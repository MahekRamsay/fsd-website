// server.js – starts HTTP server, attaches socket.io, connects to DB, auto-seeds
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const initSockets = require('./sockets');

// Refuse to start in production without a strong JWT secret
if (process.env.NODE_ENV === 'production') {
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 16) {
    console.error('❌ JWT_SECRET must be at least 16 characters in production');
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io – allow same origins as Express CORS
const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(o => o.trim());
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

// Make io accessible inside controllers via req.app.get('io')
app.set('io', io);

initSockets(io);

async function start() {
  await connectDB();

  // Auto-seed on very first startup (no admin user in DB)
  const { User } = require('./models');
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    console.log('🌱 No admin found – running seed…');
    require('./seed');
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

start();
