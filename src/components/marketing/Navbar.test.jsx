import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

it("scrolls to landing sections without adding a URL fragment", () => {
  render(<><Navbar /><section id="features">Features content</section><section id="pricing">Pricing content</section></>);
  fireEvent.click(screen.getByRole("link", { name: "Features" }));
  expect(window.location.hash).toBe("");
  expect(window.scrollTo).toHaveBeenCalled();
  expect(document.getElementById("features")).toHaveFocus();
  window.history.replaceState(null, "", "/#features");
  fireEvent.click(screen.getByRole("link", { name: "Pricing" }));
  expect(window.location.hash).toBe("");
});

it("shows an Enterprise coming-soon card and dismisses it with Escape", () => {
  render(<Navbar />);
  const trigger = screen.getByRole("button", { name: "Enterprise" });
  fireEvent.click(trigger);
  expect(screen.getByRole("heading", { name: "Enterprise — coming soon" })).toBeVisible();
  expect(window.location.hash).toBe("");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("heading", { name: "Enterprise — coming soon" })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

it("closes mobile navigation after selecting a section", () => {
  render(<><Navbar /><section id="pricing">Pricing content</section></>);
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  fireEvent.click(screen.getAllByRole("link", { name: "Pricing" })[1]);
  expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  expect(window.location.hash).toBe("");
});

it("also shows the Enterprise notice from the landing footer", () => {
  render(<Footer />);
  fireEvent.click(screen.getByRole("button", { name: "Enterprise" }));
  expect(screen.getByRole("status")).toHaveTextContent("Enterprise plans are not available yet");
  fireEvent.click(screen.getByRole("button", { name: "Dismiss Enterprise message" }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
