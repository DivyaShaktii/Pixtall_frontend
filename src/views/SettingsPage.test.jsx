import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import SettingsPage from "./SettingsPage";
import { authenticatedFetch } from "../lib/api";
import { saveAuthSession } from "../lib/auth";

vi.mock("../lib/api", () => ({ authenticatedFetch: vi.fn(), jsonOrError: async value => value }));
vi.mock("../lib/auth", () => ({ createAuthSession: value => ({ accessToken: value }), saveAuthSession: vi.fn() }));
const user = { name: "Actual User", email: "actual@example.com", has_password: true };
beforeEach(() => {
  vi.clearAllMocks();
  authenticatedFetch.mockResolvedValue({ items: [] });
});

it("shows immutable real profile information and an empty ledger", async () => {
  render(<SettingsPage user={user} />);
  expect(screen.getByLabelText("Full name")).toHaveValue(user.name);
  expect(screen.getByLabelText("Full name")).toHaveAttribute("readonly");
  expect(screen.getByLabelText("Email address")).toHaveAttribute("readonly");
  expect(await screen.findByText(/No credit activity yet/)).toBeInTheDocument();
});

it("updates a password and saves the refreshed session", async () => {
  render(<SettingsPage user={user} />);
  await screen.findByText(/No credit activity yet/);
  authenticatedFetch.mockResolvedValueOnce({ access_token: "new-token" });
  fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "old-password" } });
  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-password" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "new-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Update password" }));
  expect(await screen.findByText(/Password updated/)).toBeInTheDocument();
  expect(saveAuthSession).toHaveBeenCalledWith({ accessToken: "new-token" });
  expect(screen.getByLabelText("Current password")).toHaveValue("");
});

it("does not expose a password form for Google-only accounts", async () => {
  render(<SettingsPage user={{ ...user, has_password: false }} />);
  expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();
  expect(screen.getByText(/Manage your password in your Google account/)).toBeInTheDocument();
  await screen.findByText(/No credit activity yet/);
});

it("shows credit ledger entries and paginates", async () => {
  authenticatedFetch.mockResolvedValueOnce({ items: Array.from({ length: 10 }, (_, index) => ({
    id: String(index), type: "used", credits: 10, available_balance_after: 10,
    reserved_balance_after: 0, created_at: "2026-09-08T10:00:00Z", job_id: "job-1",
  })) });
  render(<SettingsPage user={user} />);
  expect(await screen.findAllByText("Generation completed")).toHaveLength(10);
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  await waitFor(() => expect(authenticatedFetch).toHaveBeenLastCalledWith(expect.stringContaining("offset=10")));
  expect(await screen.findByText("No more credit activity.")).toBeInTheDocument();
});

it("offers retry after a credit history failure", async () => {
  authenticatedFetch.mockRejectedValueOnce(new Error("Network unavailable"));
  render(<SettingsPage user={user} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Network unavailable");
  fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
  expect(await screen.findByText(/No credit activity yet/)).toBeInTheDocument();
});
