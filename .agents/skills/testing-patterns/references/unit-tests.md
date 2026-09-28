# Unit Tests Reference (AAA Pattern)

Unit tests isolate pure business logic, validation schemas, Zustand stores, and utility functions from the DOM, external frameworks, and network APIs.

---

## AAA Structure for Unit Tests

### 1. Arrange

- Construct raw JavaScript/TypeScript objects, fixtures, and primitive values.
- If testing a Zustand store, reset the store to a known state using `useStore.setState(...)`.
- Avoid mounting React components, instantiating QueryClients, or declaring DOM nodes in unit tests.

### 2. Act

- Execute exactly **one** logical function, schema evaluation, or store transition:
  - Schema: `schema.safeParse(input)`
  - Store: `useStore.getState().actionName(payload)`
  - Utility: `utilityFunction(arg1, arg2)`

### 3. Assert

- Assert strictly against returned outputs or updated store snapshots:
  - Schema: Verify `result.success`, parsed data integrity, or specific issue path messages.
  - Store: Compare `useStore.getState()` against expected state.
  - Utility: Compare return value with exact primitives or objects (`toBe`, `toEqual`).

---

## Code Examples

### A. Zod v4 Schema (`schemas/*.schema.ts`)

```ts
import { describe, expect, it } from "vitest";
import { editTripSchema } from "./edit-trip.schema";

describe("editTripSchema", () => {
  it("rejects endDate that precedes startDate", () => {
    // Arrange
    const invalidDateRange = {
      name: "Weekend Away",
      startDate: "2026-10-10",
      endDate: "2026-10-05",
    };

    // Act
    const result = editTripSchema.safeParse(invalidDateRange);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endDate).toContain(
        "End date can't be before the start date.",
      );
    }
  });
});
```

### B. Zustand State Store (`stores/*.ts`)

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";

describe("useOutfitDiaryUploadStore", () => {
  beforeEach(() => {
    // Arrange: ensure clean store state
    useOutfitDiaryUploadStore.setState({
      draft: null,
      result: null,
      savedEntry: null,
    });
  });

  it("sets draft and resets in-flight processing result", () => {
    // Arrange
    const file = new File(["dummy"], "ootd.jpg", { type: "image/jpeg" });
    const draft = { userId: "user-1", file, wornOn: "2026-09-28" };

    // Act
    useOutfitDiaryUploadStore.getState().startDraft(draft);

    // Assert
    const state = useOutfitDiaryUploadStore.getState();
    expect(state.draft).toEqual(draft);
    expect(state.result).toBeNull();
  });
});
```

### C. Pure Utility Function (`lib/*.ts`)

```ts
import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("preserves custom typography scale when combined with color utilities", () => {
    // Arrange & Act
    const result = cn("text-title", "text-white");

    // Assert
    expect(result).toBe("text-title text-white");
  });
});
```
