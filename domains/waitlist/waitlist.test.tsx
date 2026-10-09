import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQueryClient } from "@/test/test-utils";
import { WaitlistPage } from "./waitlist-page";
import { waitlistSchema } from "./schemas/waitlist.schema";

describe("Waitlist Domain Suite", () => {
  describe("waitlistSchema (Unit Tier)", () => {
    it("accepts valid name, email, and hurdles values", () => {
      // Arrange
      const validPayload = {
        name: "Aria",
        email: "aria@example.com",
        hurdles: "I repeat outfits and forget what I own.",
      };

      // Act
      const result = waitlistSchema.safeParse(validPayload);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Aria");
        expect(result.data.email).toBe("aria@example.com");
        expect(result.data.hurdles).toBe("I repeat outfits and forget what I own.");
      }
    });

    it("rejects missing name, invalid email, and missing hurdles", () => {
      // Arrange
      const invalidPayload = {
        name: "",
        email: "not-an-email",
        hurdles: "   ",
      };

      // Act
      const result = waitlistSchema.safeParse(invalidPayload);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.flatten().fieldErrors;
        expect(issues.name).toContain("Please enter your name");
        expect(issues.email).toContain("Please enter a valid email address");
        expect(issues.hurdles).toContain("Please share your biggest hurdles in fashion");
      }
    });
  });

  describe("WaitlistPage (Component & Integration Tier)", () => {
    it("renders shell, title, subtitle, and input fields per ADR 0004", () => {
      // Arrange & Act
      renderWithQueryClient(<WaitlistPage />);

      // Assert
      expect(screen.getByTestId("waitlist-page")).toBeInTheDocument();
      expect(screen.getByTestId("waitlist-shell__visual-panel")).toBeInTheDocument();
      expect(screen.getByTestId("waitlist-shell__form-panel")).toBeInTheDocument();
      expect(screen.getByTestId("waitlist-shell__title")).toHaveTextContent("Be the first in line.");
      expect(screen.getByTestId("waitlist-shell__subtitle")).toHaveTextContent("YOUR WARDROBE, FINALLY ORGANIZED");

      const backButton = screen.getByTestId("waitlist-shell__back-button");
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveAttribute("href", "/");

      expect(screen.getByTestId("waitlist-form__name-input")).toHaveValue("");
      expect(screen.getByTestId("waitlist-form__email-input")).toHaveValue("");
      expect(screen.getByTestId("waitlist-form__hurdles-input")).toHaveValue("");

      const submitButton = screen.getByTestId("waitlist-form__submit-button");
      expect(submitButton).toBeDisabled();
    });

    it("submits the form and displays the inline celebration confirmation view", async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithQueryClient(<WaitlistPage />);

      const nameInput = screen.getByTestId("waitlist-form__name-input");
      const emailInput = screen.getByTestId("waitlist-form__email-input");
      const hurdlesInput = screen.getByTestId("waitlist-form__hurdles-input");
      const submitButton = screen.getByTestId("waitlist-form__submit-button");

      // Act: Fill in all 3 required fields
      await user.type(nameInput, "Koral");
      await user.type(emailInput, "koral@example.com");
      await user.type(hurdlesInput, "Trouble coordinating colors and repeating styles");

      // Assert: Button becomes enabled
      expect(submitButton).toBeEnabled();

      // Act: Submit form
      await user.click(submitButton);

      // Assert: Form is replaced with success view
      await waitFor(() => {
        expect(screen.getByTestId("waitlist-success")).toBeInTheDocument();
      });

      expect(screen.getByTestId("waitlist-success__title")).toHaveTextContent("You're on the list, Koral!");
      expect(screen.getByTestId("waitlist-success__description")).toHaveTextContent("koral@example.com");

      const homeButton = screen.getByTestId("waitlist-success__home-button");
      expect(homeButton).toBeInTheDocument();
      expect(homeButton).toHaveAttribute("href", "/");
    });
  });
});
