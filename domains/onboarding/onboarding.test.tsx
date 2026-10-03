import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockRouter } from "@/test/setup";
import { renderWithQueryClient } from "@/test/test-utils";
import { StepOneForm } from "./step-one-page";
import { StepTwoForm } from "./step-two-page";
import { StepThreeForm } from "./step-three-page";
import { StepFourForm } from "./step-four-page";

describe("Onboarding Flow (Steps 1 to 4)", () => {
  describe("Step 1: Name and Email", () => {
    it("renders with disabled email and empty name when no initial value", async () => {
      renderWithQueryClient(
        <StepOneForm email="test@example.com" userId="user-123" />,
      );

      expect(
        await screen.findByTestId("onboarding-step-one"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("onboarding-shell__visual-panel"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("onboarding-shell__title")).toHaveTextContent(
        "First, let's make this yours.",
      );

      const emailInput = screen.getByTestId("onboarding-step-one__email-input");
      expect(emailInput).toHaveValue("test@example.com");
      expect(emailInput).toBeDisabled();

      const nameInput = screen.getByTestId("onboarding-step-one__name-input");
      expect(nameInput).toHaveValue("");

      const submitButton = screen.getByTestId(
        "onboarding-shell__submit-button",
      );
      expect(submitButton).toBeDisabled();
    });

    it("pre-fills name and navigates to step 2 on valid submission", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <StepOneForm
          email="test@example.com"
          initialName="Rebecca"
          userId="user-123"
        />,
      );

      const nameInput = await screen.findByTestId(
        "onboarding-step-one__name-input",
      );
      expect(nameInput).toHaveValue("Rebecca");

      const submitButton = screen.getByTestId(
        "onboarding-shell__submit-button",
      );
      expect(submitButton).toBeEnabled();

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/2");
      });
    });

    it("does not render a back button on Step 1", async () => {
      renderWithQueryClient(
        <StepOneForm email="test@example.com" userId="user-123" />,
      );

      await screen.findByTestId("onboarding-step-one");

      expect(
        screen.queryByTestId("onboarding-shell__back-button"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("onboarding-shell__back-button--desktop"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Step 2: Birthday and Gender Identity", () => {
    it("renders birthday and identity options", async () => {
      renderWithQueryClient(<StepTwoForm userId="user-123" />);

      expect(
        await screen.findByTestId("onboarding-step-two"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("onboarding-shell__title")).toHaveTextContent(
        "A little more about you.",
      );
      expect(
        screen.getByTestId("onboarding-step-two__birthday-picker"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("onboarding-step-two__identity-group"),
      ).toBeInTheDocument();

      const submitButton = screen.getByTestId(
        "onboarding-shell__submit-button",
      );
      expect(submitButton).toBeDisabled();
    });

    it("pre-fills values, allows selecting identity, and routes to step 3", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <StepTwoForm
          initialBirthday="1998-05-15"
          initialIdentity="female"
          userId="user-123"
        />,
      );

      const submitButton = await screen.findByTestId(
        "onboarding-shell__submit-button",
      );
      expect(submitButton).toBeEnabled();

      // Switch to He / Him
      const maleOption = screen.getByRole("button", { name: /he \/ him/i });
      await user.click(maleOption);

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/3");
      });
    });

    it("navigates to /onboarding/1 when clicking back on Step 2", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<StepTwoForm userId="user-123" />);

      const backButton = await screen.findByTestId(
        "onboarding-shell__back-button",
      );
      await user.click(backButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/1");
    });
  });

  describe("Step 3: Profession and Work Setting", () => {
    it("renders profession input and work setting options", async () => {
      renderWithQueryClient(<StepThreeForm userId="user-123" />);

      expect(
        await screen.findByTestId("onboarding-step-three"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("onboarding-shell__title")).toHaveTextContent(
        "What does your day-to-day look like?",
      );
      expect(
        screen.getByTestId("onboarding-step-three__profession-input"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("onboarding-step-three__work-setting-group"),
      ).toBeInTheDocument();

      const submitButton = screen.getByTestId(
        "onboarding-shell__submit-button",
      );
      expect(submitButton).toBeEnabled();
    });

    it("submits profession and work setting, routing to step 4", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <StepThreeForm
          initialProfession="Software Engineer"
          initialWorkSetting="remote"
          userId="user-123"
        />,
      );

      const professionInput = await screen.findByTestId(
        "onboarding-step-three__profession-input",
      );
      expect(professionInput).toHaveValue("Software Engineer");

      const hybridOption = screen.getByRole("button", { name: /hybrid/i });
      await user.click(hybridOption);

      const submitButton = screen.getByTestId(
        "onboarding-shell__submit-button",
      );
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/4");
      });
    });

    it("navigates to /onboarding/2 when clicking back on Step 3", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<StepThreeForm userId="user-123" />);

      const backButton = await screen.findByTestId(
        "onboarding-shell__back-button",
      );
      await user.click(backButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/2");
    });
  });

  describe("Step 4: Outfit Size and Body Measurements", () => {
    it("renders step 4 with correct title, sizing, and measurements", async () => {
      renderWithQueryClient(<StepFourForm userId="user-123" />);

      expect(
        await screen.findByTestId("onboarding-step-four"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("onboarding-shell__title")).toHaveTextContent(
        "Dress for your body, not the other way.",
      );
      expect(
        screen.getByTestId("onboarding-step-four__outfit-size-group"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("onboarding-step-four__shoe-size-input"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("onboarding-step-four__weight-unit"),
      ).toHaveTextContent(/kg/i);
      expect(
        screen.getByTestId("onboarding-step-four__weight-unit"),
      ).toHaveTextContent(/lbs/i);
    });

    it("pre-fills initial sizing and measurements and routes to step 5", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <StepFourForm
          userId="user-123"
          initialData={{
            outfitSize: "m",
            shoeSize: "39",
            shoeRegion: "eu",
            height: 165,
            weight: 58,
            bustSize: 90,
            waistSize: 65,
            highHipSize: 85,
            hipSize: 95,
          }}
        />,
      );

      const shoeInput = await screen.findByTestId(
        "onboarding-step-four__shoe-size-input",
      );
      expect(shoeInput).toHaveValue("39");

      const heightInput = screen.getByTestId(
        "onboarding-step-four__height-input",
      );
      expect(heightInput).toHaveValue(165);

      const submitButton = screen.getByTestId(
        "onboarding-shell__submit-button",
      );
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/5");
      });
    });

    it("navigates to /onboarding/3 when clicking back on Step 4", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<StepFourForm userId="user-123" />);

      const backButton = await screen.findByTestId(
        "onboarding-shell__back-button",
      );
      await user.click(backButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/3");
    });
  });
});
