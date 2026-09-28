# ADR 0004: data-testid and data-entity-id Selector Convention for Testing

**Status:** Accepted  
**Date:** 2026-09-28

## Context

As the test suite expands across unit, component, and future Playwright end-to-end (E2E) tests, selecting DOM elements solely via text labels or accessibility roles (`getByRole`, `getByText`) introduces brittleness when copy changes or when non-semantic containers and list items need deterministic targeting.

Furthermore, in full-page E2E runs, generic selectors (like `save-button` or `item`) cause strict-mode locator collisions when multiple components coexist on the screen.

## Decisions

1. **Strict `data-testid` convention with BEM-style namespacing (`<scope>__<element>`).**
   - The `<scope>` denotes the feature or component context (e.g. `trip-form`, `trip-detail`, `approval-queue`, `pill-toggle-group`).
   - The `<element>` denotes the specific control or section (e.g. `submit-button`, `start-date-input`, `title`, `empty-state`).
   - Example: `data-testid="trip-form__submit-button"`.

2. **Dedicated `data-entity-id` attribute for domain IDs.**
   - Rather than embedding IDs into test ID strings (such as `item--123`), the domain identifier is separated into a standard `data-entity-id` attribute.
   - **List Items**: Enables both uniform collection queries (e.g. `getAllByTestId("approval-queue__item")`) and exact item selection (e.g. `locator('[data-testid="approval-queue__item"][data-entity-id="123"]')`).
   - **Non-List Elements**: Containers and forms representing a singular domain entity also attach `data-entity-id` (e.g. `<main data-testid="trip-detail" data-entity-id={trip.id}>`, `<form data-testid="trip-form" data-entity-id={tripId}>`), allowing tests to verify entity association cleanly.

## Consequences

- Tests in Vitest and Playwright share a consistent, collision-free selector contract.
- Component refactoring preserves test stability as long as the test ID and entity ID contracts remain intact.
