// User.js – stores donors, hospitals, and the single admin account
// passwordHash is hidden from all queries by default (select: false)
const mongoose = require('mongoose');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false means passwordHash is NEVER returned unless explicitly asked
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['donor', 'hospital', 'admin'], required: true },
    phone: { type: String, trim: true },
    city: { type: String, trim: true },
    // bloodGroup and donor-specific fields are only meaningful for donors
    bloodGroup: { type: String, enum: BLOOD_GROUPS },
    lastDonationDate: { type: Date },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
