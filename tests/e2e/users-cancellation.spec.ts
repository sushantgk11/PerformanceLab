import { test, expect } from "@playwright/test";

test("obsolete user searches are cancelled on replacement and navigation", async ({
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

  const failures: { query: string; error: string }[] = [];
  page.on("requestfailed", (request) => {
    const url = new URL(request.url());
    if (url.pathname === "/api/data/users")
      failures.push({
        query: url.searchParams.get("q") || "",
        error: request.failure()?.errorText || "",
      });
  });
  let releaseOld: () => void = () => {};
  let releaseLeaving: () => void = () => {};
  const oldGate = new Promise<void>((resolve) => {
    releaseOld = resolve;
  });
  const leavingGate = new Promise<void>((resolve) => {
    releaseLeaving = resolve;
  });
  await page.route("**/api/data/users?*", async (route) => {
    const query = new URL(route.request().url()).searchParams.get("q");
    if (query === "olivia") await oldGate;
    if (query === "liam") await leavingGate;
    await route.continue();
  });
  const input = page.getByRole("textbox", {
    name: "Search name, email, or company...",
  });
  try {
    const oldRequest = page.waitForRequest(
      (request) => new URL(request.url()).searchParams.get("q") === "olivia",
    );
    await input.fill("olivia");
    await oldRequest;
    const replacement = page.waitForResponse(
      (response) =>
        new URL(response.url()).searchParams.get("q") === "olivia.bennett1@",
    );
    await input.fill("olivia.bennett1@");
    await replacement;
    releaseOld();
    await expect
      .poll(() =>
        failures.some(
          (failure) =>
            failure.query === "olivia" && failure.error.includes("ABORTED"),
        ),
      )
      .toBe(true);
    await expect(page.locator("[data-user-row]")).toHaveCount(1);
    await expect(page.locator("[data-user-row]")).toContainText(
      "Olivia Bennett",
    );
    await expect(page.getByText("We couldn’t load this view")).toHaveCount(0);

    const leavingRequest = page.waitForRequest(
      (request) => new URL(request.url()).searchParams.get("q") === "liam",
    );
    await input.fill("liam");
    await leavingRequest;
    await page.getByRole("link", { name: "Settings", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Settings", exact: true }),
    ).toBeVisible();
    releaseLeaving();
    await expect
      .poll(() =>
        failures.some(
          (failure) =>
            failure.query === "liam" && failure.error.includes("ABORTED"),
        ),
      )
      .toBe(true);
  } finally {
    releaseOld();
    releaseLeaving();
  }
});
