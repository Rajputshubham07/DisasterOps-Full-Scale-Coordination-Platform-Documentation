import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { MapPin, Phone, MessageSquare, Navigation, CheckCircle, Clock, AlertCircle, FileVideo, FileImage, ShieldCheck, CheckCheck } from 'lucide-react';
import MapComponent from './Map';

export default function ProviderInterface({ incidents, userLocation, alerts, providerType, onSendMessage, messages = [] }) {
  const [selectedId, setSelectedId] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [showMessenger, setShowMessenger] = useState(false);

  // Derive selectedIncident from the current incidents prop to ensure real-time status updates
  const selectedIncident = useMemo(() => {
    return incidents.find(inc => inc._id === selectedId);
  }, [incidents, selectedId]);

  // Filter SOS messages based on relevant provider type
  const sosMessages = [...incidents]
    .filter(inc => {
      // Logic mapping disaster types to service providers
      if (providerType === 'fire_engine') return inc.type === 'fire';
      if (providerType === 'ndrf') return inc.type === 'flood';
      if (providerType.includes('ambulance')) return inc.type === 'accident' || inc.type === 'medical';
      if (providerType === 'police') return (inc.type === 'crime' || inc.type === 'other');
      return true; // Default to all if no specific mapping
    })
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(inc => {
      // Check for media in description
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
       // Socket 'status_updated' will trigger state update in App.jsx
     } catch (err) {
       console.error('Error accepting mission:', err);
     }
  };

  const handleResolveMission = async (id) => {
    try {
      await axios.put(`http://localhost:5005/api/incidents/${id}/status`, { status: 'resolved' });
      setSelectedId(null); // Clear overlay after resolution
    } catch (err) {
      console.error('Error resolving mission:', err);
    }
  };

  const isAccepted = selectedIncident && selectedIncident.status === 'in-progress';
  const isResolved = selectedIncident && selectedIncident.status === 'resolved';

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)', overflow: 'hidden' }}>
      
      {/* Sidebar: Emergency SOS Feed */}
      <div style={{ width: '450px', background: 'var(--bg-panel)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '1.5rem', zIndex: 10 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ff7b72' }}>
            <AlertCircle size={28} />
            SOS Responder
          </h1>
          <p className="subtitle" style={{ margin: 0 }}>Active Duty: {providerType.replace('_', ' ').toUpperCase()}</p>
        </div>

        <h2 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Real-Time Live Feed
        </h2>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
          {sosMessages.map((msg) => (
            <div 
              key={msg._id} 
              onClick={() => setSelectedId(msg._id)}
              style={{ 
                cursor: 'pointer', 
                padding: '1.25rem', 
                borderRadius: '12px',
                border: selectedId === msg._id ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                borderLeft: `6px solid ${msg.severity === 'high' ? 'var(--danger-color)' : '#d2a8ff'}`,
                background: selectedId === msg._id ? 'rgba(47, 129, 247, 0.1)' : 'rgba(13, 17, 23, 0.6)',
                transition: 'all 0.2s ease',
                position: 'relative',
                opacity: msg.status === 'resolved' ? 0.6 : 1
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem', color: msg.severity === 'high' ? '#ff7b72' : '#d2a8ff' }}>
                  {msg.type.toUpperCase()}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{msg.time}</span>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: '#e6edf3', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                {msg.cleanDesc.length > 80 ? msg.cleanDesc.substring(0, 80) + '...' : msg.cleanDesc}
              </p>

              {msg.fileName && (
                <div style={{ marginBottom: '0.75rem', borderRadius: '8px', overflow: 'hidden', height: '80px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                   {msg.mediaData ? (
                     <img 
                       src={msg.mediaData} 
                       alt="Real-time User-Uploaded Proof" 
                       style={{ width: '100%', height: '100%', objectFit: 'cover', border: '2px solid var(--accent-color)' }} 
                     />
                   ) : msg.isVideo ? (
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <FileVideo size={24} color="var(--accent-color)" />
                        <span style={{ fontSize: '0.6rem', marginTop: '4px' }}>VIDEO PROOF</span>
                     </div>
                   ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <FileImage size={24} color="#8b949e" />
                        <span style={{ fontSize: '0.6rem', marginTop: '4px' }}>ATTACHED MEDIA</span>
                     </div>
                   )}
                   <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>PROOFS</div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={12} />
                  <span>Sector {msg.location.lat.toFixed(3)}, {msg.location.lng.toFixed(3)}</span>
                </div>
                {msg.status === 'in-progress' && (
                   <span style={{ color: '#3fb950', fontSize: '0.75rem', fontWeight: 'bold' }}>In Progress ✓</span>
                )}
                {msg.status === 'resolved' && (
                   <span style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 'bold' }}>Resolved ⬢</span>
                )}
              </div>
            </div>
          ))}
          {sosMessages.length === 0 && <p style={{ textAlign: 'center', color: '#8b949e', marginTop: '3rem' }}>No SOS alerts in queue.</p>}
        </div>
      </div>

      {/* Main Map & Incident Detail Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapComponent 
          incidents={incidents.filter(inc => inc.status !== 'resolved')} 
          userLocation={userLocation} 
          alerts={alerts}
          onSelectIncident={(inc) => setSelectedId(inc._id)}
        />

        {/* Selected SOS Mission Control Overlay */}
        {selectedIncident && (
          <div style={{ 
            position: 'absolute', 
            bottom: '2rem', 
            left: '2rem', 
            right: '2rem', 
            background: '#161b22', 
            border: '2px solid rgba(48, 54, 61, 0.8)',
            borderRadius: '16px',
            padding: '2rem',
            zIndex: 1000,
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            display: 'flex',
            gap: '2.5rem',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: isResolved ? '#8b949e' : isAccepted ? '#2ea043' : 'var(--danger-color)', padding: '0.75rem', borderRadius: '12px' }}>
                  <Navigation size={28} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>
                    {selectedIncident.type.toUpperCase()} EMERGENCY {isResolved && '(RESOLVED)'}
                  </h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    {isResolved ? 'Mission Accomplished' : 'Incoming SOS Signal • Priority Response Required'}
                    {selectedIncident.contactNumber && ` • 📞 ${selectedIncident.contactNumber}`}
                  </p>
                </div>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
                 <p style={{ flex: 1, fontSize: '1.1rem', lineHeight: '1.6', margin: 0, color: '#e6edf3' }}>
                    {selectedIncident.description.replace(/\[Attached Media: .*?\]/, '').trim()}
                 </p>
                 {selectedIncident.mediaData && (
                   <div style={{ width: '220px', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--accent-color)', position: 'relative', boxShadow: '0 0 20px rgba(47, 129, 247, 0.4)' }}>
                      <img 
                        src={selectedIncident.mediaData} 
                        alt="High-resolution User Proof" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-color)', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>REAL SOS PROOF</div>
                   </div>
                 )}
                 {!selectedIncident.mediaData && selectedIncident.description.includes('[Attached Media:') && (
                    <div style={{ width: '150px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                       <FileImage size={32} color="#8b949e" />
                    </div>
                 )}
              </div>
            </div>

            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => handleAcceptMission(selectedId)}
                disabled={isAccepted || isResolved}
                style={{ 
                  background: isAccepted ? 'rgba(46, 160, 67, 0.1)' : isResolved ? 'rgba(255,255,255,0.05)' : '#2ea043', 
                  border: (isAccepted || isResolved) ? '1px solid #2ea043' : 'none',
                  padding: '1.25rem', 
                  borderRadius: '10px', 
                  color: isAccepted ? '#3fb950' : isResolved ? '#8b949e' : '#fff', 
                  fontWeight: 'bold', 
                  fontSize: '1rem', 
                  cursor: (isAccepted || isResolved) ? 'default' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  justifyContent: 'center' 
                }}
              >
                {isAccepted ? <ShieldCheck size={20} /> : <CheckCircle size={20} />}
                {isResolved ? 'SOLVED' : isAccepted ? 'MISSION IN PROGRESS' : 'ACCEPT MISSION'}
              </button>
              
              {isAccepted && !isResolved && (
                <button 
                  onClick={() => handleResolveMission(selectedId)}
                  style={{ 
                    background: 'rgba(46, 160, 67, 0.1)', 
                    border: '1px solid #2ea043',
                    padding: '1.25rem', 
                    borderRadius: '10px', 
                    color: '#3fb950', 
                    fontWeight: 'bold', 
                    fontSize: '1rem', 
                    cursor: 'pointer',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    justifyContent: 'center' 
                  }}
                >
                  <CheckCheck size={20} />
                  MARK RESOLVED
                </button>
              )}

              {/* Direct Communication Tools */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a 
                    href={selectedIncident.contactNumber ? `tel:${selectedIncident.contactNumber}` : "tel:1234567890"} 
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '10px', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}
                    title="Call Reporter"
                  >
                    <Phone size={22} />
                  </a>
                  <button 
                    onClick={() => setShowMessenger(!showMessenger)}
                    style={{ flex: 1, background: showMessenger ? 'rgba(47, 129, 247, 0.2)' : 'rgba(255,255,255,0.05)', border: showMessenger ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', padding: '1rem', borderRadius: '10px', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    title="Send Message"
                  >
                    <MessageSquare size={22} />
                  </button>
                </div>

                {showMessenger && (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--accent-color)' }}>
                    <textarea 
                      placeholder="Type a message to the victim..."
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none', resize: 'none', height: '60px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button 
                        onClick={() => {
                          if (msgText.trim()) {
                            onSendMessage(msgText, selectedId);
                            setMsgText('');
                          }
                        }}
                        style={{ background: 'var(--accent-color)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                      >
                        SEND LIVE MESSAGE
                      </button>
                    </div>
                    
                    {/* Tiny inline history */}
                    <div style={{ marginTop: '1rem', maxHeight: '120px', overflowY: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                       {messages.filter(m => m.targetId === selectedId).map((m, i) => (
                         <div key={i} style={{ fontSize: '0.75rem', marginBottom: '0.4rem', color: m.role === 'user' ? '#8b949e' : '#3fb950' }}>
                            <strong>{m.sender}: </strong> {m.text}
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedId(null)}
                style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', marginTop: '0.5rem', textDecoration: 'underline' }}
              >
                Dismiss Overview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
