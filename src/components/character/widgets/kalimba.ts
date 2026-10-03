// The kalimba in Stories. Each note is three sine waves that fade at different speeds, which is
// close enough to a metal tine on a wooden box.

import { $, $$, pick, reducedMotion } from '../../../scripts/util'
import type { WidgetCtx } from './index'

/** a tine's overtones: how much higher than the note, how loud, and how long it rings, in s */
const PARTIALS: [number, number, number][] = [
  [1, 0.5, 2.4],
  [2.01, 0.12, 0.9],
  [6.27, 0.05, 0.25],
]
/** seconds per beat when it plays a tune */
const BEAT = 0.42

let audio: AudioContext | null = null
let out: AudioNode | null = null

/** The speakers, set up on the first tap, since browsers only allow sound after one. */
function speakers() {
  if (!audio) {
    if (!('AudioContext' in window)) return null
    audio = new AudioContext()
    const volume = audio.createGain()
    volume.gain.value = 0.35
    // so a fast glissando doesn't clip
    volume.connect(audio.createDynamicsCompressor()).connect(audio.destination)
    out = volume
  }
  if (audio.state === 'suspended') void audio.resume()
  return audio
}

/** Plays a note, now or at a time on the audio clock. */
function ring(hz: number, at?: number) {
  const ctx = speakers()
  if (!ctx || !out) return
  const t = at ?? ctx.currentTime
  for (const [times, level, decay] of PARTIALS) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = hz * times
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(level, t + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    osc.connect(gain).connect(out)
    osc.start(t)
    osc.stop(t + decay + 0.05)
  }
}

const timers = new WeakMap<HTMLElement, number>()

/** Lights a tine up and makes it wobble. */
function shake(tine: HTMLElement) {
  if (!reducedMotion()) tine.animate({ rotate: ['3deg', '-2.2deg', '1.3deg', '-0.6deg', '0deg'] }, { duration: 650, easing: 'ease-out' })
  tine.classList.add('is-lit')
  clearTimeout(timers.get(tine))
  timers.set(tine, window.setTimeout(() => tine.classList.remove('is-lit'), 220))
}

export function mountKalimba(el: HTMLElement, { say }: WidgetCtx) {
  const board = $('[data-tines]', el)
  const play = $<HTMLButtonElement>('[data-tune]', el)
  if (!board || !play) return
  const byNote = new Map($$<HTMLButtonElement>('.tine', el).map((t) => [Number(t.dataset.note), t]))
  let plucks = 0
  const pluck = (tine: HTMLElement) => {
    ring(Number(tine.dataset.hz))
    shake(tine)
    if (++plucks === 30) say('You’re a natural.')
  }

  // Drag across the tines for a glissando. Touch keeps sending events to the tine you started
  // on, so look up what's under the finger instead.
  let dragging = false
  let last: HTMLElement | null = null
  const tineAt = (e: PointerEvent) => document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('.tine') ?? null
  board.addEventListener('pointerdown', (e) => {
    dragging = true
    last = tineAt(e)
    if (last) pluck(last)
  })
  board.addEventListener('pointermove', (e) => {
    if (!dragging) return
    const tine = tineAt(e)
    if (tine && tine !== last) pluck(tine)
    last = tine
  })
  const stop = () => {
    dragging = false
    last = null
    // on touchscreens, sound is only allowed once the finger lifts
    if (audio) speakers()
  }
  addEventListener('pointerup', stop)
  addEventListener('pointercancel', stop)
  // Enter and Space on a focused tine; pointers have already played it on the way down
  board.addEventListener('click', (e) => {
    const tine = (e.target as Element).closest<HTMLElement>('.tine')
    if (tine && e.detail === 0) pluck(tine)
  })

  play.addEventListener('click', () => {
    const tune: [number, number][] = JSON.parse(play.dataset.tune ?? '[]')
    const start = 0.15
    const clock = speakers()?.currentTime ?? 0
    play.disabled = true
    play.textContent = 'Playing…'
    say('This one’s a classic.')
    let t = start
    for (const [note, beats] of tune) {
      const tine = byNote.get(note)
      if (tine) {
        ring(Number(tine.dataset.hz), clock + t)
        setTimeout(() => shake(tine), t * 1000)
      }
      t += beats * BEAT
    }
    setTimeout(() => {
      play.disabled = false
      play.textContent = 'Play it again'
      say(pick(['Thank you, thank you.', 'I’ll be here all week.', 'Requests? Within reason.']))
    }, t * 1000 + 500)
  })
}
