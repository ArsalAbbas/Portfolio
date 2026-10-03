// Section titles resolve from noise, left to right, the first time you see them.

import { $$, onceVisible, reducedMotion } from '../../scripts/util'

export function initScramble() {
  if (reducedMotion()) return
  for (const el of $$('[data-scramble]')) onceVisible(el, () => scramble(el), 0.6)
}

function scramble(el: HTMLElement) {
  const text = el.textContent ?? ''
  // noise made of the title's own letters keeps the width about the same
  const pool = text.replace(/\s/g, '')
  if (!pool) return
  el.setAttribute('aria-label', text)
  el.style.minHeight = `${el.offsetHeight}px`
  const t0 = performance.now()
  const dur = 500 + text.length * 22
  let lastSwap = 0
  const frame = (now: number) => {
    const p = (now - t0) / dur
    if (p >= 1) {
      el.textContent = text
      el.style.minHeight = ''
      el.removeAttribute('aria-label')
      return
    }
    if (now - lastSwap > 45) {
      lastSwap = now
      let out = ''
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        out += ch === ' ' || i / text.length < p * 1.25 - 0.25 ? ch : pool[Math.floor(Math.random() * pool.length)]
      }
      el.textContent = out
    }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
