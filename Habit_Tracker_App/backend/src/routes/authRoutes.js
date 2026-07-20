// Auth Routes — Week 5
// Public: register, login. Protected: /me (used by the frontend to restore
// a session from a stored token on page load).

const express     = require('express');
const router      = express.Router();
const AuthController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

router.post('/register', AuthController.registerUser);
router.post('/login', AuthController.loginUser);
router.get('/me', verifyToken, AuthController.getCurrentUser);

module.exports = router;
