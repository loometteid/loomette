# End-to-End Tests Reference (AAA Pattern)

End-to-End (E2E) tests verify complete user journeys across actual browser runtimes using Playwright. They execute against running Next.js server builds, ensuring multi-page routing, server components, and PWA mobile views function synchronously.

---

## AAA Structure for E2E Tests

### 1. Arrange

- Configure device emulation (e.g. mobile viewport for fashion PWA selfies / wardrobe grid).
- Seed test session / cookies if authenticated routes are involved.
- Navigate to the starting route:
  ```ts
  await page.goto("/trip/new");
  await expect(page.getByTestId("trip-form")).toBeVisible();
  ```

### 2. Act

- Perform the user flow across pages and dialogs using `getByTestId`:
  ```ts
  await page.getByTestId("trip-form__start-date-input").fill("2026-10-01");
  await page.getByTestId("trip-form__end-date-input").fill("2026-10-08");
  await page.getByTestId("trip-form__submit-button").click();
  ```

### 3. Assert

- Verify client-side router redirects and persisted server state:
  ```ts
  await expect(page).toHaveURL(/\/trip\/[a-z0-9-]+$/);
  await expect(page.getByTestId("trip-detail__title")).toBeVisible();
  ```

---

## Code Example

```ts
import { test, expect } from "@playwright/test";

test.describe("Trip Creation Journey", () => {
  test("creates a new trip and redirects to the itinerary view", async ({
    page,
  }) => {
    // Arrange: open trip creation form
    await page.goto("/trip/new");
    await expect(page.getByTestId("trip-form")).toBeVisible();

    // Act: fill dates and submit
    await page.getByTestId("trip-form__start-date-input").fill("2026-11-01");
    await page.getByTestId("trip-form__end-date-input").fill("2026-11-05");
    await page.getByTestId("trip-form__submit-button").click();

    // Assert: navigation succeeds to detail screen with itinerary days
    await expect(page).toHaveURL(/\/trip\/[a-zA-Z0-9_-]+$/);
    await expect(page.getByTestId("trip-detail")).toBeVisible();
    await expect(page.getByTestId("trip-detail__day-item")).toHaveCount(5);
  });
});
```
