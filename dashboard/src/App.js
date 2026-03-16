import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

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

  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 400 }}>
      <h2>Login to your Dashboard</h2>
      <label>Email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 10, width: "100%" }}
      />
      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 10, width: "100%" }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

// =============================
// Dashboard Page
// =============================
function DashboardPage() {
  const [companyId, setCompanyId] = useState("");
  const [botName, setBotName] = useState("Jet AI");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [secondaryColor, setSecondaryColor] = useState("#6366f1");
  const [accentColor, setAccentColor] = useState("#4338ca");
  const [textColor, setTextColor] = useState("#ffffff");
  const [botBubbleColor, setBotBubbleColor] = useState("#2a2a2a");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [openingMessage, setOpeningMessage] = useState("");
  const [status, setStatus] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [conversations, setConversations] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);


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

        setBotName(data.botName || "Jet AI");
        setLogoUrl(data.logoUrl || "");
        setPrimaryColor(data.primaryColor || "#4f46e5");
        setSecondaryColor(data.secondaryColor || "#6366f1");
        setAccentColor(data.accentColor || "#4338ca");
        setTextColor(data.textColor || "#ffffff");
        setBotBubbleColor(data.botBubbleColor || "#2a2a2a");
        setSystemPrompt(data.systemPrompt || "");
        setOpeningMessage(data.openingMessage || "");
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    }

    fetchSettings();
  }, [companyId]);

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
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      setUploadStatus(`❌ ${data.error}`);
      return;
    }

    setUploadStatus(`✅ Uploaded successfully! ${data.chunksStored} chunks stored.`);

  } catch (err) {
    console.error("Upload error:", err);
    setUploadStatus("❌ Upload failed.");
  }
};

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
      if (data.success) setConversations(data.conversations);

    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }; 

  useEffect(() => {
      loadConversations();
    }, []);

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
          botName,
          logoUrl,
          primaryColor,
          secondaryColor,
          accentColor,
          textColor,
          botBubbleColor,
          systemPrompt,
          openingMessage
        })
      });

      if (!res.ok) throw new Error("Save failed");

      setStatus("✅ Saved successfully!");
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

  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 500 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Dashboard for: {companyId}</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <label>Bot Name</label>
      <input value={botName} onChange={(e) => setBotName(e.target.value)} style={{ display: "block", marginBottom: 10, width: "100%" }} />

      <label>Logo URL</label>
      <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} style={{ display: "block", marginBottom: 10, width: "100%" }} />

      <label>Primary Color</label>
      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ display: "block", marginBottom: 10 }} />

      <label>Secondary Color</label>
      <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={{ display: "block", marginBottom: 10 }} />

      <label>Accent Color</label>
      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ display: "block", marginBottom: 10 }} />

      <label>Text Color</label>
      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ display: "block", marginBottom: 10 }} />

      <label>Bot Bubble Color</label>
      <input type="color" value={botBubbleColor} onChange={(e) => setBotBubbleColor(e.target.value)} style={{ display: "block", marginBottom: 10 }} />

      <label>Opening Message</label>
      <textarea value={openingMessage} onChange={(e) => setOpeningMessage(e.target.value)} rows={3} style={{ display: "block", marginBottom: 10, width: "100%" }} />

      <label>System Prompt</label>
      <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={4} style={{ display: "block", marginBottom: 10, width: "100%" }} />
      
      <hr />
      <h3>Knowledge Base</h3>
      <label>Upload PDF</label>
      <input type="file"accept="application/pdf"onChange={(e) => setPdfFile(e.target.files[0])} style={{ display: "block", marginBottom: 10 }}
/>
<button onClick={uploadPdf}>Upload PDF</button>
<div style={{ marginTop: 10 }}>{uploadStatus}</div>
<hr />

      <br />

      <button onClick={saveSettings}>Save Settings</button>

      <div style={{ marginTop: 20 }}>{status}</div>

      <hr />
<h3>Conversations</h3>
<button onClick={loadConversations} style={{ marginBottom: 10 }}>Refresh</button>

<div style={{ display: "flex", gap: 20, marginTop: 10 }}>
  
  {/* User List */}
  <div style={{ width: 200, borderRight: "1px solid #ccc", paddingRight: 10 }}>
    <h4>Users</h4>
    {Object.keys(conversations).length === 0 && <p style={{ fontSize: 12, color: "#999" }}>No conversations yet</p>}
    {Object.keys(conversations).map(userId => (
      <div
        key={userId}
        onClick={() => setSelectedUser(userId)}
        style={{
          padding: 8,
          marginBottom: 5,
          cursor: "pointer",
          background: selectedUser === userId ? "#4f46e5" : "#f0f0f0",
          color: selectedUser === userId ? "#fff" : "#000",
          borderRadius: 5,
          fontSize: 12
        }}
      >
        {userId.slice(0, 8)}...
      </div>
    ))}
  </div>

  {/* Conversation View */}
  <div style={{ flex: 1 }}>
    <h4>Messages</h4>
    {!selectedUser && <p style={{ color: "#999" }}>Select a user to view conversation</p>}
    {selectedUser && conversations[selectedUser].map((msg, i) => (
      <div
        key={i}
        style={{
          marginBottom: 8,
          textAlign: msg.role === "user" ? "right" : "left"
        }}
      >
        <div style={{
          display: "inline-block",
          padding: 8,
          borderRadius: 5,
          background: msg.role === "user" ? "#4f46e5" : "#f0f0f0",
          color: msg.role === "user" ? "#fff" : "#000",
          maxWidth: "80%",
          fontSize: 13
        }}>
          {msg.message}
        </div>
        <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
          {new Date(msg.timestamp).toLocaleString()}
        </div>
      </div>
    ))}
  </div>

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