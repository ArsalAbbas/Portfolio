// Small helpers shared by every script on the site.

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)]

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
export const coarsePointer = () => matchMedia('(pointer: coarse)').matches

/** True while the visitor is typing into something, so shortcuts and secrets stay quiet. */
export function isTyping(e: Event) {
  const t = e.target as HTMLElement | null
  if (!t) return false
  return t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
export const pick = <T>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]

/** Calls `fn` once when `el` first scrolls into view. */
export function onceVisible(el: Element, fn: () => void, threshold = 0.25) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect()
        fn()
      }
    },
    { threshold },
  )
  io.observe(el)
}

/** Calls `fn(true)` when `el` scrolls into view and `fn(false)` when it leaves. */
export function whileVisible(el: Element, fn: (visible: boolean) => void, threshold = 0) {
  new IntersectionObserver(([e]) => fn(e.isIntersecting), { threshold }).observe(el)
}

export const SHAPES = {
  circle: '<circle cx="12" cy="12" r="9.2"/>',
  triangle: '<path d="M12 2.8 21.6 20.2H2.4Z"/>',
  square: '<rect x="3" y="3" width="18" height="18" rx="2.2"/>',
  cross: '<path d="M6.3 2.6 12 8.3l5.7-5.7 3.7 3.7L15.7 12l5.7 5.7-3.7 3.7L12 15.7l-5.7 5.7-3.7-3.7L8.3 12 2.6 6.3Z"/>',
  star: '<path d="m12 1.8 3.1 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.6l-6.4 3.6 1.5-7.1-5.4-4.9 7.2-.8Z"/>',
} as const

export type Shape = keyof typeof SHAPES

export const shapeSvg = (shape: Shape, size = 22) =>
  `<svg class="shape" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${SHAPES[shape]}</svg>`
