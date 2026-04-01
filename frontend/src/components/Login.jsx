import React, { useState } from 'react';
import { User, LogIn, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !phoneNumber || phoneNumber.length < 5) {
      setError('Please provide a valid username and phone number.');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5005/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, phoneNumber })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onLogin(username, phoneNumber);
        setError('');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Server connection error. Please try again.');
    }
  };

  return (
    <div className="role-selection-wrapper" style={{ background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)', flexDirection: 'column' }}>
      <div className="glass-panel" style={{ width: '400px', padding: '3rem', textAlign: 'center', boxShadow: 'var(--glass-shadow)' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ background: 'var(--accent-color)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <User size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.1em', justifyContent: 'center' }}>
            DISASTEROPS
          </h1>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Secure Command Center Login</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Enter authorized username"
                className="input-field" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ 
                   width: '100%', 
                   paddingLeft: '2.5rem', 
                   background: 'rgba(255,255,255,0.03)',
                   border: error ? '1px solid #f85149' : '1px solid var(--border-color)',
                   color: '#fff',
                   padding: '12px 12px 12px 40px',
                   borderRadius: '8px'
                }} 
              />
              <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#8b949e' }} />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Phone Number (Emergency Contact)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="tel" 
                placeholder="+91..."
                className="input-field" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ 
                   width: '100%', 
                   paddingLeft: '2.5rem', 
                   background: 'rgba(255,255,255,0.03)',
                   border: error ? '1px solid #f85149' : '1px solid var(--border-color)',
                   color: '#fff',
                   padding: '12px 12px 12px 40px',
                   borderRadius: '8px'
                }} 
              />
              <AlertCircle size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#8b949e' }} />
            </div>
          </div>

          {error && (
            <div style={{ color: '#f85149', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
               <AlertCircle size={14} />
               {error}
            </div>
          )}

          <button 
            type="submit"
            className="sos-button" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <LogIn size={20} />
            AUTHENTICATE
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#8b949e' }}>
          &copy; 2026 Emergency Response Network. Authorized Personal Only.
        </p>
      </div>
    </div>
  );
}
