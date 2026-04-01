const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Please add an incident type'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Please add latitude'],
      },
      lng: {
        type: Number,
        required: [true, 'Please add longitude'],
      },
    },
    severity: {
      type: String,
      required: [true, 'Please add severity'],
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending',
    },
    mediaData: {
      type: String,
      default: null,
    },
    contactNumber: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

module.exports = mongoose.model('Incident', incidentSchema);
