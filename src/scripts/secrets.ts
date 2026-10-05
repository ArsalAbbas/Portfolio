// Listens for the easter eggs in src/data/secrets.ts being typed, and for the Konami code.

import { secrets, type Secret } from '../data/secrets'
import { bubbles, dust, powerUp, signal, snow } from './effects'
import { setTheme } from './theme'
import { toast } from './toast'
import { isTyping } from './util'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

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
    // a long pause starts over
    const now = performance.now()
    if (now - lastKey > 2500) typed = ''
    lastKey = now
    // Backspace takes back a letter, so a slip can be fixed
    if (e.key === 'Backspace') typed = typed.slice(0, -1)
    if (e.key.length !== 1) return
    typed = (typed + e.key.toLowerCase()).slice(-40)
    // what came before doesn't matter, so a word still counts typed again after a slip, or in quotes
    const found = secrets.find((s) => typed.endsWith(s.word))
    if (!found) return
    typed = ''
    run(found.id)
  })
}
