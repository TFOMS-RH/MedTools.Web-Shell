import assert from "node:assert/strict";
import test from "node:test";
import { formatOncologyDate } from "../src/modules/medView/widgets/workspace/ui/categories/components/oncology/formatOncologyDate.ts";

test("Oncology dates reject missing, malformed and impossible calendar dates", () => {
  for (const value of [
    null,
    undefined,
    "",
    " ",
    "bad",
    "2026-02-30",
    "2025-02-29",
    "2026-13-01",
    "2026-01-01T25:00:00Z",
    "2026-01-01T10:60:00Z",
  ]) {
    assert.equal(formatOncologyDate(value), "—", String(value));
  }
});

test("Oncology dates preserve source calendar day across timezone offsets", () => {
  for (const value of [
    "2026-01-03",
    "2026-01-03T23:30:00-12:00",
    "2026-01-03T00:30:00+14:00",
    "2026-01-03T00:00:00.1234567Z",
  ]) {
    assert.equal(formatOncologyDate(value), "03.01.2026", value);
  }
  assert.equal(formatOncologyDate("2024-02-29"), "29.02.2024");
});
