import { test, expect } from "@playwright/test";

test("authentication, navigation, directories, reporting, settings, and live events", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const unauthorized = await request.get("/api/data/users");
  expect(unauthorized.status()).toBe(401);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("Password", { exact: true }).fill("invalid-password");
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(page.locator(".form-error")).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill("demo1234");
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Revenue overview" }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/dashboard-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Notifications", exact: true })
    .click();
  await expect(page.getByText("Your workspace is ready")).toBeVisible();
  await page
    .getByRole("button", { name: "Dismiss Your workspace is ready" })
    .click();
  await expect(page.getByText("Your workspace is ready")).toHaveCount(0);
  await page.getByRole("button", { name: "Close notifications" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export report" }).click();
  expect((await download).suggestedFilename()).toBe("workspace-report.csv");

  await page.getByRole("link", { name: "Users", exact: true }).click();
  await expect(page.locator(".virtualized-users table")).toHaveAttribute(
    "aria-rowcount",
    "10001",
  );
  await expect(page.locator("[data-user-row]").first()).toBeVisible();
  expect(await page.locator("[data-user-row]").count()).toBeLessThan(50);
  await page
    .getByRole("textbox", { name: "Search name, email, or company..." })
    .fill("olivia.bennett1@");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Olivia Bennett", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Search name, email, or company..." })
    .fill("no-match-xyz");
  await expect(page.getByText("No results found")).toBeVisible();

  await page.getByRole("link", { name: "Products", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1000);
  await page.getByRole("tab", { name: "Audio", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(200);
  await page.getByLabel("Sort products").selectOption("low");
  await page.locator(".product-card .name-button").first().click();
  await expect(page.getByRole("dialog")).toContainText("Product details");
  await page.getByRole("button", { name: "Close details" }).click();

  await page.getByRole("link", { name: "Orders", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(10000);
  await page
    .getByRole("textbox", { name: "Search order, customer, or product..." })
    .fill("ORD-24001");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("checkbox", { name: "Select ORD-24001" }).check();
  await expect(page.getByText("1 orders selected")).toBeVisible();
  await page.getByRole("button", { name: "View ORD-24001" }).click();
  await expect(page.getByRole("dialog")).toContainText("Order #24001");
  await page.getByRole("button", { name: "Close details" }).click();

  await page.getByRole("link", { name: "Analytics", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Revenue over time" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Customers", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Customer acquisition" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Products", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(20);

  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByLabel("Full name").fill("Alex Rivera");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toHaveText("Profile saved.");
  await page.reload();
  await expect(page.getByLabel("Full name")).toHaveValue("Alex Rivera");
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await page
    .getByRole("button", { name: "Notifications", exact: true })
    .last()
    .click();
  await page.getByRole("switch", { name: "Weekly digest" }).click();
  await expect(
    page.getByRole("switch", { name: "Weekly digest" }),
  ).toHaveAttribute("aria-checked", "true");

  await page.getByRole("link", { name: "Activity feed", exact: true }).click();
  await expect(page.locator(".activity-row")).toHaveCount(12000);
  await expect(page.locator(".activity-row")).toHaveCount(12001, {
    timeout: 20000,
  });
  await page.getByRole("button", { name: "Pause updates" }).click();
  await expect(page.getByText("Updates paused")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/dashboard-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/orders");
  await expect(page).toHaveURL(/\/login/);
  expect(errors).toEqual([]);
});
