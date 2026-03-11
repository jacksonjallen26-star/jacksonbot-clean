import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [botName, setBotName] = useState("Jet AI");
  const [logo, setLogo] = useState("/logo.png");
  const chatEndRef = useRef(null);

  // =========================
  // Detect companyId
  // =========================
  const params = new URLSearchParams(window.location.search);
  const companyId = params.get("companyId") || "default";

  // =========================
  // Detect widget mode
  // =========================
  let isWidget = false;
  try {
    isWidget = window.self !== window.top;
  } catch {
    isWidget = true;
  }

  // =========================
  // Persistent userId
  // =========================
  let userId = localStorage.getItem("jetUserId");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("jetUserId", userId);
  }

  // =========================
  // LOAD COMPANY SETTINGS
  // =========================
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/get-settings?companyId=${companyId}`
        );

        if (!res.ok) return;

        const data = await res.json();

        // Apply CSS variables dynamically
        document.documentElement.style.setProperty("--primary-color", data.primaryColor);
        document.documentElement.style.setProperty("--secondary-color", data.secondaryColor);
        document.documentElement.style.setProperty("--accent-color", data.accentColor);
        document.documentElement.style.setProperty("--text-color", data.textColor);
        document.documentElement.style.setProperty("--bot-bubble-color", data.botBubbleColor);
        document.documentElement.style.setProperty("--glow-color", data.secondaryColor);

        if (data.botName) setBotName(data.botName);
        if (data.logoUrl) setLogo(data.logoUrl);

      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };

    loadSettings();
  }, [companyId]);

  // =========================
  // LOAD CHAT HISTORY
  // =========================
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/history?userId=${userId}&companyId=${companyId}`
        );

        if (!res.ok) return;

        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to load history");
      }
    };

    loadHistory();
  }, [companyId, userId]);

  // =========================
  // Scroll to bottom
  // =========================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // =========================
  // Send Message
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: "user",
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: input,
            userId,
            companyId
          })
        }
      );

      const data = await res.json();

      const botMessage = {
        type: "bot",
        text: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch {
      setMessages(prev => [
        ...prev,
        {
          type: "bot",
          text: "Jet is having trouble right now.",
          timestamp: new Date()
        }
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
      <div className="chat-container">
        <div className="chat-header">
          <img src={logo} alt="Bot Logo" className="chat-logo" />
          <span className="chat-title">{botName}</span>
        </div>

        <div id="chat">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.type}`}>
              {msg.text}
              <div className="timestamp">
                {formatTime(new Date(msg.timestamp))}
              </div>
            </div>
          ))}

          {typing && (
            <div className="message bot">
              <div className="typing">
                <span>{botName} is typing</span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="input-container">
          <input
            type="text"
            placeholder={`Ask ${botName}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;