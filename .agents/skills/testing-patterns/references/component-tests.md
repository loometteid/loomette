# Component Tests Reference (AAA Pattern)

Component tests verify isolated UI components, buttons, form controls, and compound widgets using React Testing Library (`@testing-library/react`) and `@testing-library/user-event`.

---

## AAA Structure for Component Tests

### 1. Arrange

- Instantiate user interaction simulation: `const user = userEvent.setup()`.
- Set up spies for event props: `const handleClick = vi.fn()`.
- Mount the component with test props: `render(<Button ... />)`.
- Do not trigger clicks, form changes, or keyboard inputs inside the Arrange step.

### 2. Act

- Perform the user action using `@testing-library/user-event`:
  - Click: `await user.click(screen.getByTestId("..."))`
  - Type: `await user.type(screen.getByTestId("..."), "text")`
  - Clear: `await user.clear(screen.getByTestId("..."))`
- Limit the Act phase to the single user interaction that triggers the expected response.

### 3. Assert

- Verify DOM mutations and callback invocations:
  - Control state: `expect(element).toBeDisabled()`, `expect(element).toHaveClass("...")`
  - Visibility: `expect(element).toBeInTheDocument()`
  - Callback payloads: `expect(handleClick).toHaveBeenCalledWith(...)`

---

## Code Example

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PillToggleGroup } from "@/components/features/onboarding/pill-toggle-group";

describe("PillToggleGroup component", () => {
  it("invokes onToggle with selected value when clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    const options = [
      { value: "casual", label: "Casual" },
      { value: "formal", label: "Formal" },
    ] as const;

    render(
      <PillToggleGroup
        options={options}
        isSelected={(val) => val === "casual"}
        onToggle={handleToggle}
        data-testid="onboarding__pills"
      />,
    );

    const formalOption = screen.getByTestId(
      "pill-toggle-group__option[data-entity-id='formal']",
    );

    // Act
    await user.click(formalOption);

    // Assert
    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledWith("formal");
  });
});
```
