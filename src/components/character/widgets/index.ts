// The toys inside each panel. Each one starts the first time its panel is opened; the
// ones not listed here (the route, the rally) are pure CSS and need no starting.

import { mountDishes } from './dishes'
import { mountFieldNotes } from './fieldnotes'
import { mountKalimba } from './kalimba'
import { mountSketch } from './sketch'
import { mountStats } from './stats'
import { mountV60 } from './v60'

export interface WidgetCtx {
  /** makes the avatar on the character card say something */
  say: (text: string) => void
}

const mounts: Record<string, (el: HTMLElement, ctx: WidgetCtx) => void> = {
  stats: mountStats,
  fieldnotes: mountFieldNotes,
  sketch: mountSketch,
  v60: mountV60,
  dishes: mountDishes,
  kalimba: mountKalimba,
}

export function mountWidget(el: HTMLElement, ctx: WidgetCtx) {
  mounts[el.dataset.widget ?? '']?.(el, ctx)
}
