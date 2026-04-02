import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { MapPin, Phone, MessageSquare, Navigation, CheckCircle, Clock, AlertCircle, FileVideo, FileImage, ShieldCheck, CheckCheck, Flame, Droplets, Activity, Wind, Shield, Search, Terminal, AlertTriangle, Hammer, Biohazard, Mountain, Zap, ShieldAlert, Target } from 'lucide-react';
import MapComponent from './Map';

export default function ProviderInterface({ incidents, userLocation, alerts, providerType, onSendMessage, messages = [] }) {
  const [selectedId, setSelectedId] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [showMessenger, setShowMessenger] = useState(false);

  const selectedIncident = useMemo(() => {
    return incidents.find(inc => inc._id === selectedId);
  }, [incidents, selectedId]);

  const getDisasterIcon = (type) => {
    switch(type) {
      case 'fire': return <Flame size={20} />;
      case 'flood': return <Droplets size={20} />;
      case 'earthquake': return <Activity size={20} />;
      case 'gas_leak': return <Biohazard size={20} />;
      case 'trapped': return <Mountain size={20} />;
      case 'medical': return <Activity size={20} />;
      case 'accident': return <AlertTriangle size={20} />;
      case 'crime': return <Shield size={20} />;
      case 'missing_person': return <Search size={20} />;
      case 'cyber_threat': return <Terminal size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  const sosMessages = [...incidents]
    .filter(inc => {
      if (providerType === 'fire_engine') return inc.type === 'fire';
      if (providerType === 'ndrf') return inc.type === 'flood';
      if (providerType === 'sdrf') return inc.type === 'earthquake';
      if (providerType === 'hazmat_team') return inc.type === 'gas_leak';
      if (providerType === 'rescue_squad') return inc.type === 'trapped';
      if (providerType === 'cid') return inc.type === 'missing_person';
      if (providerType === 'cyber_cell') return inc.type === 'cyber_threat';
      if (providerType.includes('ambulance')) return inc.type === 'accident' || inc.type === 'medical';
      if (providerType === 'police') return (inc.type === 'crime');
      return true;
    })
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(inc => {
      const mediaMatch = inc.description.match(/\[Attached Media: (.*?)\]/);
      const fileName = mediaMatch ? mediaMatch[1] : null;
      const cleanDesc = inc.description.replace(/\[Attached Media: .*?\]/, '').trim();
      const isVideo = fileName && fileName.toLowerCase().endsWith('.mp4');
      
      return {
        ...inc,
        cleanDesc,
        fileName,
        isVideo,
        time: new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });

  const handleAcceptMission = async (id) => {
     try {
       await axios.put(`http://localhost:5005/api/incidents/${id}/status`, { status: 'in-progress' });
     } catch (err) {
       console.error('Error accepting mission:', err);
     }
  };

  const handleResolveMission = async (id) => {
    try {
      await axios.put(`http://localhost:5005/api/incidents/${id}/status`, { status: 'resolved' });
      setSelectedId(null);
    } catch (err) {
      console.error('Error resolving mission:', err);
    }
  };

  const isAccepted = selectedIncident && selectedIncident.status === 'in-progress';
  const isResolved = selectedIncident && selectedIncident.status === 'resolved';

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)', overflow: 'hidden' }}>
      
      {/* COMMAND SIDEBAR: CRISIS FEED */}
      <div style={{ width: '450px', background: 'rgba(22, 27, 34, 0.85)', backdropFilter: 'blur(30px)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '1.5rem', zIndex: 10, boxShadow: '10px 0 30px rgba(0,0,0,0.5)' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
             <ShieldAlert className="pulse-slow" size={32} color="#f85149" />
             <h1 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: '900', letterSpacing: '0.1em', margin: 0 }}>COMMANDER HUD</h1>
          </div>
          <div style={{ background: 'rgba(47, 129, 247, 0.1)', border: '1px solid rgba(47, 129, 247, 0.2)', padding: '0.6rem 1rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3fb950', animation: 'blink 1.5s infinite' }}></div>
             <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--accent-color)', letterSpacing: '0.05em' }}>
               UNIT DEPLOYED: {providerType.replace('_', ' ').toUpperCase()}
             </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
           <h2 style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>ACTIVE DISTRESS SIGNALS</h2>
           <div style={{ fontSize: '0.65rem', background: 'rgba(240, 129, 247, 0.1)', color: '#d2a8ff', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(210, 168, 255, 0.2)' }}>
             {sosMessages.length} PENDING
           </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
          {sosMessages.map((msg) => (
            <div 
              key={msg._id} 
              onClick={() => setSelectedId(msg._id)}
              style={{ 
                cursor: 'pointer', 
                padding: '1.5rem', 
                borderRadius: '16px',
                border: selectedId === msg._id ? '2px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.05)',
                background: selectedId === msg._id ? 'rgba(47, 129, 247, 0.08)' : 'rgba(13, 17, 23, 0.4)',
                transform: selectedId === msg._id ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                opacity: msg.status === 'resolved' ? 0.5 : 1,
                boxShadow: selectedId === msg._id ? '0 10px 20px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              {msg.severity === 'high' && msg.status !== 'resolved' && (
                <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '4px', background: 'var(--danger-color)', borderRadius: '0 4px 4px 0' }}></div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: msg.severity === 'high' ? '#ff7b72' : '#d2a8ff' }}>{getDisasterIcon(msg.type)}</div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '900', letterSpacing: '0.05em', color: msg.severity === 'high' ? '#ff7b72' : '#fff' }}>
                      {msg.type.toUpperCase()}
                    </span>
                 </div>
                 <span style={{ fontSize: '0.65rem', color: '#8b949e', fontWeight: 'bold' }}>{msg.time}</span>
              </div>
              
              <p style={{ fontSize: '0.85rem', color: '#e6edf3', marginBottom: '1rem', lineHeight: '1.5', opacity: 0.9 }}>
                {msg.cleanDesc.length > 100 ? msg.cleanDesc.substring(0, 100) + '...' : msg.cleanDesc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#8b949e', fontWeight: 'bold' }}>
                  <MapPin size={12} color="var(--accent-color)" />
                  <span>SECTOR {msg.location.lat.toFixed(3)} / {msg.location.lng.toFixed(3)}</span>
                </div>
                {msg.status === 'in-progress' && (
                   <span style={{ background: 'rgba(46, 160, 67, 0.1)', color: '#3fb950', fontSize: '0.6rem', fontWeight: '900', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(46, 160, 67, 0.2)' }}>ENGAGED</span>
                )}
                 {msg.status === 'resolved' && (
                   <span style={{ color: '#8b949e', fontSize: '0.6rem', fontWeight: '900' }}>ARCHIVED</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TACTICAL MAP & HUD OVERLAY */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapComponent 
          incidents={incidents.filter(inc => inc.status !== 'resolved')} 
          userLocation={userLocation} 
          alerts={alerts}
          onSelectIncident={(inc) => setSelectedId(inc._id)}
          routingTarget={isAccepted ? selectedIncident : null}
        />

        {/* MISSION CONTROL CENTER OVERLAY (Sticky Bottom) */}
        {selectedIncident && (
          <div style={{ 
            position: 'absolute', 
            bottom: '2.5rem', 
            left: '2.5rem', 
            right: '2.5rem', 
            background: 'rgba(13, 17, 23, 0.85)', 
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2.5rem',
            zIndex: 1000,
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            display: 'flex',
            gap: '3rem',
            animation: 'slideUp 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ background: isResolved ? '#484f58' : isAccepted ? '#238636' : '#f85149', width: '64px', height: '64px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${isAccepted ? 'rgba(35, 134, 54, 0.3)' : 'rgba(248, 81, 73, 0.3)'}` }}>
                  <Target size={32} color="#fff" strokeWidth={2.5} />
                </div>
                <div>
                   <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', letterSpacing: '0.05em', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {selectedIncident.type.toUpperCase()} CRISIS UNIT
                    {isAccepted && <Zap size={20} fill="#3fb950" color="#3fb950" className="blink" />}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#8b949e', fontWeight: 'bold' }}>TACTICAL SECTOR 7G</span>
                     <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#484f58' }}></span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>V_STREAM_ENABLED</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '2rem', alignItems: 'start' }}>
                 <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>REPORTED SITUATION</h3>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: 0, color: '#e6edf3', fontWeight: '500' }}>
                      {selectedIncident.description.replace(/\[Attached Media: .*?\]/, '').trim()}
                    </p>
                 </div>
                 {selectedIncident.mediaData && (
                    <div style={{ position: 'relative', height: '200px', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--accent-color)', boxShadow: '0 10px 30px rgba(47, 129, 247, 0.2)' }}>
                      <img src={selectedIncident.mediaData} alt="Visual Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '900', color: '#fff' }}>MISSION PROOF_01</div>
                    </div>
                 )}
              </div>
            </div>

            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '3rem', justifyContent: 'center' }}>
              <button 
                onClick={() => handleAcceptMission(selectedId)}
                disabled={isAccepted || isResolved}
                style={{ 
                  background: isAccepted ? 'rgba(35, 134, 54, 0.1)' : isResolved ? 'rgba(72, 79, 88, 0.1)' : 'var(--accent-color)', 
                  padding: '1.4rem', 
                  borderRadius: '14px', 
                  color: isAccepted ? '#3fb950' : '#fff', 
                  fontWeight: '900', 
                  fontSize: '0.9rem', 
                  letterSpacing: '0.1em',
                  cursor: (isAccepted || isResolved) ? 'default' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  justifyContent: 'center',
                  border: isAccepted ? '1px solid rgba(63, 185, 80, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {isAccepted ? <ShieldCheck size={22} /> : <CheckCircle size={22} />}
                {isResolved ? 'ARCHIVED' : isAccepted ? 'IN PROGRESS' : 'ACCEPT MISSION'}
              </button>
              
              {isAccepted && !isResolved && (
                <button 
                  onClick={() => handleResolveMission(selectedId)}
                  style={{ background: 'linear-gradient(135deg, #238636 0%, #175e24 100%)', padding: '1.4rem', borderRadius: '14px', color: '#fff', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', border: 'none', boxShadow: '0 8px 20px rgba(35, 134, 54, 0.2)' }}
                >
                  <CheckCheck size={22} />
                  MARK AS SOLVED
                </button>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                  <a href={`tel:${selectedIncident.contactNumber || '123'}`} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}><Phone size={24} color="#fff" /></a>
                  <button onClick={() => setShowMessenger(!showMessenger)} style={{ flex: 1, background: showMessenger ? 'rgba(47, 129, 247, 0.15)' : 'rgba(255,255,255,0.05)', border: showMessenger ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.05)', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={24} color="#fff" /></button>
              </div>

              {showMessenger && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--accent-color)', marginTop: '1rem', animation: 'slideUp 0.3s ease' }}>
                  <textarea placeholder="Direct line to victim..." value={msgText} onChange={(e) => setMsgText(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none', resize: 'none', height: '60px', fontSize: '0.85rem' }} />
                  <button onClick={() => { if (msgText.trim()) { onSendMessage(msgText, selectedId); setMsgText(''); } }} style={{ width: '100%', background: 'var(--accent-color)', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '900' }}>SEND SIGNAL</button>
                </div>
              )}

              <button onClick={() => setSelectedId(null)} style={{ background: 'transparent', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', textDecoration: 'underline' }}>MINIMIZE CONSOLE</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
