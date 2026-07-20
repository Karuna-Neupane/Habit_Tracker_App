// Server Entry Point — Week 4
// Loads environment variables, connects to MongoDB, then starts HTTP server.
// Following Tutorial PDF pattern: server.js starts the app, src/app.js configures it.

require('dotenv').config(); // Must be first — loads MONGO_URI, PORT, etc.

const app       = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('─────────────────────────────────────────────');
    console.log(`  Habit Tracker API`);
    console.log(`  http://localhost:${PORT}`);
    console.log('─────────────────────────────────────────────');
    console.log('  Endpoints:');
    console.log(`  POST   /api/auth/register`);
    console.log(`  POST   /api/auth/login`);
    console.log(`  GET    /api/auth/me`);
    console.log(`  GET    /api/habits`);
    console.log(`  POST   /api/habits`);
    console.log(`  PUT    /api/habits/:id`);
    console.log(`  DELETE /api/habits/:id`);
    console.log(`  POST   /api/habits/:id/complete`);
    console.log(`  DELETE /api/habits/:id/complete`);
    console.log(`  GET    /api/habits/:id/history`);
    console.log('─────────────────────────────────────────────');
  });
});
