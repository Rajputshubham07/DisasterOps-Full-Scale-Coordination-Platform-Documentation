import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, User } from 'lucide-react';

export default function ChatWidget({ messages, onSend, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="chat-widget-container">
      {/* Floating Button */}
      <button
        className={`chat-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && messages.length > 0 && (
          <span className="chat-badge">{messages.length}</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window shadow-xl">
          <div className="chat-header">
            <h3>Emergency Support Chat</h3>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {messages.length === 0 && (
              <p className="no-msgs">No messages yet. Responders will contact you here.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`msg-bubble ${m.role === 'user' ? 'my-msg' : 'their-msg'}`}>
                <div className="msg-sender">
                  {m.role === 'user' ? 'Me' : `${m.sender} (${m.role.toUpperCase()})`}
                </div>
                <div className="msg-text">{m.text}</div>
                <div className="msg-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            ))}
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input
              placeholder="Reply to responder..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit"><Send size={18} /></button>
          </form>
        </div>
      )}
    </div>
  );
}
