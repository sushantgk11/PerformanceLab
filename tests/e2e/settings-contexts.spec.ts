import { test, expect } from "@playwright/test";

test("settings and notifications remain functional after context separation", async ({
  page,
  baseURL,
}) => {
  const login = await page.request.post("/api/auth", {
    headers: { Origin: baseURL! },
    data: { email: "alex@performancelab.dev", password: "demo1234" },
  });
  expect(login.ok()).toBe(true);
  await page.goto("/settings");
  await expect(page.locator(".footer-clock")).toBeVisible();
  await page.getByLabel("Full name").fill("Context Test User");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toHaveText("Profile saved.");
  await expect(page.locator(".sidebar-user strong")).toHaveText(
    "Context Test User",
  );
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.getByLabel("Full name")).toHaveValue("Context Test User");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  await page.getByLabel("Table density").selectOption("compact");
  await page.getByRole("link", { name: "Users", exact: true }).click();
  await expect(page.locator(".virtualized-users")).toHaveAttribute(
    "data-density",
    "compact",
  );
  await expect(page.locator("[data-user-row]").first()).toBeVisible();
  await page.getByRole("button", { name: "Export users" }).click();
  await expect(page.getByRole("status")).toHaveText("User directory exported.");
});
