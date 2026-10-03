// The skill tree powers up branch by branch the first time it scrolls into view.

import { $, $$, onceVisible, reducedMotion } from '../../scripts/util'

export function initTree() {
  const tree = $('.tree')
  if (!tree || reducedMotion()) return
  onceVisible(
    tree,
    () => {
      $$('.branch', tree).forEach((branch, b) =>
        $$('.node', branch).forEach((node, i) =>
          setTimeout(
            () => {
              node.classList.add('is-lit')
              setTimeout(() => node.classList.remove('is-lit'), 420)
            },
            b * 110 + i * 140,
          ),
        ),
      )
    },
    0.3,
  )
}
