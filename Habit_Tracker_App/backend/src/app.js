const express = require('express');
const cors = require('cors');
const habitRoutes = require('./routes/habitRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();


app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON request bodies (app.use(express.json()))
app.use(express.json());

// Request logger (dev only) — prints METHOD /path STATUS in the terminal
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    res.on('finish', () => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode}`);
    });
    next();
  });
}

// Health check 
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Habit Tracker API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes at /api/habits 
// (app.use('/tasks', taskRoutes) pattern)
app.use('/api/habits', habitRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

app.use(errorHandler);

module.exports = app;
