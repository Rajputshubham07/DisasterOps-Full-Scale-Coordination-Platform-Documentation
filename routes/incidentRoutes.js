const express = require('express');
const router = express.Router();
const {
  createIncident,
  getIncidents,
  updateIncidentStatus,
} = require('../controllers/incidentController');

router.route('/').post(createIncident).get(getIncidents);
router.route('/:id/status').put(updateIncidentStatus);

module.exports = router;
