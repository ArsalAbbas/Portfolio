// Small easter eggs: type one of these words anywhere on a page (on a keyboard) and something
// happens. Poke the thing named in `hint`, in the hideout at the bottom of the Character page,
// and the avatar gives its word away; the footer gives away the two spells.

export interface Secret {
  id: 'lumos' | 'nox' | 'accio' | 'batman' | 'winter' | 'ready' | 'dust'
  /** what to type: one lowercase word */
  word: string
  /** what gives it away in the hideout: a `data-poke` in src/components/character/Room.astro */
  hint?: string
}

export const secrets: Secret[] = [
  { id: 'lumos', word: 'lumos' },
  { id: 'nox', word: 'nox' },
  { id: 'accio', word: 'accio', hint: 'mug' },
  { id: 'batman', word: 'batman', hint: 'caped' },
  { id: 'winter', word: 'winter', hint: 'window' },
  { id: 'ready', word: 'ready', hint: 'robot' },
  { id: 'dust', word: 'snap', hint: 'plant' },
]
