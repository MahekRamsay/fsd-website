// index.js – single import point for all models
module.exports = {
  User: require('./User'),
  BloodRequest: require('./BloodRequest'),
  DonorResponse: require('./DonorResponse'),
};
