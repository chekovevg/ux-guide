import assert from "node:assert/strict";
import test from "node:test";

import {
  getChecklistStorageKey,
  readChecklistState,
  toggleChecklistIndex,
  writeChecklistState,
} from "./checklistState.mjs";

function createStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

test("builds a versioned checklist storage key from stable article identifiers", () => {
  assert.equal(
    getChecklistStorageKey("en", "planning", "research-block-2-child-1"),
    "wynde-guide-checklist:v1:en:planning:research-block-2-child-1",
  );
});

test("reads valid in-range checklist indexes without duplicates", () => {
  const storage = createStorage();

  assert.deepEqual(readChecklistState(storage, "key", 4), new Set());
  storage.setItem(
    "key",
    JSON.stringify({ version: 1, checked: [0, 2, 99, -1, 2] }),
  );

  assert.deepEqual([...readChecklistState(storage, "key", 4)], [0, 2]);
  assert.deepEqual([...readChecklistState(storage, "key", 2)], [0]);
});

test("ignores malformed and unsupported checklist state", () => {
  const storage = createStorage();

  for (const value of [
    "not json",
    JSON.stringify({ version: 2, checked: [0] }),
    JSON.stringify({ version: 1, checked: "0" }),
    JSON.stringify({ version: 1, checked: [1.5, "1", null] }),
  ]) {
    storage.setItem("key", value);
    assert.deepEqual(readChecklistState(storage, "key", 4), new Set());
  }
});

test("toggles valid indexes into a new set and rejects out-of-range indexes", () => {
  const initial = new Set([0]);
  const added = toggleChecklistIndex(initial, 1, 3);

  assert.deepEqual([...added], [0, 1]);
  assert.notEqual(added, initial);
  assert.deepEqual([...toggleChecklistIndex(added, 1, 3)], [0]);

  const belowRange = toggleChecklistIndex(initial, -1, 3);
  const aboveRange = toggleChecklistIndex(initial, 3, 3);
  assert.deepEqual([...belowRange], [0]);
  assert.deepEqual([...aboveRange], [0]);
  assert.notEqual(belowRange, initial);
  assert.notEqual(aboveRange, initial);
});

test("writes versioned state and removes empty state", () => {
  const storage = createStorage();

  writeChecklistState(storage, "key", new Set([1]));
  assert.equal(storage.getItem("key"), '{"version":1,"checked":[1]}');

  writeChecklistState(storage, "key", new Set());
  assert.equal(storage.getItem("key"), null);
});

test("swallows storage read and write failures", () => {
  const throwingStorage = {
    getItem() {
      throw new Error("unavailable");
    },
    removeItem() {
      throw new Error("unavailable");
    },
    setItem() {
      throw new Error("unavailable");
    },
  };

  assert.deepEqual(readChecklistState(throwingStorage, "key", 3), new Set());
  assert.doesNotThrow(() =>
    writeChecklistState(throwingStorage, "key", new Set([1])),
  );
  assert.doesNotThrow(() =>
    writeChecklistState(throwingStorage, "key", new Set()),
  );
});
