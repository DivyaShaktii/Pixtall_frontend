import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { StudioSidebar } from "./StudioSidebar";

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
