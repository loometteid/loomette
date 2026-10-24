import { describe, expect, it, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useNotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_STORAGE_KEY,
} from "./use-notification-settings";

describe("useNotificationSettings (Hook Tier)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("defaults to all false when no values are saved in the browser", () => {
    // Arrange & Act
    const { result } = renderHook(() => useNotificationSettings());

    // Assert
    expect(result.current.outfitReminders).toBe(false);
    expect(result.current.analysisReady).toBe(false);
    expect(result.current.weeklyRecap).toBe(false);
    expect(result.current.settings).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
  });

  it("persists toggling outfitReminders to browser localStorage", () => {
    // Arrange
    const { result } = renderHook(() => useNotificationSettings());

    // Act
    act(() => {
      result.current.setOutfitReminders(true);
    });

    // Assert
    expect(result.current.outfitReminders).toBe(true);
    const stored = JSON.parse(
      window.localStorage.getItem(NOTIFICATION_STORAGE_KEY) ?? "{}",
    );
    expect(stored.outfitReminders).toBe(true);
    expect(stored.analysisReady).toBe(false);
    expect(stored.weeklyRecap).toBe(false);
  });

  it("persists toggling analysisReady and weeklyRecap to browser localStorage", () => {
    // Arrange
    const { result } = renderHook(() => useNotificationSettings());

    // Act
    act(() => {
      result.current.setAnalysisReady(true);
      result.current.setWeeklyRecap(true);
    });

    // Assert
    expect(result.current.analysisReady).toBe(true);
    expect(result.current.weeklyRecap).toBe(true);
    const stored = JSON.parse(
      window.localStorage.getItem(NOTIFICATION_STORAGE_KEY) ?? "{}",
    );
    expect(stored.analysisReady).toBe(true);
    expect(stored.weeklyRecap).toBe(true);
  });

  it("restores saved preferences from browser localStorage on mount", () => {
    // Arrange: Pre-populate localStorage
    window.localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify({
        outfitReminders: true,
        analysisReady: false,
        weeklyRecap: true,
      }),
    );

    // Act
    const { result } = renderHook(() => useNotificationSettings());

    // Assert
    expect(result.current.outfitReminders).toBe(true);
    expect(result.current.analysisReady).toBe(false);
    expect(result.current.weeklyRecap).toBe(true);
  });
});
