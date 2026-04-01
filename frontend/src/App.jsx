import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import MapComponent from './components/Map';
import IncidentForm from './components/IncidentForm';
import Dashboard from './components/Dashboard';
import RoleSelection from './components/RoleSelection';
import AdminInterface from './components/AdminInterface';
import ProviderInterface from './components/ProviderInterface';
import Login from './components/Login';
import ChatWidget from './components/ChatWidget';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import './index.css';

const API_URL = 'http://localhost:5005/api/incidents';
const SOCKET_URL = 'http://localhost:5005';

function App() {
  const [role, setRole] = useState(null);
  const [providerType, setProviderType] = useState(null);
  const [user, setUser] = useState('');
  const [userPhone, setUserPhone] = useState('');
  
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeProviders, setActiveProviders] = useState([]);
  const [myIncidents, setMyIncidents] = useState([]); // User's own SOS submissions
  const [messages, setMessages] = useState([]); // Real-time chat messages
  
  const [userLocation, setUserLocation] = useState(null);
  const [socket, setSocket] = useState(null);

  // Initialize Socket once
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('new_incident', (incident) => {
      setIncidents((prev) => [incident, ...prev]);
    });

    newSocket.on('red_alert', (incident) => {
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.play().catch(e => console.log('Audio autoplay blocked'));
      setAlerts((prev) => [incident, ...prev]);
    });

    newSocket.on('status_updated', (updatedIncident) => {
      setIncidents((prev) => prev.map(inc => inc._id === updatedIncident._id ? updatedIncident : inc));
      setAlerts((prev) => prev.map(inc => inc._id === updatedIncident._id ? updatedIncident : inc));
      setMyIncidents((prev) => prev.map(inc => inc._id === updatedIncident._id ? updatedIncident : inc));
    });

    newSocket.on('providers_update', (providersList) => {
      setActiveProviders(providersList);
    });

    newSocket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.role !== role) {
         // Optionally play a sound for new message if not from current user
         const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
         audio.play().catch(e => console.log('Audio autoplay blocked'));
      }
    });

    return () => newSocket.disconnect();
  }, []);

  // Sync Role and Room whenever Role or Socket changes
  useEffect(() => {
    if (socket && role) {
      console.log(`Syncing role: ${role}, type: ${providerType}`);
      socket.emit('join_service', { role, providerType });
      // If we have location, sync that too
      if (userLocation) {
        socket.emit('update_location', { ...userLocation, role, providerType });
      }
    }
  }, [socket, role, providerType, userLocation]);

  // Fetch initial incidents and location
  useEffect(() => {
    axios.get(API_URL).then(res => setIncidents(res.data)).catch(console.error);

    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
         () => setUserLocation({ lat: 26.8467, lng: 80.9462 })
       );
    }
  }, []);

  const handleReportIncident = async (formData) => {
    try {
      const payload = { ...formData, contactNumber: userPhone };
      const res = await axios.post(API_URL, payload);
      // Track this as the user's own SOS so they can see their circle
      setMyIncidents((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error('Error reporting incident:', err);
      alert('Failed to report incident.');
    }
  };

  const handleSendMessage = (text, targetId = null) => {
    if (!socket || !text.trim()) return;
    const msgData = {
      text,
      sender: user || 'Anonymous',
      role: role,
      targetId: targetId, // Used to route to specific incident/user context
      timestamp: new Date()
    };
    socket.emit('send_chat_message', msgData);
    setMessages((prev) => [...prev, msgData]);
  };

  const handleRoleSelect = (r, pType = null) => {
    setRole(r);
    setProviderType(pType);
  };

  const handleLogin = (username, phone) => {
    setUser(username);
    setUserPhone(phone);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (!role) {
    return (
      <RoleSelection 
        onSelectRole={handleRoleSelect} 
      />
    );
  }

  // Intercept Admin Panel Route completely rendering distinct dual-screen UI
  if (role === 'admin') {
    return (
       <AdminInterface 
         incidents={incidents} 
         activeProviders={activeProviders} 
         userLocation={userLocation} 
       />
    );
  }

  // Intercept Provider Panel Route
  if (role === 'provider') {
    return (
       <ProviderInterface 
         incidents={incidents} 
         userLocation={userLocation} 
         alerts={alerts}
         providerType={providerType}
         onSendMessage={handleSendMessage}
         messages={messages}
       />
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar UI */}
      <div className="sidebar" style={{ width: role === 'user' ? '400px' : '450px' }}>
        <h1>
          <ShieldAlert color="#f85149" size={28} />
          DisasterOps
        </h1>
        <p className="subtitle">
          {role === 'admin' ? "Admin Control Center" : 
           role === 'provider' ? `Service Provider: ${providerType.replace('_', ' ').toUpperCase()}` : 
           "Real-time Coordination System"}
        </p>

        {/* Global Dashboard for Admins/Providers */}
        {role !== 'user' && (
           <Dashboard incidents={incidents} alerts={alerts} role={role} activeProviders={activeProviders} />
        )}
        
        {/* Replace Overview with SOS Form natively in the sidebar for Users */}
        {role === 'user' && (
           <IncidentForm onSubmit={handleReportIncident} userLocation={userLocation} />
        )}

        {/* Dynamic Alert Feed */}
        {alerts.length > 0 && (
          <div className="glass-panel" style={{ borderColor: 'var(--danger-color)' }}>
            <h2>{role === 'user' ? 'Active Red Alerts' : 'SOS Signal Feed'}</h2>
            {alerts.slice(0, 5).map((alert, i) => (
              <div key={i} className="alert-banner">
                <AlertCircle size={24} />
                <div>
                  <h3>{alert.type.toUpperCase()} DANGER</h3>
                  <p className="alert-desc">{alert.description}</p>
                  <div className="alert-meta">
                    <span>Severity: {alert.severity}</span>
                    <span>Just Now</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Map View */}
      <div className="map-container">
        {userLocation && (
          <MapComponent 
            incidents={incidents} 
            userLocation={userLocation} 
            alerts={alerts}
            providers={activeProviders}
            role={role}
            myIncidents={myIncidents}
          />
        )}
      </div>

      {/* Floating Chat for Users */}
      {role === 'user' && messages.length > 0 && (
         <ChatWidget 
           messages={messages} 
           onSend={(txt) => {
             const incidentId = messages.find(m => m.targetId)?.targetId;
             handleSendMessage(txt, incidentId);
           }} 
           user={user}
         />
      )}

    </div>
  );
}

export default App;
