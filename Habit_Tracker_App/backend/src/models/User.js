// Mongoose User Schema — Week 5
// Stores registered users. Passwords are NEVER stored in plain text —
// AuthController hashes them with bcrypt before saving (see item 1 of the
// Week 5 tutorial). This document's _id is what every Habit gets tagged
// with as `userId`, which is how habit lists stay private per user.

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be 50 characters or fewer'],
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      trim:      true,
      lowercase: true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    // Stored as a bcrypt hash — see AuthController.registerUser.
    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: 6,
      select:   false, // never return the hash unless explicitly requested
    },

    // ── Forgot-password flow ────────────────────────────────────────────
    // The 6-digit code emailed to the user is never stored in plain text —
    // only its bcrypt hash, same treatment as the password itself. Both
    // fields are cleared the moment the code is used (or a fresh one is
    // requested), so a code is valid exactly once and only until it expires.
    resetCodeHash: {
      type:    String,
      select:  false,
      default: null,
    },
    resetCodeExpires: {
      type:    Date,
      select:  false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);
