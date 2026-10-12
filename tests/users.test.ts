import assert from "node:assert/strict";
import { test } from "node:test";
import { database } from "../data/generate";
import {
  parseUserDirectoryParams,
  queryUserDirectory,
} from "../services/users";
const defaults = parseUserDirectoryParams(new URLSearchParams());
test("pages are bounded, globally sorted, disjoint, and preserve source order", () => {
  const before = database.users.map((u) => u.id);
  for (const sort of ["name", "joined", "spent"]) {
    const { result: first, matches } = queryUserDirectory(database.users, {
      ...defaults,
      sort,
    });
    const { result: second } = queryUserDirectory(database.users, {
      ...defaults,
      sort,
      page: 2,
    });
    assert.equal(first.users.length, 100);
    assert.equal(first.total, 10000);
    assert.deepEqual([...first.users, ...second.users], matches.slice(0, 200));
    assert.equal(
      new Set([...first.users, ...second.users].map((u) => u.id)).size,
      200,
    );
    for (let i = 1; i < matches.length; i++) {
      const a = matches[i - 1],
        b = matches[i];
      assert.ok(
        sort === "spent"
          ? a.spent >= b.spent
          : sort === "joined"
            ? a.joined >= b.joined
            : a.name.localeCompare(b.name) <= 0,
      );
    }
  }
  assert.deepEqual(
    database.users.map((u) => u.id),
    before,
  );
});
test("filters and search apply before pagination, with full export and summary counts", () => {
  const searched = database.users.filter((u) =>
    JSON.stringify(u).toLowerCase().includes("india"),
  );
  const expected = searched.filter(
    (u) => u.status === "Active" && u.role === "Admin",
  );
  const { result, matches } = queryUserDirectory(database.users, {
    ...defaults,
    query: "INDIA",
    status: "Active",
    role: "Admin",
    pageSize: 5,
  });
  assert.equal(result.total, expected.length);
  assert.equal(result.matchedTotal, searched.length);
  assert.equal(
    result.activeCount,
    searched.filter((u) => u.status === "Active").length,
  );
  assert.equal(result.users.length, 5);
  assert.deepEqual(
    new Set(matches.map((u) => u.id)),
    new Set(expected.map((u) => u.id)),
  );
  assert.ok(matches.length > result.users.length);
});
test("empty and out-of-range pages clamp safely", () => {
  const last = queryUserDirectory(database.users, {
    ...defaults,
    page: 9999,
  }).result;
  assert.equal(last.page, 100);
  assert.equal(last.users.length, 100);
  const empty = queryUserDirectory(database.users, {
    ...defaults,
    query: "no-user-match-xyz",
    page: 9999,
  }).result;
  assert.equal(empty.page, 1);
  assert.equal(empty.total, 0);
  assert.deepEqual(empty.users, []);
});
test("invalid pagination and filters are rejected", () => {
  for (const query of [
    "page=0",
    "page=-1",
    "page=NaN",
    "page=1.5",
    "page=Infinity",
    "pageSize=0",
    "pageSize=101",
    "pageSize=abc",
    "status=bad",
    "role=bad",
    "sort=bad",
  ]) {
    assert.throws(() => parseUserDirectoryParams(new URLSearchParams(query)));
  }
});
