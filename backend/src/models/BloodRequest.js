// BloodRequest.js – a hospital's request for a specific blood group
// status progresses: open → fulfilled or closed
const mongoose = require('mongoose');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const bloodRequestSchema = new mongoose.Schema(
  {
    // hospital is a reference to the User who created this request
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    units: { type: Number, min: 1, max: 20, required: true },
    city: { type: String, required: true, trim: true },
    urgency: { type: String, enum: ['normal', 'urgent', 'critical'], default: 'normal' },
    note: { type: String, trim: true },
    status: { type: String, enum: ['open', 'fulfilled', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
