import React, { useEffect, useState } from "react";
import { authenticatedFetch, jsonOrError } from "../lib/api";
import { createAuthSession, saveAuthSession } from "../lib/auth";
import { SYSTEM_API_BASE_URL } from "../utils/apiConfig";

const PAGE_SIZE = 10;
const labels = {
  granted: "Credits added", purchased: "Credits purchased", reserved: "Generation reserved",
  used: "Generation completed", released: "Unused credits returned", expired: "Credits expired",
  refunded: "Credits refunded",
};
const fieldClass = "w-full bg-cloud border border-line rounded-lg px-3 py-2 text-ink";

export default function SettingsPage({ user }) {
  const [passwords, setPasswords] = useState({ current_password: "", password: "", confirm_password: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHistoryError("");
    authenticatedFetch(`${SYSTEM_API_BASE_URL}/v1/credit-transactions?limit=${PAGE_SIZE}&offset=${offset}`)
      .then(jsonOrError)
      .then(data => { if (!cancelled) setHistory(data.items); })
      .catch(err => { if (!cancelled) setHistoryError(err.message || "Could not load credit history."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [offset, refresh]);

  async function updatePassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (passwords.password !== passwords.confirm_password) {
      setError("New passwords do not match.");
      return;
    }
    if (new TextEncoder().encode(passwords.password).length > 72) {
      setError("New password must be at most 72 UTF-8 bytes.");
      return;
    }
    setSaving(true);
    try {
      const data = await jsonOrError(await authenticatedFetch(`${SYSTEM_API_BASE_URL}/v1/auth/password/change`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(passwords),
      }));
      saveAuthSession(createAuthSession(data.access_token));
      setPasswords({ current_password: "", password: "", confirm_password: "" });
      setMessage("Password updated. Other sessions have been signed out.");
    } catch (err) {
      setError(err.message || "Could not update your password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-8">
      <div><h1 className="text-3xl font-bold text-ink mb-2 tracking-tight">Settings</h1>
        <p className="text-slate">Your account, password, and credit activity.</p></div>
      <section aria-labelledby="profile-title" className="bg-paper border border-line rounded-2xl p-5 sm:p-6">
        <h2 id="profile-title" className="text-lg font-semibold text-ink">Profile</h2>
        <p className="text-sm text-slate mt-1 mb-5">Your name and email are read-only.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm text-ink flex flex-col gap-2">Full name
            <input className={fieldClass} value={user?.name || ""} readOnly autoComplete="name" /></label>
          <label className="text-sm text-ink flex flex-col gap-2">Email address
            <input className={fieldClass} type="email" value={user?.email || ""} readOnly autoComplete="email" /></label>
        </div>
      </section>
      <section aria-labelledby="password-title" className="bg-paper border border-line rounded-2xl p-5 sm:p-6">
        <h2 id="password-title" className="text-lg font-semibold text-ink">Update password</h2>
        {user?.has_password === false ? <p className="text-sm text-slate mt-2">You sign in with Google. Manage your password in your Google account.</p> : (
          <form onSubmit={updatePassword} className="mt-4 flex flex-col gap-4 max-w-lg">
            <p className="text-sm text-slate">Use at least 8 characters. Updating your password signs out other sessions.</p>
            {[["current_password", "Current password"], ["password", "New password"], ["confirm_password", "Confirm new password"]].map(([key, label]) => (
              <label key={key} className="text-sm text-ink flex flex-col gap-2">{label}
                <input type="password" className={fieldClass} required disabled={saving}
                  autoComplete={key === "current_password" ? "current-password" : "new-password"}
                  minLength={key === "current_password" ? 1 : 8} maxLength={128}
                  value={passwords[key]} onChange={e => setPasswords(previous => ({ ...previous, [key]: e.target.value }))} />
              </label>
            ))}
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
            {message && <p role="status" className="text-sm text-accent">{message}</p>}
            <button type="submit" disabled={saving} className="auth-primary-button self-start px-5 py-2.5 rounded-lg disabled:opacity-50">{saving ? "Updating…" : "Update password"}</button>
          </form>
        )}
      </section>
      <section aria-labelledby="history-title" className="bg-paper border border-line rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 id="history-title" className="text-lg font-semibold text-ink">Credit history</h2>
          <button onClick={() => { setOffset(0); setRefresh(v => v + 1); }} disabled={loading} className="text-sm text-accent px-3 py-2 disabled:opacity-50">Refresh</button>
        </div>
        <p className="text-sm text-slate mt-1 mb-4">Credits are reserved when a generation starts, then used or returned. Completed usage is not a second charge.</p>
        {loading ? <p role="status" className="text-sm text-slate py-6">Loading credit history…</p> : historyError ? (
          <p role="alert" className="text-sm text-red-400 py-4">{historyError} Use Refresh to try again.</p>
        ) : history.length === 0 ? <p className="text-sm text-slate py-6">{offset ? "No more credit activity." : "No credit activity yet. Your grants and generations will appear here."}</p> : (
          <ul className="divide-y divide-line">
            {history.map(item => <li key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0"><p className="text-sm font-medium text-ink">{labels[item.type] || item.type}</p>
                <p className="text-xs text-slate mt-1"><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time></p>
                {item.job_id && <p className="text-xs text-slate mt-1 break-all">Generation {item.job_id}</p>}
              </div>
              <div className="sm:text-right shrink-0"><p className="text-sm text-ink tabular-nums">{item.credits} credits</p>
                <p className="text-xs text-slate mt-1 tabular-nums">{item.available_balance_after} available · {item.reserved_balance_after} reserved</p></div>
            </li>)}
          </ul>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-line pt-4 mt-2">
          <button disabled={loading || offset === 0} onClick={() => setOffset(v => Math.max(0, v - PAGE_SIZE))} className="border border-line rounded-lg px-4 py-2 text-sm text-ink disabled:opacity-40">Previous</button>
          <span className="text-xs text-slate">Page {offset / PAGE_SIZE + 1}</span>
          <button disabled={loading || !!historyError || history.length < PAGE_SIZE} onClick={() => setOffset(v => v + PAGE_SIZE)} className="border border-line rounded-lg px-4 py-2 text-sm text-ink disabled:opacity-40">Next</button>
        </div>
      </section>
    </div>
  );
}
