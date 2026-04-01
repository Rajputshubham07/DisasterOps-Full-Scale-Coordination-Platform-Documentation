import React from 'react';
import { Activity, Users, Truck } from 'lucide-react';

export default function Dashboard({ incidents, alerts, role, activeProviders }) {
  const highSeverity = incidents.filter(i => i.severity === 'high').length;

  return (
    <div className="glass-panel">
      <h2><Activity size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }}/> Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{incidents.length}</div>
          <div className="stat-label">Total Incidents</div>
        </div>
        
        {role === 'user' && (
          <div className="stat-card danger">
            <div className="stat-value">{alerts.length}</div>
            <div className="stat-label">My Alerts</div>
          </div>
        )}
        
        {role !== 'user' && (
          <div className="stat-card danger">
            <div className="stat-value">{alerts.length}</div>
            <div className="stat-label">Total SOS Broadcasts</div>
          </div>
        )}
        
        <div className="stat-card">
          <div className="stat-value">{highSeverity}</div>
          <div className="stat-label">High Severity</div>
        </div>

        {role === 'admin' ? (
          <div className="stat-card" style={{ borderColor: '#2ea043' }}>
            <div className="stat-value" style={{ color: '#2ea043' }}>{activeProviders.length}</div>
            <div className="stat-label">Active Services</div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="stat-value">Live</div>
            <div className="stat-label">System Status</div>
          </div>
        )}
      </div>
      
      {role === 'admin' && activeProviders.length > 0 && (
         <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Service Providers Available</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem' }}>
              {activeProviders.map(p => (
                 <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{color: '#ff7b72'}}><Truck size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> {p.providerType.replace('_', ' ').toUpperCase()}</span>
                    <span style={{color: '#e6edf3'}}>[{p.lat.toFixed(3)}, {p.lng.toFixed(3)}]</span>
                 </li>
              ))}
            </ul>
         </div>
      )}
    </div>
  );
}
