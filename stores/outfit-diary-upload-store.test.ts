import { beforeEach, describe, expect, it } from "vitest";
import {
  useOutfitDiaryUploadStore,
  type OutfitUploadDraft,
  type OutfitProcessingResult,
  type SavedOutfitEntry,
} from "@/stores/outfit-diary-upload-store";

describe("useOutfitDiaryUploadStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useOutfitDiaryUploadStore.setState({
      draft: null,
      result: null,
      savedEntry: null,
    });
  });

  it("initializes with empty state", () => {
    const state = useOutfitDiaryUploadStore.getState();
    expect(state.draft).toBeNull();
    expect(state.result).toBeNull();
    expect(state.savedEntry).toBeNull();
  });

  it("updates draft and clears previous result on startDraft", () => {
    const mockFile = new File(["dummy content"], "ootd.jpg", {
      type: "image/jpeg",
    });
    const mockDraft: OutfitUploadDraft = {
      userId: "user-123",
      file: mockFile,
      wornOn: "2026-09-28",
    };

    useOutfitDiaryUploadStore.getState().startDraft(mockDraft);

    const state = useOutfitDiaryUploadStore.getState();
    expect(state.draft).toEqual(mockDraft);
    expect(state.result).toBeNull();
  });

  it("sets processing result", () => {
    const mockResult: OutfitProcessingResult = {
      originalUrl: "https://example.com/original.jpg",
      originalPath: "uploads/user-123/original.jpg",
      previewUrl: "https://example.com/preview.jpg",
    };

    useOutfitDiaryUploadStore.getState().setResult(mockResult);

    expect(useOutfitDiaryUploadStore.getState().result).toEqual(mockResult);
  });

  it("stores savedEntry and clears in-flight draft and result", () => {
    const mockFile = new File(["dummy"], "test.png", { type: "image/png" });
    useOutfitDiaryUploadStore.setState({
      draft: { userId: "user-1", file: mockFile, wornOn: "2026-09-28" },
      result: {
        originalUrl: "https://example.com/a.jpg",
        originalPath: "a.jpg",
        previewUrl: "https://example.com/a.jpg",
      },
      savedEntry: null,
    });

    const saved: SavedOutfitEntry = {
      wearLogId: "wear-99",
      outfitId: "outfit-88",
      coverImageUrl: "https://example.com/cover.jpg",
      wornOn: "2026-09-28",
    };

    useOutfitDiaryUploadStore.getState().setSavedEntry(saved);

    const state = useOutfitDiaryUploadStore.getState();
    expect(state.savedEntry).toEqual(saved);
    expect(state.draft).toBeNull();
    expect(state.result).toBeNull();
  });

  it("resets active draft and result", () => {
    useOutfitDiaryUploadStore.setState({
      draft: {
        userId: "user-1",
        file: new File([""], "test.jpg"),
        wornOn: "2026-09-28",
      },
      result: {
        originalUrl: "url",
        originalPath: "path",
        previewUrl: "preview",
      },
      savedEntry: {
        wearLogId: "1",
        outfitId: "2",
        coverImageUrl: "3",
        wornOn: "2026-09-28",
      },
    });

    useOutfitDiaryUploadStore.getState().reset();

    const state = useOutfitDiaryUploadStore.getState();
    expect(state.draft).toBeNull();
    expect(state.result).toBeNull();
    // reset preserves savedEntry for post-approval summary display
    expect(state.savedEntry).not.toBeNull();
  });
});
