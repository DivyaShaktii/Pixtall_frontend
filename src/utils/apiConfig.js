const DEFAULT_API_BASE_URL = "https://pixtallbackend-production-9ec3.up.railway.app";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

export const SYSTEM_API_BASE_URL = (
  import.meta.env.VITE_SYSTEM_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");
