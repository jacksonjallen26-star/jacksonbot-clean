import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// =============================
// Protected Route
// =============================
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  return children;
}

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
    <div className="auth-bg">
      <a href="https://askra.app" style={{
        position: "fixed", top: 20, left: 24,
        display: "flex", alignItems: "center", gap: 6,
        color: "#444466", textDecoration: "none", fontSize: 13, transition: "color 0.15s", zIndex: 10
      }}
        onMouseOver={(e) => e.currentTarget.style.color = "#a78bfa"}
        onMouseOut={(e) => e.currentTarget.style.color = "#444466"}
      >
        ← Back to Askra
      </a>
      <div className="auth-card">
        <div style={{ marginBottom: 28 }}>
          <div className="auth-title">
            Askra Dashboard
            <span style={{
              fontSize: 9, background: "#7c3aed1a", color: "#a78bfa",
              border: "1px solid #7c3aed33", padding: "2px 6px", borderRadius: 4,
              marginLeft: 8, fontFamily: "monospace", verticalAlign: "middle"
            }}>BETA</span>
          </div>
          <div className="auth-subtitle">Sign in to your dashboard</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress} placeholder="you@company.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={handleKeyPress} placeholder="••••••••" />
          </div>
        </div>

        {error && <div className="error-text" style={{ marginTop: 10 }}>{error}</div>}

        <div style={{ textAlign: "right", marginTop: 8 }}>
          <a href="/forgot-password" style={{ fontSize: 12, color: "#444466", textDecoration: "none", transition: "color 0.15s" }}
            onMouseOver={(e) => e.currentTarget.style.color = "#a78bfa"}
            onMouseOut={(e) => e.currentTarget.style.color = "#444466"}
          >Forgot password?</a>
        </div>

        <button className="btn btn-primary" onClick={handleLogin} style={{ width: "100%", marginTop: 20, padding: "11px" }}>
          Sign In
        </button>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#444466" }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>Get started free</a>
        </div>
      </div>
    </div>
  );
}

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
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-title">Reset your password</div>
        <div className="auth-subtitle">Enter your email and we'll send you a reset link.</div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSubmit()} placeholder="you@company.com" />
        </div>

        {status && <div style={{ fontSize: 13, marginBottom: 12, color: status.includes("✅") ? "#4ade80" : "#f87171" }}>{status}</div>}

        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "11px" }}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#444466" }}>
          Remember it?{" "}
          <a href="/login" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>Back to login</a>
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
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-title">Choose a new password</div>
        <div className="auth-subtitle">Must be at least 8 characters.</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSubmit()} placeholder="Repeat your password" />
          </div>
        </div>

        {status && <div style={{ fontSize: 13, marginBottom: 12, color: status.includes("✅") ? "#4ade80" : "#f87171" }}>{status}</div>}

        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "11px" }}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

// =============================
// Register Page
// =============================
function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("free");

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan");
  if (plan && ["free", "starter", "pro"].includes(plan)) {
    setSelectedPlan(plan);
  }
}, []);

  const handleRegister = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${BACKEND_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, plan: selectedPlan })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    // Paid plan — redirect to Stripe, no token yet
    if (data.checkout) {
      window.location.href = data.url;
      return;
    }

    // Free plan — account created, store token and go to onboarding
    localStorage.setItem("token", data.token);
    localStorage.setItem("companyId", data.companyId);
    localStorage.setItem("role", data.role);
    navigate("/onboarding");

  } catch (err) {
    setError("Something went wrong");
    setLoading(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className="auth-bg">
      <a href="https://askra.app" style={{
        position: "fixed", top: 20, left: 24,
        display: "flex", alignItems: "center", gap: 6,
        color: "#444466", textDecoration: "none", fontSize: 13, transition: "color 0.15s", zIndex: 10
      }}
        onMouseOver={(e) => e.currentTarget.style.color = "#a78bfa"}
        onMouseOut={(e) => e.currentTarget.style.color = "#444466"}
      >
        ← Back to Askra
      </a>
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <div style={{ marginBottom: 24 }}>
          <div className="auth-title">
            Get started free
            <span style={{
              fontSize: 9, background: "#7c3aed1a", color: "#a78bfa",
              border: "1px solid #7c3aed33", padding: "2px 6px", borderRadius: 4,
              marginLeft: 8, fontFamily: "monospace", verticalAlign: "middle"
            }}>BETA</span>
          </div>
          <div className="auth-subtitle">Create your Askra account</div>
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
  <label>Plan</label>
  <select
    value={selectedPlan}
    onChange={(e) => setSelectedPlan(e.target.value)}
    style={{
      background: "#0a0a0f",
      border: "1px solid #1e1e2e",
      borderRadius: 6,
      padding: "8px 12px",
      color: "#e2e2e8",
      fontSize: 13,
      fontFamily: "DM Sans, sans-serif",
      width: "100%",
      outline: "none"
    }}
  >
    <option value="free">Free — $0/mo</option>
    <option value="starter">Starter — $29/mo</option>
    <option value="pro">Pro — $79/mo</option>
  </select>
</div>

<div style={{
  background: "#0a0a0f",
  border: "1px solid #1e1e2e",
  borderRadius: 8,
  padding: "14px 16px",
  marginBottom: 16
}}>
  <div style={{ fontSize: 11, color: "#555577", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
    What's included
  </div>
  {selectedPlan === "free" && (
    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> 100 messages per month</li>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> 1 PDF upload</li>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> Basic customization</li>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> Embed on any website</li>
    </ul>
  )}
  {selectedPlan === "starter" && (
    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> 5,000 messages per month</li>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> 10 PDF uploads</li>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> Full customization</li>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> Chat history</li>
    </ul>
  )}
  {selectedPlan === "pro" && (
    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> 50,000 messages per month</li>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> 75 PDF uploads</li>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> Full customization</li>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> Chat history</li>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> Priority support</li>
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> Early access to new features</li>
    </ul>
  )}
</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Joe's Plumbing"
            />
          </div>
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
              placeholder="At least 8 characters"
            />
          </div>
        </div>

        {error && <div className="error-text" style={{ marginTop: 10 }}>{error}</div>}

        <button className="btn btn-primary" onClick={handleRegister} disabled={loading} style={{ width: "100%", marginTop: 20, padding: "11px" }}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#444466" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>Sign in</a>
        </div>
      </div>
    </div>
  );
}


function OnboardingPage() {
  const companyId = localStorage.getItem("companyId");
  const navigate = useNavigate();

  const embedCode = `<script>
  window.AskraConfig = { companyId: "${companyId}" };
</script>
<script src="https://jacksonbot-clean.vercel.app/widget.js"></script>`;

  const [copied, setCopied] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUrl = async () => {
    if (!websiteUrl) {
      setError("Please enter your website URL");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/update-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ websiteUrl })
      });
      if (!res.ok) throw new Error("Failed to save");
      setStep(2);
    } catch (err) {
      setError("Failed to save. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ maxWidth: 580 }}>

        {step === 1 && (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: "#fff", marginBottom: 8, letterSpacing: -0.5 }}>
                👋 One quick thing
              </div>
              <div style={{ fontSize: 14, color: "#555577", lineHeight: 1.6 }}>
                What website will you be adding the Askra widget to? This is used to securely authorize your bot.
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Your Website URL</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourbusiness.com"
                onKeyPress={(e) => e.key === "Enter" && handleSaveUrl()}
              />
            </div>

            {error && <div style={{ fontSize: 13, color: "#f87171", marginBottom: 12 }}>{error}</div>}

            <button
              className="btn btn-primary"
              onClick={handleSaveUrl}
              disabled={saving}
              style={{ width: "100%", justifyContent: "center", padding: "10px" }}
            >
              {saving ? "Saving..." : "Continue →"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: "#fff", marginBottom: 8, letterSpacing: -0.5 }}>
                🎉 You're all set!
              </div>
              <div style={{ fontSize: 14, color: "#555577", lineHeight: 1.6 }}>
                Your bot is ready. Paste the code below into your website's HTML before the closing <code style={{ color: "#a78bfa", background: "#1e1a3a", padding: "1px 6px", borderRadius: 4 }}>&lt;/body&gt;</code> tag.
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#555577", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Your Embed Code</div>
              <div style={{
                background: "#0a0a0f",
                border: "1px solid #1e1e2e",
                borderRadius: 8,
                padding: "16px",
                fontFamily: "monospace",
                fontSize: 12,
                color: "#a78bfa",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all"
              }}>
                {embedCode}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-primary"
                onClick={handleCopy}
                style={{ flex: 1, justifyContent: "center" }}
              >
                {copied ? "✅ Copied!" : "Copy Embed Code"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => navigate("/dashboard")}
                style={{ flex: 1, justifyContent: "center" }}
              >
                Go to Dashboard
              </button>
            </div>

            <div style={{ marginTop: 20, padding: "14px 16px", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#555577", marginBottom: 4 }}>Your Company ID</div>
              <div style={{ fontSize: 13, color: "#c4c4d4", fontFamily: "monospace" }}>{companyId}</div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

function LockedField({ children, plan, onUpgrade }) {
  const isLocked = plan === "free";

  if (!isLocked) return children;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ pointerEvents: "none", opacity: 0.4, userSelect: "none" }}>
        {children}
      </div>
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, cursor: "pointer", borderRadius: 6,
          background: "rgba(10,10,20,0.5)",
        }}
        onClick={onUpgrade}
      >
        <span style={{ fontSize: 13 }}>🔒</span>
        <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>
          Upgrade to unlock
        </span>
      </div>
    </div>
  );
}

// =============================
// Paid Success Page
// =============================
function PaidSuccessPage() {
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus("error");
      return;
    }

    const exchangeToken = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/paid-success?session_id=${sessionId}`);
        const data = await res.json();

        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("companyId", data.companyId);
          localStorage.setItem("role", data.role);
          setStatus("success");
          setTimeout(() => navigate("/onboarding"), 1500);
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    exchangeToken();
  }, [navigate]);

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ textAlign: "center" }}>
        {status === "loading" && (
          <>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Setting up your account...</div>
            <div style={{ fontSize: 13, color: "#444466" }}>Just a moment while we confirm your payment.</div>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Payment successful!</div>
            <div style={{ fontSize: 13, color: "#444466" }}>Redirecting you to onboarding...</div>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: 36, marginBottom: 16 }}>❌</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Something went wrong</div>
            <div style={{ fontSize: 13, color: "#444466", marginBottom: 20 }}>Your payment went through but we had trouble setting up your account. Please contact support.</div>
            <a href="mailto:jacksonjallen26@gmail.com" className="btn btn-primary" style={{ justifyContent: "center" }}>Contact Support</a>
          </>
        )}
      </div>
    </div>
  );
}



// =============================
// Dashboard Page
// =============================
function DashboardPage() {
  const [activePage, setActivePage] = useState("overview");
  const [companyId, setCompanyId] = useState("");
  const [botName, setBotName] = useState("Askra");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#7c3aed");
  const [accentColor, setAccentColor] = useState("#52188B");
  const [textColor, setTextColor] = useState("#ffffff");
  const [botBubbleColor, setBotBubbleColor] = useState("#1a1a28");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [openingMessage, setOpeningMessage] = useState("");
  const [status, setStatus] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [conversations, setConversations] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [totalMessages, setTotalMessages] = useState(0);
  const [bubbleLogoUrl, setBubbleLogoUrl] = useState("");
  const [bubbleColor, setBubbleColor] = useState("#7c3aed");
  const [isAdmin, setIsAdmin] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [adminStatus, setAdminStatus] = useState("");
  const [pdfs, setPdfs] = useState([]);
  const [pdfListStatus, setPdfListStatus] = useState("");
  const [plan, setPlan] = useState("free");
  const [monthlyMessages, setMonthlyMessages] = useState(0);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [embedCopied, setEmbedCopied] = useState(false);

// =============================
  // Get companyId from localStorage
  // =============================
  useEffect(() => {
    const id = localStorage.getItem("companyId");
    if (id) setCompanyId(id);
  }, []);

  //====================
  //user role check
  //====================

  useEffect(() => {
  const role = localStorage.getItem("role");
  if (role === "admin") setIsAdmin(true);
}, []);

useEffect(() => {
  if (activePage === "admin" && isAdmin) {
    loadAllCompanies();
  }
}, [activePage, isAdmin]);

useEffect(() => {
  if (activePage === "knowledge") {
    loadPdfs();
  }
}, [activePage]);

  // =============================
  // Load Company Settings
  // =============================
  useEffect(() => {
    if (!companyId) return;

    async function fetchSettings() {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/get-settings?companyId=${companyId}`
        );
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        setBotName(data.botName || "Askra");
        setLogoUrl(data.logoUrl || "https://app.askra.app/logo.png");
        setPrimaryColor(data.primaryColor || "#000000");
        setSecondaryColor(data.secondaryColor || "#7c3aed");
        setAccentColor(data.accentColor || "#52188B");
        setTextColor(data.textColor || "#ffffff");
        setBotBubbleColor(data.botBubbleColor || "#1a1a28");
        setSystemPrompt(data.systemPrompt || "");
        setOpeningMessage(data.openingMessage || "");
        setBubbleLogoUrl(data.bubbleLogoUrl || "");
        setBubbleColor(data.bubbleColor || "#7c3aed");
        setPlan(data.plan || "free");
        setWebsiteUrl(data.websiteUrl || "");
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    }

    fetchSettings();
  }, [companyId]);


  // =============================
  // Load Usage
  // =============================
  useEffect(() => {
  const fetchUsage = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/usage`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) setMonthlyMessages(data.monthlyMessages);
    } catch (err) {
      console.error("Failed to load usage");
    }
  };
  fetchUsage();
}, []);

  // =============================
  // Load Conversations
  // =============================
  const loadConversations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/conversations`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
        const total = Object.values(data.conversations).reduce((sum, msgs) => sum + msgs.length, 0);
        setTotalMessages(total);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // =============================
  // Upload PDF
  // =============================
  const uploadPdf = async () => {
    if (!pdfFile) return;
    setUploadStatus("Uploading...");
    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      const res = await fetch(`${BACKEND_URL}/api/upload-pdf`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) { setUploadStatus(`❌ ${data.error}`); return; }
      setUploadStatus(`✅ ${data.chunksStored} chunks stored successfully`);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("❌ Upload failed.");
    }
  };

  // =============================
// Load PDFs
// =============================
const loadPdfs = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/pdfs`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    const data = await res.json();
    if (data.success) setPdfs(data.pdfs);
  } catch (err) {
    console.error("Failed to load PDFs:", err);
  }
};

const deletePdf = async (uploadId) => {
  if (!window.confirm("Are you sure you want to delete this PDF? This cannot be undone.")) return;
  try {
    const res = await fetch(`${BACKEND_URL}/api/delete-pdf`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ uploadId })
    });
    const data = await res.json();
    if (data.success) {
      setPdfListStatus("✅ PDF deleted successfully");
      loadPdfs();
      setTimeout(() => setPdfListStatus(""), 3000);
    }
  } catch (err) {
    setPdfListStatus("❌ Failed to delete PDF");
  }
};

  // =============================
  // Save Settings
  // =============================
  const saveSettings = async () => {
    setStatus("Saving...");
    try {
      const res = await fetch(`${BACKEND_URL}/api/update-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          botName, logoUrl, primaryColor, secondaryColor,
          accentColor, textColor, botBubbleColor, systemPrompt, openingMessage, bubbleLogoUrl,
          bubbleColor, websiteUrl
        })
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus("✅ Saved successfully");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setStatus("❌ Failed to save.");
    }
  };


  // =============================
// upgrade plan
// =============================

  const handleUpgrade = async (newPlan) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/create-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ plan: newPlan })
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error("Upgrade error:", err);
  }
};



const handleCopyEmbed = () => {
  navigator.clipboard.writeText(`<script>\n  window.AskraConfig = { companyId: "${companyId}" };\n</script>\n<script src="https://jacksonbot-clean.vercel.app/widget.js"></script>`);
  setEmbedCopied(true);
  setTimeout(() => setEmbedCopied(false), 2000);
};

const handleManageBilling = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/billing-portal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  } catch (err) {
    console.error("Billing portal error:", err);
  }
};


  // =============================
// Admin Page
// =============================


const loadAllCompanies = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/companies`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    const data = await res.json();
    if (data.success) setCompanies(data.companies);
  } catch (err) {
    console.error("Failed to load companies:", err);
  }
};

const updateCompany = async (targetCompanyId, updates) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/update-company`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ targetCompanyId, ...updates })
    });
    const data = await res.json();
    if (data.success) {
      setAdminStatus("✅ Updated successfully");
      loadAllCompanies();
      setTimeout(() => setAdminStatus(""), 3000);
    }
  } catch (err) {
    setAdminStatus("❌ Update failed");
  }
};

