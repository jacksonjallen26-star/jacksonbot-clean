import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Detect if running inside iframe (widget mode)
  let isWidget = false;
  try {
    isWidget = window.self !== window.top;
  } catch (e) {
    isWidget = true;
  }

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("https://jacksonbot-clean-production.up.railway.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const botMessage = {
        type: "bot",
        text: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Jet is having trouble right now.",
          timestamp: new Date(),
        },
      ]);
    }

    setTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const formatTime = (date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className={isWidget ? "widget-mode" : "neon-wrapper"}>
      <div className="chat-container">
        {/* ===== Header ===== */}
        <div className="chat-header">
          <img src="/logo.png" alt="Jet Logo" className="chat-logo" />
          <span className="chat-title">Jet</span>
        </div>

        {/* ===== Messages ===== */}
        <div id="chat">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.type}`}>
              {msg.text}
              <div className="timestamp">
                {formatTime(msg.timestamp)}
              </div>
            </div>
          ))}

          {typing && (
            <div className="message bot">
              <div className="typing">
                <span>Jet is typing</span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ===== Input ===== */}
        <div className="input-container">
          <input
            type="text"
            placeholder="Ask Jet..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}


export default App;