import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { StudioCanvasGrid } from "./StudioCanvasGrid";

it("fits a generated result inside the selected output ratio", () => {
  render(
    <StudioCanvasGrid
      numImages={1}
      generatedImages={["/result.png"]}
      size="16:9"
      productImageUrl="/source.png"
    />,
  );

  const comparison = screen.getByRole("slider");
  expect(comparison).toHaveClass("compare-contain", "h-full", "mb-0");
  expect(comparison.style.getPropertyValue("--compare-aspect-ratio")).toBe("16 / 9");
});
