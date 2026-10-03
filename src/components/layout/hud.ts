// The bar along the top: which section you're in, how far down the page you are, the number
// keys that jump between sections, and the light switch. Also says when the controller on
// phones can come out.

import { sections } from '../../data/site'
import { currentTheme, setTheme } from '../../scripts/theme'
import { $, $$, isTyping, reducedMotion } from '../../scripts/util'

export function initHud() {
  const xp = $('.hud__xp span')
  // on the title screen the controller waits until you've pressed start or scrolled the button up
  // near the top (pressing start leaves it just under the bar), so it never sits on top of it
  const start = $('[data-start]')
  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight
      xp?.style.setProperty('--xp', String(max > 0 ? Math.min(1, scrollY / max) : 0))
      if (start) {
        const past = start.getBoundingClientRect().bottom < innerHeight * 0.2
        document.documentElement.classList.toggle('is-started', past)
      }
      ticking = false
    })
  }
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  // light up the link for the section in the middle of the screen
  const links = $$('[data-nav]')
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const id = (e.target as HTMLElement).dataset.section
        links.forEach((l) => l.setAttribute('aria-current', String(l.dataset.nav === id)))
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  $$('[data-section]').forEach((s) => io.observe(s))

  $$('[data-theme-toggle]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const r = btn.getBoundingClientRect()
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark', { x: r.left + r.width / 2, y: r.top + r.height / 2 })
    }),
  )

  let lastLetter = 0
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e)) return
    const n = Number(e.key)
    const letter = /^[a-z]$/i.test(e.key)
    // an x straight after other letters is someone typing "nox", not pressing start
    const typing = letter && performance.now() - lastLetter < 1000
    if (letter) lastLetter = performance.now()
    if (n >= 1 && n <= sections.length) go(sections[n - 1].id)
    // "press ✕ to start", like the button on the title screen says
    else if (e.key.toLowerCase() === 'x' && !typing && $('[data-hero]') && scrollY < innerHeight * 0.6) go('quests')
  })
}

/** Scrolls to a section on this page, or goes to the page it lives on. */
export function go(id: string) {
  const el = document.getElementById(id)
  if (el) return el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
  location.href = sections.find((s) => s.id === id)?.href ?? `/#${id}`
}
