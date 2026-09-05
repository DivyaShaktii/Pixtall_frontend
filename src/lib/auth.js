const AUTH_SESSION_KEY = "pixtall_auth_session";

const decodeJwtPayload = token => {
  try {
    const encoded = token.split(".")[1];
    if (!encoded) return null;
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
};

export const createAuthSession = (accessToken, fallbackUser = {}) => {
  const claims = decodeJwtPayload(accessToken);
  if (!claims?.sub) throw new Error("The server returned an invalid access token.");
  return {
    accessToken,
    expiresAt: typeof claims.exp === "number" ? claims.exp : null,
    user: {
      id: claims.sub,
      email: claims.email || fallbackUser.email || "",
      name: claims.name || fallbackUser.name || "",
    },
  };
};

export const saveAuthSession = session => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

export const readAuthSession = () => {
  try {
    const session = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
    if (!session?.accessToken || !session?.user?.id) return null;
    if (session.expiresAt && session.expiresAt * 1000 <= Date.now()) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
};

export const readAccessToken = () => readAuthSession()?.accessToken || "";

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_SESSION_KEY);
};
