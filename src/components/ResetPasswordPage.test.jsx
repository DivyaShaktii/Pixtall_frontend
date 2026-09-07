import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./Interactive3DBackground", () => ({
  default: () => <div data-testid="auth-background" />,
}));

import ResetPasswordPage from "./ResetPasswordPage";

describe("password reset page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, "", `/reset-password?token=${"r".repeat(43)}`);
  });

  it("submits the one-time token and matching password", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ message: "Password updated" }),
    });

    render(<ResetPasswordPage onReturnToLogin={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-secure-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "new-secure-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/v1/auth/password/reset"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          token: "r".repeat(43),
          password: "new-secure-password",
          confirm_password: "new-secure-password",
        }),
      }),
    ));
    expect(await screen.findByRole("heading", { name: "Password updated" })).toBeVisible();
  });

  it("stops mismatched passwords before calling the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    render(<ResetPasswordPage onReturnToLogin={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-secure-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "different-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Passwords do not match");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
