import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;


// =============================
// Login Page
// =============================
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  

  const handleLogin = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("companyId", data.companyId);
      localStorage.setItem("role", data.role);
      navigate("/dashboard");

    } catch (err) {
      setError("Something went wrong");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <a href="https://askra.app" style={{
  position: "fixed",
  top: 20,
  left: 24,
  display: "flex",
  alignItems: "center",
  gap: 6,
  color: "#555577",
  textDecoration: "none",
  fontSize: 13,
  transition: "color 0.15s"
}}
onMouseOver={(e) => e.currentTarget.style.color = "#a78bfa"}
onMouseOut={(e) => e.currentTarget.style.color = "#555577"}
>
  ← Back to Askra
</a>
      <div style={{
        background: "#0f0f17",
        border: "1px solid #1e1e2e",
        borderRadius: 12,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 380
      }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
            Askra Dashboard
            <span style={{
              fontSize: 10,
              background: "#7c3aed22",
              color: "#a78bfa",
              border: "1px solid #7c3aed44",
              padding: "2px 6px",
              borderRadius: 4,
              marginLeft: 8,
              fontFamily: "monospace"
            }}>BETA</span>
          </div>
          <div style={{ fontSize: 13, color: "#555577" }}>Sign in to your dashboard</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="you@company.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <div className="error-text" style={{ marginTop: 10 }}>{error}</div>}

<div style={{ textAlign: "right", marginTop: 8 }}>
  <a href="/forgot-password" style={{ fontSize: 12, color: "#555577", textDecoration: "none" }}
    onMouseOver={(e) => e.currentTarget.style.color = "#a78bfa"}
    onMouseOut={(e) => e.currentTarget.style.color = "#555577"}
  >
    Forgot password?
  </a>
</div>

        <button
          className="btn btn-primary"
          onClick={handleLogin}
          style={{ width: "100%", marginTop: 20, justifyContent: "center", padding: "10px" }}
        >
          Sign In
        </button>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "#555577", width: "100%" }}>
  Don't have an account?{" "}
  <a href="/register" style={{ color: "#a78bfa", textDecoration: "none" }}>Get started free</a>
</div>
      </div>
  </div>
  );
}

export default LoginPage;