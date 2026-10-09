import assert from "node:assert/strict";
import { test } from "node:test";
import { database } from "../data/generate";
import { report, selectPeriod } from "../services/reporting";
import type { Order, Product, User } from "../types";

test("dataset counts, IDs, image URLs, and relations are valid", () => {
  assert.equal(database.users.length, 10000);
  assert.equal(database.orders.length, 10000);
  assert.equal(database.products.length, 1000);
  assert.equal(database.activities.length, 12000);
  for (const records of Object.values(database))
    assert.equal(
      new Set(records.map((record: { id: string }) => record.id)).size,
      records.length,
    );
  assert.equal(
    new Set(database.products.map((product) => product.image)).size,
    1000,
  );
  const users = new Set(database.users.map((user) => user.id));
  const products = new Map(
    database.products.map((product) => [product.id, product]),
  );
  for (const order of database.orders) {
    assert.ok(users.has(order.userId));
    assert.ok(products.has(order.productId));
    assert.equal(
      order.total,
      Math.round(products.get(order.productId)!.price * order.quantity * 100) /
        100,
    );
  }
});
test("customer lifetime spend reconciles with non-cancelled orders", () => {
  const expected = new Map<string, number>();
  for (const order of database.orders)
    if (order.status !== "Cancelled")
      expected.set(
        order.userId,
        (expected.get(order.userId) || 0) + order.total,
      );
  for (const user of database.users)
    assert.equal(user.spent, expected.get(user.id) || 0);
});
test("report includes both date boundaries and excludes cancelled revenue", () => {
  const base: Order = {
    id: "1",
    userId: "u1",
    customer: "A",
    email: "a@example.com",
    productId: "p1",
    product: "Test",
    quantity: 2,
    total: 100,
    status: "Completed",
    country: "Canada",
    date: "2026-10-01T00:00:00.000Z",
  };
  const orders: Order[] = [
    base,
    {
      ...base,
      id: "2",
      total: 50,
      quantity: 1,
      date: "2026-10-02T23:59:59.999Z",
    },
    { ...base, id: "3", total: 200, status: "Cancelled" },
    { ...base, id: "4", date: "2026-09-30T23:59:59.999Z" },
  ];
  const users = [{ id: "u1", joined: "2026-10-02T10:00:00.000Z" }] as User[];
  const products = [
    { id: "p1", name: "Test", category: "Electronics" },
  ] as Product[];
  assert.equal(selectPeriod(orders, "2026-10-01", "2026-10-02").length, 3);
  const stats = report(orders, users, products, "2026-10-01", "2026-10-02");
  assert.equal(stats.revenue, 150);
  assert.equal(stats.aov, 75);
  assert.equal(stats.customers, 1);
  assert.equal(stats.newUsers, 1);
  assert.equal(stats.productStats[0].sold, 3);
  assert.equal(stats.daily.length, 2);
  assert.equal(
    stats.daily.reduce((sum, day) => sum + day.revenue, 0),
    150,
  );
  assert.equal(stats.categoryStats[0].value, 150);
});
test("an empty reporting period has finite, zero-valued metrics", () => {
  const stats = report([], [], [], "2026-10-01", "2026-10-02");
  assert.equal(stats.revenue, 0);
  assert.equal(stats.aov, 0);
  assert.equal(stats.customers, 0);
});
