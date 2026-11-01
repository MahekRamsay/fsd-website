// controllers/admin.js – admin-only dashboard stats and user management
const { User, BloodRequest, DonorResponse } = require('../models');

// GET /api/admin/stats – counts for the dashboard
async function getStats(req, res, next) {
  try {
    const [totalDonors, totalHospitals, openRequests, fulfilledRequests] = await Promise.all([
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'hospital' }),
      BloodRequest.countDocuments({ status: 'open' }),
      BloodRequest.countDocuments({ status: 'fulfilled' }),
    ]);
    res.json({ totalDonors, totalHospitals, openRequests, fulfilledRequests });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/users – list all users (never return passwordHash)
async function listUsers(req, res, next) {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/users/:id – admin deletes a user (cannot delete self)
async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, listUsers, deleteUser };
