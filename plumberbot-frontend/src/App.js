import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: input, timestamp: new Date() }]);
    setInput('');
    setTyping(true);

    try {
      // Relative API path works for dev (proxy) + production
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, { type: 'bot', text: data.reply, timestamp: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', text: 'PlumberBot is having trouble.', timestamp: new Date() }]);
    }

    setTyping(false);
  };

  const handleKeyPress = e => { if (e.key === 'Enter') sendMessage(); };

  const formatTime = date => {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m.toString().padStart(2,'0')} ${ampm}`;
  };

  return (
    <div className="neon-wrapper">
      <div className="chat-container">
        <div id="chat">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.type}`}>
              {msg.text}
              <div className="timestamp">{formatTime(msg.timestamp)}</div>
            </div>
          ))}

          {typing && (
            <div className="message bot">
              <div className="typing">
                <span>JacksonBot is typing</span>
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
            placeholder="Ask JacksonBot..."
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