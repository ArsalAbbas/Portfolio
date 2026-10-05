// The toys inside each panel. Each one starts the first time its panel is opened.

import { mountDishes } from './dishes'
import { mountFieldNotes } from './fieldnotes'
import { mountKalimba } from './kalimba'
import { mountSketch } from './sketch'
import { mountSlides } from './slides'
import { mountV60 } from './v60'

export interface WidgetCtx {
  /** makes the avatar on the character card say something */
  say: (text: string) => void
}

const mounts: Record<string, (el: HTMLElement, ctx: WidgetCtx) => void> = {
  fieldnotes: mountFieldNotes,
  sketch: mountSketch,
  v60: mountV60,
  dishes: mountDishes,
  slides: mountSlides,
  kalimba: mountKalimba,
}

export function mountWidget(el: HTMLElement, ctx: WidgetCtx) {
  mounts[el.dataset.widget ?? '']?.(el, ctx)
}
