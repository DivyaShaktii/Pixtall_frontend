import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, CircleNotch } from "@phosphor-icons/react";
import Interactive3DBackground from "./Interactive3DBackground";
import { SYSTEM_API_BASE_URL } from "../utils/apiConfig";
import { jsonOrError } from "../lib/api";
import { createAuthSession, saveAuthSession } from "../lib/auth";
import { loadGoogleIdentity } from "../lib/googleIdentity";
import {
  DEVELOPMENT_DEMO_EMAIL,
  DEVELOPMENT_DEMO_PASSWORD,
} from "../lib/developmentAuth";

const AuthPage = ({ onAuthSuccess, onBack }) => {
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(import.meta.env.DEV ? DEVELOPMENT_DEMO_EMAIL : "");
  const [password, setPassword] = useState(import.meta.env.DEV ? DEVELOPMENT_DEMO_PASSWORD : "");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [verificationMode, setVerificationMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(Boolean(googleClientId));
  const googleCredentialHandlerRef = useRef(null);

  const switchMode = nextMode => {
    setMode(nextMode);
    setRecoveryMode(false);
    setRecoverySent(false);
    setVerificationMode(false);
    setVerificationCode("");
    setVerificationSent(false);
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
    if (verificationMode) {
      if (!/^\d{6}$/.test(verificationCode)) {
        return setError("Enter the six-digit code from your email.");
      }
      setSubmitting(true);
      try {
        const response = await fetch(`${SYSTEM_API_BASE_URL}/v1/auth/signup/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, code: verificationCode }),
        });
        const data = await jsonOrError(response);
        const session = createAuthSession(data.access_token, {
          email: normalizedEmail,
          name: name.trim(),
        });
        saveAuthSession(session);
        onAuthSuccess(session);
      } catch (authError) {
        setError(authError.message || "Could not verify this code. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (recoveryMode) {
      setSubmitting(true);
      try {
        const response = await fetch(`${SYSTEM_API_BASE_URL}/v1/auth/password/forgot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail }),
        });
        await jsonOrError(response);
        setRecoverySent(true);
      } catch (authError) {
        setError(authError.message || "Could not request a reset link. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }
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
      if (mode === "signup") {
        setVerificationMode(true);
        setVerificationCode("");
        setVerificationSent(true);
        return;
      }
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

  const handleResendCode = async () => {
    setError("");
    setVerificationSent(false);
    setSubmitting(true);
    try {
      const response = await fetch(`${SYSTEM_API_BASE_URL}/v1/auth/signup/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      await jsonOrError(response);
      setVerificationCode("");
      setVerificationSent(true);
    } catch (authError) {
      setError(authError.message || "Could not send another code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = useCallback(async credential => {
    if (!credential) {
      setError("Google did not return a sign-in credential. Please try again.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`${SYSTEM_API_BASE_URL}/v1/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await jsonOrError(response);
      const session = createAuthSession(data.access_token);
      saveAuthSession(session);
      onAuthSuccess(session);
    } catch (authError) {
      setError(authError.message || "Google sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [onAuthSuccess]);

  useEffect(() => {
    googleCredentialHandlerRef.current = handleGoogleCredential;
  }, [handleGoogleCredential]);

  useEffect(() => {
    const buttonContainer = googleButtonRef.current;
    if (!googleClientId || !buttonContainer || recoveryMode || verificationMode) return undefined;

    let active = true;
    let resizeObserver;
    let lastRenderedWidth = null;
    setGoogleLoading(true);

    loadGoogleIdentity()
      .then(google => {
        if (!active) return;
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: response => googleCredentialHandlerRef.current?.(response?.credential),
          ux_mode: "popup",
          use_fedcm_for_prompt: true,
        });

        const renderButton = () => {
          if (!active || !googleButtonRef.current) return;
          const width = Math.min(400, Math.floor(googleButtonRef.current.clientWidth));
          // GIS can change its iframe height on hover/focus. Do not rebuild it
          // for height-only ResizeObserver notifications: that loses focus.
          if (width <= 0 || width === lastRenderedWidth) return;
          lastRenderedWidth = width;
          googleButtonRef.current.replaceChildren();
          google.accounts.id.renderButton(googleButtonRef.current, {
            type: "standard",
            theme: "filled_black",
            size: "large",
            text: mode === "signup" ? "signup_with" : "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
            width,
          });
        };

        renderButton();
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(renderButton);
          resizeObserver.observe(buttonContainer);
        }
        setGoogleLoading(false);
      })
      .catch(loadError => {
        if (!active) return;
        setGoogleLoading(false);
        setError(loadError.message || "Google sign-in is temporarily unavailable.");
      });

    return () => {
      active = false;
      resizeObserver?.disconnect();
    };
  }, [googleClientId, mode, recoveryMode, verificationMode]);

  return (
    <div className={`min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-zinc-100 relative overflow-hidden p-4 sm:p-8 ${onBack ? "pt-24 sm:pt-24" : ""}`}>
      <Interactive3DBackground />

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute top-5 left-5 z-20 flex min-h-11 items-center gap-2 text-sm font-semibold text-zinc-300 bg-zinc-950! border border-zinc-800 px-4 py-2 rounded-lg hover:border-zinc-600 hover:text-white"
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
              {verificationMode
                ? "Verify your email"
                : recoveryMode
                ? "Reset your password"
                : mode === "login"
                  ? "Welcome back"
                  : "Create your account"}
            </h1>
            <p className="text-sm text-zinc-400">
              {verificationMode
                ? `We sent a six-digit code to ${email.trim().toLowerCase()}.`
                : recoveryMode
                ? "Enter your account email and we will send you a secure reset link."
                : "Your account keeps payments, credits, and generated work private."}
            </p>
          </div>

          {!recoveryMode && !verificationMode && (
            <div className="flex border-b border-zinc-800 mb-6" role="tablist" aria-label="Authentication mode">
              {[{ id: "login", label: "Log in" }, { id: "signup", label: "Sign up" }].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={mode === tab.id}
                  className={`flex-1 min-h-11 pb-3 text-sm font-semibold relative ${
                    mode === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  onClick={() => switchMode(tab.id)}
                >
                  {tab.label}
                  {mode === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                </button>
              ))}
            </div>
          )}

          {googleClientId && !recoveryMode && !verificationMode && (
            <div className="mb-6">
              <div
                className={`relative min-h-11 w-full overflow-hidden rounded-md transition-opacity ${
                  submitting ? "pointer-events-none opacity-50" : "opacity-100"
                }`}
                aria-busy={googleLoading || submitting}
              >
                <div ref={googleButtonRef} className="min-h-11 w-full" />
                {googleLoading && (
                  <div className="absolute inset-0 h-11 w-full flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 text-sm font-medium text-zinc-300">
                    <CircleNotch size={17} className="animate-spin" /> Connecting to Google
                  </div>
                )}
              </div>
              {mode === "signup" && (
                <p className="mt-2 text-center text-[11px] leading-relaxed text-zinc-500">
                  By continuing with Google, you agree to our{" "}
                  <a href="/terms" className="text-zinc-300 underline underline-offset-2">Terms of Service</a>
                  {" "}and Privacy Policy.
                </p>
              )}
              <div className="mt-5 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-zinc-800" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  or use email
                </span>
                <span className="h-px flex-1 bg-zinc-800" />
              </div>
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {!recoveryMode && !verificationMode && mode === "signup" && (
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

            {!recoveryMode && !verificationMode && mode === "login" && import.meta.env.DEV && (
              <p className="text-xs text-zinc-400 text-center py-1">
                Local demo: <span className="text-zinc-200 font-medium">{DEVELOPMENT_DEMO_EMAIL}</span>
                {" / "}<span className="text-zinc-200 font-medium">{DEVELOPMENT_DEMO_PASSWORD}</span>
              </p>
            )}
            {!verificationMode && (
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
            )}
            {!recoveryMode && !verificationMode && (
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
            )}

            {verificationMode && (
              <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
                Verification code
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={event => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  autoComplete="one-time-code"
                  placeholder="000000"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-center text-xl font-semibold tracking-[0.35em] tabular-nums text-zinc-100 placeholder:text-zinc-600 focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
            )}

            {!recoveryMode && mode === "login" && (
              <button
                type="button"
                onClick={() => {
                  setRecoveryMode(true);
                  setRecoverySent(false);
                  setPassword("");
                  setError("");
                }}
                className="self-end text-sm font-semibold text-zinc-300 underline decoration-zinc-600 underline-offset-4 hover:text-white"
              >
                Forgot password?
              </button>
            )}

            {!verificationMode && mode === "signup" && (
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
            {recoverySent && (
              <div role="status" className="p-3 bg-lime-950/40 text-lime-200 text-sm leading-relaxed rounded-lg border border-lime-900">
                If an account exists for this email, a password reset link has been sent.
              </div>
            )}
            {verificationMode && verificationSent && (
              <div role="status" className="p-3 bg-lime-950/40 text-lime-200 text-sm leading-relaxed rounded-lg border border-lime-900">
                Verification code sent. Check your inbox and spam folder.
              </div>
            )}
            <button
              type="submit"
              disabled={submitting || recoverySent}
              className="auth-primary-button w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] mt-1"
            >
              {submitting && <CircleNotch size={18} className="animate-spin" />}
              {submitting
                ? "Please wait"
                : verificationMode
                  ? "Verify and create account"
                  : recoveryMode
                  ? recoverySent
                    ? "Email sent"
                    : "Send reset link"
                  : mode === "login"
                    ? "Log in"
                    : "Create account"}
            </button>
            {recoveryMode && (
              <button
                type="button"
                onClick={() => {
                  setRecoveryMode(false);
                  setRecoverySent(false);
                  setError("");
                }}
                className="w-full py-2 text-sm font-semibold text-zinc-400 hover:text-white"
              >
                Back to login
              </button>
            )}
            {verificationMode && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationMode(false);
                    setVerificationCode("");
                    setVerificationSent(false);
                    setError("");
                  }}
                  className="py-2 text-sm font-semibold text-zinc-400 hover:text-white"
                >
                  Change details
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={submitting}
                  className="py-2 text-sm font-semibold text-zinc-300 underline decoration-zinc-600 underline-offset-4 hover:text-white disabled:opacity-60"
                >
                  Resend code
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
