// Auth Middleware — Week 5
// Verifies the JWT sent in the Authorization header (`Bearer <token>`) on
// every protected request. On success it attaches the decoded payload to
// req.user (id, name, email) so downstream controllers can scope data —
// e.g. habitController only ever queries `Habit.find({ userId: req.user.id })`.
//
// Applied to all /api/habits routes in app.js (item 2 of the Week 5 tutorial).

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied: no token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyToken;
