// Express App Configuration
// CORS allows both Vite (5173) and any other local origin.
// MongoDB is connected in server.js before this app is used.
// /api/auth is public; /api/habits requires a valid JWT (verifyToken).

const express = require('express');
const cors = require('cors');
const habitRoutes = require('./routes/habitRoutes');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const verifyToken = require('./middleware/verifyToken');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS — allow the Vite dev server (port 5173) and production origin
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON request bodies
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode}`);
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    status: 'ok',
    message: 'Habit Tracker API running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Routes
// Auth routes are public (register/login issue the token in the first place).
app.use('/api/auth', authRoutes);
// Every /api/habits route requires a valid JWT.
app.use('/api/habits', verifyToken, habitRoutes);
// AI Coach also requires a valid JWT — it reads the caller's own habits.
app.use('/api/ai', verifyToken, aiRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
