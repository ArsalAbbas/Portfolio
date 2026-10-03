// Light and dark. The choice is remembered, and the page picks it up before it paints
// (see the inline script in src/components/layout/Head.astro).

import { reducedMotion } from './util'

export type Theme = 'light' | 'dark'

export const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

/** Switches theme, spreading the new one out in a circle from `at` where the browser can. */
export function setTheme(theme: Theme, at?: { x: number; y: number }) {
  const html = document.documentElement
  if (currentTheme() === theme) return false
  const apply = () => {
    html.dataset.theme = theme
    try {
      localStorage.setItem('arsal:theme', theme)
    } catch {
      /* fine, it just won't be remembered */
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121116' : '#f4f0e6')
  }
  if (!document.startViewTransition || reducedMotion()) {
    apply()
    return true
  }
  html.style.setProperty('--cx', `${at?.x ?? innerWidth / 2}px`)
  html.style.setProperty('--cy', `${at?.y ?? innerHeight / 2}px`)
  html.classList.add('is-switching')
  document.startViewTransition(apply).finished.finally(() => html.classList.remove('is-switching'))
  return true
}
