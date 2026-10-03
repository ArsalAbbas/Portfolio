// Small easter eggs: type the words anywhere on a page (on a keyboard) and something happens.
// Nobody has to find them; they're a bonus for the people who do.

export interface Secret {
  id: 'lumos' | 'nox' | 'accio' | 'batman' | 'winter' | 'ready' | 'dust'
  /** what to type, lowercase; apostrophes are optional */
  words: string
}

export const secrets: Secret[] = [
  { id: 'lumos', words: 'lumos' },
  { id: 'nox', words: 'nox' },
  { id: 'accio', words: 'accio coffee' },
  { id: 'batman', words: "i'm batman" },
  { id: 'winter', words: 'winter is coming' },
  { id: 'ready', words: "i'm ready" },
  { id: 'dust', words: "i don't feel so good" },
]
