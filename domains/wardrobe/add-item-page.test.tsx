import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQueryClient } from "@/test/test-utils";
import { AddItemView } from "./add-item-page";

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: vi.fn(),
  }),
  usePathname: () => "/wardrobe/add",
}));

describe("AddItemView (Screen 3.2.2 / D.3.2.2)", () => {
  it("renders the title, subtitle, and intake action buttons", async () => {
    renderWithQueryClient(<AddItemView userId="user-123" />);

    expect(await screen.findByTestId("add-item-page")).toBeInTheDocument();
    expect(screen.getByTestId("add-item-page__title")).toHaveTextContent(
      "Add a new item.",
    );
    expect(
      screen.getByTestId("add-item-page__take-photo-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("add-item-page__upload-photo-button"),
    ).toBeInTheDocument();
  });

  it("opens the webcam modal when Take a Photo is clicked on desktop", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<AddItemView userId="user-123" />);

    await screen.findByTestId("add-item-page");
    const takePhotoBtn = screen.getByTestId("add-item-page__take-photo-button");
    await user.click(takePhotoBtn);

    expect(await screen.findByTestId("webcam-modal")).toBeInTheDocument();
  });

  it("triggers upload mutation when a file is selected from gallery input", async () => {
    renderWithQueryClient(<AddItemView userId="user-123" />);

    await screen.findByTestId("add-item-page");
    const galleryInput = screen.getByTestId(
      "add-item-page__gallery-input",
    ) as HTMLInputElement;

    const testFile = new File(["dummy content"], "outfit.jpg", {
      type: "image/jpeg",
    });

    const user = userEvent.setup();
    await user.upload(galleryInput, testFile);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/wardrobe/loading?jobId="),
      );
    });
  });
});
