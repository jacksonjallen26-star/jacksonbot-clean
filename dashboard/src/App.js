import React, { useState, useEffect } from "react";

function App() {
  const [botName, setBotName] = useState("");

  const companyId = "abc123"; // temporary hardcoded

  // 🔹 Load settings when page loads
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/get-settings?companyId=${companyId}`
        );

        const data = await response.json();

        if (data.botName) {
          setBotName(data.botName);
        }

      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/update-settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyId,
            botName,
          }),
        }
      );

      await response.json();
      alert("Saved to database!");

    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving.");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Jet AI Dashboard</h1>

      <div style={{ marginTop: "30px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          Bot Name
        </label>

        <input
          type="text"
          value={botName}
          onChange={(e) => setBotName(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            fontSize: "16px",
          }}
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Save Changes
      </button>
    </div>
  );
}

export default App;