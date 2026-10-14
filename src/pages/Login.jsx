import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postLogin, setSession } from "../api.js";
import { COMPANY } from "../data/content.js";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ state: "idle", msg: "" });
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus({ state: "idle", msg: "" });
    try {
      const res = await postLogin(form);
      setSession(res.token, res.user);
      navigate("/admin", { replace: true });
    } catch (err) {
      setStatus({ state: "err", msg: err.message || "Login failed." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <img src="/tct-logo.png" alt="Trend Code Technology logo" className="brand-img" />
        <span className="eyebrow on-dark">Client Portal</span>
        <h1>Welcome back to Trend Code Technology</h1>
        <p>
          Track project status, review deliverables and chat with your
          delivery team — all from one dashboard.
        </p>
        <ul>
          <li><i className="bi bi-check-circle-fill"></i> Live project timelines and milestones</li>
          <li><i className="bi bi-check-circle-fill"></i> Secure file and invoice sharing</li>
          <li><i className="bi bi-check-circle-fill"></i> Direct line to your delivery manager</li>
        </ul>
      </div>

      <div className="auth-main">
        <form className="form-card" onSubmit={onSubmit} noValidate>
          <h3>Sign In</h3>
          <p style={{ color: "var(--muted)", fontSize: 14.5, marginTop: -6 }}>
            Access the TCT client portal.
          </p>

          {status.state === "ok" && (
            <div className="banner ok"><i className="bi bi-check-circle me-1"></i>{status.msg}</div>
          )}
          {status.state === "err" && (
            <div className="banner err"><i className="bi bi-exclamation-triangle me-1"></i>{status.msg}</div>
          )}

          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
            />
          </div>
          <div className="field">
            <label htmlFor="login-pass">Password</label>
            <div className="password-field">
              <input
                id="login-pass"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy ? "Signing in…" : "Sign In"}
          </button>

          <p className="form-note" style={{ textAlign: "center" }}>
            Trouble signing in? Email{" "}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          </p>
        </form>
      </div>
    </div>
  );
}
