import React, { useState } from 'react';
import { User, ShieldCheck, Ambulance, Waves } from 'lucide-react';

export default function RoleSelection({ onSelectRole }) {
  const [showProviderOpts, setShowProviderOpts] = useState(false);

  return (
    <div className="role-selection-wrapper">
      <div className="role-selection-container">
        <h1>Select Interface</h1>
        <p className="subtitle">Enter the system with your access level to view the relevant data and functionality.</p>
        
        <div className="roles-grid">
          {/* User Role */}
          <div className="role-card" onClick={() => onSelectRole('user')}>
            <User size={48} color="#2f81f7" />
            <h2>User Mode</h2>
            <p>Report emergencies, trigger SOS, and receive local alerts.</p>
          </div>

          {/* Admin Role */}
          <div className="role-card" onClick={() => onSelectRole('admin')}>
            <ShieldCheck size={48} color="#2ea043" />
            <h2>Admin Panel</h2>
            <p>Monitor all system data, active providers, and total SOS requests.</p>
          </div>

          {/* Provider Role */}
          {!showProviderOpts ? (
            <div className="role-card" onClick={() => setShowProviderOpts(true)}>
              <Ambulance size={48} color="#f85149" />
              <h2>Service Provider</h2>
              <p>Receive live SOS messages and coordinate recovery efforts.</p>
            </div>
          ) : (
            <div className="role-card provider-types">
              <h3>Select Service Type</h3>
              <button onClick={() => onSelectRole('provider', 'police')}>Police</button>
              <button onClick={() => onSelectRole('provider', 'gov_ambulance')}>Gov Ambulance</button>
              <button onClick={() => onSelectRole('provider', 'private_ambulance')}>Pvt Ambulance</button>
              <button onClick={() => onSelectRole('provider', 'fire_engine')}>Fire Engine</button>
              <button onClick={() => onSelectRole('provider', 'ndrf')} style={{ background: 'rgba(56, 139, 253, 0.15)', border: '1px solid #388bfd' }}>🌊 NDRF (Flood)</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
