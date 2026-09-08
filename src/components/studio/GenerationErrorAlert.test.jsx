import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { GenerationErrorAlert } from "./GenerationErrorAlert";

it("shows the credit error outside the scrollable studio and supports dismissal", () => {
  const dismiss = vi.fn();
  const { container, rerender } = render(<GenerationErrorAlert message="Generation requires 10 credits" onDismiss={dismiss} />);
  const alert = screen.getByRole("alert");
  expect(alert).toHaveTextContent("Generation requires 10 credits");
  expect(container).not.toContainElement(alert);
  expect(alert.parentElement).toHaveClass("fixed", "top-20", "inset-x-0", "justify-center");
  fireEvent.click(screen.getByRole("button", { name: "Dismiss generation message" }));
  expect(dismiss).toHaveBeenCalledOnce();
  rerender(<GenerationErrorAlert message="" onDismiss={dismiss} />);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
