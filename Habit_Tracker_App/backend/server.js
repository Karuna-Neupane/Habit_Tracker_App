// ─── Server Entry Point ───────────────────────────────────────────────────────
// Imports the configured Express app and binds it to a port.
// Keeping this separate from app.js means the app can be tested without
// starting a real server. (Tutorial PDF pattern)

const app  = require('./src/app');
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('─────────────────────────────────────────');
  console.log(` Habit Tracker API`);
  console.log(` http://localhost:${port}`);
  console.log('─────────────────────────────────────────');
  console.log(' Endpoints:');
  console.log(`   GET    /api/habits`);
  console.log(`   GET    /api/habits/:id`);
  console.log(`   POST   /api/habits`);
  console.log(`   PUT    /api/habits/:id`);
  console.log(`   DELETE /api/habits/:id`);
  console.log(`   POST   /api/habits/:id/complete`);
  console.log(`   DELETE /api/habits/:id/complete`);
  console.log(`   GET    /api/habits/:id/history`);
  console.log('─────────────────────────────────────────');
});
