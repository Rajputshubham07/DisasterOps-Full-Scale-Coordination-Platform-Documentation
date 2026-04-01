import React, { useState } from 'react';
import { Truck, Shield, Flame, X, Waves } from 'lucide-react';
import MapComponent from './Map';

export default function AdminInterface({ incidents, activeProviders, userLocation }) {
  const [selectedSP, setSelectedSP] = useState(null);

  const spTypes = [
    { id: 'police', label: 'Police', icon: <Shield size={48} /> },
    { id: 'gov_ambulance', label: 'Gov Ambulance', icon: <Truck size={48} /> },
    { id: 'private_ambulance', label: 'Pvt Ambulance', icon: <Truck size={48} /> },
    { id: 'fire_engine', label: 'Fire Engine', icon: <Flame size={48} /> },
    { id: 'ndrf', label: 'NDRF (Flood)', icon: <Waves size={48} /> },
  ];

  const safeIncidents = incidents || [];
  const totalComplaints = safeIncidents.length;
  const criticalComplaints = safeIncidents.filter(i => i.severity === 'high' && i.status !== 'resolved').length;
  const solvedToday = safeIncidents.filter(i => i.status === 'resolved').length;
  const openComplaints = safeIncidents.filter(i => i.status !== 'resolved').length;
  
  // Generating a Mock GPS Database for Demo Impact
  const MOCK_FLEET = React.useMemo(() => {
    const fleet = [];
    const types = ['police', 'gov_ambulance', 'private_ambulance', 'fire_engine', 'ndrf'];
    const countPerType = 8; // Total 32 responders in area
    
    if (!userLocation) return [];

    types.forEach(type => {
      for (let i = 1; i <= countPerType; i++) {
        // Randomly scatter within 1-10km
        const offsetLat = (Math.random() - 0.5) * 0.15;
        const offsetLng = (Math.random() - 0.5) * 0.15;
        fleet.push({
          id: `${type}-${i}`,
          providerType: type,
          lat: userLocation.lat + offsetLat,
          lng: userLocation.lng + offsetLng,
          status: Math.random() > 0.4 ? 'online' : 'offline', // 60% online
          name: `${type.replace('_', ' ').toUpperCase()} Unit #${i}`
        });
      }
    });
    return fleet;
  }, [userLocation]);

  // Merge real connected providers with the mock fleet
  const allProviders = [...(activeProviders || []), ...MOCK_FLEET];
  const providersOfType = selectedSP ? allProviders.filter(p => p.providerType === selectedSP.id) : [];
  
  const totalUnits = providersOfType.length; 
  const onlineUnits = providersOfType.filter(p => p.status !== 'offline').length;
  const offlineUnits = totalUnits - onlineUnits;

  const defaultCenter = userLocation || { lat: 26.8467, lng: 80.9462 };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)', padding: '2rem', gap: '2rem', overflow: 'hidden' }}>
      
      {/* SECTION 1: USER DATA */}
      <div style={{ flex: 1, background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>User Reports Details</h2>
        
        <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', flexShrink: 0 }}>
          <div className="stat-card">
            <div className="stat-value">{totalComplaints}</div>
            <div className="stat-label">Total SOS Received</div>
          </div>
          <div className="stat-card" style={{ borderColor: '#2ea043' }}>
            <div className="stat-value" style={{ color: '#2ea043' }}>{solvedToday}</div>
            <div className="stat-label">Resolved Today</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-value">{criticalComplaints}</div>
            <div className="stat-label">Critical Pending</div>
          </div>
          <div className="stat-card" style={{ backgroundColor: 'rgba(47, 129, 247, 0.1)', borderColor: 'var(--accent-color)' }}>
            <div className="stat-value" style={{ color: 'var(--accent-color)' }}>{MOCK_FLEET.filter(p => p.status === 'online').length}</div>
            <div className="stat-label">Live Units Tracking</div>
          </div>
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#8b949e', flexShrink: 0 }}>Active GPS Units (Global Registry)</h3>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#8b949e', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
           <span>Total Registered: {MOCK_FLEET.length}</span>
           <span style={{ color: '#3fb950' }}>● Online: {MOCK_FLEET.filter(p => p.status === 'online').length}</span>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
           <h3 style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Incident Timeline</h3>
           {safeIncidents.map((inc, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '1rem', 
                borderRadius: '8px', 
                borderLeft: inc.status === 'resolved' ? '4px solid #2ea043' : inc.severity === 'high' ? '4px solid #f85149' : '4px solid #d2a8ff',
                opacity: inc.status === 'resolved' ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <strong style={{ fontSize: '1.1rem' }}>{inc.type.toUpperCase()}</strong>
                       {inc.status === 'resolved' && (
                         <span style={{ fontSize: '0.7rem', background: 'rgba(46, 160, 67, 0.15)', color: '#3fb950', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #2ea043' }}>RESOLVED ✓</span>
                       )}
                       {inc.status === 'in-progress' && (
                         <span style={{ fontSize: '0.7rem', background: 'rgba(47, 129, 247, 0.15)', color: 'var(--accent-color)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid var(--accent-color)' }}>IN PROGRESS</span>
                       )}
                    </div>
                    <span style={{fontSize: '0.8rem', color: inc.severity === 'high' ? '#f85149' : '#8b949e', fontWeight: 'bold'}}>{inc.severity.toUpperCase()}</span>
                 </div>
                 <p style={{fontSize: '0.9rem', marginTop: '0.75rem', color: inc.status === 'resolved' ? '#8b949e' : '#e6edf3'}}>{inc.description}</p>
                 <small style={{color: '#8b949e', marginTop: '6px', display: 'block', display: 'flex', justifyContent: 'space-between'}}>
                    <span>GPS Data: {inc.location.lat.toFixed(4)}, {inc.location.lng.toFixed(4)}</span>
                    <span>{new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </small>
              </div>
           ))}
           {safeIncidents.length === 0 && <p style={{color: '#8b949e', textAlign: 'center'}}>No user incidents reported.</p>}

           <h3 style={{ color: '#8b949e', fontSize: '0.9rem', margin: '1.5rem 0 0.5rem' }}>Global Fleet Registry</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {MOCK_FLEET.slice(0, 10).map((unit) => (
                 <div key={unit.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                    <span>{unit.name}</span>
                    <span style={{ color: unit.status === 'online' ? '#3fb950' : '#8b949e' }}>{unit.status.toUpperCase()}</span>
                 </div>
              ))}
              <p style={{ color: '#8b949e', fontSize: '0.7rem', textAlign: 'center' }}>+ {MOCK_FLEET.length - 10} more units tracking...</p>
           </div>
        </div>
      </div>

      {/* SECTION 2: SERVICE PROVIDERS */}
      <div style={{ flex: 1, background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Active Service Providers Array</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', overflowY: 'auto', alignContent: 'start' }}>
           {spTypes.map(sp => {
             const count = allProviders.filter(p => p.providerType === sp.id && p.status !== 'offline').length;
             return (
               <div key={sp.id} 
                    onClick={() => setSelectedSP(sp)}
                    style={{ background: 'rgba(46, 160, 67, 0.05)', border: count > 0 ? '2px solid #2ea043' : '1px solid var(--border-color)', padding: '2.5rem 1.5rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: count > 0 ? '0 0 15px rgba(46, 160, 67, 0.1)' : 'none' }}
               >
                 <div style={{ color: count > 0 ? '#3fb950' : '#8b949e', marginBottom: '1rem' }}>{sp.icon}</div>
                 <h3 style={{ fontSize: '1.25rem' }}>{sp.label}</h3>
                 <p style={{ color: count > 0 ? '#3fb950' : '#8b949e', marginTop: '0.5rem', fontWeight: 'bold' }}>{count} Ready / GPS Active</p>
               </div>
             )
           })}
        </div>
      </div>

      {/* MODAL LAUNCHED WHEN SP IS CLICKED */}
      {selectedSP && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px', width: '95%', padding: '2rem' }}>
            <button className="close-btn" onClick={() => setSelectedSP(null)}><X size={24}/></button>
            <h2 style={{ marginBottom: '1.5rem', color: '#2ea043', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem' }}>
              {selectedSP.icon} Dispatch: {selectedSP.label}
            </h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
               <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                 <h3 style={{ fontSize: '2.5rem' }}>{totalUnits}</h3>
                 <p style={{ color: '#8b949e', fontSize: '1rem', fontWeight: '600' }}>In Database (Fleet)</p>
               </div>
               <div style={{ flex: 1, background: 'rgba(46, 160, 67, 0.15)', border: '1px solid #2ea043', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 0 15px rgba(46, 160, 67, 0.2)' }}>
                 <h3 style={{ fontSize: '2.5rem', color: '#3fb950' }}>{onlineUnits}</h3>
                 <p style={{ color: '#3fb950', fontSize: '1rem', fontWeight: 'bold' }}>Online & Active</p>
               </div>
               <div style={{ flex: 1, background: 'rgba(248, 81, 73, 0.15)', border: '1px solid #f85149', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                 <h3 style={{ fontSize: '2.5rem', color: '#f85149' }}>{offlineUnits}</h3>
                 <p style={{ color: '#f85149', fontSize: '1rem', fontWeight: 'bold' }}>Offline / Service</p>
               </div>
            </div>

            {/* Medium Size Google Map focusing entirely on SP locations */}
            <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-color)', position: 'relative' }}>
               {onlineUnits === 0 && (
                 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#8b949e', fontWeight: 'bold' }}>
                    No {selectedSP.label} units are online in this sector right now.
                 </div>
               )}
               <MapComponent 
                 userLocation={onlineUnits > 0 ? { lat: providersOfType.filter(p => p.status === 'online')[0].lat, lng: providersOfType.filter(p => p.status === 'online')[0].lng } : defaultCenter}
                 incidents={[]} 
                 providers={providersOfType.filter(p => p.status === 'online')}
               />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
