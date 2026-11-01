// controllers/requests.js – CRUD for blood requests and donor responses
const mongoose = require('mongoose');
const { BloodRequest, DonorResponse, User } = require('../models');

// Validate that a string is a valid MongoDB ObjectId
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// POST /api/requests – hospital creates a new blood request
async function createRequest(req, res, next) {
  try {
    const { bloodGroup, units, city, urgency, note } = req.body;
    const request = await BloodRequest.create({
      hospital: req.user._id,
      bloodGroup,
      units,
      city,
      urgency,
      note,
    });

    // Populate hospital name for the real-time event payload
    await request.populate('hospital', 'name city');

    // Emit real-time event to all donors with the same blood group
    const io = req.app.get('io');
    if (io) {
      io.to(`group_${bloodGroup}`).emit('request:new', {
        requestId: request._id,
        bloodGroup,
        units,
        city,
        urgency,
        hospitalName: request.hospital.name,
      });
    }

    res.status(201).json({ request });
  } catch (err) {
    next(err);
  }
}

// GET /api/requests – list requests with optional filters
async function listRequests(req, res, next) {
  try {
    const filter = {};
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
    if (req.query.city) filter.city = new RegExp(req.query.city, 'i');
    if (req.query.status) filter.status = req.query.status;
    // mine=true returns only the current hospital's own requests
    if (req.query.mine === 'true') filter.hospital = req.user._id;

    const requests = await BloodRequest.find(filter)
      .populate('hospital', 'name city')
      .sort({ createdAt: -1 });

    // Attach response count so the list view doesn't need extra queries
    const withCounts = await Promise.all(
      requests.map(async r => {
        const count = await DonorResponse.countDocuments({ request: r._id });
        return { ...r.toObject(), responseCount: count };
      })
    );

    res.json({ requests: withCounts });
  } catch (err) {
    next(err);
  }
}

// GET /api/requests/:id – single request detail
async function getRequest(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid request ID' });

    const request = await BloodRequest.findById(req.params.id).populate('hospital', 'name city phone');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const responseCount = await DonorResponse.countDocuments({ request: request._id });
    res.json({ request: { ...request.toObject(), responseCount } });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/requests/:id/status – hospital owner or admin changes status
async function updateStatus(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid request ID' });

    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only the owning hospital or an admin can change status
    const isOwner = request.hospital.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    request.status = req.body.status;
    await request.save();
    res.json({ request });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/requests/:id
async function deleteRequest(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid request ID' });

    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const isOwner = request.hospital.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await request.deleteOne();
    await DonorResponse.deleteMany({ request: request._id }); // cleanup responses
    res.json({ message: 'Request deleted' });
  } catch (err) {
    next(err);
  }
}

// POST /api/requests/:id/respond – donor clicks "I can donate"
async function respondToRequest(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid request ID' });

    const request = await BloodRequest.findById(req.params.id).populate('hospital', '_id name');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'open') {
      return res.status(400).json({ message: 'This request is no longer open' });
    }

    try {
      await DonorResponse.create({ request: request._id, donor: req.user._id });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: 'Already responded to this request' });
      throw err;
    }

    // Notify the hospital in real time
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${request.hospital._id}`).emit('request:response', {
        requestId: request._id,
        donorName: req.user.name,
        bloodGroup: req.user.bloodGroup,
      });
    }

    res.status(201).json({ message: 'Response recorded' });
  } catch (err) {
    next(err);
  }
}

// GET /api/requests/:id/responses – list donors who responded (hospital/admin)
async function getResponses(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid request ID' });

    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only owner hospital or admin
    const isOwner = request.hospital.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const responses = await DonorResponse.find({ request: req.params.id })
      .populate('donor', 'name phone city bloodGroup');

    res.json({ responses });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRequest, listRequests, getRequest,
  updateStatus, deleteRequest, respondToRequest, getResponses,
};
