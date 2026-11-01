// sockets/index.js – real-time layer using socket.io
// Clients must send their JWT in the handshake auth; invalid tokens are rejected
const jwt = require('jsonwebtoken');
const { User } = require('../models');

function initSockets(io) {
  // Middleware: verify JWT before allowing connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user; // attach for use in event handlers
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', socket => {
    const user = socket.user;
    console.log(`🔌 Socket connected: ${user.name} (${user.role})`);

    // Every user gets their own private room for direct notifications
    socket.join(`user_${user._id}`);

    // Donors join a blood-group room so hospitals can broadcast to matching donors
    if (user.role === 'donor' && user.bloodGroup) {
      socket.join(`group_${user.bloodGroup}`);
    }

    // Admins get a dedicated room (reserved for future admin broadcasts)
    if (user.role === 'admin') {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${user.name}`);
    });
  });
}

module.exports = initSockets;
