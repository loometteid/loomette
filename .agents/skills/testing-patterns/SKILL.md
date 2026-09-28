---
name: testing-patterns
description: Enforces Arrange-Act-Assert (AAA) testing architecture, data-testid selector conventions, and tier-specific patterns across Vitest, React Testing Library, MSW, and Playwright.
---

# Testing Patterns & Architecture

This skill defines the universal testing conventions for Loomette across all four tiers of the test pyramid: Unit, Component, Integration, and End-to-End (E2E).

---

## 1. The Universal AAA (Arrange-Act-Assert) Pattern

Every test must follow a strict three-phase structure:

### Phase 1: Arrange

- Set up test fixtures, input objects, spies, store initializations, or mock network responses.
- Keep Arrange clean and isolated: avoid executing the target logic or triggering DOM user events here.

### Phase 2: Act

- Execute **exactly one** logical action under test:
  - In Unit tests: A single function call, store method call, or schema validation.
  - In Component/Integration tests: A single user action via `userEvent` (e.g. click submit, type input).
  - In E2E tests: A concrete user step in the workflow journey.
- Never interleave assertions inside the Act phase.

### Phase 3: Assert

- Verify returned values, DOM updates, callback calls, or network side-effects.
- In async flows, always await resolution using `waitFor`, `findByTestId`, or Playwright's `expect(locator).toBeVisible()`.

---

## 2. Selector Convention (`data-testid` & `data-entity-id`)

All component and E2E selectors must follow [ADR 0004](docs/adr/0004-data-testid-and-selector-convention.md):

1. **BEM-Style Test IDs (`<scope>__<element>`)**:
   - `<scope>`: Feature or component name (e.g. `trip-form`, `trip-detail`, `approval-queue`).
   - `<element>`: Specific control or section (e.g. `submit-button`, `start-date-input`, `title`).
   - Example: `data-testid="trip-form__submit-button"`.

2. **Domain Entity Identifier (`data-entity-id`)**:
   - **List items**: Keeps `data-testid` uniform for array/count assertions while allowing exact item targeting:
     ```tsx
     <div data-testid="approval-queue__item" data-entity-id={row.id}>
     ```
   - **Non-list containers**: Containers representing an entity attach `data-entity-id` for verification:
     ```tsx
     <main data-testid="trip-detail" data-entity-id={trip.id}>
     ```

---

## 3. Disclosed References by Tier

Consult the dedicated tier reference when authoring tests:

- [Unit Tests Reference](references/unit-tests.md): Pure Zod v4 schemas, Zustand stores, and utilities.
- [Component Tests Reference](references/component-tests.md): UI primitives and form rendering with React Testing Library.
- [Integration Tests Reference](references/integration-tests.md): Data fetching with TanStack Query, MSW v2, and Supabase PostgREST.
- [E2E Tests Reference](references/e2e-tests.md): Full browser workflows and PWA journeys with Playwright.

---

## 4. Test Completion Checklist

Before finalizing any test suite, verify the following criteria:

- [ ] **AAA Structure**: Test clearly separates Arrange, Act, and Assert phases.
- [ ] **Single Act Rule**: The Act block contains only one primary action triggering the test case.
- [ ] **Selector Standard**: Selectors adhere to `<scope>__<element>` with `data-entity-id` where applicable.
- [ ] **Async Safety**: Asynchronous mutations or queries are awaited (`findBy*`, `waitFor`) rather than relying on arbitrary sleep timeouts.
- [ ] **Offline Execution**: Network calls are intercepted at the fetch boundary via MSW v2 with no real HTTP leaks.
- [ ] **Verification**: Tests pass locally via `pnpm test` and typecheck via `pnpm exec tsc --noEmit`.
