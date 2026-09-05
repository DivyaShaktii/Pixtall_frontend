import { clearAuthSession, readAccessToken } from "./auth";

export const authenticatedFetch = async (url, options = {}) => {
  const accessToken = readAccessToken();
  if (!accessToken) throw new Error("Please sign in to continue.");

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) clearAuthSession();
  return response;
};

export const jsonOrError = async response => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.detail === "string"
      ? payload.detail
      : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload;
};
