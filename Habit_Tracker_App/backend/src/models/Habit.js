// Mongoose Habit Schema — Week 4
// Replaces the JSON-file model with a real MongoDB document schema.
//
// Schema shape (Week 4, item 1):
//   { name, frequency, completions: [String "YYYY-MM-DD"], userId }
//
// completions are stored as "YYYY-MM-DD" strings (not Date objects) so they
// round-trip cleanly to the frontend without timezone conversion issues.
// userId is stored for future auth integration — optional for now.

const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Habit name is required'],
      trim:      true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [60, 'Name must be 60 characters or fewer'],
    },

    frequency: {
      type:    String,
      enum:    {
        values:  ['daily', 'weekly'],
        message: 'Frequency must be daily or weekly',
      },
      default: 'daily',
    },

    // Array of "YYYY-MM-DD" date strings — one per completed day.
    // Stored as strings so no timezone drift between server and client.
    completions: {
      type:    [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)),
        message:   'Each completion must be a valid YYYY-MM-DD date string',
      },
    },

    // Reserved for future backend auth (Week 5+).
    // Optional now — the frontend's localStorage auth doesn't send a userId yet.
    userId: {
      type:    String,
      default: null,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields (Tutorial PDF pattern)
    timestamps: true,
  }
);

// Ensure a user can't have two habits with the same name (case-insensitive).
// Since userId is null for now, this is a global uniqueness check.
HabitSchema.index({ name: 1 }, { unique: false }); // non-unique — controller enforces it

// Virtual: streak computed from completions (not stored in DB — always derived).
// We compute it in the controller using the same streak utility as before.

module.exports = mongoose.model('Habit', HabitSchema);
