// Brings an avatar drawing to life: eyes that follow you, blinks, moods, and a speech bubble
// that types itself out. The hero and the Character page each make one.

import { bump } from '../../scripts/store'
import { reducedMotion } from '../../scripts/util'

// where the eyes sit in the avatar's 300 × 290 drawing
const EYES = { x: 150, y: 126 }
const VIEW = { w: 300, h: 290 }

export class AvatarCtl {
  readonly svg: SVGSVGElement
  private eyes: SVGGElement | null
  private bubble: HTMLElement | null
  private lines: string[]
  private next = 0
  private moodTimer = 0
  private hideTimer = 0
  private typeTimer = 0
  private look = { x: 0, y: 0 }

  constructor(svg: SVGSVGElement, bubble: HTMLElement | null, lines: string[] = []) {
    this.svg = svg
    this.eyes = svg.querySelector('.av-eyes')
    this.bubble = bubble
    this.lines = lines
    this.blinkLoop()
    svg.addEventListener('click', () => this.poke())
  }

  setLines(lines: string[]) {
    this.lines = lines
    this.next = 0
  }

  /** Points both eyes at a spot on the screen. */
  lookAt(clientX: number, clientY: number) {
    if (!this.eyes) return
    const r = this.svg.getBoundingClientRect()
    if (!r.width) return
    const scale = r.width / VIEW.w
    const cx = r.left + EYES.x * scale
    const cy = r.top + EYES.y * scale
    const dx = clientX - cx
    const dy = clientY - cy
    const d = Math.hypot(dx, dy) || 1
    const reach = Math.min(1, d / 260)
    const x = (dx / d) * 8 * reach
    const y = (dy / d) * 5.5 * reach
    if (Math.abs(x - this.look.x) < 0.05 && Math.abs(y - this.look.y) < 0.05) return
    this.look = { x, y }
    this.eyes.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`
  }

  lookAhead() {
    if (!this.eyes) return
    this.look = { x: 0, y: 0 }
    this.eyes.style.transform = ''
  }

  mood(mood: 'surprised' | 'happy', ms = 900) {
    this.svg.dataset.mood = mood
    clearTimeout(this.moodTimer)
    this.moodTimer = window.setTimeout(() => delete this.svg.dataset.mood, ms)
  }

  wobble() {
    if (reducedMotion()) return
    this.svg.classList.remove('is-wobbling')
    void this.svg.getBoundingClientRect()
    this.svg.classList.add('is-wobbling')
  }

  /** Types `text` into the bubble; hides it again after `ms` unless `ms` is 0. */
  say(text: string, ms = 3200) {
    const b = this.bubble
    if (!b) return
    clearTimeout(this.hideTimer)
    clearInterval(this.typeTimer)
    b.classList.remove('is-hidden')
    if (reducedMotion()) b.textContent = text
    else {
      let i = 0
      b.innerHTML = '<span></span><i class="caret"></i>'
      const span = b.firstElementChild as HTMLElement
      this.typeTimer = window.setInterval(() => {
        span.textContent = text.slice(0, ++i)
        if (i >= text.length) {
          clearInterval(this.typeTimer)
          b.querySelector('.caret')?.remove()
        }
      }, 26)
    }
    if (ms) this.hideTimer = window.setTimeout(() => b.classList.add('is-hidden'), ms + text.length * 26)
  }

  /** Something hit the avatar. */
  hit() {
    this.mood('surprised', 1100)
    this.wobble()
    this.say(['Ow!', 'Hey!', 'Rude.', 'Nice aim.', 'I felt that.'][Math.floor(Math.random() * 5)], 1400)
  }

  poke() {
    const total = bump('pokes')
    this.mood('happy', 700)
    this.wobble()
    if (total === 10) return this.say('Okay. That’s enough poking.')
    if (!this.lines.length) return
    this.say(this.lines[this.next % this.lines.length])
    this.next++
  }

  private blinkLoop() {
    const blink = () => {
      this.svg.classList.add('is-blinking')
      setTimeout(() => this.svg.classList.remove('is-blinking'), 130)
    }
    const loop = () => {
      blink()
      if (Math.random() < 0.25) setTimeout(blink, 260)
      setTimeout(loop, 2400 + Math.random() * 3800)
    }
    setTimeout(loop, 1500 + Math.random() * 2000)
  }
}
