// controllers/donors.js – update own profile and list available donors
const mongoose = require('mongoose');
const { User } = require('../models');

// PUT /api/donors/me – donor updates their own profile
async function updateProfile(req, res, next) {
  try {
    const allowed = ['name', 'phone', 'city', 'bloodGroup', 'lastDonationDate', 'isAvailable'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// GET /api/donors?bloodGroup=&city= – search available donors (hospital/admin)
async function listDonors(req, res, next) {
  try {
    const filter = { role: 'donor', isAvailable: true };
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
    if (req.query.city) filter.city = new RegExp(req.query.city, 'i'); // case-insensitive

    const donors = await User.find(filter).select('-__v');
    res.json({ donors });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateProfile, listDonors };
