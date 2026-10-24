import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPermissionRequest,
  buildRoleRequest,
  validateAccessForm,
} from "../src/modules/admin/model/accessForm.ts";

const empty = { name: "", code: "", description: "" };

test("Role creation requires a name and sends only the role contract", () => {
  assert.deepEqual(validateAccessForm("role", empty), {
    name: "Укажите название.",
  });
  const values = {
    name: "  Оператор  ",
    code: "ignored",
    description: "ignored",
  };
  assert.deepEqual(validateAccessForm("role", values), {});
  assert.deepEqual(buildRoleRequest(values), { name: "Оператор" });
});

test("Permission validation rejects whitespace-only required values", () => {
  const errors = validateAccessForm("permission", {
    ...empty,
    name: " \t",
    code: "  ",
  });
  assert.deepEqual(Object.keys(errors).sort(), ["code", "name"]);
});

test("Permission descriptions are nullable; blank optional values are sent as null", () => {
  for (const description of ["", "  \n  "]) {
    const values = { name: " Просмотр ", code: " app.read ", description };
    assert.deepEqual(validateAccessForm("permission", values), {});
    assert.deepEqual(buildPermissionRequest(values), {
      code: "app.read",
      name: "Просмотр",
      description: null,
    });
  }
});

test("Permission requests trim surrounding whitespace without altering codes", () => {
  assert.deepEqual(
    buildPermissionRequest({
      code: "  module.custom_action  ",
      name: "  Название  ",
      description: "  Описание  ",
    }),
    { code: "module.custom_action", name: "Название", description: "Описание" },
  );
});

test("Permission fields enforce the database limit of 255 characters", () => {
  for (const field of ["code", "name", "description"]) {
    const values = { code: "app.read", name: "Название", description: "" };
    assert.deepEqual(
      validateAccessForm("permission", { ...values, [field]: "a".repeat(255) }),
      {},
    );
    assert.deepEqual(
      Object.keys(
        validateAccessForm("permission", {
          ...values,
          [field]: "a".repeat(256),
        }),
      ),
      [field],
    );
  }
});

test("Role validation does not invent the permission field length limit", () => {
  assert.deepEqual(
    validateAccessForm("role", { ...empty, name: "a".repeat(256) }),
    {},
  );
});
