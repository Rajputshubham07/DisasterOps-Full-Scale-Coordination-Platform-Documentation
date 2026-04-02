import React, { useState, useMemo } from 'react';
import { Truck, Shield, Flame, X, Waves, Home, Biohazard, Mountain, Search, Terminal, Activity, CheckCircle, AlertCircle, Clock, Users, MapPin, ExternalLink } from 'lucide-react';
import MapComponent from './Map';

export default function AdminInterface({ incidents, activeProviders, userLocation }) {
  const [selectedSP, setSelectedSP] = useState(null);

  const spTypes = [
    { id: 'police', label: 'Police Force', icon: <Shield size={32} /> },
    { id: 'gov_ambulance', label: 'Emergency Medical', icon: <Truck size={32} /> },
    { id: 'private_ambulance', label: 'Pvt Medical', icon: <Truck size={32} /> },
    { id: 'fire_engine', label: 'Fire & Rescue', icon: <Flame size={32} /> },
    { id: 'ndrf', label: 'NDRF (Flood)', icon: <Waves size={32} /> },
    { id: 'sdrf', label: 'SDRF (Earthquake)', icon: <Home size={32} /> },
    { id: 'hazmat_team', label: 'Hazmat / CBRN', icon: <Biohazard size={32} /> },
    { id: 'rescue_squad', label: 'Tactical Rescue', icon: <Mountain size={32} /> },
    { id: 'cid', label: 'CID / Investigative', icon: <Search size={32} /> },
    { id: 'cyber_cell', label: 'Cyber Defense', icon: <Terminal size={32} /> },
  ];

  const safeIncidents = incidents || [];
  const totalComplaints = safeIncidents.length;
  const criticalComplaints = safeIncidents.filter(i => i.severity === 'high' && i.status !== 'resolved').length;
  const solvedToday = safeIncidents.filter(i => i.status === 'resolved').length;
  
  const MOCK_FLEET = useMemo(() => {
    const fleet = [];
    const types = ['police', 'gov_ambulance', 'private_ambulance', 'fire_engine', 'ndrf', 'sdrf', 'hazmat_team', 'rescue_squad', 'cid', 'cyber_cell'];
    const countPerType = 5;
    
    if (!userLocation) return [];

    types.forEach(type => {
      for (let i = 1; i <= countPerType; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.2;
        const offsetLng = (Math.random() - 0.5) * 0.2;
        fleet.push({
          id: `${type}-${i}`,
          providerType: type,
          lat: userLocation.lat + offsetLat,
          lng: userLocation.lng + offsetLng,
          status: Math.random() > 0.4 ? 'online' : 'offline',
          name: `${type.replace('_', ' ').toUpperCase()} Unit #${i}`
        });
      }
    });
    return fleet;
  }, [userLocation]);

  const allProviders = [...(activeProviders || []), ...MOCK_FLEET];
  const providersOfType = selectedSP ? allProviders.filter(p => p.providerType === selectedSP.id) : [];
  
  const totalUnits = providersOfType.length; 
  const onlineUnits = providersOfType.filter(p => p.status !== 'offline').length;
  const offlineUnits = totalUnits - onlineUnits;

  const defaultCenter = userLocation || { lat: 26.8467, lng: 80.9462 };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: 'radial-gradient(circle at top right, #1a1f26 0%, #0d1117 100%)', color: 'var(--text-primary)', padding: '2rem', gap: '2rem', overflow: 'hidden' }}>
      
      {/* LEFT COLUMN: GLOBAL ANALYTICS & TIMELINE */}
      <div style={{ width: '450px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color="var(--accent-color)" /> Operational Intelligence
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { val: totalComplaints, label: 'SOS SIGNALS', color: '#fff', icon: <AlertCircle size={14} /> },
              { val: solvedToday, label: 'RESOLVED', color: '#3fb950', icon: <CheckCircle size={14} /> },
              { val: criticalComplaints, label: 'CRITICAL', color: '#ff7b72', icon: <Activity size={14} /> },
              { val: allProviders.filter(p => p.status === 'online').length, label: 'LIVE UNITS', color: 'var(--accent-color)', icon: <MapPin size={14} /> }
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color, marginBottom: '0.25rem' }}>{s.val}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {s.icon} {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '0.8rem', padding: '1.5rem 1.5rem 1rem', background: 'rgba(255,255,255,0.02)', margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} /> SIGNAL TIMELINE
          </h2>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {safeIncidents.map((inc, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(255,255,255,0.02)', 
                padding: '1rem', 
                borderRadius: '12px', 
                borderLeft: inc.status === 'resolved' ? '4px solid #3fb950' : inc.severity === 'high' ? '4px solid #ff7b72' : '4px solid #a371f7',
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff' }}>{inc.type.toUpperCase()}</span>
                  <span style={{ fontSize: '0.65rem', color: '#8b949e' }}>{new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#8b949e', lineHeight: '1.4' }}>{inc.description.slice(0, 80)}...</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: UNIT DISPATCH & FLEET */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h2 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} color="#3fb950" /> UNIT DEPLOYMENT ARRAY
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {spTypes.map(sp => {
              const count = allProviders.filter(p => p.providerType === sp.id && p.status !== 'offline').length;
              return (
                <div key={sp.id} 
                     onClick={() => setSelectedSP(sp)}
                     style={{ 
                       background: count > 0 ? 'rgba(46, 160, 67, 0.05)' : 'rgba(255,255,255,0.02)', 
                       border: count > 0 ? '1px solid rgba(46, 160, 67, 0.3)' : '1px solid rgba(255,255,255,0.05)', 
                       padding: '1.5rem', 
                       borderRadius: '16px', 
                       cursor: 'pointer', 
                       transition: 'all 0.3s ease',
                       textAlign: 'left',
                       position: 'relative',
                       overflow: 'hidden'
                     }}
                >
                  {count > 0 && <div className="blink" style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', borderRadius: '50%', background: '#3fb950' }}></div>}
                  <div style={{ color: count > 0 ? '#3fb950' : '#484f58', marginBottom: '0.75rem' }}>{sp.icon}</div>
                  <h3 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem' }}>{sp.label}</h3>
                  <p style={{ color: count > 0 ? '#3fb950' : '#484f58', fontSize: '0.7rem', fontWeight: 'bold' }}>{count} ACTIVE UNITS</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* DISPATCH MODAL */}
      {selectedSP && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(20px)' }}>
          <div className="modal-content" style={{ maxWidth: '900px', width: '95%', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2.5rem' }}>
            <button className="close-btn" onClick={() => setSelectedSP(null)}><X size={24}/></button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', margin: 0 }}>
                {selectedSP.icon} {selectedSP.label} Dispatch Center
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <div style={{ background: 'rgba(46, 160, 67, 0.1)', border: '1px solid rgba(46, 160, 67, 0.3)', padding: '0.5rem 1.25rem', borderRadius: '20px', color: '#3fb950', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    ● {onlineUnits} UNITS ONLINE
                 </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', height: '450px' }}>
               <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                  <MapComponent 
                    userLocation={onlineUnits > 0 ? { lat: providersOfType.filter(p => p.status === 'online')[0].lat, lng: providersOfType.filter(p => p.status === 'online')[0].lng } : defaultCenter}
                    incidents={[]} 
                    providers={providersOfType.filter(p => p.status === 'online')}
                  />
               </div>
               
               <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1.5rem', overflowY: 'auto' }}>
                  <h3 style={{ fontSize: '0.8rem', color: '#8b949e', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={14} /> LIVE FLEET REGISTRY
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {providersOfType.map(unit => (
                      <div key={unit.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px' }}>
                         <div>
                            <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '700' }}>{unit.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>LOC: {unit.lat.toFixed(4)}, {unit.lng.toFixed(4)}</div>
                         </div>
                         <div style={{ fontSize: '0.6rem', padding: '4px 10px', borderRadius: '8px', background: unit.status === 'online' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(255,255,255,0.05)', color: unit.status === 'online' ? '#3fb950' : '#484f58', fontWeight: '800' }}>
                            {unit.status.toUpperCase()}
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
