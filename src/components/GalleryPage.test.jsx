import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
          aspect: "16:9",
          photos: ["/wide-result.png"],
        },
      ],
    }),
  });
});

it("renders each gallery session in its generated aspect ratio", async () => {
  const { container } = render(<GalleryPage />);

  await waitFor(() => expect(screen.getByText("1 session")).toBeInTheDocument());
  expect(container.querySelector(".gallery-card-image")).toHaveStyle({
    aspectRatio: "16 / 9",
  });
});
