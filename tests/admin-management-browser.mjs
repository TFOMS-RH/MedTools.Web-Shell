// Isolated UI integration test. All Identity requests are intercepted locally;
// synthetic sessions and test passwords are never sent to a real API.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const origin = "http://127.0.0.1:5177";
const artifacts = path.resolve("node_modules/.tmp/admin-management-browser");
await mkdir(artifacts, { recursive: true });
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "5177", "--strictPort"], {
  windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
});
const browser = spawn(process.env.MEDTOOLS_CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", "--remote-debugging-port=0", "--no-first-run", "--no-default-browser-check",
  `--user-data-dir=${path.join(artifacts, `profile-${Date.now()}`)}`, "about:blank",
], { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });

const user = { id: "11111111-1111-1111-1111-111111111111", organizationId: "22222222-2222-2222-2222-222222222222",
  userName: "operator", firstName: "Иван", lastName: "Иванов", middleName: null,
  email: null, contactPhone: null, birthDate: null };
const sessionUser = { ...user, id: "33333333-3333-3333-3333-333333333333", userName: "admin" };
const role = { id: "44444444-4444-4444-4444-444444444444", name: "Оператор" };
const catalog = [
  { id: "55555555-5555-5555-5555-555555555555", name: "Просмотр", code: "app.read", description: null },
  { id: "66666666-6666-6666-6666-666666666666", name: "Изменение", code: "app.update", description: null },
];
let assigned = [catalog[0]];
const requests = [];
const exceptions = [];
let rejectCreation = true;
let socket;
let sequence = 0;
const pending = new Map();
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++sequence;
  const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15_000);
  pending.set(id, { resolve, reject, timer });
  socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
});

