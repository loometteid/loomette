"use client";

import { useSyncExternalStore, useCallback } from "react";

export type NotificationSettings = {
  outfitReminders: boolean;
  analysisReady: boolean;
  weeklyRecap: boolean;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  outfitReminders: false,
  analysisReady: false,
  weeklyRecap: false,
};

export const NOTIFICATION_STORAGE_KEY = "loomette:notification-settings";
const NOTIFICATION_EVENT_KEY = "loomette:notification-settings-change";

let cachedSettings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS;
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function readFromStorage(): NotificationSettings {
  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      outfitReminders: typeof parsed?.outfitReminders === "boolean" ? parsed.outfitReminders : false,
      analysisReady: typeof parsed?.analysisReady === "boolean" ? parsed.analysisReady : false,
      weeklyRecap: typeof parsed?.weeklyRecap === "boolean" ? parsed.weeklyRecap : false,
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

function getSnapshot(): NotificationSettings {
  const current = readFromStorage();
  if (
    cachedSettings.outfitReminders !== current.outfitReminders ||
    cachedSettings.analysisReady !== current.analysisReady ||
    cachedSettings.weeklyRecap !== current.weeklyRecap
  ) {
    cachedSettings = current;
  }
  return cachedSettings;
}

function getServerSnapshot(): NotificationSettings {
  return DEFAULT_NOTIFICATION_SETTINGS;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);

  function handleStorageEvent(event: Event) {
    if ("key" in event && typeof event.key === "string" && event.key !== NOTIFICATION_STORAGE_KEY) {
      return;
    }
    callback();
  }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener(NOTIFICATION_EVENT_KEY, handleStorageEvent);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener(NOTIFICATION_EVENT_KEY, handleStorageEvent);
    }
  };
}

function writeToStorage(next: NotificationSettings): void {
  cachedSettings = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(NOTIFICATION_EVENT_KEY));
    } catch {
      // Gracefully handle storage quota or private-browsing restrictions
    }
  }
  emitChange();
}

export function useNotificationSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setOutfitReminders = useCallback((outfitReminders: boolean) => {
    const current = getSnapshot();
    writeToStorage({ ...current, outfitReminders });
  }, []);

  const setAnalysisReady = useCallback((analysisReady: boolean) => {
    const current = getSnapshot();
    writeToStorage({ ...current, analysisReady });
  }, []);

  const setWeeklyRecap = useCallback((weeklyRecap: boolean) => {
    const current = getSnapshot();
    writeToStorage({ ...current, weeklyRecap });
  }, []);

  const setPreference = useCallback(
    <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
      const current = getSnapshot();
      writeToStorage({ ...current, [key]: value });
    },
    [],
  );

  return {
    settings,
    outfitReminders: settings.outfitReminders,
    analysisReady: settings.analysisReady,
    weeklyRecap: settings.weeklyRecap,
    setOutfitReminders,
    setAnalysisReady,
    setWeeklyRecap,
    setPreference,
  };
}
