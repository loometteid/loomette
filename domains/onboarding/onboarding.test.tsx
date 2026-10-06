import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockRedirect, mockRouter } from "@/test/setup";
import { createTestQueryClient, renderWithQueryClient } from "@/test/test-utils";
import { StepOneForm } from "./step-one-page";
import { StepTwoForm } from "./step-two-page";
import { StepThreeForm } from "./step-three-page";
import { StepFourForm } from "./step-four-page";
import { StepFiveForm } from "./step-five-page";
import { StepSixComplete } from "./step-six-page";
import { AddInitialItem } from "./step-seven-page";
import { isProfileOnboarded } from "./utils";
import { useOnboardingGuard } from "./hooks/use-onboarding-guard";
import { useAlreadyOnboardedGuard } from "./hooks/use-already-onboarded-guard";
import {
  getOnboardingProfileQueryOptionsForBrowser,
  type OnboardingUserProfile,
} from "./query-options/get-onboarding-profile.query-option.client";

describe("Onboarding Flow (Steps 1 to 7)", () => {
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

    it("redirects onboarded user to /onboarding/7 and does not render step 1 form", async () => {
      mockRedirect.mockClear();
      const queryClient = createTestQueryClient();

      queryClient.setQueryData(
        getOnboardingProfileQueryOptionsForBrowser("user-onboarded").queryKey,
        {
          user_id: "user-onboarded",
          display_name: "Rebecca",
          gender: "female",
          birthday: "1998-05-15",
          email: "test@example.com",
          username: "rebecca",
          created_at: "2026-10-01T00:00:00Z",
          is_private: false,
          subscription_tier: "free",
          occupation: null,
          work_setting: null,
          outfit_size: null,
          shoe_size: null,
          shoe_size_region: null,
          bust_size: null,
          waist_size: null,
          high_hip_size: null,
          hip_size: null,
          height: null,
          weight: null,
          profile_photo: null,
          style_tags: [],
          body_type: null,
        } as OnboardingUserProfile,
      );

      expect(() => {
        renderWithQueryClient(
          <StepOneForm email="test@example.com" userId="user-onboarded" />,
          { queryClient },
        );
      }).toThrow();

      expect(mockRedirect).toHaveBeenCalledWith("/onboarding/7");
      expect(
        screen.queryByTestId("onboarding-step-one"),
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

  describe("Step 5: Style Tags", () => {
    it("renders with style tag options and allows toggling tags", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<StepFiveForm userId="user-123" />);

      expect(
        await screen.findByTestId("onboarding-step-five"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Now the fun part." }),
      ).toBeInTheDocument();

      // Verify pills rendered
      const minimalPill = screen.getByRole("button", {
        name: /Clean & Minimal/i,
      });
      expect(minimalPill).toBeInTheDocument();

      await user.click(minimalPill);

      const submitButton = screen.getByTestId(
        "onboarding-shell__submit-button",
      );
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/6");
      });
    });

    it("hydrates pre-selected style tags from profile data", async () => {
      const queryClient = createTestQueryClient();
      queryClient.setQueryData(
        getOnboardingProfileQueryOptionsForBrowser("user-with-tags").queryKey,
        {
          user_id: "user-with-tags",
          style_tags: ["clean_minimal", "office_ready"],
        } as unknown as OnboardingUserProfile,
      );

      renderWithQueryClient(
        <StepFiveForm userId="user-with-tags" />,
        { queryClient },
      );

      await screen.findByTestId("onboarding-step-five");

      const minimalPill = screen.getByRole("button", {
        name: /Clean & Minimal/i,
      });
      expect(minimalPill).toHaveClass("border-foreground", "text-foreground");
    });

    it("navigates back to /onboarding/4 when clicking back button", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<StepFiveForm userId="user-123" />);

      const backButton = await screen.findByTestId(
        "onboarding-shell__back-button",
      );
      await user.click(backButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/4");
    });
  });

  describe("Step 6: Completion Milestone", () => {
    it("renders celebratory screen with mascots and routes to /onboarding/7", async () => {
      renderWithQueryClient(<StepSixComplete />);

      expect(screen.getByTestId("onboarding-step-six")).toBeInTheDocument();
      expect(screen.getByTestId("onboarding-step-six__title")).toHaveTextContent(
        /all set/i,
      );

      const continueLink = screen.getByTestId(
        "onboarding-step-six__continue-button",
      );
      expect(continueLink).toHaveAttribute("href", "/onboarding/7");
    });
  });

  describe("Step 7: Wardrobe Seeding (AddInitialItem)", () => {
    it("renders initial upload screen and navigates back to /onboarding/6", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AddInitialItem userId="user-123" />);

      expect(screen.getByTestId("onboarding-step-seven")).toBeInTheDocument();
      expect(
        screen.getByTestId("onboarding-step-seven__title"),
      ).toHaveTextContent("Now, let's fill your wardrobe.");

      const backButton = screen.getByTestId(
        "onboarding-step-seven__back-button",
      );
      await user.click(backButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/onboarding/6");
    });

    it("transitions to uploaded preview state on file selection and back to initial", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AddInitialItem userId="user-123" />);

      const fileInput = screen.getByTestId(
        "onboarding-step-seven__file-input",
      );
      const testFile = new File(["dummy content"], "test-garment.jpg", {
        type: "image/jpeg",
      });

      await user.upload(fileInput, testFile);

      expect(
        await screen.findByTestId("onboarding-step-seven__preview-grid"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("onboarding-step-seven__save-button"),
      ).toBeInTheDocument();

      // Click back to return to initial
      const backButton = screen.getByTestId(
        "onboarding-step-seven__back-button",
      );
      await user.click(backButton);

      expect(
        screen.queryByTestId("onboarding-step-seven__preview-grid"),
      ).not.toBeInTheDocument();
    });

    it("uploads photo, triggers upload job mutation, and routes to /wardrobe/loading", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AddInitialItem userId="user-123" />);

      const fileInput = screen.getByTestId(
        "onboarding-step-seven__file-input",
      );
      const testFile = new File(["dummy content"], "test-garment.jpg", {
        type: "image/jpeg",
      });

      await user.upload(fileInput, testFile);

      const saveButton = await screen.findByTestId(
        "onboarding-step-seven__save-button",
      );
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(
          expect.stringContaining("/wardrobe/loading?jobId="),
        );
      });
    });

    it("navigates to library state when clicking generate basics and allows selecting all and saving", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AddInitialItem userId="user-123" />);

      const generateBasicsBtn = screen.getByTestId(
        "onboarding-step-seven__generate-basics-button",
      );
      await user.click(generateBasicsBtn);

      expect(
        await screen.findByTestId("onboarding-step-seven__library-grid"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("onboarding-step-seven__title"),
      ).toHaveTextContent("Pick from library");

      // Toggle select all
      const selectAllBtn = screen.getByTestId(
        "onboarding-step-seven__select-all-button",
      );
      await user.click(selectAllBtn);

      // Save library selection
      const saveBtn = screen.getByTestId(
        "onboarding-step-seven__save-library-button",
      );
      await user.click(saveBtn);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/home");
      });
    });
  });

  describe("Onboarding Guard and Completion Checks", () => {
    it("evaluates onboarding completion status correctly via isProfileOnboarded", () => {
      // Missing or empty profile
      expect(isProfileOnboarded(null)).toBe(false);
      expect(isProfileOnboarded(undefined)).toBe(false);
      expect(isProfileOnboarded({ display_name: null, gender: null, birthday: null })).toBe(false);
      expect(isProfileOnboarded({ display_name: "", gender: "female", birthday: null })).toBe(false);
      expect(isProfileOnboarded({ display_name: "   ", gender: "female", birthday: null })).toBe(false);

      // Incomplete step 2 (has display_name but neither gender nor birthday)
      expect(isProfileOnboarded({ display_name: "Gonjoi", gender: null, birthday: null })).toBe(false);
      expect(isProfileOnboarded({ display_name: "Gonjoi", gender: "", birthday: "" })).toBe(false);

      // Completed step 1 and step 2 via gender
      expect(isProfileOnboarded({ display_name: "Gonjoi", gender: "female", birthday: null })).toBe(true);

      // Completed step 1 and step 2 via birthday
      expect(isProfileOnboarded({ display_name: "Gonjoi", gender: null, birthday: "1998-05-15" })).toBe(true);

      // Completed step 1 and step 2 with both gender and birthday
      expect(isProfileOnboarded({ display_name: "Gonjoi", gender: "male", birthday: "1998-05-15" })).toBe(true);
    });

    it("redirects to /onboarding/1 when profile is not onboarded", () => {
      function GuardTestComponent({ profile }: { profile: Parameters<typeof useOnboardingGuard>[0] }) {
        useOnboardingGuard(profile);
        return <div data-testid="protected-content">Content</div>;
      }

      expect(() => {
        renderWithQueryClient(
          <GuardTestComponent profile={{ display_name: null, gender: null }} />,
        );
      }).toThrow();

      expect(mockRedirect).toHaveBeenCalledWith("/onboarding/1");

      mockRedirect.mockClear();

      renderWithQueryClient(
        <GuardTestComponent
          profile={{ display_name: "Rebecca", gender: "female", birthday: null }}
        />,
      );

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("redirects to /onboarding/7 when profile is already onboarded via useAlreadyOnboardedGuard", () => {
      function AlreadyOnboardedGuardTestComponent({
        profile,
      }: {
        profile: Parameters<typeof useAlreadyOnboardedGuard>[0];
      }) {
        useAlreadyOnboardedGuard(profile);
        return <div data-testid="onboarding-step-one-content">Step 1 Form</div>;
      }

      mockRedirect.mockClear();

      expect(() => {
        renderWithQueryClient(
          <AlreadyOnboardedGuardTestComponent
            profile={{
              display_name: "Hokki",
              gender: "male",
              birthday: "2002-04-20",
            }}
          />,
        );
      }).toThrow();

      expect(mockRedirect).toHaveBeenCalledWith("/onboarding/7");

      mockRedirect.mockClear();

      renderWithQueryClient(
        <AlreadyOnboardedGuardTestComponent
          profile={{ display_name: null, gender: null, birthday: null }}
        />,
      );

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(
        screen.getByTestId("onboarding-step-one-content"),
      ).toBeInTheDocument();
    });
  });
});

