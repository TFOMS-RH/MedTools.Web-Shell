import assert from "node:assert/strict";
import test from "node:test";
import { AxiosError } from "axios";
import {
  buildCreateUserRequest,
  emptyCreateUserForm,
  validateCreateUserForm,
} from "../src/modules/admin/model/createUserForm.ts";
import { getAdminApiError } from "../src/modules/admin/model/getAdminApiError.ts";

const values = {
  ...emptyCreateUserForm,
  userName: "new-user",
  password: "  password with spaces  ",
  lastName: "Иванов",
  firstName: "Иван",
  organizationId: "11111111-1111-1111-1111-111111111111",
};

test("User creation requires login, password, names and an organization", () => {
  assert.deepEqual(
    Object.keys(validateCreateUserForm(emptyCreateUserForm)).sort(),
    ["firstName", "lastName", "organizationId", "password", "userName"],
  );
  assert.deepEqual(validateCreateUserForm(values), {});
});

test("User creation preserves the password exactly and normalizes optional fields", () => {
  const request = buildCreateUserRequest({
    ...values,
    userName: " new-user ",
    email: "  ",
  });
  assert.deepEqual(request, {
    userName: "new-user",
    password: values.password,
    firstName: "Иван",
    lastName: "Иванов",
    organizationId: values.organizationId,
    middleName: null,
    email: null,
    contactPhone: null,
    birthDate: null,
  });
  assert.equal("isActive" in request, false);
  assert.equal("roleIds" in request, false);
});

test("Organization identifiers must be nonempty GUIDs", () => {
  for (const organizationId of [
    "",
    "arbitrary",
    "00000000-0000-0000-0000-000000000000",
  ])
    assert.ok(
      validateCreateUserForm({ ...values, organizationId }).organizationId,
    );
});

test("User creation checks database string limits without applying them to plaintext passwords", () => {
  assert.ok(
    validateCreateUserForm({ ...values, userName: "x".repeat(256) }).userName,
  );
  assert.ok(
    validateCreateUserForm({ ...values, lastName: "x".repeat(256) }).lastName,
  );
  assert.deepEqual(
    validateCreateUserForm({ ...values, password: "x".repeat(256) }),
    {},
  );
});

test("User creation rejects invalid dates and accepts valid leap dates", () => {
  assert.ok(
    validateCreateUserForm({ ...values, birthDate: "2026-02-29" }).birthDate,
  );
  assert.deepEqual(
    validateCreateUserForm({ ...values, birthDate: "2000-02-29" }),
    {},
  );
});

test("ASP.NET PascalCase validation fields map to camelCase form fields", () => {
  const error = new AxiosError("Bad request", undefined, undefined, undefined, {
    status: 400,
    data: {
      title: "Ошибка",
      errors: {
        OrganizationId: ["Организация не найдена."],
        UserName: ["Логин занят."],
      },
    },
  });
  assert.deepEqual(getAdminApiError(error, "Ошибка").fields, {
    organizationId: "Организация не найдена.",
    userName: "Логин занят.",
  });
});
