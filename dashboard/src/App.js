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

        <button
          className="btn btn-primary"
          onClick={handleLogin}
          style={{ width: "100%", marginTop: 20, justifyContent: "center", padding: "10px" }}
        >
          Sign In
        </button>
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
  const [botName, setBotName] = useState("Jet AI");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [secondaryColor, setSecondaryColor] = useState("#4f46e5");
  const [accentColor, setAccentColor] = useState("#4338ca");
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

  // =============================
  // Get companyId from localStorage
  // =============================
  useEffect(() => {
    const id = localStorage.getItem("companyId");
    if (id) setCompanyId(id);
  }, []);

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
        setLogoUrl(data.logoUrl || "");
        setPrimaryColor(data.primaryColor || "#7c3aed");
        setSecondaryColor(data.secondaryColor || "#4f46e5");
        setAccentColor(data.accentColor || "#4338ca");
        setTextColor(data.textColor || "#ffffff");
        setBotBubbleColor(data.botBubbleColor || "#1a1a28");
        setSystemPrompt(data.systemPrompt || "");
        setOpeningMessage(data.openingMessage || "");
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    }

    fetchSettings();
  }, [companyId]);

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
          accentColor, textColor, botBubbleColor, systemPrompt, openingMessage
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("companyId");
    window.location.href = "/login";
  };

  const initials = companyId ? companyId.slice(0, 2).toUpperCase() : "JA";

  // =============================
  // Pages
  // =============================
  const renderOverview = () => (
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
          <div className="stat-label">Status</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <span className="badge badge-active">Active</span>
            <span className="badge badge-starter">Starter</span>
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
          <div className="form-group">
            <label>Bot Name</label>
            <input type="text" value={botName} onChange={(e) => setBotName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Logo URL</label>
            <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div className="form-group full">
          <label>Opening Message</label>
          <input type="text" value={openingMessage} onChange={(e) => setOpeningMessage(e.target.value)} placeholder="Hi! How can I help you today?" />
        </div>
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
          <div className="color-group"><label>Primary</label><input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} /></div>
          <div className="color-group"><label>Secondary</label><input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} /></div>
          <div className="color-group"><label>Accent</label><input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} /></div>
          <div className="color-group"><label>Text</label><input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} /></div>
          <div className="color-group"><label>Bubble</label><input type="color" value={botBubbleColor} onChange={(e) => setBotBubbleColor(e.target.value)} /></div>
        </div>
        <div className="btn-row">
          {status && <div className={status.includes("✅") ? "status-text" : "error-text"}>{status}</div>}
          {!status && <div></div>}
          <button className="btn btn-primary" onClick={saveSettings}>Save Changes</button>
        </div>
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
    </>
  );

  const renderConversations = () => (
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
              <div className="company-plan">Starter Plan</div>
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
      </div>
    </div>
  );
}

// =============================
// App Router
// =============================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;