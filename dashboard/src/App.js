import { useState, useEffect } from "react";

function App() {
  const [companyId, setCompanyId] = useState("");
  const [botName, setBotName] = useState("Jet AI");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [textColor, setTextColor] = useState("#ffffff");
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Get companyId from URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("companyId");
    if (id) setCompanyId(id);
  }, []);

  // Fetch settings for this company
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
      } catch (err) {
        console.error("Failed to load company settings:", err);
      }
    }

    fetchSettings();
  }, [companyId, BACKEND_URL]);

  return (
    <div
      style={{
        height: "100%",
        backgroundColor: primaryColor,
        color: textColor,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>{botName}</h1>
    </div>
  );
}

export default App;