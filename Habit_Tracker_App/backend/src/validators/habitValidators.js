const { body, param, validationResult } = require('express-validator');

const ALLOWED_FREQUENCIES = ['daily', 'weekly'];
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

// Reusable: collect errors and respond 400 if any 
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next(); // all good → continue to controller
  return res.status(400).json({
    message: 'Validation failed',
    errors: errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    })),
  });
};

// POST /api/habits — create a habit
const createHabitRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Habit name is required.')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters.')
    .isLength({ max: 60 }).withMessage('Name must be 60 characters or fewer.')
    .escape(),

  body('frequency')
    .trim()
    .notEmpty().withMessage('Frequency is required.')
    .isIn(ALLOWED_FREQUENCIES)
    .withMessage(`Frequency must be one of: ${ALLOWED_FREQUENCIES.join(', ')}.`),
];

// PUT /api/habits/:id — edit a habit
const updateHabitRules = [
  param('id')
    .notEmpty().withMessage('Habit ID is required.'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters.')
    .isLength({ max: 60 }).withMessage('Name must be 60 characters or fewer.')
    .escape(),

  body('frequency')
    .optional()
    .trim()
    .isIn(ALLOWED_FREQUENCIES)
    .withMessage(`Frequency must be one of: ${ALLOWED_FREQUENCIES.join(', ')}.`),
];

// POST /api/habits/:id/complete — mark a completion
const completeHabitRules = [
  param('id')
    .notEmpty().withMessage('Habit ID is required.'),

  // `date` is optional in the body — defaults to today on the server if omitted.
  // If provided, it must be a valid YYYY-MM-DD string.
  body('date')
    .optional()
    .trim()
    .matches(DATE_KEY_RE)
    .withMessage('Date must be in YYYY-MM-DD format.'),
];

module.exports = {
  validate,
  createHabitRules,
  updateHabitRules,
  completeHabitRules,
};
