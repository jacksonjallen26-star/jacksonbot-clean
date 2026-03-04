// App.js
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [companyId, setCompanyId] = useState("");
  const [botName, setBotName] = useState("Jet AI");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [textColor, setTextColor] = useState("#ffffff");
  const [buttonColor, setButtonColor] = useState("#00c3ff");
  const [accentColor, setAccentColor] = useState("#ff00ff");
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [systemPrompt, setSystemPrompt] = useState("You are Jet, a helpful AI.");
  const [welcomeMessage, setWelcomeMessage] = useState("Hi! I’m Jet. How can I help you today?");
  const [footerText, setFooterText] = useState("");
  const [active, setActive] = useState(true);
  const [plan, setPlan] = useState("starter");
  const [statusMessage, setStatusMessage] = useState("");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Get companyId from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("companyId");
    if (id) setCompanyId(id);
  }, []);

  // Fetch company settings
  useEffect(() => {
    if (!companyId) return;
    async function fetchSettings() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/get-settings?companyId=${companyId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setBotName(data.botName || "Jet AI");
        setPrimaryColor(data.primaryColor || "#4f46e5");
        setTextColor(data.textColor || "#ffffff");
        setButtonColor(data.buttonColor || "#00c3ff");
        setAccentColor(data.accentColor || "#ff00ff");
        setLogoUrl(data.logoUrl || "/logo.png");
        setSystemPrompt(data.systemPrompt || "You are Jet, a helpful AI.");
        setWelcomeMessage(data.welcomeMessage || "Hi! I’m Jet. How can I help you today?");
        setFooterText(data.footerText || "");
        setActive(data.active ?? true);
        setPlan(data.plan || "starter");
      } catch (err) {
        console.error("Failed to load company settings:", err);
      }
    }
    fetchSettings();
  }, [companyId, BACKEND_URL]);

  // Save settings
  const saveSettings = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/update-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          botName,
          primaryColor,
          textColor,
          buttonColor,
          accentColor,
          logoUrl,
          systemPrompt,
          welcomeMessage,
          footerText,
          active,
          plan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage("Settings saved successfully!");
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        setStatusMessage("Failed to save settings.");
      }
    } catch (err) {
      console.error("Save error:", err);
      setStatusMessage("Error saving settings.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="settings-panel">
        <h2>Bot Configuration</h2>

        <label>Bot Name</label>
        <input value={botName} onChange={e => setBotName(e.target.value)} />

        <label>Primary Color</label>
        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />

        <label>Text Color</label>
        <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} />

        <label>Button Color</label>
        <input type="color" value={buttonColor} onChange={e => setButtonColor(e.target.value)} />

        <label>Accent Color</label>
        <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} />

        <label>Logo URL</label>
        <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />

        <label>System Prompt</label>
        <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} />

        <label>Welcome Message</label>
        <textarea value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} />

        <label>Footer Text</label>
        <textarea value={footerText} onChange={e => setFooterText(e.target.value)} />

        <label>
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> Bot Active
        </label>

        <label>Plan</label>
        <select value={plan} onChange={e => setPlan(e.target.value)}>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <button className="save-btn" onClick={saveSettings}>Save Changes</button>
        {statusMessage && <p className="status">{statusMessage}</p>}
      </div>
    </div>
  );
}

export default App;