// Mongoose Habit Schema — Week 4/5
// Real MongoDB document schema.
//
// Schema shape:
//   { name, frequency, completions: [String "YYYY-MM-DD"], userId }
//
// completions are stored as "YYYY-MM-DD" strings (not Date objects) so they
// round-trip cleanly to the frontend without timezone conversion issues.
// userId (Week 5) ties every habit to exactly one User — this is what makes
// habit lists private per account.

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

    // Week 5, item 3: every habit belongs to exactly one user. Set from
    // req.user.id (decoded off the JWT by verifyToken) — never from the
    // request body, so a user can never create/see a habit under someone
    // else's id.
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'userId is required'],
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields (Tutorial PDF pattern)
    timestamps: true,
  }
);

// Fast lookups of "all habits for this user" — every query in the
// controller filters by userId, so this index is on the hot path.
HabitSchema.index({ userId: 1 });
// A user can't have two habits with the same name (case-insensitive is
// enforced in the controller) — scoped per-user, not globally.
HabitSchema.index({ userId: 1, name: 1 }, { unique: false });

// Virtual: streak computed from completions (not stored in DB — always derived).
// We compute it in the controller using the same streak utility as before.

module.exports = mongoose.model('Habit', HabitSchema);
