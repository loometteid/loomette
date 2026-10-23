import { Suspense } from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithQueryClient } from "@/test/test-utils";
import { SettingsView } from "./settings-page";
import { NOTIFICATION_STORAGE_KEY } from "./hooks/use-notification-settings";

describe("SettingsView - Notification Settings (Component & Integration Tier)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders notification settings defaulting to all false", async () => {
    // Arrange & Act
    renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <SettingsView userId="user-123" />
      </Suspense>,
    );

    // Wait for the Suspense boundary to resolve
    const outfitSwitch = await screen.findByTestId(
      "settings__outfit-reminders-toggle",
    );
    const analysisSwitch = screen.getByTestId(
      "settings__analysis-ready-toggle",
    );
    const recapSwitch = screen.getByTestId("settings__weekly-recap-toggle");

    // Assert: All three should be unchecked by default
    expect(outfitSwitch).toHaveAttribute("aria-checked", "false");
    expect(analysisSwitch).toHaveAttribute("aria-checked", "false");
    expect(recapSwitch).toHaveAttribute("aria-checked", "false");
  });

  it("updates switch state and persists to localStorage when toggled", async () => {
    // Arrange
    renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <SettingsView userId="user-123" />
      </Suspense>,
    );

    const outfitSwitch = await screen.findByTestId(
      "settings__outfit-reminders-toggle",
    );
    const recapSwitch = screen.getByTestId("settings__weekly-recap-toggle");

    // Act: Toggle outfit reminders and weekly recap
    const outfitInput = outfitSwitch.parentElement?.querySelector("input");
    const recapInput = recapSwitch.parentElement?.querySelector("input");
    expect(outfitInput).toBeInstanceOf(HTMLInputElement);
    expect(recapInput).toBeInstanceOf(HTMLInputElement);
    if (!outfitInput || !recapInput) throw new Error("Inputs not found");
    fireEvent.click(outfitInput);
    fireEvent.click(recapInput);

    // Assert: Switches are now checked
    expect(outfitSwitch).toHaveAttribute("aria-checked", "true");
    expect(recapSwitch).toHaveAttribute("aria-checked", "true");

    // Assert: Persisted in browser localStorage
    const saved = JSON.parse(
      window.localStorage.getItem(NOTIFICATION_STORAGE_KEY) ?? "{}",
    );
    expect(saved.outfitReminders).toBe(true);
    expect(saved.weeklyRecap).toBe(true);
    expect(saved.analysisReady).toBe(false);
  });

  it("loads pre-existing browser notification preferences on mount", async () => {
    // Arrange: Pre-populate browser storage
    window.localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify({
        outfitReminders: false,
        analysisReady: true,
        weeklyRecap: true,
      }),
    );

    // Act
    renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <SettingsView userId="user-123" />
      </Suspense>,
    );

    // Assert: Switch states reflect saved preferences
    const outfitSwitch = await screen.findByTestId(
      "settings__outfit-reminders-toggle",
    );
    const analysisSwitch = screen.getByTestId(
      "settings__analysis-ready-toggle",
    );
    const recapSwitch = screen.getByTestId("settings__weekly-recap-toggle");

    expect(outfitSwitch).toHaveAttribute("aria-checked", "false");
    expect(analysisSwitch).toHaveAttribute("aria-checked", "true");
    expect(recapSwitch).toHaveAttribute("aria-checked", "true");
  });

  it("renders the language selector button matching Figma D.4.5 / 4.5", async () => {
    // Arrange & Act
    renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <SettingsView userId="user-123" />
      </Suspense>,
    );

    const langBtn = await screen.findByTestId("settings__language-button");
    expect(langBtn).toBeInTheDocument();
    expect(langBtn).toHaveTextContent("EN");
    expect(langBtn).toHaveClass("rounded-2xl", "border-stone");
  });

  it("hides notification section and sidebar button via React 19 Activity boundary", async () => {
    // Arrange & Act
    renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <SettingsView userId="user-123" />
      </Suspense>,
    );

    // Wait for Suspense to resolve
    await screen.findByTestId("settings__language-button");

    // Visible accessible queries should not find them
    expect(
      screen.queryByRole("heading", { name: "Notification" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Notification" }),
    ).not.toBeInTheDocument();

    // The DOM elements remain mounted in memory via React 19 Activity with display: none
    // Assert: Notification nav button and section are hidden / pruned from accessible view
    expect(
      screen.queryByRole("heading", { name: "Notification" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Notification" }),
    ).not.toBeInTheDocument();

    expect(document.getElementById("notification")).toBeNull();
  });
});
