// Original motivational lines (not quotes from real people/books — avoids
// any attribution/copyright questions). One is picked deterministically
// based on the day of the year, so it stays the same all day and rotates
// daily without needing a backend or any external API.

const QUOTES = [
  "Success is built one habit at a time.",
  "Small steps, repeated daily, beat big leaps taken rarely.",
  "You don't have to be perfect today — just show up.",
  "Every checkmark is proof you kept a promise to yourself.",
  "Progress hides in the days that feel unremarkable.",
  "Consistency is quieter than motivation, but it lasts longer.",
  "A streak is just a series of decisions to not quit.",
  "You're not starting over — you're continuing.",
  "The habit you do today is easier because of the one you did yesterday.",
  "Discipline is choosing what you want most over what you want now.",
  "One more day counts more than you think.",
  "You build who you are one ordinary day at a time.",
  "Momentum is built in the moments no one is watching.",
  "It's not about being busy — it's about being consistent.",
  "Small wins, stacked daily, become who you're becoming.",
]

/** Same quote all day; rotates through the list once per day. */
export function quoteOfTheDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  const dayOfYear = Math.floor(diff / 86_400_000)
  return QUOTES[dayOfYear % QUOTES.length]
}
