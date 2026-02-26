import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const send = async () => {
    if (!input) return;

    // Add user message to chat
    setMessages([...messages, { type: 'user', text: input }]);
    setInput('');

    try {
      const res = await fetch('https://jacksonbot-76u0.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', text: 'PlumberBot is having trouble. Try again.' }]);
    }
  };

  return (
    <div className="neon-wrapper">
      <div className="chat-container">
        <div id="chat">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.type}`}>{msg.text}</div>
          ))}
        </div>

        <div className="input-container">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Personal Bot..."
          />
          <button onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;