const renderAdmin = () => (
  <>
    <div className="page-header">
      <div className="page-title">Admin</div>
      <div className="page-subtitle">Manage all companies on Askra</div>
    </div>

    <div className="stats-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
      <div className="stat-card">
        <div className="stat-label">Total Companies</div>
        <div className="stat-value">{companies.length}</div>
        <div className="stat-sub">All time</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Active</div>
        <div className="stat-value">{companies.filter(c => c.active).length}</div>
        <div className="stat-sub">Currently active</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Messages</div>
        <div className="stat-value">{companies.reduce((sum, c) => sum + c.messageCount, 0)}</div>
        <div className="stat-sub">Across all bots</div>
      </div>
    </div>

    <div className="card">
      <div className="card-header">
        <div className="card-title"><div className="card-dot" style={{ background: "#f59e0b" }}></div>All Companies</div>
        <button className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={loadAllCompanies}>Refresh</button>
      </div>

      {adminStatus && <div className={adminStatus.includes("✅") ? "status-text" : "error-text"} style={{ marginBottom: 12 }}>{adminStatus}</div>}

      {companies.length === 0 ? (
        <div className="empty-state">No companies yet</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e2e" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#555577", fontWeight: 500 }}>Company</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#555577", fontWeight: 500 }}>ID</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#555577", fontWeight: 500 }}>Plan</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#555577", fontWeight: 500 }}>Messages</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#555577", fontWeight: 500 }}>Status</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#555577", fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company.companyId} style={{ borderBottom: "1px solid #1e1e2e" }}>
                  <td style={{ padding: "10px 12px", color: "#c4c4d4" }}>
                    <div>{company.name}</div>
                    <div style={{ fontSize: 11, color: "#444466" }}>{company.email}</div>
                  </td>
                  <td style={{ padding: "10px 12px", color: "#888899", fontFamily: "monospace", fontSize: 11 }}>{company.companyId}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <select
                      value={company.plan}
                      onChange={(e) => updateCompany(company.companyId, { active: company.active, plan: e.target.value })}
                      style={{
                        background: "#0a0a0f",
                        border: "1px solid #1e1e2e",
                        borderRadius: 4,
                        color: "#e2e2e8",
                        padding: "3px 6px",
                        fontSize: 12,
                        fontFamily: "DM Sans, sans-serif"
                      }}
                    >
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                    </select>
                  </td>
                  <td style={{ padding: "10px 12px", color: "#888899" }}>{company.messageCount}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span className={`badge ${company.active ? "badge-active" : ""}`} style={!company.active ? { background: "#2d1515", color: "#f87171", border: "1px solid #2d1515" } : {}}>
                      {company.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <button
                      className="btn"
                      style={{
                        fontSize: 11,
                        padding: "4px 10px",
                        background: company.active ? "#2d1515" : "#0f2e1f",
                        color: company.active ? "#f87171" : "#4ade80",
                        border: "none"
                      }}
                      onClick={() => updateCompany(company.companyId, { active: !company.active, plan: company.plan })}
                    >
                      {company.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </>
);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("companyId");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const initials = companyId ? companyId.slice(0, 2).toUpperCase() : "JA";

  // =============================
  // Pages
  // =============================
  const renderOverview = () => {
  const planLimits = { free: 100, starter: 5000, pro: 50000 };
  const limit = planLimits[plan] || 100;
  const remaining = Math.max(0, limit - monthlyMessages);
  const usedPercent = Math.min(100, Math.round((monthlyMessages / limit) * 100));
  return (
    <>
      <div className="page-header">
        <div className="page-title">Overview</div>
        <div className="page-subtitle">Your bot's performance at a glance</div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Messages</div>
          <div className="stat-value">{totalMessages}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Conversations</div>
          <div className="stat-value">{Object.keys(conversations).length}</div>
          <div className="stat-sub">Unique users</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Messages This Month</div>
          <div className="stat-value">{monthlyMessages}<span style={{ fontSize: 14, color: "#333355", fontWeight: 400 }}>/{limit}</span></div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{
              width: `${usedPercent}%`,
              background: usedPercent >= 90 ? "#f87171" : usedPercent >= 70 ? "#fbbf24" : "linear-gradient(90deg, #4ade80, #22d3ee)"
            }} />
          </div>
          <div className="stat-sub" style={{ marginTop: 6 }}>{remaining} remaining</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Status</div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            <span className="badge badge-active">Active</span>
            <span className={`badge badge-${plan}`} style={
              plan === "pro" ? { background: "#0c2a3a", color: "#38bdf8", border: "1px solid #0369a144" } :
              plan === "starter" ? {} :
              { background: "#16162a", color: "#666688", border: "1px solid #2a2a3e" }
            }>
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </span>
          </div>
          <div className="stat-sub" style={{ marginTop: 8, fontFamily: "DM Mono, monospace", fontSize: 10 }}>{companyId}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-dot" style={{ background: "#10b981", boxShadow: "0 0 6px #10b98188" }}></div>Recent Activity</div>
        </div>
        {Object.keys(conversations).length === 0 ? (
          <div className="empty-state">No conversations yet</div>
        ) : (
          Object.keys(conversations).slice(0, 5).map(userId => {
            const msgs = conversations[userId];
            const last = msgs[msgs.length - 1];
            return (
              <div key={userId} className="activity-row" onClick={() => { setActivePage("conversations"); setSelectedUser(userId); }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="activity-avatar">{userId.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 12, color: "#b0b0c8", fontFamily: "DM Mono, monospace" }}>{userId.slice(0, 12)}...</div>
                    <div style={{ fontSize: 11, color: "#444466", marginTop: 2 }}>{last?.message?.slice(0, 44)}...</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#2e2e44", fontFamily: "DM Mono, monospace", flexShrink: 0 }}>
                  {new Date(last?.timestamp).toLocaleDateString()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};
  
const renderSettings = () => (
  <>
    <div className="page-header">
      <div className="page-title">Bot Settings</div>
      <div className="page-subtitle">Customize your bot's appearance and behavior</div>
    </div>

    <div className="card">
      <div className="card-header">
        <div className="card-title"><div className="card-dot"></div>Identity</div>
      </div>
      <div className="form-row">
        <LockedField plan={plan}>
          <div className="form-group">
            <label>Bot Name</label>
            <input type="text" value={botName} onChange={(e) => setBotName(e.target.value)} />
          </div>
        </LockedField>
        <LockedField plan={plan}>
          <div className="form-group">
            <label>Logo URL</label>
            <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
          </div>
        </LockedField>
      </div>
      <LockedField plan={plan}>
        <div className="form-group full">
          <label>Opening Message</label>
          <input type="text" value={openingMessage} onChange={(e) => setOpeningMessage(e.target.value)} placeholder="Hi! How can I help you today?" />
        </div>
      </LockedField>
    </div>

    <div className="card">
      <div className="card-header">
        <div className="card-title"><div className="card-dot" style={{ background: "#06b6d4" }}></div>AI Behavior</div>
      </div>
      <div className="form-group">
        <label>System Prompt</label>
        <textarea
          rows={5}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="You are a helpful assistant for this business..."
        />
      </div>
    </div>

    <div className="card">
      <div className="card-header">
        <div className="card-title"><div className="card-dot" style={{ background: "#f59e0b" }}></div>Brand Colors</div>
      </div>
      <div className="color-row">
        <LockedField plan={plan}>
          <div className="color-group"><label>Primary</label><input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} /></div>
        </LockedField>
        <LockedField plan={plan}>
          <div className="color-group"><label>Secondary</label><input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} /></div>
        </LockedField>
        <LockedField plan={plan}>
          <div className="color-group"><label>Accent</label><input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} /></div>
        </LockedField>
        <LockedField plan={plan}>
          <div className="color-group"><label>Text</label><input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} /></div>
        </LockedField>
        <LockedField plan={plan}>
          <div className="color-group"><label>Bubble</label><input type="color" value={botBubbleColor} onChange={(e) => setBotBubbleColor(e.target.value)} /></div>
        </LockedField>
      </div>
    </div>

    <div className="card">
      <div className="card-header">
        <div className="card-title"><div className="card-dot" style={{ background: "#ec4899" }}></div>Chat Bubble</div>
      </div>
      <div className="form-row">
        <LockedField plan={plan}>
          <div className="form-group">
            <label>Bubble Color</label>
            <input type="color" value={bubbleColor} onChange={(e) => setBubbleColor(e.target.value)} />
          </div>
        </LockedField>
        <LockedField plan={plan}>
          <div className="form-group">
            <label>Custom Logo URL (optional, leave blank for basic chat icon)</label>
            <input type="url" value={bubbleLogoUrl} onChange={(e) => setBubbleLogoUrl(e.target.value)} placeholder="https://..." />
          </div>
        </LockedField>
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={{ marginBottom: 8, display: "block" }}>Preview</label>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: bubbleLogoUrl ? "transparent" : bubbleColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          border: "2px solid #1e1e2e"
        }}>
          {bubbleLogoUrl ? (
            <img src={bubbleLogoUrl} alt="bubble" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          )}
        </div>
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 4px" }}>
      {status ? <div className={status.includes("✅") ? "status-text" : "error-text"}>{status}</div> : <div />}
      <button className="btn btn-primary" onClick={saveSettings}>Save Changes</button>
    </div>
  </>
);

  const renderKnowledgeBase = () => (
    <>
      <div className="page-header">
        <div className="page-title">Knowledge Base</div>
        <div className="page-subtitle">Upload documents for your bot to reference</div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-dot" style={{ background: "#06b6d4" }}></div>Upload Document</div>
        </div>
        <div className="upload-zone" onClick={() => document.getElementById("pdf-input").click()}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#444466" strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block" }}>
            <path d="M16 20V8M10 14l6-6 6 6"/><path d="M6 24h20"/>
          </svg>
          <div className="upload-text"><span>Click to upload</span> or drag and drop</div>
          <div className="upload-subtext">PDF files only — max 10MB</div>
          {pdfFile && <div style={{ marginTop: 8, fontSize: 12, color: "#a78bfa" }}>{pdfFile.name}</div>}
        </div>
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={(e) => setPdfFile(e.target.files[0])}
        />
        <div className="btn-row">
          {uploadStatus && <div className={uploadStatus.includes("✅") ? "status-text" : "error-text"}>{uploadStatus}</div>}
          {!uploadStatus && <div></div>}
          <button className="btn btn-primary" onClick={uploadPdf} disabled={!pdfFile}>Upload PDF</button>
        </div>
      </div>

      <div className="card">
  <div className="card-header">
    <div className="card-title"><div className="card-dot" style={{ background: "#06b6d4" }}></div>Uploaded Documents</div>
    <button className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={loadPdfs}>Refresh</button>
  </div>

  {pdfListStatus && <div className={pdfListStatus.includes("✅") ? "status-text" : "error-text"} style={{ marginBottom: 12 }}>{pdfListStatus}</div>}

  {pdfs.length === 0 ? (
    <div className="empty-state">No documents uploaded yet</div>
  ) : (
    pdfs.map(pdf => (
      <div key={pdf.uploadId} style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #1e1e2e"
      }}>
        <div>
          <div style={{ fontSize: 13, color: "#c4c4d4" }}>{pdf.fileName}</div>
          <div style={{ fontSize: 11, color: "#444466", marginTop: 2 }}>
            {pdf.chunkCount} chunks · {new Date(pdf.createdAt).toLocaleDateString()}
          </div>
        </div>
        <button
          className="btn"
          style={{ fontSize: 11, padding: "4px 10px", background: "#2d1515", color: "#f87171", border: "none" }}
          onClick={() => deletePdf(pdf.uploadId)}
        >
          Delete
        </button>
      </div>
    ))
  )}
</div>
    </>
  );

  const renderConversations = () => {
  if (plan === "free") {
    return (
      <>
        <div className="page-header">
          <div className="page-title">Conversations</div>
          <div className="page-subtitle">Browse all conversations from your bot</div>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>🔒</span>
          <div style={{ fontSize: 16, color: "#c4c4d4", fontWeight: 600 }}>Conversation history is a paid feature</div>
          <div style={{ fontSize: 13, color: "#555577", maxWidth: 320 }}>Upgrade to Starter or Pro to view and browse all conversations your bot has had.</div>
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setActivePage("account")}>Upgrade Now</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Conversations</div>
        <div className="page-subtitle">Browse all conversations from your bot</div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-dot" style={{ background: "#10b981" }}></div>All Users</div>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={loadConversations}>Refresh</button>
        </div>

        {Object.keys(conversations).length === 0 ? (
          <div className="empty-state">No conversations yet</div>
        ) : (
          <div className="convo-layout">
            <div className="user-list">
              <div className="user-list-title">Users</div>
              {Object.keys(conversations).map(userId => (
                <div
                  key={userId}
                  className={`user-item ${selectedUser === userId ? "active" : ""}`}
                  onClick={() => setSelectedUser(userId)}
                >
                  <div className="user-item-avatar">{userId.slice(0, 2).toUpperCase()}</div>
                  <div className="user-id">{userId.slice(0, 8)}...</div>
                </div>
              ))}
            </div>

            <div className="message-view">
              {!selectedUser && <div className="empty-state">Select a user to view conversation</div>}
              {selectedUser && conversations[selectedUser].map((msg, i) => (
                <div key={i} className={`msg-bubble ${msg.role === "user" ? "user" : "bot"}`}>
                  <div className="msg-text">{msg.message}</div>
                  <div className="msg-time">{new Date(msg.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
  };

  // =============================
// Account Page
// =============================
const renderAccount = () => (
  <>
    <div className="page-header">
      <div className="page-title">Account</div>
      <div className="page-subtitle">Manage your plan, billing, and embed settings</div>
    </div>

    {/* Current Plan */}
    <div className="card">
      <div className="card-header">
        <div className="card-title"><div className="card-dot" style={{ background: "#a78bfa" }}></div>Current Plan</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
          </div>
          <div style={{ fontSize: 13, color: "#555577" }}>
            {plan === "free" && "100 messages/mo · 1 PDF upload"}
            {plan === "starter" && "5,000 messages/mo · 10 PDF uploads"}
            {plan === "pro" && "50,000 messages/mo · 75 PDF uploads"}
          </div>
        </div>
        {plan !== "free" && (
          <button className="btn btn-ghost" onClick={handleManageBilling}>
            Manage Billing
          </button>
        )}
      </div>
    </div>

    {/* Upgrade Plans */}
    {plan !== "pro" && (
      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-dot" style={{ background: "#4ade80" }}></div>Upgrade Plan</div>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {plan === "free" && (
            <div className="plan-card">
              <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Starter</div>
              <div style={{ fontSize: 26, color: "#fff", fontWeight: 700, marginBottom: 14, letterSpacing: "-1px" }}>$29<span style={{ fontSize: 13, color: "#444466", fontWeight: 400 }}>/mo</span></div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
                {["5,000 messages/mo", "10 PDF uploads", "Full customization", "Conversation history"].map(f => (
                  <li key={f} style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#4ade80", fontSize: 11 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => handleUpgrade("starter")}>
                Upgrade to Starter
              </button>
            </div>
          )}
          <div className="plan-card featured">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Pro</div>
              <span style={{ fontSize: 9, background: "#7c3aed33", color: "#a78bfa", border: "1px solid #7c3aed44", padding: "1px 6px", borderRadius: 10, fontWeight: 600 }}>POPULAR</span>
            </div>
            <div style={{ fontSize: 26, color: "#fff", fontWeight: 700, marginBottom: 14, letterSpacing: "-1px" }}>$79<span style={{ fontSize: 13, color: "#444466", fontWeight: 400 }}>/mo</span></div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
              {["50,000 messages/mo", "75 PDF uploads", "Full customization", "Conversation history", "Priority support", "Early access to features"].map(f => (
                <li key={f} style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#4ade80", fontSize: 11 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => handleUpgrade("pro")}>
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Website URL */}
    <div className="card">
      <div className="card-header">
        <div className="card-title"><div className="card-dot" style={{ background: "#06b6d4" }}></div>Website URL</div>
      </div>
      <div style={{ fontSize: 13, color: "#555577", marginBottom: 12 }}>
        The website where your Askra widget is embedded. This is required for your bot to work correctly.
      </div>
      <div className="form-group full" style={{ marginBottom: 12 }}>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://yourbusiness.com"
        />
      </div>
      <button className="btn btn-primary" onClick={saveSettings}>Save URL</button>
    </div>

    {/* Embed Code */}
    <div className="card">
      <div className="card-header">
        <div className="card-title"><div className="card-dot" style={{ background: "#f59e0b" }}></div>Embed Code</div>
      </div>
      <div style={{ fontSize: 13, color: "#555577", marginBottom: 12 }}>
        Paste this into your website's HTML before the closing <code style={{ color: "#a78bfa", background: "#1e1a3a", padding: "1px 6px", borderRadius: 4 }}>&lt;/body&gt;</code> tag.
      </div>
      <div style={{
        background: "#0a0a0f",
        border: "1px solid #1e1e2e",
        borderRadius: 8,
        padding: "16px",
        fontFamily: "monospace",
        fontSize: 12,
        color: "#a78bfa",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        marginBottom: 12
      }}>
        {`<script>\n  window.AskraConfig = { companyId: "${companyId}" };\n</script>\n<script src="https://jacksonbot-clean.vercel.app/widget.js"></script>`}
      </div>
      <button className="btn btn-ghost" onClick={handleCopyEmbed} style={{ fontSize: 12 }}>
        {embedCopied ? "✅ Copied!" : "Copy Embed Code"}
      </button>
    </div>
  </>
);

return (
    <div className="layout">
      <div className="sidebar">
        <div className="logo">
          <img src="/logo.png" alt="Askra" style={{ width: 15, height: 15, borderRadius: 8 }} />
          <span className="logo-text">Askra</span>
          <span className="logo-badge">BETA</span>
        </div>

        <div className="nav-section">
          <div className="nav-label">Main</div>
          {[
            { id: "overview", label: "Overview", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
            { id: "settings", label: "Bot Settings", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0M4.93 4.93l14.14 14.14"/></svg> },
            { id: "conversations", label: "Conversations", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
            { id: "knowledge", label: "Knowledge Base", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
            { id: "account", label: "Account", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
            ...(isAdmin ? [{ id: "admin", label: "Admin", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }] : [])
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="company-badge">
            <div className="avatar">{initials}</div>
            <div>
              <div className="company-name">{companyId || "Loading..."}</div>
              <div className="company-plan">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</div>
            </div>
          </div>
          <button className="btn btn-danger" onClick={handleLogout} style={{ width: "100%", marginTop: 8, justifyContent: "center" }}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="main">
        {activePage === "overview" && renderOverview()}
        {activePage === "settings" && renderSettings()}
        {activePage === "knowledge" && renderKnowledgeBase()}
        {activePage === "conversations" && renderConversations()}
        {activePage === "account" && renderAccount()}
        {activePage === "admin" && isAdmin && renderAdmin()}
      </div>
    </div>
  );
}

// =============================
// Privacy Policy Page
// =============================
function PrivacyPage() {
  return (
    <div style={{ 
      maxWidth: 900, 
      margin: "0 auto", 
      padding: "60px 24px", 
      background: "#fff",
      minHeight: "100vh"
    }}
      dangerouslySetInnerHTML={{ __html: `<style>
  [data-custom-class='body'], [data-custom-class='body'] * {
          background: transparent !important;
        }
[data-custom-class='title'], [data-custom-class='title'] * {
          font-family: Arial !important;
font-size: 26px !important;
color: #000000 !important;
        }
[data-custom-class='subtitle'], [data-custom-class='subtitle'] * {
          font-family: Arial !important;
color: #595959 !important;
font-size: 14px !important;
        }
[data-custom-class='heading_1'], [data-custom-class='heading_1'] * {
          font-family: Arial !important;
font-size: 19px !important;
color: #000000 !important;
        }
[data-custom-class='heading_2'], [data-custom-class='heading_2'] * {
          font-family: Arial !important;
font-size: 17px !important;
color: #000000 !important;
        }
[data-custom-class='body_text'], [data-custom-class='body_text'] * {
          color: #595959 !important;
font-size: 14px !important;
font-family: Arial !important;
        }
[data-custom-class='link'], [data-custom-class='link'] * {
          color: #3030F1 !important;
font-size: 14px !important;
font-family: Arial !important;
word-break: break-word !important;
        }
</style>
      <span style="display: block;margin: 0 auto 3.125rem;width: 11.125rem;height: 2.375rem;background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNzgiIGhlaWdodD0iMzgiIHZpZXdCb3g9IjAgMCAxNzggMzgiPgogICAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cGF0aCBmaWxsPSIjRDFEMUQxIiBkPSJNNC4yODMgMjQuMTA3Yy0uNzA1IDAtMS4yNTgtLjI1Ni0xLjY2LS43NjhoLS4wODVjLjA1Ny41MDIuMDg2Ljc5Mi4wODYuODd2Mi40MzRILjk4NXYtOC42NDhoMS4zMzJsLjIzMS43NzloLjA3NmMuMzgzLS41OTQuOTUtLjg5MiAxLjcwMi0uODkyLjcxIDAgMS4yNjQuMjc0IDEuNjY1LjgyMi40MDEuNTQ4LjYwMiAxLjMwOS42MDIgMi4yODMgMCAuNjQtLjA5NCAxLjE5OC0uMjgyIDEuNjctLjE4OC40NzMtLjQ1Ni44MzMtLjgwMyAxLjA4LS4zNDcuMjQ3LS43NTYuMzctMS4yMjUuMzd6TTMuOCAxOS4xOTNjLS40MDUgMC0uNy4xMjQtLjg4Ni4zNzMtLjE4Ny4yNDktLjI4My42Ni0uMjkgMS4yMzN2LjE3N2MwIC42NDUuMDk1IDEuMTA3LjI4NyAxLjM4Ni4xOTIuMjguNDk1LjQxOS45MS40MTkuNzM0IDAgMS4xMDEtLjYwNSAxLjEwMS0xLjgxNiAwLS41OS0uMDktMS4wMzQtLjI3LTEuMzI5LS4xODItLjI5NS0uNDY1LS40NDMtLjg1Mi0uNDQzem01LjU3IDEuNzk0YzAgLjU5NC4wOTggMS4wNDQuMjkzIDEuMzQ4LjE5Ni4zMDQuNTEzLjQ1Ny45NTQuNDU3LjQzNyAwIC43NS0uMTUyLjk0Mi0uNDU0LjE5Mi0uMzAzLjI4OC0uNzUzLjI4OC0xLjM1MSAwLS41OTUtLjA5Ny0xLjA0LS4yOS0xLjMzOC0uMTk0LS4yOTctLjUxLS40NDUtLjk1LS40NDUtLjQzOCAwLS43NTMuMTQ3LS45NDYuNDQzLS4xOTQuMjk1LS4yOS43NDItLjI5IDEuMzR6bTQuMTUzIDBjMCAuOTc3LS4yNTggMS43NDItLjc3NCAyLjI5My0uNTE1LjU1Mi0xLjIzMy44MjctMi4xNTQuODI3LS41NzYgMC0xLjA4NS0uMTI2LTEuNTI1LS4zNzhhMi41MiAyLjUyIDAgMCAxLTEuMDE1LTEuMDg4Yy0uMjM3LS40NzMtLjM1NS0xLjAyNC0uMzU1LTEuNjU0IDAtLjk4MS4yNTYtMS43NDQuNzY4LTIuMjg4LjUxMi0uNTQ1IDEuMjMyLS44MTcgMi4xNi0uODE3LjU3NiAwIDEuMDg1LjEyNiAxLjUyNS4zNzYuNDQuMjUxLjc3OS42MSAxLjAxNSAxLjA4LjIzNi40NjkuMzU1IDEuMDE5LjM1NSAxLjY0OXpNMTkuNzEgMjRsLS40NjItMi4xLS42MjMtMi42NTNoLS4wMzdMMTcuNDkzIDI0SDE1LjczbC0xLjcwOC02LjAwNWgxLjYzM2wuNjkzIDIuNjU5Yy4xMS40NzYuMjI0IDEuMTMzLjMzOCAxLjk3MWguMDMyYy4wMTUtLjI3Mi4wNzctLjcwNC4xODgtMS4yOTRsLjA4Ni0uNDU3Ljc0Mi0yLjg3OWgxLjgwNGwuNzA0IDIuODc5Yy4wMTQuMDc5LjAzNy4xOTUuMDY3LjM1YTIwLjk5OCAyMC45OTggMCAwIDEgLjE2NyAxLjAwMmMuMDIzLjE2NS4wMzYuMjk5LjA0LjM5OWguMDMyYy4wMzItLjI1OC4wOS0uNjExLjE3Mi0xLjA2LjA4Mi0uNDUuMTQxLS43NTQuMTc3LS45MTFsLjcyLTIuNjU5aDEuNjA2TDIxLjQ5NCAyNGgtMS43ODN6bTcuMDg2LTQuOTUyYy0uMzQ4IDAtLjYyLjExLS44MTcuMzMtLjE5Ny4yMi0uMzEuNTMzLS4zMzguOTM3aDIuMjk5Yy0uMDA4LS40MDQtLjExMy0uNzE3LS4zMTctLjkzNy0uMjA0LS4yMi0uNDgtLjMzLS44MjctLjMzem0uMjMgNS4wNmMtLjk2NiAwLTEuNzIyLS4yNjctMi4yNjYtLjgtLjU0NC0uNTM0LS44MTYtMS4yOS0uODE2LTIuMjY3IDAtMS4wMDcuMjUxLTEuNzg1Ljc1NC0yLjMzNC41MDMtLjU1IDEuMTk5LS44MjUgMi4wODctLjgyNS44NDggMCAxLjUxLjI0MiAxLjk4Mi43MjUuNDcyLjQ4NC43MDkgMS4xNTIuNzA5IDIuMDA0di43OTVoLTMuODczYy4wMTguNDY1LjE1Ni44MjkuNDE0IDEuMDkuMjU4LjI2MS42Mi4zOTIgMS4wODUuMzkyLjM2MSAwIC43MDMtLjAzNyAxLjAyNi0uMTEzYTUuMTMzIDUuMTMzIDAgMCAwIDEuMDEtLjM2djEuMjY4Yy0uMjg3LjE0My0uNTkzLjI1LS45Mi4zMmE1Ljc5IDUuNzkgMCAwIDEtMS4xOTEuMTA0em03LjI1My02LjIyNmMuMjIyIDAgLjQwNi4wMTYuNTUzLjA0OWwtLjEyNCAxLjUzNmExLjg3NyAxLjg3NyAwIDAgMC0uNDgzLS4wNTRjLS41MjMgMC0uOTMuMTM0LTEuMjIyLjQwMy0uMjkyLjI2OC0uNDM4LjY0NC0uNDM4IDEuMTI4VjI0aC0xLjYzOHYtNi4wMDVoMS4yNGwuMjQyIDEuMDFoLjA4Yy4xODctLjMzNy40MzktLjYwOC43NTYtLjgxNGExLjg2IDEuODYgMCAwIDEgMS4wMzQtLjMwOXptNC4wMjkgMS4xNjZjLS4zNDcgMC0uNjIuMTEtLjgxNy4zMy0uMTk3LjIyLS4zMS41MzMtLjMzOC45MzdoMi4yOTljLS4wMDctLjQwNC0uMTEzLS43MTctLjMxNy0uOTM3LS4yMDQtLjIyLS40OC0uMzMtLjgyNy0uMzN6bS4yMyA1LjA2Yy0uOTY2IDAtMS43MjItLjI2Ny0yLjI2Ni0uOC0uNTQ0LS41MzQtLjgxNi0xLjI5LS44MTYtMi4yNjcgMC0xLjAwNy4yNTEtMS43ODUuNzU0LTIuMzM0LjUwNC0uNTUgMS4yLS44MjUgMi4wODctLjgyNS44NDkgMCAxLjUxLjI0MiAxLjk4Mi43MjUuNDczLjQ4NC43MDkgMS4xNTIuNzA5IDIuMDA0di43OTVoLTMuODczYy4wMTguNDY1LjE1Ni44MjkuNDE0IDEuMDkuMjU4LjI2MS42Mi4zOTIgMS4wODUuMzkyLjM2MiAwIC43MDQtLjAzNyAxLjAyNi0uMTEzYTUuMTMzIDUuMTMzIDAgMCAwIDEuMDEtLjM2djEuMjY4Yy0uMjg3LjE0My0uNTkzLjI1LS45MTkuMzJhNS43OSA1Ljc5IDAgMCAxLTEuMTkyLjEwNHptNS44MDMgMGMtLjcwNiAwLTEuMjYtLjI3NS0xLjY2My0uODIyLS40MDMtLjU0OC0uNjA0LTEuMzA3LS42MDQtMi4yNzggMC0uOTg0LjIwNS0xLjc1Mi42MTUtMi4zMDEuNDEtLjU1Ljk3NS0uODI1IDEuNjk1LS44MjUuNzU1IDAgMS4zMzIuMjk0IDEuNzI5Ljg4MWguMDU0YTYuNjk3IDYuNjk3IDAgMCAxLS4xMjQtMS4xOTh2LTEuOTIyaDEuNjQ0VjI0SDQ2LjQzbC0uMzE3LS43NzloLS4wN2MtLjM3Mi41OTEtLjk0Ljg4Ni0xLjcwMi44ODZ6bS41NzQtMS4zMDZjLjQyIDAgLjcyNi0uMTIxLjkyMS0uMzY1LjE5Ni0uMjQzLjMwMi0uNjU3LjMyLTEuMjR2LS4xNzhjMC0uNjQ0LS4xLTEuMTA2LS4yOTgtMS4zODYtLjE5OS0uMjc5LS41MjItLjQxOS0uOTctLjQxOWEuOTYyLjk2MiAwIDAgMC0uODUuNDY1Yy0uMjAzLjMxLS4zMDQuNzYtLjMwNCAxLjM1IDAgLjU5Mi4xMDIgMS4wMzUuMzA2IDEuMzMuMjA0LjI5Ni40OTYuNDQzLjg3NS40NDN6bTEwLjkyMi00LjkyYy43MDkgMCAxLjI2NC4yNzcgMS42NjUuODMuNC41NTMuNjAxIDEuMzEyLjYwMSAyLjI3NSAwIC45OTItLjIwNiAxLjc2LS42MiAyLjMwNC0uNDE0LjU0NC0uOTc3LjgxNi0xLjY5LjgxNi0uNzA1IDAtMS4yNTgtLjI1Ni0xLjY1OS0uNzY4aC0uMTEzbC0uMjc0LjY2MWgtMS4yNTF2LTguMzU3aDEuNjM4djEuOTQ0YzAgLjI0Ny0uMDIxLjY0My0uMDY0IDEuMTg3aC4wNjRjLjM4My0uNTk0Ljk1LS44OTIgMS43MDMtLjg5MnptLS41MjcgMS4zMWMtLjQwNCAwLS43LjEyNS0uODg2LjM3NC0uMTg2LjI0OS0uMjgzLjY2LS4yOSAxLjIzM3YuMTc3YzAgLjY0NS4wOTYgMS4xMDcuMjg3IDEuMzg2LjE5Mi4yOC40OTUuNDE5LjkxLjQxOS4zMzcgMCAuNjA1LS4xNTUuODA0LS40NjUuMTk5LS4zMS4yOTgtLjc2LjI5OC0xLjM1IDAtLjU5MS0uMS0xLjAzNS0uMy0xLjMzYS45NDMuOTQzIDAgMCAwLS44MjMtLjQ0M3ptMy4xODYtMS4xOTdoMS43OTRsMS4xMzQgMy4zNzljLjA5Ni4yOTMuMTYzLjY0LjE5OCAxLjA0MmguMDMzYy4wMzktLjM3LjExNi0uNzE3LjIzLTEuMDQybDEuMTEyLTMuMzc5aDEuNzU3bC0yLjU0IDYuNzczYy0uMjM0LjYyNy0uNTY2IDEuMDk2LS45OTcgMS40MDctLjQzMi4zMTItLjkzNi40NjgtMS41MTIuNDY4LS4yODMgMC0uNTYtLjAzLS44MzMtLjA5MnYtMS4zYTIuOCAyLjggMCAwIDAgLjY0NS4wN2MuMjkgMCAuNTQzLS4wODguNzYtLjI2Ni4yMTctLjE3Ny4zODYtLjQ0NC41MDgtLjgwM2wuMDk2LS4yOTUtMi4zODUtNS45NjJ6Ii8+CiAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzMpIj4KICAgICAgICAgICAgPGNpcmNsZSBjeD0iMTkiIGN5PSIxOSIgcj0iMTkiIGZpbGw9IiNFMEUwRTAiLz4KICAgICAgICAgICAgPHBhdGggZmlsbD0iI0ZGRiIgZD0iTTIyLjQ3NCAxNS40NDNoNS4xNjJMMTIuNDM2IDMwLjRWMTAuMzYzaDE1LjJsLTUuMTYyIDUuMDh6Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxwYXRoIGZpbGw9IiNEMkQyRDIiIGQ9Ik0xMjEuNTQ0IDE0LjU2di0xLjcyOGg4LjI3MnYxLjcyOGgtMy4wMjRWMjRoLTIuMjR2LTkuNDRoLTMuMDA4em0xMy43NDQgOS41NjhjLTEuMjkgMC0yLjM0MS0uNDE5LTMuMTUyLTEuMjU2LS44MS0uODM3LTEuMjE2LTEuOTQ0LTEuMjE2LTMuMzJzLjQwOC0yLjQ3NyAxLjIyNC0zLjMwNGMuODE2LS44MjcgMS44NzItMS4yNCAzLjE2OC0xLjI0czIuMzYuNDAzIDMuMTkyIDEuMjA4Yy44MzIuODA1IDEuMjQ4IDEuODggMS4yNDggMy4yMjQgMCAuMzEtLjAyMS41OTctLjA2NC44NjRoLTYuNDY0Yy4wNTMuNTc2LjI2NyAxLjA0LjY0IDEuMzkyLjM3My4zNTIuODQ4LjUyOCAxLjQyNC41MjguNzc5IDAgMS4zNTUtLjMyIDEuNzI4LS45NmgyLjQzMmEzLjg5MSAzLjg5MSAwIDAgMS0xLjQ4OCAyLjA2NGMtLjczNi41MzMtMS42MjcuOC0yLjY3Mi44em0xLjQ4LTYuNjg4Yy0uNC0uMzUyLS44ODMtLjUyOC0xLjQ0OC0uNTI4cy0xLjAzNy4xNzYtMS40MTYuNTI4Yy0uMzc5LjM1Mi0uNjA1LjgyMS0uNjggMS40MDhoNC4xOTJjLS4wMzItLjU4Ny0uMjQ4LTEuMDU2LS42NDgtMS40MDh6bTcuMDE2LTIuMzA0djEuNTY4Yy41OTctMS4xMyAxLjQ2MS0xLjY5NiAyLjU5Mi0xLjY5NnYyLjMwNGgtLjU2Yy0uNjcyIDAtMS4xNzkuMTY4LTEuNTIuNTA0LS4zNDEuMzM2LS41MTIuOTE1LS41MTIgMS43MzZWMjRoLTIuMjU2di04Ljg2NGgyLjI1NnptNi40NDggMHYxLjMyOGMuNTY1LS45NyAxLjQ4My0xLjQ1NiAyLjc1Mi0xLjQ1Ni42NzIgMCAxLjI3Mi4xNTUgMS44LjQ2NC41MjguMzEuOTM2Ljc1MiAxLjIyNCAxLjMyOC4zMS0uNTU1LjczMy0uOTkyIDEuMjcyLTEuMzEyYTMuNDg4IDMuNDg4IDAgMCAxIDEuODE2LS40OGMxLjA1NiAwIDEuOTA3LjMzIDIuNTUyLjk5Mi42NDUuNjYxLjk2OCAxLjU5Ljk2OCAyLjc4NFYyNGgtMi4yNHYtNC44OTZjMC0uNjkzLS4xNzYtMS4yMjQtLjUyOC0xLjU5Mi0uMzUyLS4zNjgtLjgzMi0uNTUyLTEuNDQtLjU1MnMtMS4wOS4xODQtMS40NDguNTUyYy0uMzU3LjM2OC0uNTM2Ljg5OS0uNTM2IDEuNTkyVjI0aC0yLjI0di00Ljg5NmMwLS42OTMtLjE3Ni0xLjIyNC0uNTI4LTEuNTkyLS4zNTItLjM2OC0uODMyLS41NTItMS40NC0uNTUycy0xLjA5LjE4NC0xLjQ0OC41NTJjLS4zNTcuMzY4LS41MzYuODk5LS41MzYgMS41OTJWMjRoLTIuMjU2di04Ljg2NGgyLjI1NnpNMTY0LjkzNiAyNFYxMi4xNmgyLjI1NlYyNGgtMi4yNTZ6bTcuMDQtLjE2bC0zLjQ3Mi04LjcwNGgyLjUyOGwyLjI1NiA2LjMwNCAyLjM4NC02LjMwNGgyLjM1MmwtNS41MzYgMTMuMDU2aC0yLjM1MmwxLjg0LTQuMzUyeiIvPgogICAgPC9nPgo8L3N2Zz4K) center no-repeat;"></span>

      <div data-custom-class="body">
      <div><strong><span style="font-size: 26px;"><span data-custom-class="title"><bdt class="block-component"></bdt><bdt class="question"><h1>PRIVACY POLICY</h1></bdt><bdt class="statement-end-if-in-editor"></bdt></span></span></strong></div><div><span style="color: rgb(127, 127, 127);"><strong><span style="font-size: 15px;"><span data-custom-class="subtitle">Last updated <bdt class="question">March 25, 2026</bdt></span></span></strong></span></div><div><br></div><div><br></div><div><br></div><div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text">This Privacy Notice for <bdt class="question noTranslate">Askra</bdt><bdt class="block-component"></bdt></bdt> (<bdt class="block-component"></bdt>"<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>"<bdt class="statement-end-if-in-editor"></bdt></span><span data-custom-class="body_text">), describes how and why we might access, collect, store, use, and/or share (<bdt class="block-component"></bdt>"<strong>process</strong>"<bdt class="statement-end-if-in-editor"></bdt>) your personal information when you use our services (<bdt class="block-component"></bdt>"<strong>Services</strong>"<bdt class="statement-end-if-in-editor"></bdt>), including when you:</span></span></span><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Visit our website<bdt class="block-component"></bdt> at <span style="color: rgb(0, 58, 250);"><bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="https://www.askra.app">https://www.askra.app</a></bdt></span><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"> or any website of ours that links to this Privacy Notice</bdt></span></span></span></span></span></span></span></span></li></ul><div><bdt class="block-component"><span style="font-size: 15px;"><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Engage with us in other related ways, including any marketing or events<span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span data-custom-class="body_text"><strong>Questions or concerns? </strong>Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services.<bdt class="block-component"></bdt> If you still have any questions or concerns, please contact us at <bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:jacksonjallen26@gmail.com">jacksonjallen26@gmail.com</a></bdt>.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>SUMMARY OF KEY POINTS</h2></span></span></strong></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong><em>This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our </em></strong></span></span><a data-custom-class="link" href="#toc"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><strong><em>table of contents</em></strong></span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text"><strong><em> below to find the section you are looking for.</em></strong></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about </span></span><a data-custom-class="link" href="#personalinfo"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">personal information you disclose to us</span></span></a><span data-custom-class="body_text">.</span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Do we process any sensitive personal information? </strong>Some of the information may be considered <bdt class="block-component"></bdt>"special" or "sensitive"<bdt class="statement-end-if-in-editor"></bdt> in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. <bdt class="block-component"></bdt>We do not process sensitive personal information.<bdt class="else-block"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Do we collect any information from third parties?</strong> <bdt class="block-component"></bdt>We do not collect any information from third parties.<bdt class="else-block"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about </span></span><a data-custom-class="link" href="#infouse"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">how we process your information</span></span></a><span data-custom-class="body_text">.</span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>In what situations and with which <bdt class="block-component"></bdt>parties do we share personal information?</strong> We may share information in specific situations and with specific <bdt class="block-component"></bdt>third parties. Learn more about </span></span><a data-custom-class="link" href="#whoshare"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">when and with whom we share your personal information</span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text">.<bdt class="block-component"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>How do we keep your information safe?</strong> We have adequate <bdt class="block-component"></bdt>organizational<bdt class="statement-end-if-in-editor"></bdt> and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other <bdt class="block-component"></bdt>unauthorized<bdt class="statement-end-if-in-editor"></bdt> third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about </span></span><a data-custom-class="link" href="#infosafe"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">how we keep your information safe</span></span></a><span data-custom-class="body_text">.</span><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about </span></span><a data-custom-class="link" href="#privacyrights"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">your privacy rights</span></span></a><span data-custom-class="body_text">.</span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by <bdt class="block-component">submitting a </bdt></span></span><a data-custom-class="link" href="https://app.termly.io/dsar/352b87d2-347d-4fed-9b09-e8549db89a87" rel="noopener noreferrer" target="_blank"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">data subject access request</span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Want to learn more about what we do with any information we collect? </span></span><a data-custom-class="link" href="#toc"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">Review the Privacy Notice in full</span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text">.</span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><br></div><div id="toc" style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>TABLE OF CONTENTS</h2></span></strong></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#infocollect"><span style="color: rgb(0, 58, 250);">1. WHAT INFORMATION DO WE COLLECT?</span></a></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#infouse"><span style="color: rgb(0, 58, 250);">2. HOW DO WE PROCESS YOUR INFORMATION?<bdt class="block-component"></bdt></span></a></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="#whoshare">3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></span><span data-custom-class="body_text"><bdt class="block-component"></bdt></a><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#cookies"><span style="color: rgb(0, 58, 250);">4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</span></a><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span><bdt class="block-component"></bdt></span></div><div style="line-height: 1.5;"><a data-custom-class="link" href="#ai"><span style="color: rgb (0, 58, 250);">5. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</span></a><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"></bdt></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></span> <bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#inforetain"><span style="color: rgb(0, 58, 250);">6. HOW LONG DO WE KEEP YOUR INFORMATION?</span></a><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#infosafe"><span style="color: rgb(0, 58, 250);">7. HOW DO WE KEEP YOUR INFORMATION SAFE?</span></a><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#infominors"><span style="color: rgb(0, 58, 250);">8. DO WE COLLECT INFORMATION FROM MINORS?</span></a><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="#privacyrights">9. WHAT ARE YOUR PRIVACY RIGHTS?</a></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#DNT"><span style="color: rgb(0, 58, 250);">10. CONTROLS FOR DO-NOT-TRACK FEATURES<bdt class="block-component"></bdt></span></a></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#uslaws"><span style="color: rgb(0, 58, 250);">11. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</span></a></span><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></bdt></span></div><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></span></bdt></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#policyupdates"><span style="color: rgb(0, 58, 250);">12. DO WE MAKE UPDATES TO THIS NOTICE?</span></a></span></div><div style="line-height: 1.5;"><a data-custom-class="link" href="#contact"><span style="color: rgb(0, 58, 250); font-size: 15px;">13. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></a></div><div style="line-height: 1.5;"><a data-custom-class="link" href="#request"><span style="color: rgb(0, 58, 250);">14. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</span></a></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><br></div><div id="infocollect" style="line-height: 1.5;"><span style="color: rgb(0, 0, 0);"><span style="color: rgb(0, 0, 0); font-size: 15px;"><span style="font-size: 15px; color: rgb(0, 0, 0);"><span style="font-size: 15px; color: rgb(0, 0, 0);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>1. WHAT INFORMATION DO WE COLLECT?</h2></span></strong></span></span></span></span></span><span data-custom-class="heading_2" id="personalinfo" style="color: rgb(0, 0, 0);"><span style="font-size: 15px;"><strong><h3>Personal information you disclose to us</h3></strong></span></span><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong></span></span></span></span><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em> </em></strong><em>We collect personal information that you provide to us.</em></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We collect personal information that you voluntarily provide to us when you <span style="font-size: 15px;"><bdt class="block-component"></bdt></span>register on the Services, </span><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"></bdt></span></span><span data-custom-class="body_text">express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:<span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">names</bdt></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">email addresses</bdt></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">usernames</bdt></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">passwords</bdt></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">billing addresses</bdt></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">debit/credit card numbers</bdt></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></div><div id="sensitiveinfo" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Sensitive Information.</strong> <bdt class="block-component"></bdt>We do not process sensitive information.</span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="else-block"></bdt></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Payment Data.</strong> We may collect data necessary to process your payment if you choose to make purchases, such as your payment instrument number, and the security code associated with your payment instrument. All payment data is handled and stored by<bdt class="forloop-component"></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span> <bdt class="question noTranslate">Stripe</bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></span>. You may find their privacy notice link(s) here:<span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span> <span style="color: rgb(0, 58, 250);"><bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="https://stripe.com/privacy">https://stripe.com/privacy</a></bdt></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="forloop-component"></bdt><span style="font-size: 15px;"><span data-custom-class="body_text">.<bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></bdt></span></span></span></span><bdt class="block-component"></span></span></bdt></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt></span></span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></bdt></span></span></span></span></bdt></span></span></span></span></span></span></span></span><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div id="infouse" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>2. HOW DO WE PROCESS YOUR INFORMATION?</h2></span></strong></span></span></span><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short: </em></strong><em>We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.<bdt class="block-component"></bdt> We may also process your information for other purposes <bdt class="block-component"></bdt>with your<bdt class="statement-end-if-in-editor"></bdt> consent.</em></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</strong><bdt class="block-component"></bdt></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To facilitate account creation and authentication and otherwise manage user accounts. </strong>We may process your information so you can create and log in to your account, as well as keep your account in working order.<span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To deliver and facilitate delivery of services to the user. </strong>We may process your information to provide you with the requested service.<span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><p style="font-size: 15px; line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px; line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px; line-height: 1.5;"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px; line-height: 1.5;"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></bdt></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"><span data-custom-class="body_text"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>To protect our Services.</strong> We may process your information as part of our efforts to keep our Services safe and secure, including fraud monitoring and prevention.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>To evaluate and improve our Services, products, marketing, and your experience.</strong> We may process your information when we believe it is necessary to identify usage trends, determine the effectiveness of our promotional campaigns, and to evaluate and improve our Services, products, marketing, and your experience.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><div style="line-height: 1.5;"><br></div><div id="whoshare" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We may share information in specific situations described in this section and/or with the following <bdt class="block-component"></bdt>third parties.</em></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We <bdt class="block-component"></bdt>may need to share your personal information in the following situations:</span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"><span data-custom-class="body_text"></span></bdt></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"><span data-custom-class="heading_1"><bdt class="block-component"></bdt></span></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="cookies" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We may use cookies and other tracking technologies to collect and store your information.</em></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services<bdt class="block-component"></bdt> and your account<bdt class="statement-end-if-in-editor"></bdt>, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help manage and display advertisements, to tailor advertisements to your interests, or to send abandoned shopping cart reminders (depending on your communication preferences). The third parties and service providers use their technology to provide advertising about products and services tailored to your interests which may appear either on our Services or on other websites.</span></span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">To the extent these online tracking technologies are deemed to be a <bdt class="block-component"></bdt>"sale"/"sharing"<bdt class="statement-end-if-in-editor"></bdt> (which includes targeted advertising, as defined under the applicable laws) under applicable US state laws, you can opt out of these online tracking technologies by submitting a request as described below under section <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span><span data-custom-class="body_text"><a data-custom-class="link" href="#uslaws"><span style="color: rgb(0, 58, 250); font-size: 15px;">DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</span></a></span><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span><bdt class="statement-end-if-in-editor"></bdt></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice<span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>.</span></span></span></span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></span><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><div style="line-height: 1.5;"><br></div><div id="ai" style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="heading_1"><h2>5. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2></span></strong><strong><em><span data-custom-class="body_text">In Short:</span></em></strong><em><span data-custom-class="body_text"> We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.</span></em></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">As part of our Services, we offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies (collectively, <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt>AI Products<bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt>). These tools are designed to enhance your experience and provide you with innovative solutions. The terms in this Privacy Notice govern your use of the AI Products within our Services.</span><bdt class="block-component"></bdt></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="body_text">Use of AI Technologies</span></strong></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We provide the AI Products through third-party service providers (<bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt>AI Service Providers<bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt>), including <bdt class="forloop-component"></bdt><bdt class="block-component"></bdt><bdt class="question noTranslate">OpenAI</bdt><bdt class="block-component"></bdt><bdt class="forloop-component"></bdt>. As outlined in this Privacy Notice, your input, output, and personal information will be shared with and processed by these AI Service Providers to enable your use of our AI Products for purposes outlined in <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt></span><a data-custom-class="link" href="#whoshare"><span style="color: rgb(0, 58, 250); font-size: 15px;">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</span></a></span><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt> You must not use the AI Products in any way that violates the terms or policies of any AI Service Provider.</span><bdt class="statement-end-if-in-editor"></bdt></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="body_text">Our AI Products</span></strong></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Our AI Products are designed for the following functions:</span><bdt class="forloop-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="question"><span data-custom-class="body_text">AI bots</span></bdt></span></li></ul><div><span style="font-size: 15px;"><bdt class="forloop-component"></bdt><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="body_text">How We Process Your Data Using AI</span></strong></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">All personal information processed using our AI Products is handled in line with our Privacy Notice and our agreement with third parties. This ensures high security and safeguards your personal information throughout the process, giving you peace of mind about your data's safety.</span> <bdt class="block-component"></bdt><bdt class="statement-end-if-in-editor"></bdt></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span><bdt class="block-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="inforetain" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>6. HOW LONG DO WE KEEP YOUR INFORMATION?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short: </em></strong><em>We keep your information for as long as necessary to <bdt class="block-component"></bdt>fulfill<bdt class="statement-end-if-in-editor"></bdt> the purposes outlined in this Privacy Notice unless otherwise required by law.</em></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).<bdt class="block-component"></bdt> No purpose in this notice will require us keeping your personal information for longer than <span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span> <bdt class="block-component"></bdt>the period of time in which users have an account with us<bdt class="block-component"></bdt><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="else-block"></bdt></span></span></span>.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">When we have no ongoing legitimate business need to process your personal information, we will either delete or <bdt class="block-component"></bdt>anonymize<bdt class="statement-end-if-in-editor"></bdt> such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.<span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="infosafe" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>7. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short: </em></strong><em>We aim to protect your personal information through a system of <bdt class="block-component"></bdt>organizational<bdt class="statement-end-if-in-editor"></bdt> and technical security measures.</em></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We have implemented appropriate and reasonable technical and <bdt class="block-component"></bdt>organizational<bdt class="statement-end-if-in-editor"></bdt> security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other <bdt class="block-component"></bdt>unauthorized<bdt class="statement-end-if-in-editor"></bdt> third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.<span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="infominors" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>8. DO WE COLLECT INFORMATION FROM MINORS?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We do not knowingly collect data from or market to <bdt class="block-component"></bdt>children under 18 years of age<bdt class="block-component"></bdt><bdt class="else-block"></bdt>.</em><bdt class="block-component"></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We do not knowingly collect, solicit data from, or market to children under 18 years of age<bdt class="block-component"></bdt>, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18<bdt class="block-component"></bdt> or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the Services. If we learn that personal information from users less than 18 years of age<bdt class="block-component"></bdt> has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18<bdt class="block-component"></bdt>, please contact us at <span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="question"><a target="_blank" data-custom-class="link" href="mailto:jacksonjallen26@gmail.com">jacksonjallen26@gmail.com</a></bdt><bdt class="else-block"></bdt></span></span>.</span><span data-custom-class="body_text"><bdt class="else-block"><bdt class="block-component"></bdt></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="privacyrights" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>9. WHAT ARE YOUR PRIVACY RIGHTS?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> <span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span data-custom-class="body_text"><em><bdt class="block-component"></bdt></em></span></span> </span>You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.</em><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><bdt class="block-component"><bdt class="block-component"></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="withdrawconsent" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><u>Withdrawing your consent:</u></strong> If we are relying on your consent to process your personal information,<bdt class="block-component"></bdt> which may be express and/or implied consent depending on the applicable law,<bdt class="statement-end-if-in-editor"></bdt> you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span><a data-custom-class="link" href="#contact"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span data-custom-class="body_text">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></span></span></a><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt> below<bdt class="block-component"></bdt>.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">However, please note that this will not affect the lawfulness of the processing before its withdrawal nor,<bdt class="block-component"></bdt> when applicable law allows,<bdt class="statement-end-if-in-editor"></bdt> will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.<bdt class="block-component"></bdt></span></span><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><span style="font-size: 15px;"><span data-custom-class="heading_2"><strong><h3>Account Information</h3></strong></span></span><span data-custom-class="body_text"><span style="font-size: 15px;">If you would at any time like to review or change the information in your account or terminate your account, you can:<bdt class="forloop-component"></bdt></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="question">Log in to your account settings and update your user account.</bdt></span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><u>Cookies and similar technologies:</u></strong> Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Services. <bdt class="block-component"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></span></span></span><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If you have questions or comments about your privacy rights, you may email us at <bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:jacksonjallen26@gmail.com">jacksonjallen26@gmail.com</a></bdt>.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><div style="line-height: 1.5;"><br></div><div id="DNT" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>10. CONTROLS FOR DO-NOT-TRACK FEATURES</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (<bdt class="block-component"></bdt>"DNT"<bdt class="statement-end-if-in-editor"></bdt>) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for <bdt class="block-component"></bdt>recognizing<bdt class="statement-end-if-in-editor"></bdt> and implementing DNT signals has been <bdt class="block-component"></bdt>finalized<bdt class="statement-end-if-in-editor"></bdt>. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.</span></span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">California law requires us to let you know how we respond to web browser DNT signals. Because there currently is not an industry or legal standard for <bdt class="block-component"></bdt>recognizing<bdt class="statement-end-if-in-editor"></bdt> or <bdt class="block-component"></bdt>honoring<bdt class="statement-end-if-in-editor"></bdt> DNT signals, we do not respond to them at this time.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="uslaws" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>11. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short: </em></strong><em>If you are a resident of<bdt class="block-component"></bdt> California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia<bdt class="else-block"></bdt>, you may have the right to request access to and receive details about the personal information we maintain about you and how we have processed it, correct inaccuracies, get a copy of, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. More information is provided below.</em></span><strong><span data-custom-class="heading_2"><h3>Categories of Personal Information We Collect</h3></span></strong><span data-custom-class="body_text">The table below shows the categories of personal information we have collected in the past twelve (12) months. The table includes illustrative examples of each category and does not reflect the personal information we collect from you. For a comprehensive inventory of all personal information we process, please refer to the section <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span><a data-custom-class="link" href="#infocollect"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span data-custom-class="body_text"><span data-custom-class="link">WHAT INFORMATION DO WE COLLECT?</span></span></span></span></a><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div><table style="width: 100%;"><thead><tr><th style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black; text-align: left;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Category</strong></span></span></span></th><th style="width: 51.4385%; border-top: 1px solid black; border-right: 1px solid black; text-align: left;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Examples</strong></span></span></span></th><th style="width: 14.9084%; border-right: 1px solid black; border-top: 1px solid black; text-align: center; text-align: left;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Collected</strong></span></span></span></th></tr></thead><tbody><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">A. Identifiers</span></span></span></div></td><td style="width: 51.4385%; border-top: 1px solid black; border-right: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name</span></span></span></div></td><td style="width: 14.9084%; text-align: center; vertical-align: middle; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"><bdt class="block-component"></bdt></bdt>YES<bdt class="else-block"><bdt class="block-component"></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div></td></tr></tbody></table><div style="line-height: 1.5;"><bdt class="block-component"></bdt></div><table style="width: 100%;"><tbody><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">B. Personal information as defined in the California Customer Records statute</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Name, contact information, education, employment, employment history, and financial information</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="forloop-component"><bdt class="block-component"><bdt class="block-component">NO<bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div></td></tr></tbody></table><div style="line-height: 1.5;"><bdt class="block-component"></bdt></div><table style="width: 100%;"><tbody><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>C<bdt class="else-block"></bdt>. Protected classification characteristics under state or federal law</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO<bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>D<bdt class="else-block"></bdt>. Commercial information</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Transaction information, purchase history, financial details, and payment information</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO<bdt class="statement-end-if-in-editor"><bdt class="block-component"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>E<bdt class="else-block"></bdt>. Biometric information</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Fingerprints and voiceprints</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"><bdt class="block-component">NO</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>F<bdt class="else-block"></bdt>. Internet or other similar network activity</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Browsing history, search history, online <bdt class="block-component"></bdt>behavior<bdt class="statement-end-if-in-editor"></bdt>, interest data, and interactions with our and other websites, applications, systems, and advertisements</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO<bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>G<bdt class="else-block"></bdt>. Geolocation data</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Device location</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO<bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>H<bdt class="else-block"></bdt>. Audio, electronic, sensory, or similar information</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Images and audio, video or call recordings created in connection with our business activities</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO<bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>I<bdt class="else-block"></bdt>. Professional or employment-related information</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO<bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black; width: 33.8274%;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>J<bdt class="else-block"></bdt>. Education Information</span></span></span></div></td><td style="border-right: 1px solid black; border-top: 1px solid black; width: 51.4385%;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Student records and directory information</span></span></span></div></td><td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black; width: 14.9084%;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO<bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="border-width: 1px; border-color: black; border-style: solid; width: 33.8274%;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>K<bdt class="else-block"></bdt>. Inferences drawn from collected personal information</span></span></span></div></td><td style="border-bottom: 1px solid black; border-top: 1px solid black; border-right: 1px solid black; width: 51.4385%;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual’s preferences and characteristics</span></span></span></div></td><td style="text-align: center; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black; width: 14.9084%;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>NO<span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black; line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>L<bdt class="else-block"></bdt>. Sensitive personal Information</span></td><td style="border-right: 1px solid black; border-bottom: 1px solid black; line-height: 1.5;"><bdt class="block-component"><span data-custom-class="body_text"></span></bdt></td><td style="border-right: 1px solid black; border-bottom: 1px solid black;"><div data-empty="true" style="text-align: center;"><br></div><div data-custom-class="body_text" data-empty="true" style="text-align: center; line-height: 1.5;"><bdt class="block-component"><span data-custom-class="body_text"></bdt>NO</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></div><div data-empty="true" style="text-align: center;"><br></div></td></tr></tbody></table><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of:</span><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Receiving help through our customer support channels;<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text"><span style="font-size: 15px;">Participation in customer surveys or contests; and<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text"><span style="font-size: 15px;">Facilitation in the delivery of our Services and to respond to your inquiries.</span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span data-custom-class="body_text"></span></bdt><span data-custom-class="body_text">We will use and retain the collected personal information as needed to provide the Services or for:<bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category A - <bdt class="question">As long as the user has an account with us</bdt><bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"><bdt class="block-component"></bdt></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></li></ul><div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_2"><h3>Sources of Personal Information</h3></span></span></strong><span style="font-size: 15px;"><span data-custom-class="body_text">Learn more about the sources of personal information we collect in <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span><span style="color: rgb(0, 58, 250);"><span data-custom-class="body_text"><a data-custom-class="link" href="#infocollect"><span style="color: rgb (0, 58, 250); font-size: 15px;">WHAT INFORMATION DO WE COLLECT?</span></a></span></span><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><strong><span data-custom-class="heading_2"><h3>How We Use and Share Personal Information</h3></span></strong></span></span><span data-custom-class="body_text" style="font-size: 15px;"><bdt class="block-component"></bdt>Learn more about how we use your personal information in the section, <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span><a data-custom-class="link" href="#infouse"><span style="color: rgb(0, 58, 250); font-size: 15px;">HOW DO WE PROCESS YOUR INFORMATION?</span></a><span data-custom-class="body_text" style="font-size: 15px;"><bdt class="block-component"></bdt>"</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text" style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></bdt></bdt></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Will your information be shared with anyone else?</strong></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Learn more about how we disclose personal information to in the section, <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span><a data-custom-class="link" href="#whoshare"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span style="font-size: 15px; color: rgb(0, 58, 250);">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</span></span></a><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may use your personal information for our own business purposes, such as for undertaking internal research for technological development and demonstration. This is not considered to be <bdt class="block-component"></bdt>"selling"<bdt class="statement-end-if-in-editor"></bdt> of your personal information.<span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We have not disclosed, sold, or shared any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. We<span style="color: rgb(89, 89, 89);"> </span>will not sell or share personal information in the future belonging to website visitors, users, and other consumers.<span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></bdt></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span><span data-custom-class="body_text"><span style="color: rgb(0, 0, 0);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="heading_2"><h3>Your Rights</h3></span></strong><span data-custom-class="body_text">You have rights under certain US state data protection laws. However, these rights are not absolute, and in certain cases, we may decline your request as permitted by law. These rights include:</span><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to know</strong> whether or not we are processing your personal data<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to access </strong>your personal data<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to correct </strong>inaccuracies in your personal data<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to request</strong> the deletion of your personal data<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to obtain a copy </strong>of the personal data you previously shared with us<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to non-discrimination</strong> for exercising your rights<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to opt out</strong> of the processing of your personal data if it is used for targeted advertising<bdt class="block-component"></bdt> (or sharing as defined under California’s privacy law)<bdt class="statement-end-if-in-editor"></bdt>, the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects (<bdt class="block-component"></bdt>"profiling"<bdt class="statement-end-if-in-editor"></bdt>)<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Depending upon the state where you live, you may also have the following rights:</span><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to access the categories of personal data being processed (as permitted by applicable law, including the privacy law in Minnesota)<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to obtain a list of the categories of third parties to which we have disclosed personal data (as permitted by applicable law, including the privacy law in<bdt class="block-component"></bdt> California, Delaware, and Maryland<bdt class="else-block"></bdt><bdt class="block-component"></bdt>)<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to obtain a list of specific third parties to which we have disclosed personal data (as permitted by applicable law, including the privacy law in<bdt class="block-component"></bdt> Minnesota and Oregon<bdt class="else-block"></bdt>)</span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5; font-size: 15px;">Right to obtain a list of third parties to which we have sold personal data (as permitted by applicable law, including the privacy law in Connecticut)<bdt class="statement-end-if-in-editor"></bdt></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to review, understand, question, and depending on where you live, correct how personal data has been profiled (as permitted by applicable law, including the privacy law in <bdt class="block-component"></bdt>Connecticut and Minnesota<bdt class="else-block"></bdt>)<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to limit use and disclosure of sensitive personal data (as permitted by applicable law, including the privacy law in California)</span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to opt out of the collection of sensitive data and personal data collected through the operation of a voice or facial recognition feature (as permitted by applicable law, including the privacy law in Florida)</span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"></bdt></span><strong><span style="font-size: 15px;"><span data-custom-class="heading_2"><h3>How to Exercise Your Rights</h3></span></span></strong><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">To exercise these rights, you can contact us <bdt class="block-component"></bdt>by submitting a </span></span></span><a data-custom-class="link" href="https://app.termly.io/dsar/352b87d2-347d-4fed-9b09-e8549db89a87" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span style="font-size: 15px; color: rgb(0, 58, 250);">data subject access request</span></span></a><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">, <bdt class="block-component"></bdt></span><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>by emailing us at <bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:jacksonjallen26@gmail.com">jacksonjallen26@gmail.com</a></bdt>, <bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt></span><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="block-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt></span></span></span></span></span></span></span></span></span></span></span></span><span data-custom-class="body_text">or by referring to the contact details at the bottom of this document.</span></span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Under certain US state data protection laws, you can designate an <bdt class="block-component"></bdt>authorized<bdt class="statement-end-if-in-editor"></bdt> agent to make a request on your behalf. We may deny a request from an <bdt class="block-component"></bdt>authorized<bdt class="statement-end-if-in-editor"></bdt> agent that does not submit proof that they have been validly <bdt class="block-component"></bdt>authorized<bdt class="statement-end-if-in-editor"></bdt> to act on your behalf in accordance with applicable laws.</span> <br><strong><span data-custom-class="heading_2"><h3>Request Verification</h3></span></strong><span data-custom-class="body_text">Upon receiving your request, we will need to verify your identity to determine you are the same person about whom we have the information in our system. We will only use personal information provided in your request to verify your identity or authority to make the request. However, if we cannot verify your identity from the information already maintained by us, we may request that you provide additional information for the purposes of verifying your identity and for security or fraud-prevention purposes.</span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">If you submit the request through an <bdt class="block-component"></bdt>authorized<bdt class="statement-end-if-in-editor"></bdt> agent, we may need to collect additional information to verify your identity before processing your request and the agent will need to provide a written and signed permission from you to submit such request on your behalf.</span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px;"><span data-custom-class="heading_2"><strong><h3>Appeals</h3></strong></span><span data-custom-class="body_text">Under certain US state data protection laws, if we decline to take action regarding your request, you may appeal our decision by emailing us at <bdt class="block-component"></bdt><bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:jacksonjallen26@gmail.com">jacksonjallen26@gmail.com</a></bdt><bdt class="else-block"></bdt>. We will inform you in writing of any action taken or not taken in response to the appeal, including a written explanation of the reasons for the decisions. If your appeal is denied, you may submit a complaint to your state attorney general.</span><bdt class="statement-end-if-in-editor"></bdt></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"><bdt class="block-component"></span></bdt></span></span></span></span></span></span></span></span></span></span><bdt class="block-component"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></bdt><span style="font-size: 15px;"><strong><span data-custom-class="heading_2"><h3>California <bdt class="block-component"></bdt>"Shine The Light"<bdt class="statement-end-if-in-editor"></bdt> Law</h3></span></strong><span data-custom-class="body_text">California Civil Code Section 1798.83, also known as the <bdt class="block-component"></bdt>"Shine The Light"<bdt class="statement-end-if-in-editor"></bdt> law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year. If you are a California resident and would like to make such a request, please submit your request in writing to us by using the contact details provided in the section <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span><span data-custom-class="body_text"><a data-custom-class="link" href="#contact"><span style="color: rgb(0, 58, 250); font-size: 15px;">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></a></span><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"><bdt class="statement-end-if-in-editor"></bdt></bdt></span></span></span></span></span></span></span></span></span></span></span></bdt></span></span></span></span></span></span></span></span></span></span><bdt class="block-component"><span style="font-size: 15px;"></bdt></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><br></div><div id="policyupdates" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>12. DO WE MAKE UPDATES TO THIS NOTICE?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><em><strong>In Short: </strong>Yes, we will update this notice as necessary to stay compliant with relevant laws.</em></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may update this Privacy Notice from time to time. The updated version will be indicated by an updated <bdt class="block-component"></bdt>"Revised"<bdt class="statement-end-if-in-editor"></bdt> date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.</span></span></span></div><div style="line-height: 1.5;"><br></div><div id="contact" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>13. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you have questions or comments about this notice, you may <span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"><bdt class="block-component"></bdt></bdt>email us at <bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:jacksonjallen26@gmail.com">jacksonjallen26@gmail.com</a> or </bdt><bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></bdt></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">contact us by post at:</span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="question noTranslate">Askra</bdt></span></span></span></span></span><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"><bdt class="block-component"></bdt></bdt></bdt></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question noTranslate">4201 Hill Top Rd</bdt><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></span></bdt></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">Louisville</bdt><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><bdt class="block-component"></bdt><bdt class="block-component"></bdt>, <bdt class="question noTranslate">KY</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt> <bdt class="question noTranslate">40207</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt></span></span></span></span></div><div style="line-height: 1.5;"><span data-custom-class="body_text" style="font-size: 15px;"><bdt class="question noTranslate">United States<span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></bdt></span><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span></span></bdt><bdt class="statement-end-if-in-editor"></bdt></span></span></span><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"><bdt class="block-component"></span></bdt><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div id="request" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>14. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>Based on the applicable laws of your country<bdt class="block-component"></bdt> or state of residence in the US<bdt class="statement-end-if-in-editor"></bdt>, you may<bdt class="else-block"><bdt class="block-component"> have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to <bdt class="block-component"></bdt>withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please <bdt class="block-component"></bdt>fill out and submit a </span><span style="color: rgb(0, 58, 250);"><span data-custom-class="body_text"><span style="color: rgb(0, 58, 250); font-size: 15px;"><a data-custom-class="link" href="https://app.termly.io/dsar/352b87d2-347d-4fed-9b09-e8549db89a87" rel="noopener noreferrer" target="_blank">data subject access request</a></span></span></span><bdt class="block-component"><span data-custom-class="body_text"></bdt></span></span><span data-custom-class="body_text">.</span></span></span><div style="display: none;"><a class="privacy123" href="https://app.termly.io/dsar/352b87d2-347d-4fed-9b09-e8549db89a87"></a></div></div><style>
      ul {
        list-style-type: square;
      }
      ul > li > ul {
        list-style-type: circle;
      }
      ul > li > ul > li > ul {
        list-style-type: square;
      }
      ol li {
        font-family: Arial ;
      }
    </style>
      </div>
      <br><div><span data-custom-class='body_text'>This Privacy Policy was created using Termly's </span><a href="https://termly.io/products/privacy-policy-generator/" target="_blank" rel="noopener external" data-custom-class='link'>Privacy Policy Generator</a></div>` }}
    />
  )
}

// =============================
// Terms of Service Page
// =============================
function TermsPage() {
  return (
    <div style={{ 
      maxWidth: 900, 
      margin: "0 auto", 
      padding: "60px 24px", 
      background: "#fff",
      minHeight: "100vh"
    }}
      dangerouslySetInnerHTML={{ __html: `<style>
  [data-custom-class='body'], [data-custom-class='body'] * {
          background: transparent !important;
        }
[data-custom-class='title'], [data-custom-class='title'] * {
          font-family: Arial !important;
font-size: 26px !important;
color: #000000 !important;
        }
[data-custom-class='subtitle'], [data-custom-class='subtitle'] * {
          font-family: Arial !important;
color: #595959 !important;
font-size: 14px !important;
        }
[data-custom-class='heading_1'], [data-custom-class='heading_1'] * {
          font-family: Arial !important;
font-size: 19px !important;
color: #000000 !important;
        }
[data-custom-class='heading_2'], [data-custom-class='heading_2'] * {
          font-family: Arial !important;
font-size: 17px !important;
color: #000000 !important;
        }
[data-custom-class='body_text'], [data-custom-class='body_text'] * {
          color: #595959 !important;
font-size: 14px !important;
font-family: Arial !important;
        }
[data-custom-class='link'], [data-custom-class='link'] * {
          color: #3030F1 !important;
font-size: 14px !important;
font-family: Arial !important;
word-break: break-word !important;
        }
</style>

      <div data-custom-class="body">
      <div align="center" style="text-align: left;"><div class="MsoNormal" data-custom-class="title" style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 19px;"></bdt><bdt class="question"><strong><h1>TERMS OF SERVICE</h1></strong></bdt><bdt class="statement-end-if-in-editor"></bdt></span></div><div class="MsoNormal" data-custom-class="subtitle" style="line-height: 1.5;"><strong>Last updated</strong> <bdt class="question"><strong>March 26, 2026</strong></bdt></div><div class="MsoNormal" style="line-height: 1.1;"><br></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>AGREEMENT TO OUR LEGAL TERMS</h2></span></strong></div></div><div align="center" style="text-align: left;"><div class="MsoNormal" id="agreement" style="line-height: 1.5;"><a name="_6aa3gkhykvst"></a></div></div><div align="center" style="text-align: left;"><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">We are <bdt class="question noTranslate" data-id="9d459c4e-c548-e5cb-7729-a118548965d2">Askra</bdt><bdt class="block-component"></bdt> (<bdt class="block-component"></bdt>"<strong>Company</strong>," "<strong>we</strong>," "<strong>us</strong>," "<strong>our</strong>"<bdt class="statement-end-if-in-editor"></bdt>)<span style="font-size:11.0pt;line-height:115%;
Arial;mso-fareast-font-family:Calibri;color:#595959;mso-themecolor:text1;
mso-themetint:166;"><span style="font-size:11.0pt;line-height:115%;
Arial;mso-fareast-font-family:Calibri;color:#595959;mso-themecolor:text1;
mso-themetint:166;"><span style="font-size:11.0pt;line-height:115%;
Arial;mso-fareast-font-family:Calibri;color:#595959;mso-themecolor:text1;
mso-themetint:166;"><bdt class="question"><bdt class="block-component"></bdt></bdt><span style="font-size:11.0pt;line-height:115%;
Arial;mso-fareast-font-family:Calibri;color:#595959;mso-themecolor:text1;
mso-themetint:166;"><bdt class="block-component"></bdt></span>, a company registered in<bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"> </bdt><span style="font-size:11.0pt;line-height:115%;
Arial;mso-fareast-font-family:Calibri;color:#595959;mso-themecolor:text1;
mso-themetint:166;"><span style="font-size:11.0pt;line-height:115%;
Arial;mso-fareast-font-family:Calibri;color:#595959;mso-themecolor:text1;
mso-themetint:166;"><bdt class="question noTranslate">Kentucky</bdt>, <bdt class="question noTranslate">United States</bdt></span></span><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt></span></span></bdt> </span></span>at <bdt class="question noTranslate">4201 Hill Top Rd</bdt><bdt class="block-component"></bdt></span></span>, <bdt class="question noTranslate">Louisville</bdt></span></span><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt><bdt class="block-component"></bdt>, <bdt class="question noTranslate">KY</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt> <bdt class="question noTranslate">40207</bdt><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span><span style="font-size:11.0pt;line-height:115%;
Arial;mso-fareast-font-family:Calibri;color:#595959;mso-themecolor:text1;
mso-themetint:166;"><span style="font-size:11.0pt;line-height:115%;
Arial;mso-fareast-font-family:Calibri;color:#595959;mso-themecolor:text1;
mso-themetint:166;"><bdt class="else-block"></bdt></bdt></span></bdt></span><bdt class="statement-end-if-in-editor">.</bdt></span><bdt class="block-component"></bdt></span></span></span></span></span></span></div></div><div align="center" style="line-height: 1;"><br></div><div align="center" style="text-align: left;"><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">We operate <bdt class="block-component"></bdt>the website <span style="color: rgb(0, 58, 250);"><bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="https://www.askra.app">https://www.askra.app</a></bdt></span> (the <bdt class="block-component"></bdt>"<strong>Site</strong>"<bdt class="statement-end-if-in-editor"></bdt>)<bdt class="block-component"></bdt><bdt class="block-component"></bdt>, as well as any other related products and services that refer or link to these legal terms (the <bdt class="block-component"></bdt>"<strong>Legal Terms</strong>"<bdt class="statement-end-if-in-editor"></bdt>) (collectively, the <bdt class="block-component"></bdt>"<strong>Services</strong>"<bdt class="statement-end-if-in-editor"></bdt>).<bdt class="block-component"></bdt></span></div><div class="MsoNormal" style="line-height: 1;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">You can contact us by <bdt class="block-component"></bdt>phone at <bdt class="question">(+1)5029317187</bdt>, email at <bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:jacksonjallen26@gmail.com">jacksonjallen26@gmail.com</a></bdt><bdt class="block-component"></bdt>,<bdt class="statement-end-if-in-editor"></bdt> or by mail to <bdt class="question noTranslate">4201 Hill Top Rd</bdt><bdt class="block-component"></bdt>, <bdt class="question noTranslate">Louisville</bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt>, <bdt class="question noTranslate">KY</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt> <bdt class="question noTranslate">40207</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt><bdt class="block-component">, </bdt><bdt class="question noTranslate">United States</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt>.</span></div><div class="MsoNormal" style="line-height: 1;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (<bdt class="block-component"></bdt>"<strong>you</strong>"<bdt class="statement-end-if-in-editor"></bdt>), and <bdt class="question noTranslate">Askra</bdt>, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.<bdt class="block-component"></bdt></span></div><div class="MsoNormal" style="line-height: 1;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms <bdt class="block-component"></bdt>at any time and for any reason<bdt class="statement-end-if-in-editor"></bdt>. We will alert you about any changes by updating the <bdt class="block-component"></bdt>"Last updated"<bdt class="statement-end-if-in-editor"></bdt> date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.<bdt class="else-block"></bdt></span></div></div><div align="center" style="line-height: 1;"><br></div><div align="center" style="text-align: left;"><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><bdt class="block-container if" data-type="if" id="a2595956-7028-dbe5-123e-d3d3a93ed076"><bdt data-type="conditional-block"><bdt data-type="body"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;"><bdt class="block-component"></bdt>The
Services are intended for users who are at least 18 years old. Persons under the age
of 18 are not permitted to use or register for the Services.</span></bdt></bdt><bdt data-type="conditional-block"><bdt class="block-component"></bdt></bdt></div><div class="MsoNormal" style="line-height: 1;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;">We recommend that you print a copy of these Legal Terms for your records.</div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="heading_1" style="line-height: 1.5;"><strong><h2>TABLE OF CONTENTS</h2></strong></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#services"><span data-custom-class="link"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">1. OUR SERVICES</span></span></span></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#ip"><span style="color: rgb(0, 58, 250);"><span data-custom-class="body_text">2. INTELLECTUAL PROPERTY RIGHTS</span></span></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#userreps"></a><a data-custom-class="link" href="#userreps"><span style="color: rbg(0, 58, 250); font-size: 15px; line-height: 1.5;"><span data-custom-class="body_text">3. USER REPRESENTATIONS</span></span></a></div><div class="MsoNormal" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span><a data-custom-class="link" href="#userreg"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">4. USER REGISTRATION</span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span> <a data-custom-class="link" href="#products"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#products"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></a> <a data-custom-class="link" href="#purchases"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#purchases"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>5. PURCHASES AND PAYMENT<bdt class="statement-end-if-in-editor"></bdt></span></span></a></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><a data-custom-class="link" href="#subscriptions"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">6. SUBSCRIPTIONS</span></span></a><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span> <a data-custom-class="link" href="#software"></a> <a data-custom-class="link" href="#software"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#software"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></a> <a data-custom-class="link" href="#prohibited"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#prohibited"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">7. PROHIBITED ACTIVITIES</span></span></a> <a data-custom-class="link" href="#ugc"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#ugc"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">8. USER GENERATED CONTRIBUTIONS</span></span></a> <a data-custom-class="link" href="#license"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#license"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">9. CONTRIBUTION <bdt class="block-component"></bdt>LICENSE<bdt class="statement-end-if-in-editor"></bdt></span></span></a> <a data-custom-class="link" href="#reviews"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#reviews"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></a> <a data-custom-class="link" href="#mobile"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#mobile"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></a> <a data-custom-class="link" href="#socialmedia"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#socialmedia"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></a> <a data-custom-class="link" href="#thirdparty"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#thirdparty"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></a> <a data-custom-class="link" href="#advertisers"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#advertisers"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></a> <a data-custom-class="link" href="#sitemanage"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#sitemanage"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">10. SERVICES MANAGEMENT</span></span></a> <a data-custom-class="link" href="#ppyes"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#ppyes"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>11. PRIVACY POLICY<bdt class="statement-end-if-in-editor"></bdt></span></span></a> <a data-custom-class="link" href="#ppno"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#ppno"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></a> <a data-custom-class="link" href="#dmca"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#dmca"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="statement-end-if-in-editor"></bdt></span></span></a></div><div class="MsoNormal" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt></span></span> <a data-custom-class="link" href="#terms"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#terms"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">12. TERM AND TERMINATION</span></span></a> <a data-custom-class="link" href="#modifications"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#modifications"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">13. MODIFICATIONS AND INTERRUPTIONS</span></span></a> <a data-custom-class="link" href="#law"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#law"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">14. GOVERNING LAW</span></span></a> <a data-custom-class="link" href="#disputes"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#disputes"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">15. DISPUTE RESOLUTION</span></span></a> <a data-custom-class="link" href="#corrections"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#corrections"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">16. CORRECTIONS</span></span></a> <a data-custom-class="link" href="#disclaimer"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#disclaimer"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">17. DISCLAIMER</span></span></a> <a data-custom-class="link" href="#liability"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#liability"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">18. LIMITATIONS OF LIABILITY</span></span></a> <a data-custom-class="link" href="#indemnification"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#indemnification"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">19. INDEMNIFICATION</span></span></a> <a data-custom-class="link" href="#userdata"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#userdata"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">20. USER DATA</span></span></a> <a data-custom-class="link" href="#electronic"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#electronic"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">21. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</span></span></a> <a data-custom-class="link" href="#california"></a></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#california"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>22. CALIFORNIA USERS AND RESIDENTS<bdt class="statement-end-if-in-editor"></bdt></span></span></a> <a data-custom-class="link" href="#misc"></a></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#misc"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">23. MISCELLANEOUS</span></span></a> <a data-custom-class="link" href="#contact"></a></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"></span></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><a data-custom-class="link" href="#contact"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">24. CONTACT US</span></span></a></div></div><div align="center" style="text-align: left;"><div class="MsoNormal" data-custom-class="heading_1" style="line-height: 1.5;"><a name="_b6y29mp52qvx"></a></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="services" style="line-height: 1.5;"><strong><span style="font-size: 19px; line-height: 1.5;"><h2>1. OUR SERVICES</h2></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.<bdt class="block-component"></bdt></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">The Services are not tailored to comply with industry-specific regulations (Health Insurance Portability and Accountability Act (HIPAA), Federal Information Security Management Act (FISMA), etc.), so if your interactions would be subjected to such laws, you may not use the Services. You may not use the Services in a way that would violate the Gramm-Leach-Bliley Act (GLBA).<bdt class="block-component"></bdt><bdt class="statement-end-if-in-editor"></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><br></div></div><div align="center" data-custom-class="heading_1" style="text-align: left; line-height: 1.5;"><strong><span id="ip" style="font-size: 19px; line-height: 1.5;"><h2>2. INTELLECTUAL PROPERTY RIGHTS</h2></span></strong></div><div align="center" style="text-align: left;"><div class="MsoNormal" data-custom-class="heading_2" style="line-height: 1.5;"><strong><h3>Our intellectual property</h3></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the <bdt class="block-component"></bdt>"Content"<bdt class="statement-end-if-in-editor"></bdt>), as well as the trademarks, service marks, and logos contained therein (the <bdt class="block-component"></bdt>"Marks"<bdt class="statement-end-if-in-editor"></bdt>).</span></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties<bdt class="block-component"></bdt> in the United States and<bdt class="statement-end-if-in-editor"></bdt> around the world.</span></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">The Content and Marks are provided in or through the Services <bdt class="block-component"></bdt>"AS IS"<bdt class="statement-end-if-in-editor"></bdt> for your <bdt class="block-component"></bdt>personal, non-commercial use or internal business purpose<bdt class="statement-end-if-in-editor"></bdt> only.</span></div><div class="MsoNormal" data-custom-class="heading_2" style="line-height: 1.5;"><strong><h3>Your use of our Services</h3></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Subject to your compliance with these Legal Terms, including the <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span><a data-custom-class="link" href="#prohibited"><span style="color: rgb(0, 58, 250); font-size: 15px;">PROHIBITED ACTIVITIES</span></a><span style="font-size: 15px;"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt> section below, we grant you a non-exclusive, non-transferable, revocable <bdt class="block-component"></bdt>license<bdt class="statement-end-if-in-editor"></bdt> to:</span></div><ul><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">access the Services; and</span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">download or print a copy of any portion of the Content to which you have properly gained access,</span></li></ul><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">solely for your <bdt class="block-component"></bdt>personal, non-commercial use or internal business purpose<bdt class="statement-end-if-in-editor"></bdt>.</span></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced,
aggregated, republished, uploaded, posted, publicly displayed, encoded,
translated, transmitted, distributed, sold, licensed, or otherwise exploited
for any commercial purpose whatsoever, without our express prior written
permission.</span></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: <bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:jacksonjallen26@gmail.com">jacksonjallen26@gmail.com</a></bdt>. If we ever grant you the permission to post, reproduce, or publicly display any part of our Services or Content, you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, reproducing, or displaying our Content.</span></div></div><div align="center" style="line-height: 1.5;"><br></div><div align="center" style="text-align: left;"><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.</span></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.</span></div><div class="MsoNormal" data-custom-class="heading_2" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:1.5;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;"><strong><h3>Your submissions<bdt class="block-component"></strong></bdt></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Please review this section and the <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt><a data-custom-class="link" href="#prohibited"><span style="color: rgb(0, 58, 250);">PROHIBITED ACTIVITIES</span></a><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt> section carefully prior to using our Services to understand the (a) rights you give us and (b) obligations you have when you post or upload any content through the Services.</span></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Submissions:</strong> By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services (<bdt class="block-component"></bdt>"Submissions"<bdt class="statement-end-if-in-editor"></bdt>), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.<bdt class="block-component"></bdt></span></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>You are responsible for what you post or upload:</strong> By sending us Submissions<bdt class="block-component"></bdt> through any part of the Services<bdt class="block-component"></bdt> you:</span></div><ul><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">confirm that you have read and agree with our <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span><a data-custom-class="link" href="#prohibited"><span style="color: rgb(0, 58, 250); font-size: 15px;">PROHIBITED ACTIVITIES</span></a><span style="font-size: 15px;"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt> and will not post, send, publish, upload, or transmit through the Services any Submission<bdt class="block-component"></bdt> that is illegal, harassing, hateful, harmful, defamatory, obscene, bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, false, inaccurate, deceitful, or misleading;</span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">to the extent permissible by applicable law, waive any and all moral rights to any such Submission<bdt class="block-component"></bdt>;</span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">warrant that any such Submission<bdt class="block-component"></bdt> are original to you or that you have the necessary rights and <bdt class="block-component"></bdt>licenses<bdt class="statement-end-if-in-editor"></bdt> to submit such Submissions<bdt class="block-component"></bdt> and that you have full authority to grant us the above-mentioned rights in relation to your Submissions<bdt class="block-component"></bdt>; and</span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">warrant and represent that your Submissions<bdt class="block-component"></bdt> do not constitute confidential information.</span></li></ul><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;">You are solely responsible for your Submissions<bdt class="block-component"></bdt> and you expressly agree to reimburse us for any and all losses that we may suffer because of your breach of (a) this section, (b) any third party’s intellectual property rights, or (c) applicable law.<bdt class="block-component"></bdt><bdt class="block-component"></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><br></div></div><div align="center" style="text-align: left;"><div class="MsoNormal" data-custom-class="heading_1" id="userreps" style="line-height: 1.5;"><a name="_5hg7kgyv9l8z"></a><strong><span style="line-height: 1.5; font-family: Arial; font-size: 19px;"><h2>3. USER REPRESENTATIONS</h2></span></strong></div></div><div align="center" style="text-align: left;"><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">By using the Services, you represent and warrant that:</span><bdt class="block-container if" data-type="if" id="d2d82ca8-275f-3f86-8149-8a5ef8054af6"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="user_account_option" data-type="statement"></bdt> <bdt data-type="body"><span style="color: rgb(89, 89, 89); font-size: 11pt;">(</span><span style="color: rgb(89, 89, 89); font-size: 14.6667px;">1</span><span style="color: rgb(89, 89, 89); font-size: 11pt;">) all registration information you submit
will be true, accurate, current, and complete; (</span><span style="color: rgb(89, 89, 89); font-size: 14.6667px;">2</span><span style="color: rgb(89, 89, 89); font-size: 11pt;">) you will maintain the accuracy of such information and promptly update such registration information as necessary;</span></bdt></bdt><bdt class="statement-end-if-in-editor" data-type="close"></bdt> </bdt><span style="color: rgb(89, 89, 89); font-size: 11pt;">(</span><span style="color: rgb(89, 89, 89); font-size: 14.6667px;">3</span><span style="color: rgb(89, 89, 89); font-size: 11pt;">) you have the legal capacity and you agree to comply with these Legal Terms;</span><bdt class="block-container if" data-type="if" id="8d4c883b-bc2c-f0b4-da3e-6d0ee51aca13"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="user_u13_option" data-type="statement"></bdt> </bdt><span style="color: rgb(89, 89, 89); font-size: 11pt;">(</span><span style="color: rgb(89, 89, 89); font-size: 14.6667px;">4</span><span style="color: rgb(89, 89, 89); font-size: 11pt;">) you are not a
minor in the jurisdiction in which you reside<bdt class="block-container if" data-type="if" id="76948fab-ec9e-266a-bb91-948929c050c9"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="user_o18_option" data-type="statement"></bdt></bdt>; (</span><span style="color: rgb(89, 89, 89); font-size: 14.6667px;">5</span><span style="color: rgb(89, 89, 89); font-size: 11pt;">) you will not access the Services through automated or non-human means, whether through a bot, script or
otherwise; (</span><span style="color: rgb(89, 89, 89); font-size: 14.6667px;">6</span><span style="color: rgb(89, 89, 89); font-size: 11pt;">) you will not use the Services for any illegal or <bdt class="block-component"></bdt>unauthorized<bdt class="statement-end-if-in-editor"></bdt> purpose; and (</span><span style="color: rgb(89, 89, 89); font-size: 14.6667px;">7</span><span style="color: rgb(89, 89, 89); font-size: 11pt;">) your use of the Services will not violate any applicable law or regulation.</span><span style="color: rgb(89, 89, 89); font-size: 14.6667px;"></span></div></div><div align="center" style="line-height: 1.5;"><br></div><div align="center" style="text-align: left;"><div class="MsoNormal" style="text-align: justify; line-height: 115%;"><div class="MsoNormal" style="line-height: 17.25px;"><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).</span></div><div class="MsoNormal" style="line-height: 1.1; text-align: left;"><bdt class="block-component"></bdt></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div></div><div class="MsoNormal" style="line-height: 1;"><bdt data-type="conditional-block"><bdt data-type="body"><div class="MsoNormal" data-custom-class="heading_1" id="userreg" style="line-height: 1.5; text-align: left;"><strong><span style="line-height: 1.5; font-size: 19px;"><h2>4. USER REGISTRATION</h2></span></strong></div></bdt></bdt></div><div class="MsoNormal" style="line-height: 1;"><bdt data-type="conditional-block"><bdt data-type="body"><div class="MsoNormal" data-custom-class="body_text" style="text-align: left; line-height: 1.5;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.<bdt class="statement-end-if-in-editor" data-type="close"></bdt></span></div></bdt></bdt> <bdt class="block-component"><span style="font-size: 15px;"></bdt></span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div></div></div><div align="center" style="text-align: left;"><div class="MsoNormal" data-custom-class="heading_1" id="purchases" style="line-height: 1.5;"><a name="_ynub0jdx8pob"></a><strong><span style="line-height: 1.5; font-family: Arial; font-size: 19px;"><h2>5. PURCHASES AND PAYMENT</h2></span></strong></div></div><div align="center" style="text-align: left;"><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">We accept the following forms of payment:</span></div><div class="MsoNormal" style="text-align:justify;line-height:115%;"><div class="MsoNormal" style="text-align: left; line-height: 1;"><br></div></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; margin-left: 20px;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;"><bdt class="forloop-component"></bdt>-  <bdt class="question noTranslate">Visa</bdt></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; margin-left: 20px;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;"><bdt class="forloop-component"></bdt>-  <bdt class="question noTranslate">Mastercard</bdt></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; margin-left: 20px;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;"><bdt class="forloop-component"></bdt>-  <bdt class="question noTranslate">American Express</bdt></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; margin-left: 20px;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;"><bdt class="forloop-component"></bdt></span></div><div class="MsoNormal" style="line-height: 1;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;"><br></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed. Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be </span><span style="font-size: 15px; line-height: 115%; font-family: Arial; color: rgb(89, 89, 89);">in <bdt class="question">US dollars</bdt>.</span></div></div><div align="center" style="line-height: 1.5;"><br></div><div align="center" style="text-align: left;"><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, and you <bdt class="block-component"></bdt>authorize<bdt class="statement-end-if-in-editor"></bdt> us to charge your chosen payment provider for any such amounts upon placing your order. We reserve the right to correct any errors or mistakes in pricing, even if we have already requested or received payment.</span></div></div><div align="center" style="line-height: 1.5;"><br></div><div align="center" style="text-align: left; line-height: 1.5;"><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">We reserve the right to refuse any order placed through the Services. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing or shipping address. We reserve the right to limit or prohibit orders that, in our sole <bdt class="block-component"></bdt>judgment<bdt class="statement-end-if-in-editor"></bdt>, appear to be placed by dealers, resellers, or distributors.</span><span style="line-height: 115%; font-family: Arial; color: rgb(89, 89, 89);"><bdt data-type="conditional-block" style="color: rgb(10, 54, 90); text-align: left;"><bdt class="block-component" data-record-question-key="return_option" data-type="statement" style="font-size: 15px;"></bdt></bdt></span></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="subscriptions" style="line-height: 1.5;"><strong><span style="font-size: 19px; line-height: 1.5;"><h2>6. SUBSCRIPTIONS</h2></span></strong></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"></bdt></div><div class="MsoNormal" data-custom-class="heading_2" style="line-height: 1.5;"><strong><span style="font-size: 15px; line-height: 1.5;"><h3>Billing and Renewal</h3></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt>Your subscription will continue and automatically renew unless <bdt class="block-component"></bdt>canceled<bdt class="statement-end-if-in-editor"></bdt>. You consent to our charging your payment method on a recurring basis without requiring your prior approval for each recurring charge, until such time as you cancel the applicable order.<bdt class="block-component"></bdt> The length of your billing cycle <bdt class="block-component"></bdt>is monthly<bdt class="block-component"></bdt>.<bdt class="statement-end-if-in-editor"></bdt><bdt class="else-block"></bdt></span></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div class="MsoNormal" data-custom-class="heading_2" style="line-height: 1.5;"><span style="font-size: 15px; line-height: 1.5;"><strong><h3>Cancellation</h3></strong></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px;">All purchases are non-refundable. <bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt>You can cancel your subscription at any time by logging into your account.<bdt class="block-component"></bdt> Your cancellation will take effect at the end of the current paid term. If you have any questions or are unsatisfied with our Services, please email us at <bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:jacksonjallen26@gmail.com">jacksonjallen26@gmail.com</a></bdt>.<bdt class="statement-end-if-in-editor"></bdt><br></span></div><div class="MsoNormal" data-custom-class="heading_2" style="line-height: 1.5;"><strong><span style="font-size: 15px; line-height: 1.5;"><h3>Fee Changes</h3></span></strong></div><span style="font-size: 15px;"><span data-custom-class="body_text">We may, from time to time, make changes to the subscription fee and will communicate any price changes to you in accordance with applicable law.</span></span><div class="MsoNormal" style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"></bdt></span><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-component"></bdt></div><div class="MsoNormal" style="text-align: justify; line-height: 1.5;"><span style="line-height: 115%; font-family: Arial; color: rgb(89, 89, 89);"><bdt data-type="conditional-block" style="color: rgb(10, 54, 90); text-align: left;"><bdt data-type="body"><div class="MsoNormal" style="font-size: 15px; line-height: 1.5;"><br></div></bdt></bdt></span><div class="MsoNormal" data-custom-class="heading_1" id="prohibited" style="text-align: left; line-height: 1.5;"><strong><span style="line-height: 1.5; font-size: 19px;"><h2>7. PROHIBITED ACTIVITIES</h2></span></strong></div></div><div class="MsoNormal" style="text-align: justify; line-height: 1;"><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial <bdt class="block-component"></bdt>endeavors<bdt class="statement-end-if-in-editor"></bdt> except those that are specifically endorsed or approved by us.</span></div></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" style="text-align: justify; line-height: 1;"><div class="MsoNormal" style="line-height: 17.25px;"><div class="MsoNormal" style="line-height: 1.1;"><div class="MsoNormal" style="line-height: 17.25px;"><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">As a user of the Services, you agree not to:</span></div></div><ul><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-size: 15px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Use any information obtained from the Services in order to harass, abuse, or harm another person.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Make improper use of our support services or submit false reports of abuse or misconduct.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Use the Services in a manner inconsistent with any applicable laws or regulations.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Engage in <bdt class="block-component"></bdt>unauthorized<bdt class="statement-end-if-in-editor"></bdt> framing of or linking to the Services.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party’s uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Delete the copyright or other proprietary rights notice from any Content.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Attempt to impersonate another user or person or use the username of another user.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats (<bdt class="block-component"></bdt>"gifs"<bdt class="statement-end-if-in-editor"></bdt>), 1×1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as <bdt class="block-component"></bdt>"spyware" or "passive collection mechanisms" or "pcms"<bdt class="statement-end-if-in-editor"></bdt>).</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any <bdt class="block-component"></bdt>unauthorized<bdt class="statement-end-if-in-editor"></bdt> script or other software.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Use a buying agent or purchasing agent to make purchases on the Services.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Make any <bdt class="block-component"></bdt>unauthorized<bdt class="statement-end-if-in-editor"></bdt> use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false <bdt class="block-component"></bdt>pretenses<bdt class="statement-end-if-in-editor"></bdt>.</span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><span style="line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);">Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating <bdt class="block-component"></bdt>endeavor<bdt class="statement-end-if-in-editor"></bdt> or commercial enterprise.</span><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);font-family: sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: justify; text-indent: -29.4px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; color: rgb(89, 89, 89);"><bdt class="forloop-component"></bdt></span></span></span></span></span></li><li class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><bdt class="question">Sell or otherwise transfer your profile.</bdt><bdt class="forloop-component"></bdt></span></li></ul><div class="MsoNormal"><br></div><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt data-type="conditional-block"><bdt data-type="body"><div class="MsoNormal" data-custom-class="heading_1" id="ugc" style="line-height: 1.5;"><strong><span style="line-height: 1.5; font-size: 19px;"><h2>8. USER GENERATED CONTRIBUTIONS</h2></span></strong></div></bdt></bdt></bdt> <bdt class="block-container if" data-type="if" style="text-align: left;"><bdt data-type="conditional-block"><bdt data-type="body"><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><bdt class="block-container if" data-type="if" id="24327c5d-a34f-f7e7-88f1-65a2f788484f" style="text-align: left;"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="user_post_content_option" data-type="statement"></bdt><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">The Services does not offer users to submit or post content.<bdt class="block-component"></bdt> We may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, <bdt class="block-component"></bdt>"Contributions"<bdt class="statement-end-if-in-editor"></bdt>). Contributions may be viewable by other users of the Services and through third-party websites.<bdt class="block-component"></bdt> As such, any Contributions you transmit may be treated in accordance with the Services' Privacy Policy.<bdt class="statement-end-if-in-editor"></bdt> When you create or make available any Contributions, you thereby represent and warrant that:<span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></bdt></span></span></span></div></bdt></bdt></bdt></div></div><div class="MsoNormal" style="line-height: 17.25px;"><ul style="font-size: medium;text-align: left;"><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.</span></span></span></li><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">You are the creator and owner of or have the necessary <bdt class="block-component"></bdt>licenses<bdt class="statement-end-if-in-editor"></bdt>, rights, consents, releases, and permissions to use and to <bdt class="block-component"></bdt>authorize<bdt class="statement-end-if-in-editor"></bdt> us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.</span></span></span></li><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Services and these Legal Terms.</span></span></span></li><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">Your Contributions are not false, inaccurate, or misleading.</span></span></span></li><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">Your Contributions are not unsolicited or <bdt class="block-component"></bdt>unauthorized<bdt class="statement-end-if-in-editor"></bdt> advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.</span></span></span></li><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, <bdt class="block-component"></bdt>libelous<bdt class="statement-end-if-in-editor"></bdt>, slanderous, or otherwise objectionable (as determined by us).</span></span></span></li><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.</span></span></span></li><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.</span></span></span></li><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">Your Contributions do not violate any applicable law, regulation, or rule.</span></span></span></li><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">Your Contributions do not violate the privacy or publicity rights of any third party.</span></span></span></li><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.</span></span></span></li><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.</span></span></span></li><li data-custom-class="body_text" style="line-height: 1.5;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 14px;"><span data-custom-class="body_text">Your Contributions do not otherwise violate, or link to material that violates, any provision of these Legal Terms, or any applicable law or regulation.</span></span></span></li></ul><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt data-type="conditional-block"><bdt data-type="body"><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">Any use of the Services in violation of the foregoing violates these Legal Terms and may result in, among other things, termination or suspension of your rights to use the Services.</span></div></bdt></bdt></bdt></div></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" style="text-align: justify; line-height: 1;"><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt data-type="conditional-block"><bdt data-type="body"><div class="MsoNormal" data-custom-class="heading_1" id="license" style="line-height: 1.5;"><strong><span style="line-height: 1.5; font-size: 19px;"><h2>9. CONTRIBUTION <bdt class="block-component"></bdt>LICENSE<bdt class="statement-end-if-in-editor"></bdt></h2></span></strong></div></bdt></bdt></bdt></div><div class="MsoNormal" style="line-height: 1;"><bdt class="block-container if" data-type="if" id="a088ddfb-d8c1-9e58-6f21-958c3f4f0709" style="text-align: left;"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="user_post_content_option" data-type="statement"></bdt></span></bdt></bdt></bdt></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">You and Services agree that we may access, store, process, and use any information and personal data that you provide<bdt class="block-component"></bdt> following the terms of the Privacy Policy<bdt class="statement-end-if-in-editor"></bdt> and your choices (including settings).</span></span></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">By submitting suggestions or other feedback regarding the Services, you agree that we can use and share such feedback for any purpose without compensation to you.<bdt class="block-component"></bdt></span></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions. We are not liable for any statements or representations in your Contributions provided by you in any area on the Services. You are solely responsible for your Contributions to the Services and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.<bdt class="statement-end-if-in-editor"></bdt></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt class="statement-end-if-in-editor" data-type="close"></bdt></bdt></span></span></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5;"><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="review_option" data-type="statement"></bdt></bdt></span></span></span></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="mobile_app_option" data-type="statement"></bdt></bdt></span></span></span></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="socialnetwork_link_option" data-type="statement"></span></div></bdt></bdt></bdt> <bdt class="block-container if" data-type="if" style="text-align: left;"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="3rd_party_option" data-type="statement"></bdt></bdt></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="advertiser_option" data-type="statement"></bdt></bdt></div><div class="MsoNormal" data-custom-class="heading_1" id="sitemanage" style="line-height: 1.5;"><strong><span style="line-height: 1.5; font-size: 19px;"><h2>10. SERVICES MANAGEMENT</h2></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;">We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.</div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="privacy_policy_option" data-type="statement"></bdt></bdt></bdt></div><div class="MsoNormal" data-custom-class="heading_1" id="ppyes" style="line-height: 1.5;"><strong><h2>11. PRIVACY POLICY</h2></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">We care about data privacy and security. Please review our Privacy Policy:<strong> <span style="color: rgb(0, 58, 250);"><bdt class="block-container question question-in-editor" data-id="d10c7fd7-0685-12ac-c717-cbc45ff916d1" data-type="question noTranslate"><a target="_blank" data-custom-class="link" href="https://app.askra.app/privacy">https://app.askra.app/privacy</a></bdt></span></strong>. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms. Please be advised the Services are hosted in <bdt class="block-component"></bdt>the <bdt class="question noTranslate">United States</bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt>. If you access the Services from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in <span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><bdt class="block-component"></bdt>the <bdt class="question noTranslate">United States</bdt><bdt class="block-component"></bdt></span><bdt class="block-component"></bdt>, then through your continued use of the Services, you are transferring your data to <span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><bdt class="block-component"></bdt>the <bdt class="question noTranslate">United States</bdt><bdt class="block-component"></bdt></span><bdt class="block-component"></bdt>, and you expressly consent to have your data transferred to and processed in <span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><bdt class="block-component"></bdt>the <bdt class="question noTranslate">United States</bdt><bdt class="block-component"></bdt></span><bdt class="block-component"></bdt>.<bdt class="block-component"></bdt><bdt class="block-container if" data-type="if" id="547bb7bb-ecf2-84b9-1cbb-a861dc3e14e7"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="user_u13_option" data-type="statement"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></bdt></bdt></span></div><div class="MsoNormal" style="line-height: 1.5;"><br></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt class="statement-end-if-in-editor" data-type="close"></bdt></bdt><bdt class="block-container if" data-type="if"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="privacy_policy_followup" data-type="statement" style="font-size: 14.6667px;"></bdt></span></bdt></bdt></span></bdt></bdt></bdt></span></bdt></bdt></span></bdt></span></bdt></bdt></span></bdt></bdt></bdt></span></bdt></bdt></span></div><div class="MsoNormal" style="line-height: 1.5;"><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="copyright_agent_option" data-type="statement"><bdt class="block-component"></bdt><bdt class="block-component"></bdt></bdt><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt class="statement-end-if-in-editor" data-type="close"></bdt></bdt></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><bdt class="block-component"></bdt><bdt class="block-container if" data-type="if" style="text-align: left;"><bdt class="statement-end-if-in-editor" data-type="close"><bdt class="block-component"></bdt></bdt><bdt class="block-component"></bdt></div><div class="MsoNormal" data-custom-class="heading_1" id="terms" style="line-height: 1.5; text-align: left;"><strong><span style="line-height: 1.5; font-size: 19px;"><h2>12. TERM AND TERMINATION</h2></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE <bdt class="block-container if" data-type="if" id="a6e121c2-36b4-5066-bf9f-a0a33512e768"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="user_account_option" data-type="statement"></bdt><bdt data-type="body">YOUR ACCOUNT AND </bdt></bdt><bdt class="statement-end-if-in-editor" data-type="close"></bdt></bdt>ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="modifications" style="line-height: 1.5; text-align: left;"><strong><span style="line-height: 1.5; font-size: 19px;"><h2>13. MODIFICATIONS AND INTERRUPTIONS</h2></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services.<bdt class="block-component"></bdt> We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services. Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="law" style="line-height: 1.5; text-align: left;"><strong><span style="line-height: 1.5; font-size: 19px;"><h2>14. GOVERNING LAW</h2></span></strong></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);">These Legal Terms and your use of the Services are governed by and construed in accordance with the laws of <bdt class="block-container if" data-type="if" id="b86653c1-52f0-c88c-a218-e300b912dd6b"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="governing_law" data-type="statement"></bdt><bdt data-type="body">the Commonwealth of <bdt class="question noTranslate">Kentucky</bdt><bdt class="block-component"></bdt></bdt> applicable to agreements made and to be entirely performed within<bdt class="block-container if" data-type="if" id="b86653c1-52f0-c88c-a218-e300b912dd6b" style="font-size: 14.6667px;"><bdt data-type="conditional-block"> <span style="font-size: 11pt; line-height: 16.8667px; color: rgb(89, 89, 89);"><bdt class="block-container if" data-type="if" id="b86653c1-52f0-c88c-a218-e300b912dd6b"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="governing_law" data-type="statement"></bdt><bdt data-type="body">the Commonwealth of <bdt class="question noTranslate">Kentucky</bdt><bdt class="block-component"></bdt></bdt><span style="font-size: 14.6667px;">, </span>without regard to its conflict of law principles.<bdt class="block-component"></bdt></span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="disputes" style="line-height: 1.5; text-align: left;"><strong><span style="line-height: 1.5; font-size: 19px;"><h2>15. DISPUTE RESOLUTION</h2></span></strong></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><bdt class="block-component"></bdt></bdt></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><bdt class="block-component"></bdt></div><div class="MsoNormal" data-custom-class="heading_2" style="line-height: 1.5; text-align: left;"><strong><h3>Informal Negotiations</h3></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;">To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a <bdt class="block-component"></bdt>"Dispute" and collectively, the "Disputes"<bdt class="statement-end-if-in-editor"></bdt>) brought by either you or us (individually, a <bdt class="block-component"></bdt>"Party" and collectively, the "Parties"<bdt class="statement-end-if-in-editor"></bdt>), the Parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least <bdt class="question">thirty (30)</bdt> days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><bdt class="statement-end-if-in-editor"></bdt></div><div class="MsoNormal" data-custom-class="heading_2" style="line-height: 1.5; text-align: left;"><strong><h3>Binding Arbitration</h3></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px;">If the Parties are unable to resolve a Dispute through informal negotiations, the Dispute (except those Disputes expressly excluded below) will be finally and exclusively resolved by binding arbitration. YOU UNDERSTAND THAT WITHOUT THIS PROVISION, YOU WOULD HAVE THE RIGHT TO SUE IN COURT AND HAVE A JURY TRIAL. <bdt class="block-component"></bdt>The arbitration shall be commenced and conducted under the Commercial Arbitration Rules of the American Arbitration Association (<bdt class="block-component"></bdt>"AAA"<bdt class="statement-end-if-in-editor"></bdt>) and, where appropriate, the AAA’s Supplementary Procedures for Consumer Related Disputes (<bdt class="block-component"></bdt>"AAA Consumer Rules"<bdt class="statement-end-if-in-editor"></bdt>), both of which are available at the <span style="font-size: 15px; line-height: 16.8667px; color: rgb(0, 58, 250);"><a data-custom-class="link" href="http://www.adr.org" rel="noopener noreferrer" target="_blank">American Arbitration Association (AAA) website</a></span>. Your arbitration fees and your share of arbitrator compensation shall be governed by the AAA Consumer Rules and, where appropriate, limited by the AAA Consumer Rules. <bdt class="else-block"></bdt>If such costs are determined by the arbitrator to be excessive, we will pay all arbitration fees and expenses. <bdt class="statement-end-if-in-editor"></bdt>The arbitration may be conducted in person, through the submission of documents, by phone, or online. The arbitrator will make a decision in writing, but need not provide a statement of reasons unless requested by either Party. The arbitrator must follow applicable law, and any award may be challenged if the arbitrator fails to do so. Except where otherwise required by the applicable <bdt class="block-component"></bdt>AAA<bdt class="else-block"></bdt> rules or applicable law, the arbitration will take place in <bdt class="block-component"></bdt><bdt class="question noTranslate">Jefferson Couny</bdt>, <bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt><bdt class="question noTranslate">Kentucky</bdt><bdt class="statement-end-if-in-editor"></bdt>. Except as otherwise provided herein, the Parties may litigate in court to compel arbitration, stay proceedings pending arbitration, or to confirm, modify, vacate, or enter <bdt class="block-component"></bdt>judgment<bdt class="statement-end-if-in-editor"></bdt> on the award entered by the arbitrator.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;">If for any reason, a Dispute proceeds in court rather than arbitration, the Dispute shall be commenced or prosecuted in the</span> <bdt class="block-component" style="font-size: 15px;"></bdt><span style="font-size: 15px;"> state and federal courts</span><bdt class="statement-end-if-in-editor" style="font-size: 15px;"></bdt><span style="font-size: 15px;"> located in</span><bdt class="block-component" style="font-size: 15px;"></bdt> <bdt class="question noTranslate">Jefferson County</bdt><span style="font-size: 15px;">,</span><bdt class="statement-end-if-in-editor" style="font-size: 15px;"></bdt><bdt class="block-component" style="font-size: 15px;"> </bdt><bdt class="question noTranslate" style="font-size: 15px;">Kentucky</bdt><bdt class="statement-end-if-in-editor" style="font-size: 15px;"></bdt><span style="font-size: 15px;">, and the Parties hereby consent to, and waive all <bdt class="block-component"></bdt>defenses<bdt class="statement-end-if-in-editor"></bdt> of lack of personal jurisdiction, and forum non conveniens with respect to venue and jurisdiction in such<bdt class="block-component"></bdt> state and federal courts<bdt class="statement-end-if-in-editor"></bdt>. Application of the United Nations Convention on Contracts for the International Sale of Goods and the Uniform Computer Information Transaction Act (UCITA) are excluded from these Legal Terms.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><bdt class="block-component"></bdt>If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.<bdt class="block-component"></bdt></bdt></div><div class="MsoNormal" data-custom-class="heading_2" style="line-height: 1.5; text-align: left;"><strong><h3>Restrictions</h3></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;">The Parties agree that any arbitration shall be limited to the Dispute between the Parties individually. To the full extent permitted by law, (a) no arbitration shall be joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated on a class-action basis or to <bdt class="block-component"></bdt>utilize<bdt class="statement-end-if-in-editor"></bdt> class action procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.</div><div class="MsoNormal" data-custom-class="heading_2" style="line-height: 1.5; text-align: left;"><bdt class="block-component"></bdt><strong><h3>Exceptions to Informal Negotiations and Arbitration</h3></strong> <bdt class="statement-end-if-in-editor"></bdt></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><bdt class="block-component"></bdt>The Parties agree that the following Disputes are not subject to the above provisions concerning informal negotiations binding arbitration: (a) any Disputes seeking to enforce or protect, or concerning the validity of, any of the intellectual property rights of a Party; (b) any Dispute related to, or arising from, allegations of theft, piracy, invasion of privacy, or <bdt class="block-component"></bdt>unauthorized<bdt class="statement-end-if-in-editor"></bdt> use; and (c) any claim for injunctive relief. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.<bdt class="statement-end-if-in-editor"></bdt></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><bdt class="statement-end-if-in-editor"><bdt class="statement-end-if-in-editor"></bdt></bdt></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="corrections" style="line-height: 1.5; text-align: left;"><strong><span style="font-size: 19px; line-height: 1.5;"><h2>16. CORRECTIONS</h2></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;">There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.</div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="disclaimer" style="line-height: 1.5; text-align: left;"><span style="font-size: 19px; line-height: 1.5; color: rgb(0, 0, 0);"><strong><h2>17. DISCLAIMER</h2></strong></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES, (3) ANY <bdt class="block-component"></bdt>UNAUTHORIZED<bdt class="statement-end-if-in-editor"></bdt> ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST <bdt class="block-component"></bdt>JUDGMENT<bdt class="statement-end-if-in-editor"></bdt> AND EXERCISE CAUTION WHERE APPROPRIATE.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="liability" style="line-height: 1.5; text-align: left;"><strong><span style="line-height: 1.5; font-family: Arial; font-size: 19px;"><h2>18. LIMITATIONS OF LIABILITY</h2></span></strong></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;"><span data-custom-class="body_text">IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</span> <bdt class="block-container if" data-type="if" id="3c3071ce-c603-4812-b8ca-ac40b91b9943"><span data-custom-class="body_text"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="limitations_liability_option" data-type="statement"></bdt><bdt data-type="body">NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO <bdt class="block-container if" data-type="if" id="73189d93-ed3a-d597-3efc-15956fa8e04e"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="limitations_liability_option" data-type="statement"></bdt><bdt data-type="body">THE
AMOUNT PAID, IF ANY, BY YOU TO US<bdt class="block-container if" data-type="if" id="19e172cb-4ccf-1904-7c06-4251800ba748"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="limilation_liability_time_option" data-type="statement"> </bdt><bdt data-type="body"><span style="font-size: 11pt; color: rgb(89, 89, 89); text-transform: uppercase;">DURING THE <bdt class="block-container question question-in-editor" data-id="5dd68d46-ed6f-61c7-cd66-6b3f424b6bdd" data-type="question">six (6)</bdt> mONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING</span></bdt></bdt><bdt class="statement-end-if-in-editor" data-type="close"></bdt></bdt></bdt></bdt><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="limitations_liability_option" data-type="statement">.</span></bdt> </bdt></span><span data-custom-class="body_text">CERTAIN US STATE LAWS AND INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.</span></bdt></bdt></span><bdt class="statement-end-if-in-editor" data-type="close"><span data-custom-class="body_text"></span></bdt></bdt></span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="indemnification" style="line-height: 1.5; text-align: left;"><strong><span style="line-height: 1.5; font-family: Arial; font-size: 19px;"><h2>19. INDEMNIFICATION</h2></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">You agree to
defend, indemnify, and hold us harmless, including our subsidiaries,
affiliates, and all of our respective officers, agents, partners, and
employees, from and against any loss, damage, liability, claim, or demand, including
reasonable attorneys’ fees and expenses, made by any third party due to or
arising out of: <bdt class="block-container if" data-type="if" id="475fffa5-05ca-def8-ac88-f426b238903c"><bdt data-type="conditional-block"><bdt class="block-component" data-record-question-key="user_post_content_option" data-type="statement"></bdt></bdt>(<span style="font-size: 14.6667px;">1</span>) use of the Services; (<span style="font-size: 14.6667px;">2</span>) breach of these Legal Terms; (<span style="font-size: 14.6667px;">3</span>) any breach of your representations and warranties set forth in these Legal Terms; (<span style="font-size: 14.6667px;">4</span>) your violation of the rights of a third party, including but not limited to intellectual property rights; or (<span style="font-size: 14.6667px;">5</span>) any overt harmful act toward any other user of the Services with whom you connected via the Services. Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive <bdt class="block-component"></bdt>defense<bdt class="statement-end-if-in-editor"></bdt> and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our <bdt class="block-component"></bdt>defense<bdt class="statement-end-if-in-editor"></bdt> of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="userdata" style="line-height: 1.5; text-align: left;"><strong><span style="line-height: 1.5; font-family: Arial; font-size: 19px;"><h2>20. USER DATA</h2></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">We will maintain
certain data that you transmit to the Services for the purpose of managing the
performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups
of data, you are solely responsible for all data that you transmit or that
relates to any activity you have undertaken using the Services. You agree
that we shall have no liability to you for any loss or corruption of any such
data, and you hereby waive any right of action against us arising from any such
loss or corruption of such data.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="electronic" style="line-height: 1.5; text-align: left;"><strong><span style="line-height: 1.5; font-family: Arial; font-size: 19px;"><h2>21. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span><bdt class="block-component"></bdt></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="california" style="line-height: 1.5; text-align: left;"><strong><span style="line-height: 1.5; font-family: Arial; font-size: 19px;"><h2>22. CALIFORNIA USERS AND RESIDENTS</h2></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">If any complaint
with us is not satisfactorily resolved, you can contact the Complaint
Assistance Unit of the Division of Consumer Services of the California
Department of Consumer Affairs in writing at 1625 North Market Blvd., Suite N
112, Sacramento, California 95834 or by telephone at (800) 952-5210 or (916)
445-1254.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><bdt class="statement-end-if-in-editor"></bdt></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="misc" style="line-height: 1.5; text-align: left;"><strong><span style="line-height: 1.5; font-family: Arial; font-size: 19px;"><h2>23. MISCELLANEOUS</h2></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Legal Terms or use of the Services. You agree that these Legal Terms will not be construed against us by virtue of having drafted them. You hereby waive any and all <bdt class="block-component"></bdt>defenses<bdt class="statement-end-if-in-editor"></bdt> you may have based on the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute these Legal Terms.</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="heading_1" id="contact" style="line-height: 1.5; text-align: left;"><strong><span style="line-height: 115%; font-family: Arial;"><span style="font-size: 19px; line-height: 1.5;"><h2>24. CONTACT US</h2></span></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;">In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:</span></div><div class="MsoNormal" style="line-height: 1.5; text-align: left;"><br></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="question noTranslate"><strong>Askra</strong></bdt><strong><bdt class="block-component"></bdt></strong></span></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><span style="line-height: 115%; font-family: Arial; color: rgb(89, 89, 89);"><bdt class="question"><strong><bdt class="question noTranslate">4201 Hill Top Rd</bdt></strong></bdt><span style="line-height: 115%; font-family: Arial; color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span><bdt class="block-component"></bdt></span></span></span></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><strong><span style="color: rgb(89, 89, 89);"><bdt class="question"><bdt class="block-component"></bdt><bdt class="question noTranslate">Louisville</bdt><bdt class="statement-end-if-in-editor"></bdt></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt>, <bdt class="question noTranslate">KY</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt> <bdt class="question noTranslate">40207</bdt><bdt class="statement-end-if-in-editor"></bdt></span></strong><strong><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span><bdt class="block-component"></bdt><bdt class="block-component"></bdt></strong></span></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><span style="font-size: 15px;"><bdt class="question noTranslate"><strong>United States</strong></bdt><strong><bdt class="statement-end-if-in-editor"><span style="color: rgb(89, 89, 89);"><strong><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"><span style="color: rgb(89, 89, 89);"><strong><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></strong><bdt class="statement-end-if-in-editor"><strong></strong></bdt></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><strong><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;"><strong><bdt class="block-component"></bdt>Phone: <bdt class="question">(+1)5029317187</bdt><bdt class="statement-end-if-in-editor"></bdt></strong></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><strong><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;"><strong><bdt class="block-component"></bdt></strong></span></strong></span></strong></div><div class="MsoNormal" data-custom-class="body_text" style="line-height: 1.5; text-align: left;"><strong><span style="font-size:11.0pt;line-height:115%;font-family:Arial;
Calibri;color:#595959;mso-themecolor:text1;mso-themetint:166;"><strong><bdt class="question"><bdt class="block-component"></bdt><bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:jacksonjallen26@gmail.com">jacksonjallen26@gmail.com</a></bdt><bdt class="statement-end-if-in-editor"></bdt></bdt></strong></span></strong></div></div><div style="display: none;"><a class="terms123" href="https://app.termly.io/dsar/3589ca5d-4704-425b-a8e7-e038a3980014"></a></div></div><style>
      ul {
        list-style-type: square;
      }
      ul > li > ul {
        list-style-type: circle;
      }
      ul > li > ul > li > ul {
        list-style-type: square;
      }
      ol li {
        font-family: Arial ;
      }
    </style>
      </div>
      ` }}
    />
  )
}

// =============================
// App Router
// =============================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/paid-success" element={<PaidSuccessPage />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;