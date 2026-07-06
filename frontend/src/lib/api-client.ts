const AUTH_STORAGE_KEY = "streamvibe_auth_session";

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const API_BASE = env.VITE_API_URL?.replace(/\/$/, "")

if (!API_BASE) { 
    throw new Error('Unable to connect to server')
}

type StoredUser = {
  id?: string;
  [key: string]: unknown;
};

type StoredAuthSession = {
  token: string;
  user?: StoredUser | null;
};

export function getStoredAuthSession(): StoredAuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>;
    if (typeof parsed.token === "string" && parsed.token) {
      return { token: parsed.token, user: parsed.user ?? null };
    }
  } catch {
    // Ignore malformed session data and fall back to a cleared state.
  }

  return null;
}

export function getStoredAuthToken(): string | null {
  return getStoredAuthSession()?.token ?? null;
}

export function getStoredAuthUser(): StoredUser | null {
  return getStoredAuthSession()?.user ?? null;
}

export function setAuthSession(session: StoredAuthSession | null) {
  if (typeof window === "undefined") return;

  if (!session?.token) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  setAuthSession(null);
}

/**
 * fetch() wrapper that attaches the current user's JWT from local storage so our
 * server routes can identify the caller. Errors surface as thrown Error with the server's message.
 */
export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getStoredAuthToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(resolveApiUrl(path), { ...init, headers });
  const text = await res.text();
  const body = text ? safeJson(text) : null;
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    if (body && typeof body === "object" && "error" in body) {
      const err = (body as { error: unknown }).error;
      if (typeof err === "string" && err) message = err;
    } else if (body && typeof body === "object" && "message" in body) {
      const err = (body as { message: unknown }).message;
      if (typeof err === "string" && err) message = err;
    }
    const err = new Error(message) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return body as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
