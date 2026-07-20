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

// Forgot password — 3-step flow, all public (no token yet at this point).
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-reset-code', AuthController.verifyResetCode);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
