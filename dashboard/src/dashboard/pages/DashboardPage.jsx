import { useState, useEffect } from "react";
import LockedField from "../components/LockedField";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;


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
      <div className="btn-row">
        {status && <div className={status.includes("✅") ? "status-text" : "error-text"}>{status}</div>}
        {!status && <div></div>}
        <button className="btn btn-primary" onClick={saveSettings}>Save Changes</button>
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
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {plan === "free" && (
            <div style={{ flex: 1, minWidth: 220, padding: "16px", background: "#0a0a0f", borderRadius: 8, border: "1px solid #1e1e2e" }}>
              <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, marginBottom: 4 }}>Starter</div>
              <div style={{ fontSize: 24, color: "#c4c4d4", fontWeight: 700, marginBottom: 12 }}>$29<span style={{ fontSize: 13, color: "#555577" }}>/mo</span></div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {["5,000 messages/mo", "10 PDF uploads", "Full customization", "Conversation history"].map(f => (
                  <li key={f} style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#4ade80" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleUpgrade("starter")}>
                Upgrade to Starter
              </button>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 220, padding: "16px", background: "#0a0a0f", borderRadius: 8, border: "1px solid #7c3aed44" }}>
            <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, marginBottom: 4 }}>Pro</div>
            <div style={{ fontSize: 24, color: "#c4c4d4", fontWeight: 700, marginBottom: 12 }}>$79<span style={{ fontSize: 13, color: "#555577" }}>/mo</span></div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              {["50,000 messages/mo", "75 PDF uploads", "Full customization", "Conversation history", "Priority support", "Early access to features"].map(f => (
                <li key={f} style={{ fontSize: 12, color: "#888899", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#4ade80" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleUpgrade("pro")}>
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
            { id: "overview", label: "Overview" },
            { id: "settings", label: "Bot Settings" },
            { id: "conversations", label: "Conversations" },
            { id: "knowledge", label: "Knowledge Base" },
            { id: "account", label: "⚙️ Account" },
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
        {activePage === "account" && renderAccount()}
        {activePage === "admin" && isAdmin && renderAdmin()}
      </div>
    </div>
  );
}

  export default DashboardPage;
  