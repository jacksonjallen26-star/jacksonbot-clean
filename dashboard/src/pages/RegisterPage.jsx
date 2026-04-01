import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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

export { RegisterPage, OnboardingPage };