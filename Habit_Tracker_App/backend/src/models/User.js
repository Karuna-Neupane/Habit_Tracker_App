// Mongoose User Schema 
// Stores registered users. Passwords are NEVER stored in plain text —
// AuthController hashes them with bcrypt before saving. 
// This document's _id is what every Habit gets tagged
// with as `userId`, which is how habit lists stay private per user.

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be 50 characters or fewer'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    // Data URL (small, client-resized image) or a plain image URL. Optional —
    // the frontend falls back to the user's initial when this is empty.
    avatarUrl: {
      type: String,
      default: '',
    },

    // Stored as a bcrypt hash — see AuthController.registerUser.
    // Not required for accounts created via Google Sign-In (see googleId below) —
    // those users never set a local password unless they later use "forgot password".
    password: {
      type: String,
      required: [
        function () {
          return !this.googleId;
        },
        'Password is required',
      ],
      minlength: 6,
      select: false, // never return the hash unless explicitly requested
    },

    // Google Sign-In 
    // Set when the account was created (or linked) via "Continue with Google".
    // This is Google's stable, unique subject id ("sub" claim) for the user —
    // used to find the account on subsequent Google logins without relying on
    // email matching alone.
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows many docs with no googleId at all
      select: false,
    },

    // Forgot-password flow 
    // The 6-digit code emailed to the user is never stored in plain text —
    // only its bcrypt hash, same treatment as the password itself. Both
    // fields are cleared the moment the code is used (or a fresh one is
    // requested), so a code is valid exactly once and only until it expires.
    resetCodeHash: {
      type: String,
      select: false,
      default: null,
    },
    resetCodeExpires: {
      type: Date,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);
