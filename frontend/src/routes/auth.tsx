import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { getStoredAuthSession, setAuthSession } from "../lib/api-client";
import "../routeTree.gen";

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const apiBase = env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";
const signupEndpoint = env.VITE_AUTH_SIGNUP_URL ?? `${apiBase}/api/auth/register`;
const loginEndpoint = env.VITE_AUTH_LOGIN_URL ?? `${apiBase}/api/auth/login`;

export const Route = createFileRoute('/auth')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Sign in — StreamVibe' },
      { name: 'description', content: 'Sign in or create your StreamVibe creator account.' },
    ],
  }),
  beforeLoad: () => {
    if (getStoredAuthSession()) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthPage,
})

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = mode === "signup" ? signupEndpoint : loginEndpoint;
      const payload =
        mode === "signup"
          ? {
              email,
              password,
              username: username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
            }
          : { authname: email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const body = text ? safeJson(text) : null;
      if (!res.ok) {
        const message = extractErrorMessage(body) ?? "Authentication failed";
        throw new Error(message);
      }

      const token = extractToken(body);
      if (!token) throw new Error("The backend did not return an authentication token.");

      const user = extractUser(body);
      setAuthSession({ token, user: user ?? (extractUserId(body) ? { id: extractUserId(body) } : null) });
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function safeJson(text: string): unknown {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  function extractErrorMessage(body: unknown): string | null {
    if (!body || typeof body !== "object") return null;
    const candidate = body as Record<string, unknown>;
    if (typeof candidate.error === "string" && candidate.error) return candidate.error;
    if (typeof candidate.message === "string" && candidate.message) return candidate.message;
    if (typeof candidate.detail === "string" && candidate.detail) return candidate.detail;
    return null;
  }

  function extractToken(body: unknown): string | null {
    if (!body || typeof body !== "object") return null;
    const candidate = body as Record<string, unknown>;
    if (typeof candidate.token === "string" && candidate.token) return candidate.token;
    if (typeof candidate.access_token === "string" && candidate.access_token) return candidate.access_token;
    if (typeof candidate.accessToken === "string" && candidate.accessToken) return candidate.accessToken;
    if (candidate.data && typeof candidate.data === "object") {
      const nested = candidate.data as Record<string, unknown>;
      if (typeof nested.token === "string" && nested.token) return nested.token;
      if (typeof nested.access_token === "string" && nested.access_token) return nested.access_token;
      if (typeof nested.accessToken === "string" && nested.accessToken) return nested.accessToken;
    }
    return null;
  }

  function extractUser(body: unknown) {
    if (!body || typeof body !== "object") return null;
    const candidate = body as Record<string, unknown>;
    if (candidate.user && typeof candidate.user === "object") return candidate.user as Record<string, unknown>;
    if (candidate.profile && typeof candidate.profile === "object") return candidate.profile as Record<string, unknown>;
    if (candidate.data && typeof candidate.data === "object") {
      const nested = candidate.data as Record<string, unknown>;
      if (nested.user && typeof nested.user === "object") return nested.user as Record<string, unknown>;
      if (nested.profile && typeof nested.profile === "object") return nested.profile as Record<string, unknown>;
    }
    return null;
  }

  function extractUserId(body: unknown): string | null {
    if (!body || typeof body !== "object") return null;
    const candidate = body as Record<string, unknown>;
    if (typeof candidate.userId === "string" && candidate.userId) return candidate.userId;
    if (typeof candidate.id === "string" && candidate.id) return candidate.id;
    if (typeof candidate.user_id === "string" && candidate.user_id) return candidate.user_id;
    if (candidate.data && typeof candidate.data === "object") {
      const nested = candidate.data as Record<string, unknown>;
      if (typeof nested.userId === "string" && nested.userId) return nested.userId;
      if (typeof nested.id === "string" && nested.id) return nested.id;
      if (typeof nested.user_id === "string" && nested.user_id) return nested.user_id;
    }
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo" style={{ fontSize: "2rem", marginBottom: 24 }}>
          Stream<span>Vibe</span>
        </div>
        <h1 style={{ margin: "0 0 6px" }}>
          {mode === "login" ? "Welcome back" : "Create your channel"}
        </h1>
        <p style={{ color: "var(--muted)", margin: "0 0 24px" }}>
          {mode === "login"
            ? "Sign in to your creator account"
            : "Start uploading in under a minute"}
        </p>

        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && (
            <>
              <div className="form-row">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_handle"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_]+"
                />
              </div>
              <div className="form-row">
                <label className="form-label">Display name</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            </>
          )}
          <div className="form-row">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-row">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn-upload" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, color: "var(--muted)", fontSize: "0.9rem" }}>
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
