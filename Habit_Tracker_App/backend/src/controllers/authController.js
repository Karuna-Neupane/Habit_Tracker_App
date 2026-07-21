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
const crypto = require('crypto');
const User   = require('../models/User');
const Habit  = require('../models/Habit');
const { sendResetCodeEmail } = require('../utils/mailer');

const TOKEN_EXPIRES_IN       = '7d';
const RESET_CODE_TTL_MINUTES = 10;
const RESET_TOKEN_EXPIRES_IN = '10m';

function signToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

function publicUser(user) {
  return {
    id:        String(user._id),
    name:      user.name,
    email:     user.email,
    avatarUrl: user.avatarUrl || '',
    createdAt: user.createdAt,
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

// ─────────────────────────────────────────────────────────────────────────────
// Forgot password — 3-step flow:
//   1. POST /forgot-password    { email }               -> emails a 6-digit code
//   2. POST /verify-reset-code  { email, code }          -> returns a short-lived resetToken
//   3. POST /reset-password     { resetToken, password } -> sets new password, logs the user in
//
// The code itself is never trusted twice: verifying it issues a resetToken
// (a JWT scoped to purpose: 'password-reset', 10-minute expiry) which is what
// step 3 actually requires — so even if someone captured the code in transit,
// it's useless once step 2 has already consumed it into a token.
// ─────────────────────────────────────────────────────────────────────────────

function signResetToken(user) {
  return jwt.sign(
    { id: user._id, purpose: 'password-reset' },
    process.env.JWT_SECRET,
    { expiresIn: RESET_TOKEN_EXPIRES_IN }
  );
}

// ── POST /api/auth/forgot-password ──────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Always respond the same way whether or not the account exists, so this
    // endpoint can't be used to check which emails are registered.
    const genericResponse = {
      message: 'If that email is registered, a reset code has been sent.',
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // 6-digit numeric code, e.g. "042917". Stored only as a bcrypt hash —
    // same treatment as the account password.
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    user.resetCodeHash    = await bcrypt.hash(code, 10);
    user.resetCodeExpires = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);
    await user.save();

    await sendResetCodeEmail(user.email, code);

    res.status(200).json(genericResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/verify-reset-code ────────────────────────────────────────
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required.' });
    }

    const user = await User
      .findOne({ email: email.trim().toLowerCase() })
      .select('+resetCodeHash +resetCodeExpires');

    const invalid = () => res.status(400).json({ message: 'Invalid or expired code.' });

    if (!user || !user.resetCodeHash || !user.resetCodeExpires) return invalid();
    if (user.resetCodeExpires.getTime() < Date.now())            return invalid();

    const isMatch = await bcrypt.compare(code, user.resetCodeHash);
    if (!isMatch) return invalid();

    res.status(200).json({ resetToken: signResetToken(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/reset-password ───────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, password, confirmPassword } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({ message: 'Reset token and new password are required.' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Reset link expired. Please request a new code.' });
    }
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token.' });
    }

    const user = await User.findById(decoded.id).select('+resetCodeHash +resetCodeExpires +password');
    if (!user || !user.resetCodeHash) {
      // Code already used (or never requested) — the reset token alone isn't enough.
      return res.status(400).json({ message: 'This reset link has already been used. Please request a new code.' });
    }

    // Don't let the "new" password just be the old one again.
    const sameAsOld = await bcrypt.compare(password, user.password);
    if (sameAsOld) {
      return res.status(400).json({ message: 'New password must be different from your old password.' });
    }

    user.password         = await bcrypt.hash(password, 10);
    user.resetCodeHash    = null;
    user.resetCodeExpires = null;
    await user.save();

    // Log the user straight in, matching the normal login response shape,
    // so the frontend can redirect straight to the dashboard.
    const token = signToken(user);
    res.status(200).json({ message: 'Password reset successful', token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Profile — Week 6: update profile, change password, delete account.
// All three require verifyToken, so req.user.id is always the caller's own id.
// ─────────────────────────────────────────────────────────────────────────────

// ── PUT /api/auth/profile ───────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatarUrl } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: 'Name cannot be empty.' });
      user.name = name.trim();
    }

    // Small data-URL image (resized client-side) or a plain image URL.
    // Cap length defensively — avatarUrl is not meant to hold a full-size photo.
    if (avatarUrl !== undefined) {
      if (avatarUrl.length > 2_000_000) {
        return res.status(400).json({ message: 'Image is too large. Please choose a smaller picture.' });
      }
      user.avatarUrl = avatarUrl;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated', user: publicUser(user) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PUT /api/auth/password ──────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }
    if (confirmNewPassword !== undefined && newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'New passwords do not match.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // Don't let the "new" password just be the old one again.
    const sameAsOld = await bcrypt.compare(newPassword, user.password);
    if (sameAsOld) {
      return res.status(400).json({ message: 'New password must be different from your current password.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/auth/account ────────────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Enter your password to confirm account deletion.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // Cascade delete — a user's habits are meaningless (and inaccessible)
    // without the account they're scoped to.
    await Habit.deleteMany({ userId: user._id });
    await user.deleteOne();

    res.status(200).json({ message: 'Account deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
