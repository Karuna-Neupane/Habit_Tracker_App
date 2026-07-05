// Centralised validation so the same rules apply in the form (UX feedback)
// AND in the storage layer (defense in depth — never trust only the UI).

export const ALLOWED_FREQUENCIES = ['daily', 'weekly']
export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 60

/**
 * Strips control characters and collapses excess whitespace.
 * React auto-escapes all rendered text so there is no XSS risk from storing
 * a name like "<script>" — it will always display as a literal string.
 */
export function sanitizeName(rawName) {
  return String(rawName ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Returns a non-empty error string if the name is invalid, otherwise ''.
 * @param {string}   rawName
 * @param {string[]} existingNames  Other habits' names (for duplicate check)
 */
export function validateHabitName(rawName, existingNames = []) {
  const name = sanitizeName(rawName)

  if (!name)
    return 'Habit name is required.'
  if (name.length < NAME_MIN_LENGTH)
    return `Name must be at least ${NAME_MIN_LENGTH} characters.`
  if (name.length > NAME_MAX_LENGTH)
    return `Name must be ${NAME_MAX_LENGTH} characters or fewer.`

  const duplicate = existingNames.some(
    (n) => n.trim().toLowerCase() === name.toLowerCase()
  )
  if (duplicate)
    return 'You already have a habit with this name.'

  return ''
}

export function validateFrequency(frequency) {
  return ALLOWED_FREQUENCIES.includes(frequency) ? '' : 'Choose a valid frequency.'
}
