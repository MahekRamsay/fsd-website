// controllers/auth.js – register, login, and get-current-user
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Sign a JWT that expires in 1 day
function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, role, phone, city, bloodGroup } = req.body;

    // Only donors and hospitals can self-register; admin is seeded
    if (!['donor', 'hospital'].includes(role)) {
      return res.status(400).json({ message: 'Role must be donor or hospital' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role, phone, city, bloodGroup });

    const token = signToken(user);
    // Return safe user object (no hash)
    const safe = user.toObject();
    delete safe.passwordHash;

    res.status(201).json({ token, user: safe });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Explicitly select passwordHash since it's hidden by default
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    const safe = user.toObject();
    delete safe.passwordHash;

    res.json({ token, user: safe });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  // req.user already attached by authMiddleware
  res.json({ user: req.user });
}

module.exports = { register, login, getMe };
