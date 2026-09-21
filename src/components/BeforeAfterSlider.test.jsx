import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import BeforeAfterSlider from "./BeforeAfterSlider";

it("uses the requested aspect ratio and contain mode without cropping", () => {
  render(
    <BeforeAfterSlider
      beforeSrc="/source.png"
      afterSrc="/result.png"
      aspectRatio="16:9"
      fit="contain"
    />,
  );

  const comparison = screen.getByRole("slider");
  expect(comparison).toHaveClass("compare-contain");
  expect(comparison.style.getPropertyValue("--compare-aspect-ratio")).toBe("16 / 9");
});

it("switches the frame to the generated image's real dimensions", () => {
  render(
    <BeforeAfterSlider
      beforeSrc="/source.png"
      afterSrc="/result.png"
      aspectRatio="4:5"
      fit="contain"
      useAfterImageAspectRatio
    />,
  );

  const generatedImage = screen.getByAltText("Generated marketplace photo");
  Object.defineProperties(generatedImage, {
    naturalWidth: { configurable: true, value: 1600 },
    naturalHeight: { configurable: true, value: 900 },
  });
  fireEvent.load(generatedImage);

  expect(screen.getByRole("slider").style.getPropertyValue("--compare-aspect-ratio"))
    .toBe("1600 / 900");
});

it("tracks a touch pointer immediately throughout the drag", () => {
  render(<BeforeAfterSlider beforeSrc="/source.png" afterSrc="/result.png" />);

  const comparison = screen.getByRole("slider");
  vi.spyOn(comparison, "getBoundingClientRect").mockReturnValue({
    left: 0,
    width: 200,
    top: 0,
    right: 200,
    bottom: 100,
    height: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  comparison.setPointerCapture = vi.fn();

  fireEvent.pointerDown(comparison, { pointerId: 7, pointerType: "touch", clientX: 40 });
  fireEvent.pointerMove(comparison, { pointerId: 7, pointerType: "touch", clientX: 150 });

  expect(comparison).toHaveAttribute("aria-valuenow", "75");
  expect(comparison).toHaveClass("is-dragging");

  fireEvent.pointerUp(comparison, { pointerId: 7, pointerType: "touch", clientX: 150 });
  expect(comparison).not.toHaveClass("is-dragging");
});
