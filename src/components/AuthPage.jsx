import React, { useState } from "react";
import { ArrowLeft, CircleNotch } from "@phosphor-icons/react";
import Interactive3DBackground from "./Interactive3DBackground";
import { SYSTEM_API_BASE_URL } from "../utils/apiConfig";
import { jsonOrError } from "../lib/api";
import { createAuthSession, saveAuthSession } from "../lib/auth";
import {
  DEVELOPMENT_DEMO_EMAIL,
  DEVELOPMENT_DEMO_PASSWORD,
} from "../lib/developmentAuth";

const AuthPage = ({ onAuthSuccess, onBack }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(import.meta.env.DEV ? DEVELOPMENT_DEMO_EMAIL : "");
  const [password, setPassword] = useState(import.meta.env.DEV ? DEVELOPMENT_DEMO_PASSWORD : "");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const switchMode = nextMode => {
    setMode(nextMode);
    if (nextMode === "login" && import.meta.env.DEV) {
      setEmail(DEVELOPMENT_DEMO_EMAIL);
      setPassword(DEVELOPMENT_DEMO_PASSWORD);
    } else if (nextMode === "signup") {
      setEmail("");
      setPassword("");
    }
    setError("");
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return setError("Email is required.");
    if (!password) return setError("Password is required.");
    if (mode === "signup" && password.length < 8) {
      return setError("Use a password with at least 8 characters.");
    }
    if (mode === "signup" && !name.trim()) return setError("Full name is required.");
    if (mode === "signup" && !acceptedTerms) {
      return setError("Accept the Terms of Service and Privacy Policy to continue.");
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${SYSTEM_API_BASE_URL}/v1/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup"
            ? { email: normalizedEmail, password, name: name.trim() }
            : { email: normalizedEmail, password },
        ),
      });
      const data = await jsonOrError(response);
      const session = createAuthSession(data.access_token, {
        email: normalizedEmail,
        name: name.trim(),
      });
      saveAuthSession(session);
      onAuthSuccess(session);
    } catch (authError) {
      setError(authError.message || "Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-zinc-100 relative overflow-hidden p-4 sm:p-8">
      <Interactive3DBackground />

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute top-5 left-5 z-20 flex items-center gap-2 text-sm font-semibold text-zinc-300 bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-lg hover:border-zinc-600 hover:text-white"
        >
          <ArrowLeft size={16} weight="bold" /> Back to home
        </button>
      )}

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
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-zinc-400">
              Your account keeps payments, credits, and generated work private.
            </p>
          </div>

          <div className="flex border-b border-zinc-800 mb-6" role="tablist" aria-label="Authentication mode">
            {[{ id: "login", label: "Log in" }, { id: "signup", label: "Sign up" }].map(tab => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mode === tab.id}
                className={`flex-1 pb-3 text-sm font-semibold relative ${
                  mode === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
                onClick={() => switchMode(tab.id)}
              >
                {tab.label}
                {mode === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
              </button>
            ))}
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
                Full name
                <input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
            )}

            {mode === "login" && import.meta.env.DEV && (
              <p className="text-xs text-zinc-400 text-center py-1">
                Local demo · <span className="text-zinc-200 font-medium">{DEVELOPMENT_DEMO_EMAIL}</span>
                {" · "}<span className="text-zinc-200 font-medium">{DEVELOPMENT_DEMO_PASSWORD}</span>
              </p>
            )}
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
              Email
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
              Password
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>

            {mode === "signup" && (
              <label className="flex items-start gap-3 text-xs text-zinc-400 leading-relaxed mt-1">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={event => setAcceptedTerms(event.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-accent shrink-0"
                />
                <span>
                  I accept the <a href="/terms" className="text-zinc-200 underline underline-offset-2">Terms of Service</a> and Privacy Policy.
                </span>
              </label>
            )}

            {error && (
              <div role="alert" className="p-3 bg-red-950/50 text-red-300 text-sm rounded-lg border border-red-900">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-accent text-[#0a0a0a] py-3.5 rounded-xl font-bold text-sm hover:bg-lime-400 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {submitting && <CircleNotch size={18} className="animate-spin" />}
              {submitting ? "Please wait" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
