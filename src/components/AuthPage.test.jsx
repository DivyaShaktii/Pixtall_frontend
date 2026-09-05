import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./Interactive3DBackground", () => ({
  default: () => <div data-testid="auth-background" />,
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
  });

  it("creates an account through the system API", async () => {
    const user = {
      id: "00000000-0000-0000-0000-000000000010",
      email: "asha@example.com",
      name: "Asha Rao",
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(successfulResponse(user));
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
    expect(onAuthSuccess).toHaveBeenCalledWith(expect.objectContaining({ user }));
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
});
