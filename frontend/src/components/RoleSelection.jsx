import React from 'react';
import { 
  Shield, 
  Truck, 
  Flame, 
  Waves, 
  Home, 
  Biohazard, 
  Mountain, 
  Search, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Lock
} from 'lucide-react';

export default function RoleSelection({ onSelectRole }) {
  const units = [
    { id: 'police', label: 'POLICE FORCE', icon: <Shield size={24} />, group: 'Public Safety' },
    { id: 'gov_ambulance', label: 'GOV AMBULANCE', icon: <Activity size={24} />, group: 'Medical' },
    { id: 'private_ambulance', label: 'PVT AMBULANCE', icon: <Truck size={24} />, group: 'Medical' },
    { id: 'fire_engine', label: 'FIRE & RESCUE', icon: <Flame size={24} />, group: 'Emergency' },
    { id: 'ndrf', label: 'NDRF (FLOOD)', icon: <Waves size={24} />, group: 'Specialized' },
    { id: 'sdrf', label: 'SDRF (QUAKE)', icon: <Home size={24} />, group: 'Specialized' },
    { id: 'hazmat_team', label: 'HAZMAT TEAM', icon: <Biohazard size={24} />, group: 'Hazmat' },
    { id: 'rescue_squad', label: 'RESCUE SQUAD', icon: <Mountain size={24} />, group: 'Tactical' },
    { id: 'cid', label: 'MISSING UNIT', icon: <Search size={24} />, group: 'Investigations' },
    { id: 'cyber_cell', label: 'CYBER CELL', icon: <Terminal size={24} />, group: 'Digital Defense' },
  ];

  return (
    <div className="role-selection-wrapper" style={{ 
      background: 'radial-gradient(circle at center, #1a1f26 0%, #0d1117 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      {/* Background Atmosphere */}
      <div style={{ position: 'fixed', top: '20%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'var(--accent-color)', opacity: 0.05, filter: 'blur(100px)', zIndex: 0 }}></div>
      <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: '#f85149', opacity: 0.05, filter: 'blur(100px)', zIndex: 0 }}></div>

      <div style={{ width: '100%', maxWidth: '1000px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '900', 
            letterSpacing: '0.15em', 
            color: '#fff', 
            marginBottom: '0.75rem',
            textShadow: '0 0 20px rgba(255,255,255,0.1)'
          }}>
            SERVICE COMMISSIONING
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
             <Lock size={16} />
             <span style={{ fontSize: '0.9rem', fontWeight: '500', letterSpacing: '0.05em' }}>AUTHENTICATED_ACCESS_GRANTED</span>
             <ShieldCheck size={16} color="#3fb950" />
          </div>
        </div>

        <div style={{ 
          background: 'rgba(22, 27, 34, 0.6)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '3rem', 
          borderRadius: '24px', 
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
        }}>
          <h3 style={{ 
            fontSize: '0.75rem', 
            color: 'var(--accent-color)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.3em', 
            marginBottom: '2rem', 
            fontWeight: '900',
            textAlign: 'center'
          }}>
            SELECT ACTIVE DUTY SPECIALTY
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '1.25rem' 
          }}>
            {units.map((unit) => (
              <div 
                key={unit.id}
                onClick={() => onSelectRole('provider', unit.id)}
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="role-card-inner"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ color: 'var(--accent-color)', transition: 'transform 0.3s ease' }}>{unit.icon}</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: '4px', mb: '4px', color: '#fff' }}>
                    {unit.label}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {unit.group}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ marginTop: '2.5rem', fontSize: '0.75rem', color: '#484f58', fontWeight: 'bold', letterSpacing: '0.05em' }}>
          * COMMISSIONING INTO A UNIT RESTRICTS YOUR DATA FEED TO CRISIS RELEVANT TO YOUR SPECIALTY.
        </p>
      </div>
    </div>
  );
}
