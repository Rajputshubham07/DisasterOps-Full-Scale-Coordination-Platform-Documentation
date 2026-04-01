const express = require('express');
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Fix Atlas querySrv ECONNREFUSED issues
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const incidentRoutes = require('./routes/incidentRoutes');
const authRoutes = require('./routes/authRoutes');
const { initSocket } = require('./sockets');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);
app.set('io', io); // make it accessible in routes/controllers

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mount routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/auth', authRoutes);

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('Disaster Incidents API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

const PORT = 5005;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