try {
  await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => reject(new Error("Vite startup timed out")), 15_000);
    server.on("error", reject);
    server.stdout.on("data", (chunk) => {
      output += chunk;
      if (output.includes(origin)) { clearTimeout(timer); resolve(); }
    });
    server.stderr.on("data", () => {});
  });
  const endpoint = await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => reject(new Error("Chrome startup timed out")), 15_000);
    browser.on("error", reject);
    browser.stderr.on("data", (chunk) => {
      output += chunk;
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
    if (message.method === "Fetch.requestPaused") {
      const { request, requestId } = message.params;
      const url = new URL(request.url).pathname.replace("/api/identity", "");
      const body = request.postData ? JSON.parse(request.postData) : null;
      requests.push({ method: request.method, url, body });
      let status = 200;
      let result;
      if (request.method === "GET" && url === "/users/me") result = sessionUser;
      else if (request.method === "GET" && url === "/admin/roles") result = [role];
      else if (request.method === "GET" && url === `/admin/roles/${role.id}`) result = role;
      else if (url === `/admin/roles/${role.id}/permissions`) {
        if (request.method === "PUT") {
          assigned = catalog.filter((permission) => body.permissionIds.includes(permission.id));
          status = 204;
        } else result = assigned;
      } else if (request.method === "GET" && url === "/admin/permissions") result = catalog;
      else if (request.method === "GET" && url === "/admin/organizations")
        result = [{ id: user.organizationId, type: 1, code: "ORG", name: "Тестовая организация" }];
      else if (request.method === "GET" && url === "/admin/users") result = [user];
      else if (request.method === "GET" && url === `/admin/users/${user.id}`) result = user;
      else if (request.method === "PATCH" && url === `/admin/users/${user.id}/status`) status = 204;
      else if (request.method === "POST" && url === "/admin/users") {
        if (rejectCreation) {
          status = 400;
          result = { title: "Ошибка валидации", errors: { OrganizationId: ["Указанная организация не существует."] } };
          rejectCreation = false;
        } else status = 201;
      } else {
        status = 500;
        result = { title: `Unexpected test request: ${request.method} ${url}` };
      }
      void send("Fetch.fulfillRequest", {
        requestId, responseCode: status,
        responseHeaders: [{ name: "Content-Type", value: "application/json" }],
        body: Buffer.from(result === undefined ? "" : JSON.stringify(result)).toString("base64"),
      }, message.sessionId).catch((error) => exceptions.push(String(error)));
    }
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
  await call("Fetch.enable", { patterns: [{ urlPattern: `${origin}/api/identity/*` }] });
  const evaluate = async (expression) => {
    const result = await call("Runtime.evaluate", { expression, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const waitFor = async (expression) => {
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      if (await evaluate(`Boolean(${expression})`)) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Browser condition timed out: ${expression}`);
  };
  const click = (label) => evaluate(`([...document.querySelectorAll('button')].filter(button => button.textContent.trim() === ${JSON.stringify(label)}).at(-1)).click()`);
  const fill = (label, value) => evaluate(`(() => {
    const label = [...document.querySelectorAll('label')].find(label => label.textContent.replace('*', '').trim() === ${JSON.stringify(label)});
    const input = document.getElementById(label.htmlFor);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  const authenticate = async (permissions, route) => {
    const claims = { exp: Math.floor(Date.now() / 1000) + 3600, permission: permissions };
    const token = `test.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.test`;
    await evaluate(`sessionStorage.setItem('accessToken', ${JSON.stringify(token)})`);
    await call("Page.navigate", { url: `${origin}${route}` });
  };

  await call("Page.navigate", { url: `${origin}/admin/roles` });
  await waitFor(`location.pathname === '/login' && document.querySelector('input[autocomplete=username]')`);
  console.log("PASS: guests cannot open administration");

  const all = ["identity.roles.read", "identity.roles.read_permissions", "identity.roles.permissions_manage", "identity.permissions.read",
    "identity.users.read", "identity.users.create", "identity.users.status_update", "identity.organizations.read"];
  await authenticate(all, "/admin/roles");
  await waitFor(`document.body.innerText.includes('Оператор')`);
  await click("Открыть");
  await waitFor(`document.querySelector('[role=combobox]')`);
  await evaluate(`document.querySelector('[role=combobox]').click()`);
  await waitFor(`document.querySelector('[role=option]')`);
  await evaluate(`[...document.querySelectorAll('[role=option]')].find(option => option.textContent.includes('app.update')).click()`);
  await click("Сохранить разрешения");
  await waitFor(`document.body.innerText.includes('Разрешения роли сохранены.')`);
  assert.deepEqual(requests.find((request) => request.method === "PUT").body, { permissionIds: catalog.map((permission) => permission.id) });
  await evaluate(`document.querySelector('.MuiAutocomplete-clearIndicator').click()`);
  await waitFor(`document.body.innerText.includes('у роли не останется разрешений')`);
  await click("Сохранить разрешения");
  await waitFor(`document.body.innerText.includes('Разрешения роли сохранены.')`);
  assert.deepEqual(requests.filter((request) => request.method === "PUT").at(-1).body, { permissionIds: [] });
  console.log("PASS: role permission selection, save and clearing submit exact ID sets");

  await call("Page.navigate", { url: `${origin}/admin/users` });
  await waitFor(`document.body.innerText.includes('operator')`);
  await click("Открыть");
  await waitFor(`document.body.innerText.includes('Доступ к учётной записи')`);
  await click("Отключить");
  await waitFor(`document.body.innerText.includes('Отключить учётную запись?')`);
  assert.equal(requests.some((request) => request.method === "PATCH"), false);
  await click("Отключить");
  await waitFor(`document.body.innerText.includes('Учётная запись отключена.')`);
  assert.deepEqual(requests.find((request) => request.method === "PATCH").body, { isActive: false });
  await click("Закрыть");
  console.log("PASS: status changes require confirmation and send an explicit boolean");

  await click("Создать пользователя");
  await waitFor(`document.querySelector('[role=combobox]')`);
  await click("Создать пользователя");
  await waitFor(`document.body.innerText.includes('Укажите логин.')`);
  await evaluate(`document.querySelector('[role=combobox]').click()`);
  await waitFor(`document.querySelector('[role=option]')`);
  await evaluate(`document.querySelector('[role=option]').click()`);
  for (const [label, value] of [["Логин", "new.operator"], ["Пароль", " test password "], ["Фамилия", "Петров"], ["Имя", "Пётр"]])
    await fill(label, value);
  await click("Создать пользователя");
  await waitFor(`document.body.innerText.includes('Указанная организация не существует.')`);
  assert.equal(await evaluate(`document.querySelector('input[type=password]').value`), " test password ");
  await click("Создать пользователя");
  await waitFor(`document.body.innerText.includes('Пользователь создан.')`);
  const created = requests.filter((request) => request.method === "POST").at(-1).body;
  assert.equal(created.organizationId, user.organizationId);
  assert.equal(created.password, " test password ");
  assert.equal(created.birthDate, null);
  console.log("PASS: user creation validates fields, maps backend errors and preserves password bytes");

  const before = requests.length;
  await authenticate(["identity.users.create", "identity.organizations.read"], "/admin/users");
  await waitFor(`document.body.innerText.includes('Нет разрешения на просмотр списка пользователей.')`);
  assert.equal(requests.slice(before).some((request) => request.url === "/admin/users" && request.method === "GET"), false);
  assert.equal(await evaluate(`document.body.innerText.includes('Создать пользователя')`), true);
  console.log("PASS: create-only access does not request the protected user list");

  await authenticate(["identity.users.read"], "/admin/users");
  await waitFor(`document.body.innerText.includes('operator')`);
  assert.equal(await evaluate(`document.body.innerText.includes('Создать пользователя')`), false);
  await click("Открыть");
  await waitFor(`document.body.innerText.includes('Данные пользователя')`);
  assert.equal(await evaluate(`document.body.innerText.includes('Доступ к учётной записи')`), false);
  assert.deepEqual(exceptions, []);
  console.log("PASS: read-only access hides write actions; no uncaught browser exceptions");
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    await send("Browser.close").catch(() => {});
    socket.close();
  }
  browser.kill();
  server.kill();
}
