import { create } from "zustand";

// Carries an in-progress outfit-diary upload across the Calendar ->
// loading -> approval -> Calendar route sequence (components/features/
// calendar/*). Each stage is a separate route/page component, so this
// can't just be React state -- see stores/README.md, this is exactly
// the "draft state that must survive navigation" case it describes.

export type OutfitUploadDraft = {
  userId: string;
  file: File;
  /** Target calendar date, "YYYY-MM-DD" (wear_log.worn_on). */
  wornOn: string;
};

export type OutfitProcessingResult = {
  /** The real, always-uploaded original photo. */
  originalUrl: string;
  originalPath: string;
  /**
   * What the approval screen shows as "the outfit". Today this is just
   * `originalUrl` (no AI yet). Once outfit extraction exists, this
   * becomes the generated wearer-removed composite instead.
   */
  previewUrl: string;
};

export type SavedOutfitEntry = {
  wearLogId: string;
  outfitId: string;
  coverImageUrl: string;
  wornOn: string;
};

type OutfitDiaryUploadState = {
  draft: OutfitUploadDraft | null;
  result: OutfitProcessingResult | null;
  savedEntry: SavedOutfitEntry | null;
  startDraft: (draft: OutfitUploadDraft) => void;
  setResult: (result: OutfitProcessingResult) => void;
  setSavedEntry: (entry: SavedOutfitEntry) => void;
  clearSavedEntry: () => void;
  reset: () => void;
};

export const useOutfitDiaryUploadStore = create<OutfitDiaryUploadState>()(
  (set) => ({
    draft: null,
    result: null,
    savedEntry: null,
    startDraft: (draft) => set({ draft, result: null }),
    setResult: (result) => set({ result }),
    setSavedEntry: (entry) =>
      set({ savedEntry: entry, draft: null, result: null }),
    clearSavedEntry: () => set({ savedEntry: null }),
    reset: () => set({ draft: null, result: null }),
  }),
);
