import { test, expect } from "@playwright/test";

test("user search updates immediately and sends one request after typing stops", async ({
  page,
  baseURL,
}) => {
  const login = await page.request.post("/api/auth", {
    headers: { Origin: baseURL! },
    data: { email: "alex@performancelab.dev", password: "demo1234" },
  });
  expect(login.ok()).toBe(true);
  await page.goto("/users");
  await expect(page.locator("[data-user-row]").first()).toBeVisible();
  const searches: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === "/api/data/users")
      searches.push(url.searchParams.get("q") || "");
  });
  const input = page.getByRole("textbox", {
    name: "Search name, email, or company...",
  });
  await input.pressSequentially("olivia.bennett1@", { delay: 30 });
  await expect(input).toHaveValue("olivia.bennett1@");

  await expect(page.locator("[data-user-row]")).toHaveCount(1);
  await expect(page.locator("[data-user-row]")).toContainText("Olivia Bennett");
  expect(searches).toEqual(["olivia.bennett1@"]);
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(input).toHaveValue("");

  await expect(page.locator(".virtualized-users table")).toHaveAttribute(
    "aria-rowcount",
    "10001",
  );
});
