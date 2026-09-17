import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ProductImageUpload from "./ProductImageUpload";

it("forwards a selected product image", () => {
  const onFileChange = vi.fn();
  const { container } = render(
    <ProductImageUpload file={null} onFileChange={onFileChange} vertical />,
  );
  const image = new File(["image"], "product.png", { type: "image/png" });

  fireEvent.change(container.querySelector('input[type="file"]'), {
    target: { files: [image] },
  });

  expect(onFileChange).toHaveBeenCalledWith(image);
});
