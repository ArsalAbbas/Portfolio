// Who, where, and how to reach me. Everything the site says about me lives in src/data.

export const site = {
  name: 'Arsal',
  /** shown in one place only, the footer; everywhere else it's just the name above */
  fullName: 'Syed Arsal Abbas',
  role: 'Product Engineer',
  company: 'SquadStack.ai',
  companyUrl: 'https://squadstack.ai',
  location: 'Noida, India',
  /** first day at SquadStack; the level counter on the title screen counts years from here */
  since: '2024-01-08',
  tagline: 'I build voice AI across the stack, and I care about the people on the other end of the line.',
  description:
    'Arsal, product engineer at SquadStack.ai. Voice AI, backend and frontend systems, and product design.',
  /** empty ones, here and in the links, are simply hidden */
  email: 'syedarsal.abbas2002@gmail.com',
  links: [
    { label: 'GitHub', href: 'https://github.com/ArsalAbbas1', handle: 'ArsalAbbas1' },
    { label: 'X', href: 'https://x.com/arsal_abbas22', handle: '@arsal_abbas22' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/syed-arsal-abbas/', handle: 'in/syed-arsal-abbas' },
  ],
}

export const links = site.links.filter((l) => l.href)

export type ShapeName = 'circle' | 'triangle' | 'square' | 'cross' | 'star'
export type Hue = 'red' | 'green' | 'pink' | 'blue' | 'yellow'

/**
 * The four sections, each with its own shape and colour, like the buttons on a controller.
 * The work comes first, on the home page; the Character page is for the curious.
 */
export const sections = [
  { id: 'quests', label: 'Quests', shape: 'circle', hue: 'red', key: '1', href: '/#quests' },
  { id: 'skills', label: 'Skill tree', shape: 'triangle', hue: 'green', key: '2', href: '/#skills' },
  { id: 'blog', label: 'Blog', shape: 'cross', hue: 'blue', key: '3', href: '/#blog' },
  { id: 'character', label: 'Character', shape: 'square', hue: 'pink', key: '4', href: '/character/' },
] as const satisfies readonly { id: string; label: string; shape: ShapeName; hue: Hue; key: string; href: string }[]

export type SectionId = (typeof sections)[number]['id']

/** Years since `since`, counted like levels: you are level 1 on day one. */
export function level(now = new Date()) {
  const start = new Date(site.since)
  let lvl = 1
  let from = new Date(start)
  for (;;) {
    const next = new Date(from)
    next.setFullYear(next.getFullYear() + 1)
    if (next > now) return { lvl, progress: (now.getTime() - from.getTime()) / (next.getTime() - from.getTime()), next }
    from = next
    lvl++
  }
}
