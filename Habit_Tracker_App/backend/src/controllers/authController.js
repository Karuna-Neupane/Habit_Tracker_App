// AuthController — Week 5
// Handles registration and login. Follows the Week 5 tutorial pattern:
//   register -> hash password with bcrypt, save user
//   login    -> compare password with bcrypt, sign a JWT on success
//
// The JWT payload carries just enough to identify the user on later
// requests (id, email, name). verifyToken middleware decodes this and
// attaches it to req.user so every route can scope data to the right user.

const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User   = require('../models/User');

const TOKEN_EXPIRES_IN = '7d';

function signToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

function publicUser(user) {
  return {
    id:    String(user._id),
    name:  user.name,
    email: user.email,
  };
}

// ── POST /api/auth/register ─────────────────────────────────────────────────
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    // Hash the password before it ever touches the database (item 1).
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name:  name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    const token = signToken(newUser);
    res.status(201).json({ message: 'Registered successfully', token, user: publicUser(newUser) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }
    res.status(400).json({ message: err.message });
  }
};

// ── POST /api/auth/login ────────────────────────────────────────────────────
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // password has `select: false` on the schema, so it must be explicitly requested.
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const token = signToken(user);
    res.status(200).json({ message: 'Login successful', token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
// Lets the frontend restore a session on page load: send the stored token,
// get back the current user (or 401 if the token is missing/expired/invalid).
// verifyToken middleware has already run and attached req.user by this point.
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
