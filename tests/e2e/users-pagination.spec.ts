import { test, expect } from "@playwright/test";
test("users API pages and exports; UI resets pages on filter changes", async ({
  page,
  request,
  baseURL,
}) => {
  expect((await request.get("/api/users")).status()).toBe(401);
  await page.request.post("/api/auth", {
    headers: { Origin: baseURL! },
    data: { email: "alex@performancelab.dev", password: "demo1234" },
  });
  const first = await (await page.request.get("/api/users")).json();
  const second = await (await page.request.get("/api/users?page=2")).json();
  expect(first.users).toHaveLength(100);
  expect(first.total).toBe(10000);
  expect(new Set([...first.users, ...second.users].map((u) => u.id)).size).toBe(
    200,
  );
  expect((await page.request.get("/api/users?pageSize=101")).status()).toBe(
    400,
  );
  const filtered = await (
    await page.request.get("/api/users?status=Active&role=Admin&sort=spent")
  ).json();
  const exported = await (
    await page.request.get(
      "/api/users?status=Active&role=Admin&sort=spent&export=true",
    )
  ).json();
  expect(exported.length).toBe(filtered.total);
  expect(exported.length).toBeGreaterThan(100);
  expect(exported.slice(0, 100)).toEqual(filtered.users);
  const requests: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) requests.push(r.url());
  });
  await page.goto("/users");
  await expect(page.getByText("Page 1 of 100", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Page 2 of 100", { exact: true })).toBeVisible();
  await expect(page.locator("[data-user-row]").first()).toContainText(
    second.users[0].email,
  );
  await page.getByLabel("User status").selectOption("Active");
  await expect(page.locator(".pagination")).toContainText("Page 1 of");
  await page.getByLabel("User status").selectOption("All");
  await expect(page.getByText("Page 1 of 100", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Previous", exact: true }),
  ).toBeDisabled();
  expect(
    requests.some(
      (url) => url.includes("/api/data/users") || url.includes("export=true"),
    ),
  ).toBe(false);
});
