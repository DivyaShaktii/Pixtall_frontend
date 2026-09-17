import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ProductImageUpload from "./ProductImageUpload";

afterEach(() => vi.useRealTimers());

it("shows a compact Premium-quality hint after an image upload", () => {
  vi.useFakeTimers();
  const onFileChange = vi.fn();
  const { container } = render(
    <ProductImageUpload file={null} onFileChange={onFileChange} vertical />,
  );
  const image = new File(["image"], "product.png", { type: "image/png" });

  fireEvent.change(container.querySelector('input[type="file"]'), {
    target: { files: [image] },
  });

  expect(onFileChange).toHaveBeenCalledWith(image);
  expect(screen.getByRole("status")).toHaveTextContent(
    "For sharper product details, choose Premium quality.",
  );

  act(() => vi.advanceTimersByTime(4000));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
