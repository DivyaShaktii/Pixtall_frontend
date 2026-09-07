import React, { useEffect, useState } from "react";
import { ArrowLeft, CircleNotch } from "@phosphor-icons/react";
import Interactive3DBackground from "./Interactive3DBackground";
import { SYSTEM_API_BASE_URL } from "../utils/apiConfig";
import { jsonOrError } from "../lib/api";

const readResetToken = () => new URLSearchParams(window.location.search).get("token") || "";

const ResetPasswordPage = ({ onReturnToLogin }) => {
  const [token] = useState(readResetToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (token) window.history.replaceState({}, "", "/reset-password");
  }, [token]);

  const handleSubmit = async event => {
    event.preventDefault();
    setError("");

    if (!token) return setError("This reset link is missing its security token.");
    if (password.length < 8) return setError("Use a password with at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setSubmitting(true);
    try {
      const response = await fetch(`${SYSTEM_API_BASE_URL}/v1/auth/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirm_password: confirmPassword }),
      });
      await jsonOrError(response);
      setComplete(true);
      setPassword("");
      setConfirmPassword("");
    } catch (resetError) {
      setError(resetError.message || "Could not reset your password. Please request a new link.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-zinc-100 relative overflow-hidden p-4 sm:p-8">
      <Interactive3DBackground />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-accent text-[#0a0a0a] flex items-center justify-center font-bold text-lg">
            PS
          </div>
          <div>
            <p className="text-zinc-100 font-semibold leading-tight">Pixtall</p>
            <p className="text-xs text-zinc-400">by AI Vatika</p>
          </div>
        </div>

        <div className="bg-[#121215] rounded-2xl p-6 sm:p-8 border border-zinc-800">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">
              {complete ? "Password updated" : "Choose a new password"}
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400">
              {complete
                ? "Your previous sessions have been closed. Log in with your new password."
                : "Use at least 8 characters. This reset link can only be used once."}
            </p>
          </div>

          {complete ? (
            <button
              type="button"
              onClick={onReturnToLogin}
              className="auth-primary-button w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98]"
            >
              Continue to login
            </button>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
                New password
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>

              {error && (
                <div role="alert" className="p-3 bg-red-950/50 text-red-300 text-sm rounded-lg border border-red-900">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="auth-primary-button w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98]"
              >
                {submitting && <CircleNotch size={18} className="animate-spin" />}
                {submitting ? "Updating password" : "Update password"}
              </button>
            </form>
          )}

          {!complete && (
            <button
              type="button"
              onClick={onReturnToLogin}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-zinc-400 hover:text-white"
            >
              <ArrowLeft size={16} weight="bold" /> Request another link
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
