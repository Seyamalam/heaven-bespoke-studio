import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

// Run against a local production preview; only the room's lazy module is faulted.
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  let missing = true;
  await page.route(/\/assets\/RoomScene-[^/]+\.js$/, (route) =>
    missing
      ? route.fulfill({ status: 404, body: "Module removed by deployment" })
      : route.continue(),
  );
  await page.goto("http://127.0.0.1:4173/#room");
  await page
    .getByRole("button", { name: "Room finish: Deep teal", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Step inside the room", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reload room", exact: true })
    .waitFor({ timeout: 4000 });
  assert.equal(await page.locator("#room canvas").count(), 0);
  assert.equal(
    await page.getByRole("group", { name: "Room camera views" }).count(),
    0,
  );
  assert.equal(
    await page.getByRole("slider", { name: "Room daylight" }).isDisabled(),
    true,
  );
  missing = false;
  await page.getByRole("button", { name: "Reload room", exact: true }).click();
  await page.waitForLoadState("domcontentloaded");
  await page
    .getByRole("button", { name: "Step inside the room", exact: true })
    .click();
  await page
    .locator('#room[data-render-state="ready"] canvas')
    .waitFor({ timeout: 15000 });
  assert.equal(
    await page
      .getByRole("button", { name: "Room finish: Deep teal", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(
    await page.getByRole("group", { name: "Room camera views" }).count(),
    1,
  );
  await page.locator("#room canvas").evaluate((canvas) => {
    const context = canvas.getContext("webgl2");
    context.getExtension("WEBGL_lose_context").loseContext();
  });
  await page
    .getByRole("button", { name: "Reload room", exact: true })
    .waitFor();
  assert.equal(
    await page.getByRole("group", { name: "Room camera views" }).count(),
    0,
  );
  assert.equal(
    await page.getByRole("slider", { name: "Room daylight" }).isDisabled(),
    true,
  );
  console.log(
    "PASS: removed module and GPU loss report failure; reload preserves design and restores the rendered room.",
  );
} finally {
  await browser.close();
}
