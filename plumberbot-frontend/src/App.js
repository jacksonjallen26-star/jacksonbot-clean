// App.js
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [settings, setSettings] = useState({
    botName: "Jet AI",
    primaryColor: "#4f46e5",
    textColor: "#ffffff",
    buttonColor: "#00c3ff",
    accentColor: "#ff00ff",
    logoUrl: "/logo.png",
    systemPrompt: "You are Jet, a helpful and friendly AI assistant.",
    welcomeMessage: "Hi! I’m Jet. How can I help you today?",
    footerText: "",
    active: true,
    plan: "starter"
  });

  const chatEndRef = useRef(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // ✅ Dynamically read companyId from iframe URL
  const params = new URLSearchParams(window.location.search);
  const companyId = params.get("companyId") || "default";

  // Detect widget mode
  let isWidget = false;
  try {
    isWidget = window.self !== window.top;
  } catch (e) {
    isWidget = true;
  }

  // ===== Generate or load a unique userId per visitor =====
  let userId = localStorage.getItem("jetUserId");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("jetUserId", userId);
  }

  // Fetch company settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/get-settings?companyId=${companyId}`);
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
        // Optionally show welcome message
        if (data.welcomeMessage) {
          setMessages([{ type: "bot", text: data.welcomeMessage, timestamp: new Date() }]);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    fetchSettings();
  }, [companyId, BACKEND_URL]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ===== Send a message =====
  const sendMessage = async () => {
    if (!input.trim() || !settings.active) return;

    const userMessage = {
      type: "user",
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userId,
          companyId
        }),
      });

      const data = await res.json();

      const botMessage = {
        type: "bot",
        text: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { type: "bot", text: "Jet is having trouble right now.", timestamp: new Date() }
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
    <div className={isWidget ? "widget-mode" : "neon-wrapper"}>
      <div
        className="chat-container"
        style={{ backgroundColor: settings.primaryColor, color: settings.textColor }}
      >
        {/* Header */}
        <div className="chat-header">
          <img src={settings.logoUrl} alt="Logo" className="chat-logo" />
          <span className="chat-title" style={{ color: settings.accentColor }}>
            {settings.botName}
          </span>
        </div>

        {/* Chat Messages */}
        <div id="chat">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${msg.type}`}
              style={{
                backgroundColor: msg.type === "user" ? settings.buttonColor : "#383838",
                color: msg.type === "user" ? "#fff" : settings.textColor
              }}
            >
              {msg.text}
              <div className="timestamp">{formatTime(msg.timestamp)}</div>
            </div>
          ))}

          {typing && (
            <div className="message bot">
              <div className="typing">
                <span>{settings.botName} is typing</span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="input-container">
          <input
            type="text"
            placeholder={`Ask ${settings.botName}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={sendMessage}
            style={{ backgroundColor: settings.buttonColor }}
          >
            Send
          </button>
        </div>

        {/* Footer */}
        {settings.footerText && (
          <div className="chat-footer" style={{ color: settings.accentColor }}>
            {settings.footerText}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;