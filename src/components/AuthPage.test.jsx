import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const googleIdentityMock = vi.hoisted(() => ({
  callback: null,
  initialize: vi.fn(config => {
    googleIdentityMock.callback = config.callback;
  }),
  loadGoogleIdentity: vi.fn(),
  renderButton: vi.fn(),
}));

vi.mock("./Interactive3DBackground", () => ({
  default: () => <div data-testid="auth-background" />,
}));

vi.mock("../lib/googleIdentity", () => ({
  loadGoogleIdentity: googleIdentityMock.loadGoogleIdentity,
}));

import AuthPage from "./AuthPage";

const token = user => {
  const encode = value => window.btoa(JSON.stringify(value))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + 300,
  })}.signature`;
};

const successfulResponse = user => ({
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({ access_token: token(user), token_type: "Bearer" }),
});

describe("custom JWT authentication", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    googleIdentityMock.callback = null;
    googleIdentityMock.initialize.mockClear();
    googleIdentityMock.loadGoogleIdentity.mockReset().mockResolvedValue({
      accounts: { id: googleIdentityMock },
    });
    googleIdentityMock.renderButton.mockClear();
  });

  it("creates an account only after verifying the emailed code", async () => {
    const user = {
      id: "00000000-0000-0000-0000-000000000010",
      email: "asha@example.com",
      name: "Asha Rao",
    };
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: vi.fn().mockResolvedValue({ message: "Enter the verification code" }),
      })
      .mockResolvedValueOnce(successfulResponse(user));
    const onAuthSuccess = vi.fn();

    render(<AuthPage onAuthSuccess={onAuthSuccess} />);
    fireEvent.click(screen.getByRole("tab", { name: "Sign up" }));
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Asha Rao" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: " ASHA@EXAMPLE.COM " } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secure-pass" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/v1/auth/signup"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "asha@example.com",
          password: "secure-pass",
          name: "Asha Rao",
        }),
      }),
    ));
    expect(await screen.findByRole("heading", { name: "Verify your email" })).toBeVisible();
    expect(onAuthSuccess).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "471208" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify and create account" }));

    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("/v1/auth/signup/verify"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "asha@example.com", code: "471208" }),
      }),
    ));
    expect(onAuthSuccess).toHaveBeenCalledWith(expect.objectContaining({ user }));
  });

  it("resends a manual sign-up verification code", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: vi.fn().mockResolvedValue({ message: "Enter the verification code" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: vi.fn().mockResolvedValue({ message: "Enter the verification code" }),
      });

    render(<AuthPage onAuthSuccess={vi.fn()} />);
    fireEvent.click(screen.getByRole("tab", { name: "Sign up" }));
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Asha Rao" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "asha@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secure-pass" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await screen.findByRole("heading", { name: "Verify your email" });
    fireEvent.click(screen.getByRole("button", { name: "Resend code" }));

    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("/v1/auth/signup/resend"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "asha@example.com" }),
      }),
    ));
  });

  it("logs in through the system API and stores the JWT session", async () => {
    const user = {
      id: "00000000-0000-0000-0000-000000000011",
      email: "seller@example.com",
      name: "Seller",
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(successfulResponse(user));
    const onAuthSuccess = vi.fn();

    render(<AuthPage onAuthSuccess={onAuthSuccess} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: user.email } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secure-pass" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/v1/auth/login"),
      expect.objectContaining({ method: "POST" }),
    ));
    expect(onAuthSuccess).toHaveBeenCalledWith(expect.objectContaining({ user }));
    expect(JSON.parse(localStorage.getItem("pixtall_auth_session"))).toEqual(
      expect.objectContaining({ accessToken: expect.any(String), user }),
    );
  });

  it("uses the seeded demo credentials through the login endpoint", async () => {
    const user = {
      id: "00000000-0000-0000-0000-000000000001",
      email: "demo@pixtall.dev",
      name: "Pixtall Demo User",
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(successfulResponse(user));

    render(<AuthPage onAuthSuccess={vi.fn()} />);
    expect(screen.getByLabelText("Email")).toHaveValue("demo@pixtall.dev");
    expect(screen.getByLabelText("Password")).toHaveValue("123456");
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/v1/auth/login"),
      expect.objectContaining({
        body: JSON.stringify({ email: "demo@pixtall.dev", password: "123456" }),
      }),
    ));
  });

  it("exchanges a verified Google credential for a Pixtall session", async () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "web-client.apps.googleusercontent.com");
    const user = {
      id: "00000000-0000-0000-0000-000000000012",
      email: "google-user@example.com",
      name: "Google User",
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(successfulResponse(user));
    const onAuthSuccess = vi.fn();

    render(<AuthPage onAuthSuccess={onAuthSuccess} />);

    await waitFor(() => expect(googleIdentityMock.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "web-client.apps.googleusercontent.com" }),
    ));

    await act(async () => {
      googleIdentityMock.callback({ credential: "google-id-token" });
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/v1/auth/google"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ credential: "google-id-token" }),
      }),
    ));
    expect(onAuthSuccess).toHaveBeenCalledWith(expect.objectContaining({ user }));
  });

  it("requests a password reset without revealing whether the account exists", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 202,
      json: vi.fn().mockResolvedValue({
        message: "If an account exists for this email, a password reset link has been sent.",
      }),
    });

    render(<AuthPage onAuthSuccess={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: " OWNER@EXAMPLE.COM " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/v1/auth/password/forgot"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "owner@example.com" }),
      }),
    ));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "If an account exists for this email",
    );
  });
});
