// Real frontend smoke check. No API interception, fixtures or synthetic browser sessions.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const origin = process.env.MEDTOOLS_TEST_URL ?? "http://127.0.0.1:5175";
const chromePath = process.env.MEDTOOLS_CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const artifacts = path.resolve("node_modules/.tmp/admin-browser");
await mkdir(artifacts, { recursive: true });
const browser = spawn(chromePath, [
  "--headless=new", "--remote-debugging-port=0", "--no-first-run", "--no-default-browser-check",
  `--user-data-dir=${path.join(artifacts, `profile-${Date.now()}`)}`, "about:blank",
], { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });

let socket;
let sequence = 0;
const pending = new Map();
const exceptions = [];
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++sequence;
  const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15_000);
  pending.set(id, { resolve, reject, timer });
  socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
});

try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => reject(new Error("Chrome startup timed out")), 15_000);
    browser.on("error", (error) => { clearTimeout(timer); reject(error); });
    browser.stderr.on("data", (chunk) => {
      output += chunk.toString();
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Runtime.exceptionThrown") exceptions.push(message.params.exceptionDetails);
    const request = pending.get(message.id);
    if (request) {
      clearTimeout(request.timer);
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    }
  });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const call = (method, params) => send(method, params, sessionId);
  await call("Runtime.enable");
  await call("Page.enable");
  const evaluate = async (expression) => {
    const result = await call("Runtime.evaluate", { expression, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const waitFor = async (expression) => {
    const deadline = Date.now() + 20_000;
    while (Date.now() < deadline) {
      if (await evaluate(expression)) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Browser condition timed out: ${expression}`);
  };

  await call("Page.navigate", { url: `${origin}/admin/users` });
  await waitFor('location.pathname === "/login" && document.querySelector("input[autocomplete=username]") !== null');
  assert.equal(await evaluate('new URLSearchParams(location.search).get("returnTo")'), "/admin/users");
  assert.equal(await evaluate('document.querySelector("input[autocomplete=current-password]").type'), "password");
  assert.equal(await evaluate('document.querySelector("input[autocomplete=username]").required'), true);
  assert.equal(await evaluate('document.body.innerText.includes("Учётные записи MedTools Web")'), false);
  console.log("PASS: direct admin navigation requires login and preserves return path");

  await call("Page.reload");
  await waitFor('location.pathname === "/login" && document.querySelector("input[autocomplete=username]") !== null');
  console.log("PASS: login survives a page reload");
  await call("Page.navigate", { url: `${origin}/` });
  await waitFor(`document.querySelector('nav[aria-label] a[href="/login"]') !== null`);
  assert.equal(await evaluate(`document.querySelector('a[href="/admin/users"]') === null`), true);
  assert.deepEqual(exceptions, []);
  console.log("PASS: guest navigation hides administration; no uncaught JavaScript exceptions");
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    await send("Browser.close").catch(() => {});
    socket.close();
  }
  browser.kill();
}
