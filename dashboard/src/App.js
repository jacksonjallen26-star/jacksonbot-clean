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

    localStorage.setItem("token", data.token);
    localStorage.setItem("companyId", data.companyId);
    localStorage.setItem("role", data.role);

    // Free plan goes straight to onboarding
    if (selectedPlan === "free") {
      navigate("/onboarding");
      return;
    }

    // Paid plans go to Stripe checkout
    console.log("Plan is:", selectedPlan);
    console.log("Token is:", data.token);
    const checkoutRes = await fetch(`${BACKEND_URL}/api/create-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${data.token}`
      },
      body: JSON.stringify({ plan: selectedPlan })
    });

    const checkoutData = await checkoutRes.json();

    if (checkoutData.success) {
      window.location.href = checkoutData.url;
    } else {
      setError("Failed to create checkout session");
      setLoading(false);
    }

  } catch (err) {
    setError("Something went wrong");
    setLoading(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleRegister();
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
            Get started free
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
          <div style={{ fontSize: 13, color: "#555577" }}>Create your Askra account</div>
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
      <li style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#4ade80" }}>✓</span> Email support</li>
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

        <button
          className="btn btn-primary"
          onClick={handleRegister}
          disabled={loading}
          style={{ width: "100%", marginTop: 20, justifyContent: "center", padding: "10px" }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "#555577" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#a78bfa", textDecoration: "none" }}>Sign in</a>
        </div>
      </div>
    </div>
  );
}


// =============================
// Onboarding Page
// =============================
function OnboardingPage() {
  const companyId = localStorage.getItem("companyId");
  const navigate = useNavigate();

  const embedCode = `<script>
  window.AskraConfig = { companyId: "${companyId}" };
</script>
<script src="https://jacksonbot-clean.vercel.app/widget.js"></script>`;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{
        background: "#0f0f17",
        border: "1px solid #1e1e2e",
        borderRadius: 12,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 560
      }}>
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
      </div>
    </div>
  );
}

