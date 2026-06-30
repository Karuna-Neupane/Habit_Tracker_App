// Centralised validation rules so the same constraints are enforced
// both in the form (UX) and in storage (defense in depth — never trust
// only the UI layer, in case data is added programmatically or the
// localStorage value is edited by hand).

export const ALLOWED_FREQUENCIES = ['daily', 'weekly']

export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 60

// Strips control characters and collapses excess whitespace. Does not
// attempt to strip HTML — React already escapes all text it renders, so
// there is no injection risk from storing "<script>" as a plain string.
export function sanitizeName(rawName) {
  return String(rawName ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Validates a habit name against length rules and (optionally) against
 * a list of names already in use, so two habits can't collide.
 *
 * @param {string} rawName
 * @param {string[]} existingNames - other habit names already saved (lowercased comparison)
 * @returns {string} an error message, or '' if the name is valid
 */
export function validateHabitName(rawName, existingNames = []) {
  const name = sanitizeName(rawName)

  if (!name) {
    return 'Habit name is required.'
  }
  if (name.length < NAME_MIN_LENGTH) {
    return `Habit name must be at least ${NAME_MIN_LENGTH} characters.`
  }
  if (name.length > NAME_MAX_LENGTH) {
    return `Habit name must be ${NAME_MAX_LENGTH} characters or fewer.`
  }

  const isDuplicate = existingNames.some(
    (existing) => existing.trim().toLowerCase() === name.toLowerCase()
  )
  if (isDuplicate) {
    return 'You already have a habit with this name.'
  }

  return ''
}

export function validateFrequency(frequency) {
  return ALLOWED_FREQUENCIES.includes(frequency)
    ? ''
    : 'Choose a valid frequency.'
}
