import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { StudioSidebar } from "./StudioSidebar";

afterEach(() => vi.useRealTimers());

it("shows the Premium hint for a product upload and restarts its dismissal timer for replacements", () => {
  vi.useFakeTimers();
  const setProductImageFile = vi.fn();
  const { container } = render(<StudioSidebar setProductImageFile={setProductImageFile} />);
  const input = container.querySelector('input[type="file"]');
  const file = new File(["image"], "product.png", { type: "image/png" });

  fireEvent.change(input, { target: { files: [file] } });
  expect(setProductImageFile).toHaveBeenCalledWith(file);
  expect(screen.getByRole("status")).toHaveTextContent("For watches, jewellery, and intricate products, choose Premium quality to capture finer details.");
  act(() => vi.advanceTimersByTime(3000));
  fireEvent.change(input, { target: { files: [file] } });
  act(() => vi.advanceTimersByTime(3000));
  expect(screen.getByRole("status")).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("makes every selected Studio control visually and semantically distinct", () => {
  render(
    <StudioSidebar
      activeTool="product-to-model"
      setActiveTool={vi.fn()}
      productImageFile={null}
      setProductImageFile={vi.fn()}
      model="female"
      handleModelTypeChange={vi.fn()}
      modelImagePath="/models/female/example.png"
      setIsModelModalOpen={vi.fn()}
      productCategory="fashion"
      handleCategoryChange={vi.fn()}
      productSubcategory="shirt"
      setProductSubcategory={vi.fn()}
      scene="studio"
      setScene={vi.fn()}
      size="4:5"
      setSize={vi.fn()}
      setHoveredSize={vi.fn()}
      numImages={3}
      setNumImages={vi.fn()}
      imageQuality="premium"
      setImageQuality={vi.fn()}
      handleGenerate={vi.fn()}
    />
  );

  for (const name of ["Marketplace", "Female", "Premium", "3 images"]) {
    const control = screen.getByRole("button", { name });
    expect(control).toHaveAttribute("aria-pressed", "true");
  }

  expect(screen.getByRole("button", { name: "Marketplace" })).toHaveClass("studio-selected-control");
  expect(screen.getByRole("button", { name: "Premium" })).toHaveClass("studio-selected-control");
  expect(screen.getByRole("button", { name: "3 images" })).toHaveClass("studio-selected-control");
  expect(screen.getByRole("button", { name: "Change Model" })).toHaveClass("studio-selected-control");

  const sizeTrigger = screen.getByRole("button", { name: "4:5" });
  expect(sizeTrigger).toHaveClass("studio-selected-control");
  fireEvent.click(sizeTrigger);
  expect(within(screen.getByRole("listbox")).getByRole("option", { name: "4:5" }))
    .toHaveAttribute("aria-selected", "true");
});

it("shows a short Premium hint after a category is selected", () => {
  vi.useFakeTimers();
  const handleCategoryChange = vi.fn();
  render(
    <StudioSidebar
      setActiveTool={vi.fn()}
      setProductImageFile={vi.fn()}
      handleModelTypeChange={vi.fn()}
      handleCategoryChange={handleCategoryChange}
      setProductSubcategory={vi.fn()}
      setScene={vi.fn()}
      setSize={vi.fn()}
      setHoveredSize={vi.fn()}
      setNumImages={vi.fn()}
      setImageQuality={vi.fn()}
      handleGenerate={vi.fn()}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Category" }));
  fireEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: "Fashion" }));

  expect(handleCategoryChange).toHaveBeenCalledWith("fashion");
  expect(screen.getByRole("status")).toHaveTextContent(
    "For watches, jewellery, and intricate products, choose Premium quality to capture finer details.",
  );

  act(() => vi.advanceTimersByTime(4000));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("renders Generate Images as the primary accent action", () => {
  render(<StudioSidebar handleGenerate={vi.fn()} />);

  const generateButton = screen.getByRole("button", { name: "Generate Images" });
  expect(generateButton).toHaveClass("studio-generate-primary", "min-h-[52px]");
  expect(generateButton).not.toHaveClass("bg-white");
});
