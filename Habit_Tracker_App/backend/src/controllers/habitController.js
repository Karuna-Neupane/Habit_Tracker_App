// Controller — Week 5: every operation is scoped to req.user.id (attached
// by the verifyToken middleware, applied to all /api/habits routes in
// app.js). This is the enforcement point for private, per-user habit lists:
//   - list/read only ever query { userId: req.user.id }
//   - create always stamps the new habit with userId: req.user.id
//   - update/delete/complete look the habit up by { _id, userId } together,
//     so a user can never touch another user's habit even if they guess
//     its Mongo _id.
//
// The streak is NEVER stored in the database — it is always computed from
// the live completions array returned from MongoDB, exactly like before.

const Habit      = require('../models/Habit');
const { computeStreak, todayKey, isValidDateKey } = require('../utils/streak');

// Attach computed streak to a Mongoose document before sending to client.
// We call .toObject() so the result is a plain JS object (not a Mongoose doc).
function withStreak(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  // Rename _id → id so the frontend doesn't need to change
  obj.id  = String(obj._id);
  delete obj._id;
  delete obj.__v;
  delete obj.userId; // internal — no need to ship it back to the client
  obj.streak = computeStreak(obj.completions, obj.frequency);
  return obj;
}

// ── GET /api/habits ─────────────────────────────────────────────────────────
exports.getAllHabits = async (req, res) => {
  try {
    const docs   = await Habit.find({ userId: req.user.id }).sort({ createdAt: 1 });
    const habits = docs.map(withStreak);
    res.status(200).json({ count: habits.length, habits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/habits/:id ─────────────────────────────────────────────────────
exports.getHabitById = async (req, res) => {
  try {
    const doc = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Habit not found.' });
    res.status(200).json(withStreak(doc));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/habits ────────────────────────────────────────────────────────
exports.createHabit = async (req, res) => {
  try {
    const { name, frequency } = req.body;

    // Duplicate name check (case-insensitive), scoped to this user only —
    // two different users are free to both have a habit called "Read".
    const exists = await Habit.findOne({
      userId: req.user.id,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });
    if (exists) {
      return res.status(409).json({ message: `A habit named "${name}" already exists.` });
    }

    const doc = await Habit.create({ name: name.trim(), frequency, userId: req.user.id });
    res.status(201).json(withStreak(doc));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PUT /api/habits/:id ─────────────────────────────────────────────────────
exports.updateHabit = async (req, res) => {
  try {
    const { name, frequency } = req.body;

    // If renaming, check the new name isn't taken by a different habit
    // belonging to this same user.
    if (name) {
      const exists = await Habit.findOne({
        userId: req.user.id,
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id:  { $ne: req.params.id },
      });
      if (exists) {
        return res.status(409).json({ message: `A habit named "${name}" already exists.` });
      }
    }

    const updates = {};
    if (name)      updates.name      = name.trim();
    if (frequency) updates.frequency = frequency;

    const doc = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ message: 'Habit not found.' });
    res.status(200).json(withStreak(doc));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── DELETE /api/habits/:id ───────────────────────────────────────────────────
exports.deleteHabit = async (req, res) => {
  try {
    const doc = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Habit not found.' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/habits/:id/complete ───────────────────────────────────────────
exports.completeHabit = async (req, res) => {
  try {
    const date = req.body.date || todayKey();

    if (!isValidDateKey(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const doc = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Habit not found.' });

    if (doc.completions.includes(date)) {
      return res.status(409).json({
        message: `Already completed on ${date}. Each day can only be marked once.`,
      });
    }

    doc.completions = [...doc.completions, date].sort();
    await doc.save();

    res.status(200).json(withStreak(doc));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/habits/:id/complete ─────────────────────────────────────────
exports.uncompleteHabit = async (req, res) => {
  try {
    const date = req.body.date || todayKey();

    const doc = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Habit not found.' });
    if (!doc.completions.includes(date)) {
      return res.status(404).json({ message: 'No completion found for that date.' });
    }

    doc.completions = doc.completions.filter((d) => d !== date);
    await doc.save();

    res.status(200).json(withStreak(doc));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/habits/:id/history ─────────────────────────────────────────────
exports.getHabitHistory = async (req, res) => {
  try {
    const doc = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Habit not found.' });

    res.status(200).json({
      id:               String(doc._id),
      name:             doc.name,
      frequency:        doc.frequency,
      completions:      doc.completions,
      streak:           computeStreak(doc.completions, doc.frequency),
      totalCompletions: doc.completions.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
