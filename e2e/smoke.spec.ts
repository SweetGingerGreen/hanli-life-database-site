import { expect, test } from "@playwright/test";

const pages = [
  ["/", ["韩立人生"]],
  ["/timeline", ["人生时间轴"]],
  ["/events", ["事件库"]],
  ["/realms", ["境界档案"]],
  ["/methodology", ["数据口径"]],
  ["/realms/fanren", ["凡人"]],
  ["/events/1", ["事件详情", "三叔"]],
] as const;

test("core pages return HTML with key copy", async ({ request }) => {
  for (const [url, expectedTexts] of pages) {
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
    const html = await response.text();
    for (const text of expectedTexts) {
      expect(html, url).toContain(text);
    }
  }
});

test("stage OG image returns a real PNG", async ({ request }) => {
  const response = await request.get("/cards/risk-annual/opengraph-image");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  expect((await response.body()).length).toBeGreaterThanOrEqual(30_000);
});

test("theme and font cookies affect hydrated shell", async ({ context, page }) => {
  await context.addCookies([
    { name: "theme", value: "ink", domain: "127.0.0.1", path: "/" },
    { name: "font", value: "hei", domain: "127.0.0.1", path: "/" },
  ]);
  await page.goto("/events/1");
  await expect(page.locator("html")).toHaveAttribute("data-color-mode", "ink");
  await expect(page.locator("html")).toHaveAttribute("data-font", "hei");
});
