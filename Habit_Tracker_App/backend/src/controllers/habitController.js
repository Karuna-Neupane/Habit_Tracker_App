// Controller — Week 4: all operations are now async and use Mongoose.
// The streak is NEVER stored in the database — it is always computed from
// the live completions array returned from MongoDB, exactly like before.

const Habit = require('../models/Habit');
const { computeStreak, todayKey, isValidDateKey } = require('../utils/streak');

// Attach computed streak to a Mongoose document before sending to client.
// We call .toObject() so the result is a plain JS object (not a Mongoose doc).
function withStreak(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  // Rename _id → id so the frontend doesn't need to change
  obj.id = String(obj._id);
  delete obj._id;
  delete obj.__v;
  obj.streak = computeStreak(obj.completions, obj.frequency);
  return obj;
}

// ── GET /api/habits ─────────────────────────────────────────────────────────
exports.getAllHabits = async (req, res) => {
  try {
    // Week 4, item 3: fetch live data from MongoDB, not a JSON file
    const docs = await Habit.find().sort({ createdAt: 1 });
    const habits = docs.map(withStreak);
    res.status(200).json({ count: habits.length, habits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/habits/:id ─────────────────────────────────────────────────────
exports.getHabitById = async (req, res) => {
  try {
    const doc = await Habit.findById(req.params.id);
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

    // Duplicate name check (case-insensitive)
    const exists = await Habit.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });
    if (exists) {
      return res.status(409).json({ message: `A habit named "${name}" already exists.` });
    }

    const doc = await Habit.create({ name: name.trim(), frequency });
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
    if (name) {
      const exists = await Habit.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: req.params.id },
      });
      if (exists) {
        return res.status(409).json({ message: `A habit named "${name}" already exists.` });
      }
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (frequency) updates.frequency = frequency;

    const doc = await Habit.findByIdAndUpdate(
      req.params.id,
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
    const doc = await Habit.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Habit not found.' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/habits/:id/complete ───────────────────────────────────────────
// Week 4, item 4: completion saved to MongoDB, streak computed from live DB data
exports.completeHabit = async (req, res) => {
  try {
    const date = req.body.date || todayKey();

    if (!isValidDateKey(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const doc = await Habit.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Habit not found.' });

    // Week 4, item 6 (also Week 3 item 6): reject duplicate for same date
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
// Un-tick a date — removes it from the completions array in MongoDB
exports.uncompleteHabit = async (req, res) => {
  try {
    const date = req.body.date || todayKey();

    const doc = await Habit.findById(req.params.id);
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
// Week 4, item 5: returns real completion dates from MongoDB
exports.getHabitHistory = async (req, res) => {
  try {
    const doc = await Habit.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Habit not found.' });

    res.status(200).json({
      id: String(doc._id),
      name: doc.name,
      frequency: doc.frequency,
      completions: doc.completions,          // real dates from MongoDB
      streak: computeStreak(doc.completions, doc.frequency),
      totalCompletions: doc.completions.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
