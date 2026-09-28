# Integration Tests Reference (AAA Pattern)

Integration tests verify data-driven features where React components, TanStack Query (`useQuery` / `useSuspenseQuery` / `useMutation`), and Supabase client communicate over real HTTP fetch calls intercepted by Mock Service Worker (MSW v2).

---

## AAA Structure for Integration Tests

### 1. Arrange

- Define or override MSW HTTP handlers using `server.use(http.get(...), http.post(...))` if testing non-default payloads or error conditions.
- Wrap the component under test with `renderWithQueryClient`:
  ```tsx
  renderWithQueryClient(
    <Suspense fallback={<div data-testid="loading">Loading...</div>}>
      <FeatureComponent userId="user-123" />
    </Suspense>,
  );
  ```
- Instantiate `userEvent.setup()`.

### 2. Act

- Fill in form fields and trigger mutation or selection:
  ```tsx
  await user.type(
    screen.getByTestId("trip-form__start-date-input"),
    "2026-10-01",
  );
  await user.click(screen.getByTestId("trip-form__submit-button"));
  ```

### 3. Assert

- Await asynchronous network and cache resolution:
  - For queries: `const title = await screen.findByTestId("trip-detail__title");`
  - For mutations / navigation: `await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/trip/123"));`
- Assert on side-effects: router calls, toast notifications (`toast.error`), and container entity attributes (`data-entity-id`).

---

## Code Example

```tsx
import { Suspense } from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { renderWithQueryClient } from "@/test/test-utils";
import { TripDetailView } from "./trip-detail-view";

describe("TripDetailView integration", () => {
  it("fetches trip details and renders day itinerary", async () => {
    // Arrange: mock specific trip in MSW
    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/trip`, () => {
        return HttpResponse.json({
          id: "trip-789",
          name: "Tokyo Winter",
          start_date: "2026-12-01",
          end_date: "2026-12-03",
          season: "winter",
          travel_companion: "family",
          user_id: "user-123",
        });
      }),
    );

    // Act: mount component wrapped in QueryClient and Suspense
    renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <TripDetailView userId="user-123" tripId="trip-789" />
      </Suspense>,
    );

    // Assert: verify title and computed days
    const title = await screen.findByTestId("trip-detail__title");
    expect(title).toHaveTextContent("Tokyo Winter");

    const days = screen.getAllByTestId("trip-detail__day-item");
    expect(days).toHaveLength(3);
    expect(days[0]).toHaveAttribute("data-entity-id", "2026-12-01");
  });
});
```
