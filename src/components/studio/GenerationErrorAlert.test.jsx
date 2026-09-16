import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { GenerationErrorAlert } from "./GenerationErrorAlert";

afterEach(() => vi.useRealTimers());

it("dismisses after five seconds even when the parent updates its callback", () => {
  vi.useFakeTimers();
  const firstDismiss = vi.fn();
  const latestDismiss = vi.fn();
  const { rerender } = render(<GenerationErrorAlert message="Scene is required." onDismiss={firstDismiss} />);
  act(() => vi.advanceTimersByTime(3000));
  rerender(<GenerationErrorAlert message="Scene is required." onDismiss={latestDismiss} />);
  act(() => vi.advanceTimersByTime(1999));
  expect(latestDismiss).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(latestDismiss).toHaveBeenCalledOnce();
  expect(firstDismiss).not.toHaveBeenCalled();
});

it("gives a replacement message five seconds and cleans up on unmount", () => {
  vi.useFakeTimers();
  const dismiss = vi.fn();
  const { rerender, unmount } = render(<GenerationErrorAlert message="Scene is required." onDismiss={dismiss} />);
  act(() => vi.advanceTimersByTime(4000));
  rerender(<GenerationErrorAlert message="Output size is required." onDismiss={dismiss} />);
  act(() => vi.advanceTimersByTime(4000));
  expect(dismiss).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1000));
  expect(dismiss).toHaveBeenCalledOnce();
  rerender(<GenerationErrorAlert message="Product image is required." onDismiss={dismiss} />);
  unmount();
  act(() => vi.advanceTimersByTime(5000));
  expect(dismiss).toHaveBeenCalledOnce();
});

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