function LockedField({ children, plan }) {
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
        onClick={() => window.location.href = "/dashboard?upgrade=true"}
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
          bubbleColor,
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

    <div className="stats-row">
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
          <div className="stat-value">{monthlyMessages}<span style={{ fontSize: 13, color: "#555577" }}>/{limit}</span></div>
          <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: "#1e1e2e" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              width: `${usedPercent}%`,
              background: usedPercent >= 90 ? "#f87171" : usedPercent >= 70 ? "#fbbf24" : "#4ade80",
              transition: "width 0.3s"
            }} />
          </div>
          <div className="stat-sub" style={{ marginTop: 4 }}>{remaining} remaining</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Status</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <span className="badge badge-active">Active</span>
            <span className={`badge badge-${plan}`} style={
              plan === "pro" ? { background: "#0c2a3a", color: "#38bdf8", border: "1px solid #0369a144" } :
              plan === "starter" ? {} :
              { background: "#1a1a28", color: "#888899", border: "1px solid #33334444" }
            }>
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </span>
          </div>
          <div className="stat-sub" style={{ marginTop: 8, fontFamily: "monospace", fontSize: 10 }}>{companyId}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-dot" style={{ background: "#10b981" }}></div>Recent Activity</div>
        </div>
        {Object.keys(conversations).length === 0 ? (
          <div className="empty-state">No conversations yet</div>
        ) : (
          Object.keys(conversations).slice(0, 5).map(userId => {
            const msgs = conversations[userId];
            const last = msgs[msgs.length - 1];
            return (
              <div key={userId} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #1e1e2e",
                cursor: "pointer"
              }} onClick={() => { setActivePage("conversations"); setSelectedUser(userId); }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "#1e1a3a", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#a78bfa", fontFamily: "monospace"
                  }}>{userId.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 12, color: "#c4c4d4" }}>{userId.slice(0, 12)}...</div>
                    <div style={{ fontSize: 11, color: "#444466" }}>{last?.message?.slice(0, 40)}...</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#333355", fontFamily: "monospace" }}>
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
      <LockedField plan={plan}>
        <div className="form-group full">
          <label>Bubble Logo URL</label>
          <input type="url" value={bubbleLogoUrl} onChange={(e) => setBubbleLogoUrl(e.target.value)} placeholder="https://..." />
        </div>
      </LockedField>
    </div>

    {/* System Prompt — always unlocked */}
    <div className="card">
      <div className="card-header">
        <div className="card-title"><div className="card-dot"></div>Behavior</div>
      </div>
      <div className="form-group full">
        <label>System Prompt</label>
        <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={5} />
      </div>
    </div>

    {/* Colors — all locked for free */}
    <div className="card">
      <div className="card-header">
        <div className="card-title"><div className="card-dot"></div>Appearance</div>
      </div>
      <div className="form-row">
        {[
          { label: "Primary Color", value: primaryColor, set: setPrimaryColor },
          { label: "Secondary Color", value: secondaryColor, set: setSecondaryColor },
          { label: "Accent Color", value: accentColor, set: setAccentColor },
          { label: "Text Color", value: textColor, set: setTextColor },
          { label: "Bot Bubble Color", value: botBubbleColor, set: setBotBubbleColor },
          { label: "Bubble Color", value: bubbleColor, set: setBubbleColor },
        ].map(({ label, value, set }) => (
          <LockedField key={label} plan={plan}>
            <div className="form-group">
              <label>{label}</label>
              <input type="color" value={value} onChange={(e) => set(e.target.value)} />
            </div>
          </LockedField>
        ))}
      </div>
    </div>

    {/* Embed Code */}
<div className="card">
  <div className="card-header">
    <div className="card-title"><div className="card-dot" style={{ background: "#a78bfa" }}></div>Embed Code</div>
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
  <button
    className="btn btn-ghost"
    onClick={() => {
      navigator.clipboard.writeText(`<script>\n  window.AskraConfig = { companyId: "${companyId}" };\n</script>\n<script src="https://jacksonbot-clean.vercel.app/widget.js"></script>`);
    }}
    style={{ fontSize: 12 }}
  >
    Copy Embed Code
  </button>
</div>

    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <button className="btn btn-primary" onClick={saveSettings}>Save Settings</button>
      {status && <span style={{ fontSize: 13, color: status.includes("✅") ? "#4ade80" : "#f87171" }}>{status}</span>}
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
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setActivePage("upgrade")}>Upgrade Now</button>
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
  // Upgrade Page
  // =============================
  const renderUpgrade = () => (
    <>
      <div className="page-header">
        <div className="page-title">Upgrade Plan</div>
        <div className="page-subtitle">Unlock more features and higher limits</div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, marginBottom: 4 }}>Starter</div>
          <div style={{ fontSize: 28, color: "#c4c4d4", fontWeight: 700, marginBottom: 12 }}>$29<span style={{ fontSize: 13, color: "#555577" }}>/mo</span></div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
            {["5,000 messages/mo", "10 PDF uploads", "Full customization", "Conversation history"].map(f => (
              <li key={f} style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#4ade80" }}>✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => handleUpgrade("starter")}
            disabled={plan === "starter" || plan === "pro"}
          >
            {plan === "starter" ? "Current Plan" : plan === "pro" ? "Already on higher plan" : "Upgrade to Starter"}
          </button>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 220, border: "1px solid #7c3aed44" }}>
          <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, marginBottom: 4 }}>Pro</div>
          <div style={{ fontSize: 28, color: "#c4c4d4", fontWeight: 700, marginBottom: 12 }}>$79<span style={{ fontSize: 13, color: "#555577" }}>/mo</span></div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
            {["50,000 messages/mo", "75 PDF uploads", "Full customization", "Conversation history", "Priority support", "Early access to features"].map(f => (
              <li key={f} style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#4ade80" }}>✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => handleUpgrade("pro")}
            disabled={plan === "pro"}
          >
            {plan === "pro" ? "Current Plan" : "Upgrade to Pro"}
          </button>
        </div>
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
            { id: "overview", label: "Overview" },
            { id: "settings", label: "Bot Settings" },
            { id: "conversations", label: "Conversations" },
            { id: "knowledge", label: "Knowledge Base" },
            { id: "upgrade", label: "⚡ Upgrade" },
            ...(isAdmin ? [{ id: "admin", label: "Admin" }] : [])
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
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
        {activePage === "upgrade" && renderUpgrade()}
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
// App Router
// =============================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;