import { test, expect } from "@playwright/test";

for (const density of ["comfortable", "compact"] as const) {
  test(`virtualized users retain scrolling and controls (${density})`, async ({
    page,
    baseURL,
  }) => {
    const login = await page.request.post("/api/auth", {
      headers: { Origin: baseURL! },
      data: { email: "alex@performancelab.dev", password: "demo1234" },
    });
    expect(login.ok()).toBe(true);
    await page.addInitScript(
      (value) =>
        localStorage.setItem(
          "lab-settings",
          JSON.stringify({ density: value }),
        ),
      density,
    );
    await page.goto("/users");
    const table = page.locator(".virtualized-users");
    const rows = table.locator("[data-user-row]");
    await expect(table).toHaveAttribute("data-density", density);
    await expect(table.locator("table")).toHaveAttribute(
      "aria-rowcount",
      "101",
    );
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeLessThan(50);
    expect(
      await rows.first().evaluate((el) => el.getBoundingClientRect().height),
    ).toBe(density === "compact" ? 56 : 72);
    await table.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(rows.last()).toHaveAttribute("aria-rowindex", "101");
    await expect(rows.last()).toBeVisible();
    expect(await rows.count()).toBeLessThan(50);
    await rows.last().getByRole("button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close details" }).click();
    await page.getByLabel("User status").selectOption("Active");
    await page.getByLabel("User role").selectOption("Admin");
    await expect(rows.first()).toHaveAttribute("aria-rowindex", "2");
    expect(await table.evaluate((el) => el.scrollTop)).toBe(0);
    await expect(rows.first().locator(".badge")).toHaveText("Active");
    await expect(rows.first().locator(".role-label")).toHaveText("Admin");
    await page.getByLabel("Sort users").selectOption("spent");
    await expect(rows.first()).toBeVisible();
    await page.getByLabel("User status").selectOption("All");
    await page.getByLabel("User role").selectOption("All");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export users" }).click();
    const stream = await (await downloadPromise).createReadStream();
    let csv = "";
    for await (const chunk of stream!) csv += chunk.toString();
    expect(csv.split("\r\n")).toHaveLength(10001);
    await page
      .getByRole("textbox", { name: "Search name, email, or company..." })
      .fill("olivia.bennett1@");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("Olivia Bennett");
    await page
      .getByRole("textbox", { name: "Search name, email, or company..." })
      .fill("no-user-match-xyz");
    await expect(page.getByText("No results found")).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(table.locator("table")).toHaveAttribute(
      "aria-rowcount",
      "101",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(rows.first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
