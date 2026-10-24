import assert from "node:assert/strict";
import test from "node:test";
import { AxiosError } from "axios";
import {
  buildUserPatch,
  sameRoleIds,
  toUserForm,
  validateUserForm,
} from "../src/modules/admin/model/userForm.ts";
import { readTokenClaims } from "../src/modules/auth/helpers/readTokenClaims.ts";
import { getApiError } from "../src/shared/helpers/getApiError.ts";

const user = {
  id: "user-id",
  organizationId: "organization-id",
  userName: "operator",
  firstName: "Иван",
  lastName: "Иванов",
  middleName: null,
  email: "operator@example.test",
  contactPhone: null,
  birthDate: "2000-02-29",
};

test("An unchanged form produces no PATCH fields", () => {
  assert.deepEqual(buildUserPatch(toUserForm(user), toUserForm(user)), {});
});

test("PATCH sends only changed supported fields, preserving explicit nullable clears", () => {
  const original = toUserForm(user);
  const request = buildUserPatch(original, {
    ...original,
    email: "",
    middleName: "Петрович",
    birthDate: "",
  });
  assert.deepEqual(request, {
    middleName: "Петрович",
    email: null,
    birthDate: null,
  });
  assert.equal("userName" in request, false);
  assert.equal("organizationId" in request, false);
});

test("Empty optional values stay omitted until changed", () => {
  const original = toUserForm(user);
  assert.deepEqual(
    buildUserPatch(original, { ...original, firstName: "Пётр" }),
    { firstName: "Пётр" },
  );
});

test("Validation rejects invalid dates and accepts leap days and null dates", () => {
  const values = toUserForm(user);
  assert.deepEqual(validateUserForm(values), {});
  assert.deepEqual(validateUserForm({ ...values, birthDate: "" }), {});
  for (const date of [
    "2025-02-29",
    "2026-04-31",
    "2026-13-01",
    "0000-01-01",
    "not-a-date",
  ]) {
    assert.ok(validateUserForm({ ...values, birthDate: date }).birthDate, date);
  }
});

test("Required names and database field length are checked", () => {
  const errors = validateUserForm({
    ...toUserForm(user),
    firstName: " ",
    lastName: "",
    email: "a".repeat(256),
  });
  assert.deepEqual(Object.keys(errors).sort(), [
    "email",
    "firstName",
    "lastName",
  ]);
});

test("Reordering roles is not an update; adding and removing are updates", () => {
  assert.equal(sameRoleIds(["a", "b"], ["b", "a"]), true);
  assert.equal(sameRoleIds(["a"], []), false);
  assert.equal(sameRoleIds(["a"], ["a", "b"]), false);
});

// Synthetic payloads test UI decoding only; they are never used to authenticate an API or browser session.
const tokenWith = (claims) =>
  `header.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.signature`;

test("UI permissions follow the API's permission claim, not role names", () => {
  const expiresAt = 2_000_000_000;
  assert.deepEqual(
    readTokenClaims(
      tokenWith({ exp: expiresAt, permission: "identity.users.read" }),
    ),
    {
      permissions: ["identity.users.read"],
      expiresAt: expiresAt * 1000,
    },
  );
  assert.deepEqual(
    readTokenClaims(
      tokenWith({
        exp: expiresAt,
        permission: ["identity.users.read", "identity.users.update", 1],
      }),
    ).permissions,
    ["identity.users.read", "identity.users.update"],
  );
  assert.deepEqual(
    readTokenClaims(tokenWith({ exp: expiresAt, role: "Admin" })).permissions,
    [],
  );
});

test("Malformed JWT payloads fail closed", () => {
  for (const token of [
    "",
    "invalid",
    "header.!!!.signature",
    tokenWith(null),
    tokenWith({}),
    tokenWith({ exp: "forever" }),
  ]) {
    assert.equal(readTokenClaims(token), null);
  }
});

test("ValidationProblem field messages and ProblemDetails are preserved", () => {
  const error = new AxiosError("Bad request", undefined, undefined, undefined, {
    status: 400,
    data: {
      title: "Некорректные данные",
      errors: { birthDate: ["Дата неверна", "Проверьте формат"] },
    },
  });
  assert.deepEqual(getApiError(error, "Ошибка"), {
    status: 400,
    message: "Некорректные данные",
    fields: { birthDate: "Дата неверна Проверьте формат" },
  });
});

test("Forbidden responses remain distinguishable from empty lists and other errors", () => {
  const error = new AxiosError("Forbidden", undefined, undefined, undefined, {
    status: 403,
  });
  const info = getApiError(error, "Ошибка");
  assert.equal(info.status, 403);
  assert.match(info.message, /разрешений/);
});
