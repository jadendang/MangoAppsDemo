// Click-through checks on the live UI. Run with: npm run test:ui
// TODAY is fixed in onboarding.js, so the sample hires always land in the same states.

import { test, expect } from "@playwright/test";

const card = (page, title) => page.locator(".action-card").filter({ has: page.getByText(title, { exact: true }) });
const section = (page, heading) => page.locator(".card").filter({ has: page.getByRole("heading", { name: heading, exact: true }) });
const nextTitles = (page) => page.locator(".action-card .action-title");

async function complete(page, title) {
  await card(page, title).getByRole("button", { name: /Mark done|Acknowledge/ }).click();
}

async function expectNoSideScroll(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("employee view", () => {
  test("Ben sees his top 3 next actions", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Ben" })).toBeVisible();
    await expect(page.getByText("Seattle HQ").first()).toBeVisible();
    await expect(nextTitles(page)).toHaveText([
      "Sign offer letter & NDA",
      "Complete background check",
      "Submit tax forms (W-4)",
    ]);
  });

  test("Mark done removes the card and refills the list", async ({ page }) => {
    await complete(page, "Sign offer letter & NDA");
    await expect(card(page, "Sign offer letter & NDA")).toHaveCount(0);
    await expect(nextTitles(page)).toHaveCount(3);
    await expect(card(page, "Receive dev laptop")).toBeVisible();
    await expect(page.getByText("1 of 11 tasks done")).toBeVisible();
  });

  test("completing blockers reveals dev environment setup", async ({ page }) => {
    for (const title of ["Sign offer letter & NDA", "Complete background check", "Submit tax forms (W-4)", "Receive dev laptop"]) {
      await complete(page, title);
    }
    await expect(card(page, "Set up dev environment")).toHaveCount(0);
    await expect(page.getByRole("status")).toContainText("Get repo & tool access");

    await complete(page, "Get repo & tool access");
    await expect(page.getByRole("status")).toContainText("Set up dev environment");
    await expect(card(page, "Set up dev environment")).toBeVisible();
  });

  test("compliance tasks show Acknowledged once done", async ({ page }) => {
    await complete(page, "Complete background check");
    await page.getByRole("tab", { name: /Completed/ }).click();
    await expect(page.locator(".task-row", { hasText: "Complete background check" })).toContainText("Acknowledged");
  });

  test("task help shows the reach path, link and who to ask", async ({ page }) => {
    const offer = card(page, "Sign offer letter & NDA");
    await offer.getByRole("button", { name: "How to do this" }).click();
    await expect(offer.locator(".breadcrumb li")).toHaveText(["Email from BrightPath People team", "Review & sign"]);
    await expect(offer.getByRole("link", { name: /Open offer packet/ })).toBeVisible();
    await expect(offer.getByText("Dana Kim")).toBeVisible();
    await expect(offer.getByRole("link", { name: /dana.kim@example.com/ })).toHaveAttribute("href", "mailto:dana.kim@example.com");

    await offer.getByRole("button", { name: "Hide help" }).click();
    await expect(offer.locator(".task-help-panel")).toHaveCount(0);
  });

  test("laptop help says it ships home", async ({ page }) => {
    await complete(page, "Sign offer letter & NDA");
    const laptop = card(page, "Receive dev laptop");
    await laptop.getByRole("button", { name: "How to do this" }).click();
    await expect(laptop).toContainText("Ships to your home address");
    await expect(laptop.getByRole("link", { name: /Track shipment/ })).toBeVisible();
    await expect(laptop).toContainText("IT shipping desk");
  });

  test("who to ask lists plan contacts and the HQ directory, without mobiles", async ({ page }, testInfo) => {
    const contacts = section(page, "Who to ask");
    for (const name of ["John Rivera", "Dana Kim", "Sam Lee", "Alex Chen", "Front desk", "Facilities"]) {
      await expect(contacts.locator(".contact-name", { hasText: name })).toBeVisible();
    }
    await expect(contacts).toContainText("760 Aloha Street, Ste 500, Seattle, WA 98109");
    await expect(page.getByText(/Mobile/)).toHaveCount(0);
    await expect(page.getByText("555-0187")).toHaveCount(0);

    await card(page, "Sign offer letter & NDA").getByRole("button", { name: "How to do this" }).click();
    await expectNoSideScroll(page);
    await page.screenshot({ path: testInfo.outputPath("employee-ben.png"), fullPage: true });
  });

  test("Priya sees the all-done state and the missing-template notice", async ({ page }) => {
    await page.getByRole("combobox").selectOption("priya");
    await expect(page.getByText("You're all set")).toBeVisible();
    await expect(page.getByText("No Finance plan exists yet")).toBeVisible();
    await expect(section(page, "Who to ask")).toHaveCount(0);
  });

  test("Joseph is remote and gets the remote directory", async ({ page }) => {
    await page.getByRole("combobox").selectOption("joseph");
    const contacts = section(page, "Who to ask");
    await expect(contacts.getByText("Remote", { exact: true })).toBeVisible();
    await expect(contacts.getByText("IT shipping desk")).toBeVisible();
    await expect(contacts).not.toContainText("760 Aloha Street");
  });
});

test.describe("manager view", () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole("button", { name: "Manager", exact: true }).click();
  });

  test("John's dashboard flags Ben and follow up works", async ({ page }, testInfo) => {
    await expect(page.getByRole("heading", { name: "John's team" })).toBeVisible();
    await expect(page.locator(".stat", { hasText: "Needs attention" }).locator(".stat-value")).toHaveText("1");

    const row = section(page, "Needs attention").locator("tbody tr", { hasText: "Ben" });
    await expect(row).toContainText("Preboarding open, starts in 2 days");
    await row.getByRole("button", { name: "Follow up" }).click();
    await expect(row).toContainText("Reminder sent");

    await expectNoSideScroll(page);
    await page.screenshot({ path: testInfo.outputPath("manager-john.png"), fullPage: true });
  });

  test("drilling into Ben shows his plan and manager-only mobiles", async ({ page }, testInfo) => {
    await section(page, "People onboarding").getByRole("button", { name: "Ben" }).click();
    await expect(page.getByRole("heading", { name: "Full plan" })).toBeVisible();

    const contacts = section(page, "Ben's contacts");
    await expect(contacts.getByText("Plan contacts")).toBeVisible();
    await expect(contacts.getByRole("link", { name: /Mobile: \(206\) 555-0187/ })).toBeVisible();
    await expect(contacts).toContainText("760 Aloha Street");

    await expectNoSideScroll(page);
    await page.screenshot({ path: testInfo.outputPath("manager-ben-detail.png"), fullPage: true });

    await page.getByRole("button", { name: "← Back to team" }).click();
    await expect(page.getByRole("heading", { name: "John's team" })).toBeVisible();
  });

  test("Jane's team has nobody needing attention", async ({ page }) => {
    await page.getByRole("combobox").selectOption("Jane");
    await expect(page.getByText("Everyone's on track")).toBeVisible();
    await expect(section(page, "People onboarding").locator("tbody tr")).toHaveCount(3);
  });
});
