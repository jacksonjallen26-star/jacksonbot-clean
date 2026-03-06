import { useState, useEffect } from "react";

function App() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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

  // =============================
  // Get companyId from URL
  // =============================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("companyId");
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
  }, [companyId, BACKEND_URL]);

  // =============================
  // Save Settings
  // =============================
  const saveSettings = async () => {
    setStatus("Saving...");

    try {
      const res = await fetch(`${BACKEND_URL}/api/update-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
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

  if (!companyId) {
    return <div style={{ padding: 40 }}>No companyId in URL.</div>;
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 600 }}>

      <h2>Dashboard for: {companyId}</h2>

      <label>Bot Name</label>
      <input
        value={botName}
        onChange={e => setBotName(e.target.value)}
      />

      <label>Logo URL</label>
      <input
        value={logoUrl}
        onChange={e => setLogoUrl(e.target.value)}
      />

      <label>Primary Color</label>
      <input
        type="color"
        value={primaryColor}
        onChange={e => setPrimaryColor(e.target.value)}
      />

      <label>Secondary Color</label>
      <input
        type="color"
        value={secondaryColor}
        onChange={e => setSecondaryColor(e.target.value)}
      />

      <label>Accent Color</label>
      <input
        type="color"
        value={accentColor}
        onChange={e => setAccentColor(e.target.value)}
      />

      <label>Text Color</label>
      <input
        type="color"
        value={textColor}
        onChange={e => setTextColor(e.target.value)}
      />

      <label>Bot Bubble Color</label>
      <input
        type="color"
        value={botBubbleColor}
        onChange={e => setBotBubbleColor(e.target.value)}
      />

      <label>System Prompt</label>
      <textarea
        value={systemPrompt}
        onChange={e => setSystemPrompt(e.target.value)}
        rows={4}
      />

      <label>Opening Message</label>
      <textarea
        value={openingMessage}
        onChange={e => setOpeningMessage(e.target.value)}
        rows={3}
        placeholder="Example: Hi! How can we help you today?"
      />

      <br /><br />

      <button onClick={saveSettings}>
        Save Settings
      </button>

      <div style={{ marginTop: 20 }}>{status}</div>

    </div>
  );
}

export default App;