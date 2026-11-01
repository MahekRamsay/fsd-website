// db.js – connects Mongoose to MongoDB with retry logic
// We retry up to 10 times so the app survives a slow Docker startup
const mongoose = require('mongoose');

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

async function connectDB(retries = MAX_RETRIES) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    if (retries > 0) {
      console.warn(`⚠️  MongoDB connection failed. Retrying in ${RETRY_DELAY_MS / 1000}s… (${retries} left)`);
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      return connectDB(retries - 1);
    }
    console.error('❌ Could not connect to MongoDB after multiple retries:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
