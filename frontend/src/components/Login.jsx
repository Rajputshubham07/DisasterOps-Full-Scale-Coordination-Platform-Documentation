import React, { useState } from 'react';
import { User, LogIn, AlertCircle, Shield, Activity, Settings, Lock } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('SELECT OPERATIONAL INTERFACE');
      return;
    }
    if (!username || !phoneNumber || phoneNumber.length < 5) {
      setError('VALIDATE CREDENTIALS');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phoneNumber })
      });
      
      const data = await res.json();
      if (res.ok) {
        onLogin(username, phoneNumber, selectedRole);
        setError('');
      } else {
        setError(data.message || 'ACCESS DENIED');
      }
    } catch (err) {
      console.error(err);
      setError('COMMUNICATION FAILURE');
    }
  };

  return (
    <div className="role-selection-wrapper" style={{ 
      background: 'radial-gradient(circle at 50% 50%, #1a1f26 0%, #0d1117 100%)', 
      flexDirection: 'column', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(47, 129, 247, 0.05)', filter: 'blur(120px)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(248, 81, 73, 0.05)', filter: 'blur(120px)', borderRadius: '50%' }}></div>

      <div className="glass-panel" style={{ 
        width: '460px', 
        padding: '3.5rem', 
        textAlign: 'center', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(22, 27, 34, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px'
      }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #2f81f7 0%, #1a56b2 100%)', 
            width: '72px', height: '72px', borderRadius: '20px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 16px rgba(47, 129, 247, 0.3)',
            transform: 'rotate(-5deg)'
          }}>
            <Shield size={36} color="#fff" />
          </div>
          <h1 style={{ 
            fontSize: '2.2rem', margin: '0 0 0.5rem', 
            fontWeight: '800', textTransform: 'uppercase', 
            color: '#fff', letterSpacing: '0.15em', 
            textShadow: '0 0 20px rgba(255,255,255,0.1)'
          }}>
            DISASTER<span style={{ color: '#2f81f7' }}>OPS</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Emergency Response Coordination
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Initialize Command Interface</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[
              { id: 'user', label: 'CITIZEN', icon: <User size={20} />, desc: 'SOS Reporting' },
              { id: 'provider', label: 'RESPONDER', icon: <Activity size={20} />, desc: 'Unit Dispatch' },
              { id: 'admin', label: 'COMMAND', icon: <Settings size={20} />, desc: 'Fleet Control' }
            ].map(r => (
              <div 
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                style={{
                  flex: 1,
                  padding: '1.25rem 0.5rem',
                  borderRadius: '16px',
                  border: selectedRole === r.id ? '1px solid #2f81f7' : '1px solid rgba(255,255,255,0.05)',
                  background: selectedRole === r.id ? 'rgba(47, 129, 247, 0.1)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div style={{ color: selectedRole === r.id ? '#2f81f7' : '#8b949e', transition: 'color 0.3s' }}>{r.icon}</div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: selectedRole === r.id ? '#fff' : '#8b949e' }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent)', marginBottom: '2rem' }}></div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', opacity: selectedRole ? 1 : 0.4, pointerEvents: selectedRole ? 'all' : 'none', transition: 'opacity 0.5s' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="ID / USERNAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ 
                   width: '100%', 
                   background: 'rgba(0,0,0,0.2)',
                   border: error && !username ? '1px solid #f85149' : '1px solid rgba(255,255,255,0.1)',
                   color: '#fff',
                   padding: '14px 14px 14px 44px',
                   borderRadius: '12px',
                   fontSize: '0.9rem',
                   letterSpacing: '0.05em',
                   outline: 'none',
                   transition: 'border-color 0.2s'
                }} 
              />
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#444' }} />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="tel" 
                placeholder="PROTOCOL CONTACT (PHONE)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ 
                   width: '100%', 
                   background: 'rgba(0,0,0,0.2)',
                   border: error && !phoneNumber ? '1px solid #f85149' : '1px solid rgba(255,255,255,0.1)',
                   color: '#fff',
                   padding: '14px 14px 14px 44px',
                   borderRadius: '12px',
                   fontSize: '0.9rem',
                   letterSpacing: '0.05em',
                   outline: 'none',
                   transition: 'border-color 0.2s'
                }} 
              />
              <Activity size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#444' }} />
            </div>
          </div>

          {error && (
            <div style={{ 
              color: '#f85149', 
              fontSize: '0.7rem', 
              fontWeight: '700',
              letterSpacing: '0.1em',
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              justifyContent: 'center',
              background: 'rgba(248, 81, 73, 0.1)',
              padding: '0.5rem',
              borderRadius: '8px'
            }}>
               <AlertCircle size={12} />
               {error}
            </div>
          )}

          <button 
            type="submit"
            style={{ 
              width: '100%', 
              padding: '1rem', 
              borderRadius: '12px',
              background: selectedRole ? '#2f81f7' : 'rgba(255,255,255,0.05)',
              color: selectedRole ? '#fff' : '#444',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              cursor: selectedRole ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.3s ease',
              boxShadow: selectedRole ? '0 8px 20px rgba(47, 129, 247, 0.3)' : 'none'
            }}
          >
            <LogIn size={20} />
            {selectedRole ? `AUTHORIZE ${selectedRole.toUpperCase()}` : 'SELECT UNIT'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
           <div style={{ fontSize: '0.65rem', color: '#444', letterSpacing: '0.05em' }}>ENCRYPTION: AES-256</div>
           <div style={{ fontSize: '0.65rem', color: '#444', letterSpacing: '0.05em' }}>STATUS: SECURE</div>
        </div>
      </div>
    </div>
  );
}
