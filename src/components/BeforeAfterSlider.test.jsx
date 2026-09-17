import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
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
