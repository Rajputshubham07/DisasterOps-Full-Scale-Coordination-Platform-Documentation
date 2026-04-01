const { Server } = require('socket.io');

// For tracking non-provider user locations for Haversine filtering
const connectedUsers = new Map(); // socket.id -> { lat, lng }

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  const broadcastProviders = () => {
    const providers = [];
    const sockets = io.sockets.adapter.rooms;
    // We can also track providers in a Map for Admin if needed, but we used connectedUsers previously
    // I'll keep the connectedUsers map for simplified Admin tracking
    for (const [id, user] of connectedUsers.entries()) {
      if (user.role === 'provider') providers.push({ id, ...user });
    }
    io.to('admin').emit('providers_update', providers);
  };

  io.on('connection', (socket) => {
    console.log(`Connection: ${socket.id}`);

    // Join specialized rooms for role-based routing
    socket.on('join_service', (roleData) => {
      const { role, providerType } = roleData;
      if (role === 'admin') {
        socket.join('admin');
      } else if (role === 'provider' && providerType) {
        socket.join(providerType);
        // Also joining 'ambulance' room if it's gov or pvt for easier routing
        if (providerType.includes('ambulance')) socket.join('ambulance');
      }
      console.log(`Socket ${socket.id} joined rooms:`, Array.from(socket.rooms));
    });

    socket.on('update_location', (data) => {
      if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
        connectedUsers.set(socket.id, { 
          lat: data.lat, 
          lng: data.lng, 
          role: data.role || 'user', 
          providerType: data.providerType || null 
        });
        broadcastProviders();
      }
    });

    socket.on('send_chat_message', (msg) => {
      console.log(`Chat Message:`, msg);
      // Broadcast to everyone else for the prototype (ideally target specifically)
      socket.broadcast.emit('chat_message', msg);
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      broadcastProviders();
    });
  });

  return io;
};

const notifyNearbyUsers = (io, incident) => {
  if (!incident || !incident.location) return;
  const incidentLat = incident.location.lat;
  const incidentLng = incident.location.lng;
  const type = incident.type;

  // 1. Alert ALL Admins
  io.to('admin').emit('red_alert', incident);

  // 2. Alert Specific Service Providers (The Brain Routing)
  console.log(`Routing Incident Type: ${type}`);
  if (type === 'fire') {
    console.log('Emitting to fire_engine room');
    io.to('fire_engine').emit('red_alert', incident);
  } else if (type === 'medical' || type === 'accident') {
    console.log('Emitting to ambulance rooms');
    io.to('gov_ambulance').emit('red_alert', incident);
    io.to('private_ambulance').emit('red_alert', incident);
  } else if (type === 'crime' || type === 'other') {
    console.log('Emitting to police room');
    io.to('police').emit('red_alert', incident);
  }

  // 3. Alert Regular Users within 5km Radius
  for (const [socketId, userLoc] of connectedUsers.entries()) {
    if (userLoc.role === 'user') {
      const distance = calculateDistance(incidentLat, incidentLng, userLoc.lat, userLoc.lng);
      if (distance <= 5) {
        io.to(socketId).emit('red_alert', incident);
      }
    }
  }
};

module.exports = { initSocket, notifyNearbyUsers };
