// ─── Global Error Handler Middleware ─────────────────────────────────────────
// Catches anything thrown or passed to next(err) in routes/controllers.
// Express recognises a 4-argument middleware as an error handler.
//
// Placed LAST in app.js after all routes.

const errorHandler = (err, req, res, next) => {
  console.error('[ErrorHandler]', err.stack || err.message);

  // SyntaxError from express.json() when body is malformed JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message    = statusCode < 500 ? err.message : 'Internal server error.';

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
