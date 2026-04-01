# Disaster Incidents API

## Overview
A Node.js backend using Express.js and MongoDB to manage disaster incidents.

### Project Structure
```text
.
├── config
│   └── db.js                        # MongoDB Mongoose connection
├── controllers
│   └── incidentController.js        # Logic for creating/fetching incidents
├── models
│   └── Incident.js                  # Mongoose Schema
├── routes
│   └── incidentRoutes.js            # Express API Routes
├── .env                             # Environment Variables
├── package.json                     # Project Configuration
├── sockets                          # Real-time event handlers
└── server.js                        # Entry point
```

---

## 🛑 Problem Statement
Traditional disaster response systems are often fragmented and slow. Lack of real-time communication between victims and rescuers leads to:
- **Delayed Intervention**: Crucial minutes lost in manual reporting.
- **Information Gap**: Lack of visual proof for responders to assess severity.
- **Coordination Chaos**: Difficulty in routing incidents to the nearest available service.

## 💡 Our Solution: Shubhshastra
**Shubhshastra** is an agentic disaster response system designed to bridge the gap between incident reporting and emergency action. It provides:
- **Instant Reporting**: One-tap SOS with geo-coordinates.
- **Visual Evidence**: Support for "Visual Proof" to verify and triage incidents.
- **Intelligent Routing**: Real-time broadcast to nearby providers and oversight by administrators.

## 🏗️ System Architecture
The platform follows a robust full-stack architecture:
1.  **Frontend**: React (Vite) for a high-performance, responsive UI.
2.  **State & Map**: Leaflet for geospatial tracking and Socket.IO-Client for real-time updates.
3.  **Backend**: Node.js/Express.js handling business logic and RESTful communication.
4. **Database**: MongoDB (Mongoose) for scalable document storage and a CSV-based Excel mapping for lightweight authentication.
5. **Comms**: Socket.IO for persistent, bi-directional event emission (broadcast alerts, live chat).

## 🔄 Workflow Diagram
```mermaid
graph TD
    Citizen[Citizen / Victim] -- "1. Reports SOS (Location + Media)" --> Backend[Backend - Express & Sockets]
    Backend -- "2. Persists Incident" --> DB[(MongoDB Database)]
    Backend -- "3. Real-time Broadcast (Red Alert)" --> Responder[Service Provider / Responder]
    Backend -- "4. Live Update Dashboard" --> Admin[Administrator]
    Responder -- "5. Accepts Incident & Dispatched" --> Backend
    Admin -- "6. Monitors & Coordinates" --> Backend
```

## 🛠️ Technology Stack
- **Languages**: JavaScript (Node.js, React)
- **Styling**: CSS with a focus on premium, dynamic UI.
- **Maps**: Leaflet/React-Leaflet
- **Real-time**: Socket.IO
- **Database**: MongoDB & Mongoose
- **Icons/UI**: Lucide React

## ✨ Key Features & Impact
- 🚨 **Real-time Red Alerts**: Immediate notification to all responders within the radius.
- 📸 **Visual Proof Verification**: SOS reports include media proof for authenticity.
- 🗺️ **Live Incident Dashboard**: Admin view of all active disasters and provider status.
- 👮 **Role-Based Access**: Specialized interfaces for Admin, Provider, and Citizen.
- 💬 **Live Responder Chat**: Direct, real-time messaging between victims and service providers.
- 📞 **Direct Phone Integration**: One-click calling from the responder interface directly to the victim's verified contact number.
- 📊 **Excel-Based Authentication**: Seamless login and registration with data persisted in a `users.csv` for easy analysis and session security.
- **Impact**: Significant reduction in "First Response Time" (FRT) through automated workflows.

## 🚀 Future Scope & Conclusion
### Future Scope
- **AI Triage**: Automated severity assessment using computer vision on uploaded media.
- **Offline SMS SOS**: Ability to report incidents without an active internet connection.
- **Emergency Hubs**: Integration with government healthcare and fire services.
- **Predictive Analytics**: Using historical data to predict flood or fire-prone zones.

### Conclusion
Shubhshastra is more than just an app; it's a lifeline. By leveraging modern tech like real-time sockets and geospatial mapping, we ensure that help is always just a "shastra" (instrument) away.

---

## Running the Backend

1. **Verify Environment Variables**
   Ensure your `.env` contains:
   ```env
   PORT=5005
   MONGO_URI=mongodb+srv://shubhamsingh164572_db_user:Shubham164573_01@cluster0.zntyhwd.mongodb.net/?appName=Cluster0
   ```
   *(Ensure MongoDB is running locally, or replace the URI with a MongoDB Atlas cluster URI).*

2. **Start the Application**
   For local development (auto-reloads on edits):
   ```bash
   npm run dev
   ```

   For standard runtime:
   ```bash
   npm start
   ```

3. **Verify Up status**
   You'll see:
   ```text
   Server running on port 5005
   MongoDB Connected: Cluster0
   ```

---

## Testing API Endpoints

### 1. Create a New Incident (POST)

**Endpoint:** `POST /api/incidents`

**Schema Requirements:**
- `type`: 'fire', 'flood', 'accident', 'earthquake', 'other'
- `severity`: 'low', 'medium', 'high'
- `description`: String
- `location.lat`: Number
- `location.lng`: Number

**Curl Command:**
```bash
curl -X POST http://localhost:5005/api/incidents \
-H "Content-Type: application/json" \
-d '{
  "type": "fire",
  "description": "Large forest fire spreading quickly.",
  "location": {
    "lat": 34.0522,
    "lng": -118.2437
  },
  "severity": "high"
}'
```

### 2. Get All Incidents (GET)

**Endpoint:** `GET /api/incidents`

**Curl Command:**
```bash
curl http://localhost:5005/api/incidents
```
