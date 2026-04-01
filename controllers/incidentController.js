const Incident = require('../models/Incident');

// @desc    Create a new incident
// @route   POST /api/incidents
// @access  Public
const createIncident = async (req, res) => {
  try {
    const { type, description, location, severity, mediaData, contactNumber } = req.body;

    // Basic validation
    if (!type || !description || !location || location.lat === undefined || location.lng === undefined || !severity) {
      return res.status(400).json({ message: 'Please provide all required fields (type, description, location.lat, location.lng, severity)' });
    }

    const validSeverities = ['low', 'medium', 'high'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ message: `Invalid severity. Valid severities are: ${validSeverities.join(', ')}` });
    }

    const incident = await Incident.create({
      type,
      description,
      location,
      severity,
      mediaData,
      contactNumber
    });

    // Broadcast new incident globally for the dashboard, and red alerts to nearby users
    const io = req.app.get('io');
    if (io) {
      io.emit('new_incident', incident);
      const { notifyNearbyUsers } = require('../sockets');
      notifyNearbyUsers(io, incident);
    }

    res.status(201).json(incident);
  } catch (error) {
    console.error(`Error creating incident: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all incidents
// @route   GET /api/incidents
// @access  Public
const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.status(200).json(incidents);
  } catch (error) {
    console.error(`Error fetching incidents: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update incident status
// @route   PUT /api/incidents/:id/status
// @access  Public
const updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['pending', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const incident = await Incident.findByIdAndUpdate(id, { status }, { new: true });
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    // Notify ALL admins and relevant provider about status change via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('status_updated', incident);
    }

    res.status(200).json(incident);
  } catch (error) {
    console.error(`Error updating status: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createIncident,
  getIncidents,
  updateIncidentStatus,
};
