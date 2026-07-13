// Controller (MVC) 
// Handles incoming HTTP requests. Each function:
//   1. Reads data from req (params, body, query)
//   2. Calls the Model to do the actual work
//   3. Sends the HTTP response with the right status code
// 
// Controllers never contain data logic — that belongs in the model.
// Controllers never know about database queries — that also belongs in the model.

const HabitModel = require('../models/habitModel');
const { todayKey } = require('../utils/streak');

// GET /api/habits
exports.getAllHabits = (req, res) => {
  const habits = HabitModel.getAll();
  res.status(200).json({
    count: habits.length,
    habits,
  });
};

// GET /api/habits/:id 
exports.getHabitById = (req, res) => {
  const habit = HabitModel.getById(req.params.id);
  if (!habit) {
    return res.status(404).json({ message: 'Habit not found.' });
  }
  res.status(200).json(habit);
};

// POST /api/habits 
exports.createHabit = (req, res) => {
  const { name, frequency } = req.body;

  // Duplicate name check (case-insensitive)
  if (HabitModel.nameExists(name)) {
    return res.status(409).json({
      message: `A habit named "${name}" already exists.`,
    });
  }

  const habit = HabitModel.create({ name, frequency });
  res.status(201).json(habit);
};

// PUT /api/habits/:id
exports.updateHabit = (req, res) => {
  const { name, frequency } = req.body;

  // If renaming, check the new name isn't taken by a different habit
  if (name && HabitModel.nameExists(name, req.params.id)) {
    return res.status(409).json({
      message: `A habit named "${name}" already exists.`,
    });
  }

  const updated = HabitModel.update(req.params.id, { name, frequency });
  if (!updated) {
    return res.status(404).json({ message: 'Habit not found.' });
  }
  res.status(200).json(updated);
};

// DELETE /api/habits/:id 
exports.deleteHabit = (req, res) => {
  const deleted = HabitModel.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Habit not found.' });
  }
  // 204 No Content — success with no body (standard for DELETE)
  res.status(204).send();
};

// POST /api/habits/:id/complete 
exports.completeHabit = (req, res) => {
  // Use date from body if provided, otherwise default to today on the server.
  // Server-side "today" is authoritative — client can't fake a future date.
  const date = req.body.date || todayKey();

  const result = HabitModel.addCompletion(req.params.id, date);

  if (!result.success) {
    const statusMap = {
      NOT_FOUND: 404,
      DUPLICATE: 409,
      INVALID_DATE: 400,
    };
    return res.status(statusMap[result.code] || 400).json({
      message: result.message,
    });
  }

  res.status(200).json(result.habit);
};

// DELETE /api/habits/:id/complete 
// Un-tick a specific date (or today if no date body provided)
exports.uncompleteHabit = (req, res) => {
  const date = req.body.date || todayKey();
  const updated = HabitModel.removeCompletion(req.params.id, date);
  if (!updated) {
    return res.status(404).json({
      message: 'Habit not found or no completion exists for that date.',
    });
  }
  res.status(200).json(updated);
};

// GET /api/habits/:id/history 
exports.getHabitHistory = (req, res) => {
  const history = HabitModel.getHistory(req.params.id);
  if (!history) {
    return res.status(404).json({ message: 'Habit not found.' });
  }
  res.status(200).json(history);
};
