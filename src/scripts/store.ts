// A few counters, kept in this browser's localStorage and nowhere else, so the avatar can say
// "that's your third cup" and the field notes can tell a first visit from a return.

interface Save {
  counters: Record<string, number>
  /** the visitor's number in the field notes */
  subject: number
}

const KEY = 'arsal:save'

function load(): Save {
  const fresh: Save = { counters: {}, subject: 1000 + Math.floor(Math.random() * 9000) }
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...fresh, ...JSON.parse(raw) } : fresh
  } catch {
    return fresh
  }
}

export const save: Save = load()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(save))
  } catch {
    /* private mode: the counters last for this visit */
  }
}

/** Adds one (or `by`) to a counter and returns the new total. */
export function bump(counter: string, by = 1) {
  save.counters[counter] = (save.counters[counter] ?? 0) + by
  persist()
  return save.counters[counter]
}
