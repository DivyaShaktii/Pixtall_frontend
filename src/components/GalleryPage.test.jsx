import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import GalleryPage from "./GalleryPage";
import { authenticatedFetch } from "../lib/api";

vi.mock("../lib/api", () => ({
  authenticatedFetch: vi.fn(),
}));

beforeEach(() => {
  authenticatedFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      sessions: [
        {
          id: "session-1",
          title: "Wide product shot",
          tag: "premium",
          date: "2026-09-17",
          aspect: "4:5",
          photos: ["/wide-result.png"],
        },
      ],
    }),
  });
});

it("updates each gallery card to the loaded image's real aspect ratio", async () => {
  const { container } = render(<GalleryPage />);

  await waitFor(() => expect(screen.getByText("1 session")).toBeInTheDocument());
  const frame = container.querySelector(".gallery-card-image");
  const image = frame.querySelector("img");
  expect(frame).toHaveStyle({
    aspectRatio: "4 / 5",
  });

  Object.defineProperties(image, {
    naturalWidth: { configurable: true, value: 1600 },
    naturalHeight: { configurable: true, value: 900 },
  });
  fireEvent.load(image);

  expect(frame).toHaveStyle({ aspectRatio: "1600 / 900" });
});
