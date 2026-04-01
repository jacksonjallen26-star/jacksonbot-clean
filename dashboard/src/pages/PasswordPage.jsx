import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;


// =============================
// Forgot Password Page
// =============================
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setStatus("✅ If that email exists you'll receive a reset link shortly.");
      } else {
        setStatus("❌ Something went wrong, please try again.");
      }
    } catch (err) {
      setStatus("❌ Something went wrong, please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#0f0f17", border: "1px solid #1e1e2e", borderRadius: 12, padding: "40px 36px", width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Reset your password</div>
        <div style={{ fontSize: 13, color: "#555577", marginBottom: 24 }}>Enter your email and we'll send you a reset link.</div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="you@company.com"
          />
        </div>

        {status && <div style={{ fontSize: 13, marginBottom: 12, color: status.includes("✅") ? "#4ade80" : "#f87171" }}>{status}</div>}

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", padding: "10px" }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "#555577" }}>
          Remember it?{" "}
          <a href="/login" style={{ color: "#a78bfa", textDecoration: "none" }}>Back to login</a>
        </div>
      </div>
    </div>
  );
}

// =============================
// Reset Password Page
// =============================
function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = new URLSearchParams(window.location.search).get("token");

  const handleSubmit = async () => {
    if (password !== confirm) {
      setStatus("❌ Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (data.success) {
        setStatus("✅ Password reset successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (err) {
      setStatus("❌ Something went wrong, please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#0f0f17", border: "1px solid #1e1e2e", borderRadius: 12, padding: "40px 36px", width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Choose a new password</div>
        <div style={{ fontSize: 13, color: "#555577", marginBottom: 24 }}>Must be at least 8 characters.</div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Repeat your password"
          />
        </div>

        {status && <div style={{ fontSize: 13, marginBottom: 12, color: status.includes("✅") ? "#4ade80" : "#f87171" }}>{status}</div>}

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", padding: "10px" }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

export { ForgotPasswordPage, ResetPasswordPage };