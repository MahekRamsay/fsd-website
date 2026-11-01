// DonorResponse.js – tracks which donor responded to which request
// The compound unique index prevents a donor from responding twice to the same request
const mongoose = require('mongoose');

const donorResponseSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Prevent duplicate responses (same donor, same request)
donorResponseSchema.index({ request: 1, donor: 1 }, { unique: true });

module.exports = mongoose.model('DonorResponse', donorResponseSchema);
