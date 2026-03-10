import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

function App() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // =========================
  // State
  // =========================
  const [companyId, setCompanyId] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [botName, setBotName] = useState("Jet AI");
  const [logo, setLogo] = useState("/logo.png");
  const chatEndRef = useRef(null);

  // =========================
  // Persistent userId
  // =========================
  const [userId] = useState(() => {
    let id = localStorage.getItem("jetUserId");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("jetUserId", id);
    }
    return id;
  });

  // =========================
  // Detect companyId and load settings
  // =========================
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("companyId") || "default";
        setCompanyId(id);

        const res = await fetch(`${BACKEND_URL}/api/get-settings?companyId=${id}`);
        const data = await res.json();

        if (data.botName) setBotName(data.botName);
        if (data.logoUrl) setLogo(data.logoUrl);

        // Show opening message if available
        if (data.openingMessage) {
          setMessages([{ type: "bot", text: data.openingMessage, timestamp: new Date() }]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadSettings();
  }, [BACKEND_URL]);

  // =========================
  // Scroll to bottom
  // =========================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // =========================
  // Handle PDF upload
  // =========================
  const handleUpload = async () => {
    if (!pdfFile || !companyId) return;
    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("companyId", companyId);

    try {
      const res = await fetch(`${BACKEND_URL}/api/upload-pdf`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (data.success) setUploadStatus(`✅ PDF uploaded, ${data.chunksStored} chunks stored!`);
      else setUploadStatus(`❌ Upload failed: ${data.error}`);
    } catch (err) {
      console.error(err);
      setUploadStatus("❌ Upload failed due to server error.");
    }
  };

  // =========================
  // Send Chat Message
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { type: "user", text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userId, companyId })
      });
      const data = await res.json();
      const botMessage = { type: "bot", text: data.reply, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    } catch {
      setMessages(prev => [
        ...prev,
        { type: "bot", text: "Jet is having trouble.", timestamp: new Date() }
      ]);
    }

    setTyping(false);
  };

  const handleKeyPress = e => {
    if (e.key === "Enter") sendMessage();
  };

  const formatTime = date => {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 600, margin: "0 auto" }}>
      <h2>{companyId} Dashboard</h2>

      {/* ================= PDF Upload ================= */}
      <div style={{ marginBottom: 20 }}>
        <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload PDF</button>
        <div>{uploadStatus}</div>
      </div>

      {/* ================= Chat Bot ================= */}
      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 10 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <img src={logo} alt="Bot Logo" style={{ width: 40, height: 40, marginRight: 10 }} />
          <h3>{botName}</h3>
        </div>

        <div
          style={{
            height: 300,
            overflowY: "auto",
            marginBottom: 10,
            padding: 5,
            background: "#f9f9f9"
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                marginBottom: 5,
                textAlign: msg.type === "bot" ? "left" : "right"
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: 8,
                  borderRadius: 5,
                  background: msg.type === "bot" ? "#eee" : "#4f46e5",
                  color: msg.type === "bot" ? "#000" : "#fff"
                }}
              >
                {msg.text}
              </div>
              <div style={{ fontSize: 10, color: "#555" }}>{formatTime(new Date(msg.timestamp))}</div>
            </div>
          ))}
          {typing && <div style={{ fontStyle: "italic" }}>{botName} is typing...</div>}
          <div ref={chatEndRef} />
        </div>

        <div style={{ display: "flex" }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${botName}...`}
            style={{ flex: 1, padding: 8 }}
          />
          <button onClick={sendMessage} style={{ padding: "0 16px" }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;