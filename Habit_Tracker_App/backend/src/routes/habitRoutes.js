const express = require('express');
const router = express.Router();
const controller = require('../controllers/habitController');
const {
  validate,
  createHabitRules,
  updateHabitRules,
  completeHabitRules,
} = require('../validators/habitValidators');

// Habit CRUD 
// GET /api/habits - list all habits
router.get('/', controller.getAllHabits);

// GET /api/habits/:id - get one habit
router.get('/:id', controller.getHabitById);

// POST /api/habits - create a habit
router.post('/', createHabitRules, validate, controller.createHabit);

// PUT /api/habits/:id - edit a habit
router.put('/:id', updateHabitRules, validate, controller.updateHabit);

// DELETE /api/habits/:id - delete a habit
router.delete('/:id', controller.deleteHabit);

// Completion tracking

// POST /api/habits/:id/complete - mark a habit done (today or given date)
router.post('/:id/complete', completeHabitRules, validate, controller.completeHabit);

// DELETE /api/habits/:id/complete - un-tick a habit (today or given date)
router.delete('/:id/complete', controller.uncompleteHabit);

// GET /api/habits/:id/history - full completions array + metadata
router.get('/:id/history', controller.getHabitHistory);

module.exports = router;
