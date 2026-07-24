import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import Interactive3DBackground from "./Interactive3DBackground";

const DEFAULT_PASSWORD = "123456";
const USERS_STORAGE_KEY = "ready2marketplace_users";
const SESSION_STORAGE_KEY = "ready2marketplace_session";

const createUserId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `user-${Date.now()}`;
};

const readUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

const writeUsers = users => localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

const AuthPage = ({ onAuthSuccess, onBack }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [error, setError] = useState("");

  const handleSubmit = event => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) { setError("Email is required."); return; }
    if (!password) { setError("Password is required."); return; }

    const users = readUsers();

    if (mode === "signup") {
      if (!name.trim()) { setError("Name is required."); return; }
      if (users.some(u => u.email === normalizedEmail)) {
        setError("An account with this email already exists.");
        return;
      }
      const nextUser = { id: createUserId(), name: name.trim(), email: normalizedEmail, password };
      writeUsers([...users, nextUser]);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
      onAuthSuccess(nextUser);
      return;
    }

    const fallback = {
      id: "default-demo-user",
      name: "Demo User",
      email: "admin@pixtall.ai",
      password: DEFAULT_PASSWORD
    };
    const existing =
      users.find(u => u.email === normalizedEmail) ||
      (normalizedEmail === fallback.email ? fallback : null);

    if (!existing) { setError("Account not found. Sign up to create one."); return; }
    if (existing.password !== password) { setError("Incorrect password."); return; }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(existing));
    onAuthSuccess(existing);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a] text-zinc-100 relative overflow-hidden font-sans selection:bg-accent/20 p-4">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* 3D Particle Simulator Background */}
      <Interactive3DBackground />

      {/* Top Bar / Back button */}
      <div className="absolute top-6 left-6 z-20">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-zinc-100 bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-xl backdrop-blur-md hover:border-zinc-700 transition-all"
          >
            <ArrowLeft size={16} weight="bold" /> Back to Home
          </button>
        )}
      </div>

      {/* Brand Logo Header */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-3 shadow-[0_0_40px_rgba(132,204,22,0.3)]">
          <span className="text-[#0a0a0a] font-bold text-2xl tracking-tighter">PS</span>
        </div>
        <span className="text-zinc-100 text-xl font-semibold tracking-tight">Pixtall AI Pro</span>
      </div>

      {/* Auth card — Dark Mode Card for perfect text visibility */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#121215] rounded-3xl shadow-2xl p-8 border border-zinc-800/80 backdrop-blur-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-100 mb-1">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-zinc-400">Build listing-ready product creatives in minutes.</p>
          </div>

          <div className="flex border-b border-zinc-800 mb-6">
            <button
              type="button"
              className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
                mode === "login" 
                  ? "text-zinc-100" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Log in
              {mode === "login" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
              )}
            </button>
            <button
              type="button"
              className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
                mode === "signup" 
                  ? "text-zinc-100" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              onClick={() => { setMode("signup"); setError(""); }}
            >
              Sign up
              {mode === "signup" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Full name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
              />
            </div>

            <p className="text-xs text-zinc-400 text-center py-1">
              Demo account · <span className="text-zinc-200 font-medium">admin@pixtall.ai</span> · <span className="text-zinc-200 font-medium">123456</span>
            </p>

            {error && (
              <div className="p-3 bg-red-950/60 text-red-400 text-xs rounded-xl border border-red-800/60 font-medium flex gap-2 items-center">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="w-full bg-accent text-[#0a0a0a] py-3.5 rounded-xl font-bold text-sm hover:bg-lime-400 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(132,204,22,0.25)] mt-1">
              {mode === "login" ? "Enter studio →" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          No credit card required · Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
export { SESSION_STORAGE_KEY };