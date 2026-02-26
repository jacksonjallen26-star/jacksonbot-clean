import React, { useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: input }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://jacksonbot-76u0.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', text: 'PlumberBot is having trouble. Try again.' }]);
    }

    setLoading(false);
  };

  return (
    <div className="neon-wrapper">
      <div className="chat-container">
        <div id="chat">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.type}`}>{msg.text}</div>
          ))}
        </div>

        {loading && (
          <div id="spinner">
            <div className="loader"></div>
          </div>
        )}

        <div className="input-container">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Personal Bot..."
            onKeyPress={e => { if (e.key === 'Enter') send(); }}
          />
          <button onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;