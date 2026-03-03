// App.js
import { useState, useEffect } from "react";

function App() {
  const [companyId] = useState("abc123"); // Replace with actual companyId
  const [botName, setBotName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [textColor, setTextColor] = useState("#ffffff");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch current settings from backend
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/get-settings?companyId=${companyId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setBotName(data.botName || "");
        setPrimaryColor(data.primaryColor || "#4f46e5");
        setTextColor(data.textColor || "#ffffff");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching settings:", err);
        setMessage("Failed to load settings");
        setLoading(false);
      }
    }
    fetchSettings();
  }, [companyId, BACKEND_URL]);

  // Save updated settings
  const handleSave = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/update-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, botName, primaryColor, textColor })
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Saved to database ✅");
      } else {
        setMessage("Save failed ❌");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setMessage("Save failed ❌");
    }
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", maxWidth: 400 }}>
      <h2>Company Dashboard</h2>

      <label>Bot Name:</label>
      <input
        type="text"
        value={botName}
        onChange={(e) => setBotName(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 5 }}
      />

      <label>Primary Color:</label>
      <input
        type="color"
        value={primaryColor}
        onChange={(e) => setPrimaryColor(e.target.value)}
        style={{ width: "100%", marginBottom: 10, height: 40 }}
      />

      <label>Text Color:</label>
      <input
        type="color"
        value={textColor}
        onChange={(e) => setTextColor(e.target.value)}
        style={{ width: "100%", marginBottom: 10, height: 40 }}
      />

      <button
        onClick={handleSave}
        style={{
          padding: "10px 20px",
          backgroundColor: primaryColor,
          color: textColor,
          border: "none",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Save
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}

export default App;