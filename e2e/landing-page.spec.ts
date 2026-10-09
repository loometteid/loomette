import { test, expect } from "@playwright/test";

test.describe("Landing Page E2E Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Arrange: Navigate to the landing page
    await page.goto("/");
    await expect(page.getByTestId("landing-page")).toBeVisible();
  });

  test("renders all 7 fullscreen sections and hero mascots per ADR 0004", async ({
    page,
  }) => {
    // Assert: Verify all section containers exist
    await expect(page.getByTestId("landing-page__header")).toBeVisible();
    await expect(page.getByTestId("landing-page__hero")).toBeVisible();
    await expect(page.getByTestId("landing-page__overview")).toBeVisible();
    await expect(page.getByTestId("landing-page__steps")).toBeVisible();
    await expect(page.getByTestId("landing-page__stats")).toBeVisible();
    await expect(page.getByTestId("landing-page__reviews")).toBeVisible();
    await expect(page.getByTestId("landing-page__faq")).toBeVisible();
    await expect(page.getByTestId("landing-page__final-cta-section")).toBeVisible();
    await expect(page.getByTestId("landing-page__footer")).toBeVisible();

    // Assert: Verify all 4 character mascots are present with data-entity-id
    const mascots = page.getByTestId("landing-page__mascot");
    await expect(mascots).toHaveCount(4);
    await expect(page.locator('[data-testid="landing-page__mascot"][data-entity-id="mascot-43"]')).toBeAttached();
    await expect(page.locator('[data-testid="landing-page__mascot"][data-entity-id="mascot-45"]')).toBeAttached();
    await expect(page.locator('[data-testid="landing-page__mascot"][data-entity-id="mascot-44"]')).toBeAttached();
    await expect(page.locator('[data-testid="landing-page__mascot"][data-entity-id="mascot-42"]')).toBeAttached();

    // Assert: Verify stats counters exist
    const statItems = page.getByTestId("landing-page__stat-item");
    await expect(statItems).toHaveCount(4);

    // Assert: Verify review cards exist
    const reviews = page.getByTestId("landing-page__review-card");
    await expect(reviews).toHaveCount(3);
  });

  test("toggles FAQ accordion panels open and closed smoothly", async ({
    page,
  }) => {
    // Arrange: Scroll FAQ section into view
    const faqSection = page.getByTestId("landing-page__faq");
    await faqSection.scrollIntoViewIfNeeded();

    const faqItems = page.getByTestId("landing-page__faq-item");
    await expect(faqItems).toHaveCount(5);

    const firstTrigger = page
      .locator('[data-testid="landing-page__faq-item"][data-entity-id="0"]')
      .getByTestId("landing-page__faq-trigger");

    const firstPanel = page
      .locator('[data-testid="landing-page__faq-item"][data-entity-id="0"]')
      .getByTestId("landing-page__faq-panel");

    // Act: Click first FAQ trigger to open
    await firstTrigger.click();

    // Assert: Panel becomes visible with answer content
    await expect(firstPanel).toBeVisible();
    await expect(firstPanel).toContainText("Loomette works across all styles");

    // Act: Click again to collapse
    await firstTrigger.click();

    // Assert: Panel collapses
    await expect(firstPanel).not.toBeVisible();
  });

  test("navigates to /waitlist when clicking Hero Join Waitlist CTA", async ({
    page,
  }) => {
    // Arrange: Ensure hero CTA is visible
    const heroCta = page.getByTestId("landing-page__hero-cta");
    await expect(heroCta).toBeVisible();

    // Act: Click waitlist button
    await heroCta.click();

    // Assert: Client-side routing to waitlist page
    await expect(page).toHaveURL(/\/waitlist/);
  });

  test("navigates to /waitlist when clicking Final CTA Join Waitlist button", async ({
    page,
  }) => {
    // Arrange: Scroll to final CTA section
    const finalCtaButton = page.getByTestId("landing-page__final-cta-button");
    await finalCtaButton.scrollIntoViewIfNeeded();
    await expect(finalCtaButton).toBeVisible();

    // Act: Click final CTA button
    await finalCtaButton.click();

    // Assert: Client-side routing to waitlist page
    await expect(page).toHaveURL(/\/waitlist/);
  });

  test("navigates to /waitlist from header navigation link", async ({
    page,
  }) => {
    // Arrange: Locate header waitlist link
    const waitlistLink = page.getByTestId("landing-page__waitlist-link");
    await expect(waitlistLink).toBeVisible();

    // Act: Click waitlist link
    await waitlistLink.click();

    // Assert: Navigated to waitlist page
    await expect(page).toHaveURL(/\/waitlist/);
  });
});
