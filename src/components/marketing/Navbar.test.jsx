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
  const featuresLink = screen.getByRole("link", { name: "Features" });
  const pricingLink = screen.getByRole("link", { name: "Pricing" });
  expect(featuresLink).toHaveAttribute("href", "/");
  expect(pricingLink).toHaveAttribute("href", "/");
  fireEvent.click(featuresLink);
  expect(window.location.hash).toBe("");
  expect(window.scrollTo).toHaveBeenCalled();
  expect(document.getElementById("features")).toHaveFocus();
  window.history.replaceState(null, "", "/#features");
  fireEvent.click(pricingLink);
  expect(window.location.hash).toBe("");
});

it("directs Enterprise enquiries to the custom-plans contact address", () => {
  render(<Navbar />);
  expect(screen.getByRole("link", { name: "Enterprise" })).toHaveAttribute(
    "href",
    "https://www.aivatika.com/contact",
  );
});

it("closes mobile navigation after selecting a section", () => {
  render(<><Navbar /><section id="pricing">Pricing content</section></>);
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  fireEvent.click(screen.getAllByRole("link", { name: "Pricing" })[1]);
  expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  expect(window.location.hash).toBe("");
});

it("shows separate contact and support routes in the landing footer", () => {
  render(<Footer />);
  expect(screen.getByRole("link", { name: "Contact AI Vatika" })).toHaveAttribute(
    "href",
    "https://www.aivatika.com/contact",
  );
  expect(screen.getByRole("link", { name: "support@aivatika.com" })).toHaveAttribute(
    "href",
    expect.stringMatching(/^mailto:support@aivatika\.com\?subject=/),
  );
});
