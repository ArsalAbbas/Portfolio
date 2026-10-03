// Listens for the easter eggs in src/data/secrets.ts being typed, and for the Konami code.

import { secrets, type Secret } from '../data/secrets'
import { bubbles, dust, powerUp, signal, snow } from './effects'
import { setTheme } from './theme'
import { toast } from './toast'
import { isTyping } from './util'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

// apostrophes are optional, straight or curly
const plain = (text: string) => text.toLowerCase().replace(/['’]/g, '')
const typeable = secrets.map((s) => ({ id: s.id, key: plain(s.words) }))

/** Opens the Character page on one of its panels: right here if it's on this page, otherwise there. */
export function summon(id: string) {
  if (document.querySelector('[data-character]')) return document.dispatchEvent(new CustomEvent('summon', { detail: id }))
  try {
    sessionStorage.setItem('arsal:summon', id)
  } catch {
    /* it'll just open the page */
  }
  location.href = '/character/'
}

function run(id: Secret['id']) {
  switch (id) {
    case 'lumos':
      if (!setTheme('light')) toast({ kicker: 'Lumos', title: 'It’s already bright in here.', hue: 'yellow' })
      break
    case 'nox':
      if (!setTheme('dark')) toast({ kicker: 'Nox', title: 'It’s already dark. Spooky.', hue: 'blue' })
      break
    case 'accio':
      summon('barista')
      break
    case 'batman':
      setTheme('dark')
      signal()
      break
    case 'winter':
      snow()
      break
    case 'ready':
      bubbles()
      break
    case 'dust':
      dust()
      break
  }
}

/** True if the end of `typed`, from the start of a word, is the beginning of a longer secret. */
function midSecret(typed: string) {
  for (let i = 0; i < typed.length - 1; i++) {
    if (i > 0 && typed[i - 1] !== ' ') continue
    const tail = typed.slice(i)
    if (typeable.some((s) => s.key.length > tail.length && s.key.startsWith(tail))) return true
  }
  return false
}

export function listenForSecrets() {
  let typed = ''
  let keys: string[] = []
  let lastKey = 0
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e)) return
    keys = [...keys, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length)
    if (keys.join() === KONAMI.join()) {
      keys = []
      powerUp()
      toast({ kicker: 'Cheat code accepted', title: 'Fully powered up.', hue: 'yellow', shape: 'triangle' })
      return
    }
    if (e.key.length !== 1 || /['’]/.test(e.key)) return
    // a long pause starts over
    const now = performance.now()
    if (now - lastKey > 2500) typed = ''
    lastKey = now
    // the space in "winter is coming" shouldn't scroll the page
    if (e.key === ' ' && midSecret(typed + ' ')) e.preventDefault()
    typed = (typed + e.key.toLowerCase()).slice(-40)
    for (const s of typeable) {
      // "nox" also ends "phoenix", so a secret has to start a word
      const at = typed.length - s.key.length
      if (at >= 0 && typed.endsWith(s.key) && (at === 0 || typed[at - 1] === ' ')) {
        typed = ''
        run(s.id)
        break
      }
    }
  })
}
