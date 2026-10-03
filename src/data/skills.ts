// The tools I work with, grouped the same way as the quests. Logos are the official ones, in
// public/logos; things without a logo get a simple drawn glyph instead.

import type { Glyph } from '../components/skills/glyphs'
import type { Hue, ShapeName } from './site'

export interface Skill {
  name: string
  /** a file in public/logos, without the .svg */
  logo?: string
  /** a drawn icon, for ideas rather than products */
  glyph?: Glyph
  /** what I reach for every day; drawn as a filled node */
  core?: boolean
}

export interface Branch {
  name: string
  shape: ShapeName
  hue: Hue
  skills: Skill[]
}

export const branches: Branch[] = [
  {
    name: 'Voice AI',
    shape: 'triangle',
    hue: 'green',
    skills: [
      { name: 'Speech-to-text & TTS', glyph: 'waveform', core: true },
      { name: 'WebRTC', logo: 'webrtc' },
      { name: 'RAG', glyph: 'search' },
      { name: 'Agent memory', glyph: 'brain' },
      { name: 'Latency', glyph: 'timer' },
    ],
  },
  {
    name: 'Backend',
    shape: 'square',
    hue: 'blue',
    skills: [
      { name: 'Python', logo: 'python', core: true },
      { name: 'Django', logo: 'django', core: true },
      { name: 'REST APIs', glyph: 'braces' },
      { name: 'PostgreSQL', logo: 'postgresql' },
      { name: 'Redis', logo: 'redis' },
    ],
  },
  {
    name: 'Frontend',
    shape: 'circle',
    hue: 'red',
    skills: [
      { name: 'TypeScript', logo: 'typescript', core: true },
      { name: 'React', logo: 'react', core: true },
      { name: 'Next.js', logo: 'nextjs', core: true },
      { name: 'React Native', logo: 'react' },
      { name: 'Tailwind', logo: 'tailwind' },
      { name: 'Vite', logo: 'vite' },
    ],
  },
  {
    name: 'Platform',
    shape: 'cross',
    hue: 'yellow',
    skills: [
      { name: 'AWS', logo: 'aws' },
      { name: 'Firebase', logo: 'firebase' },
      { name: 'Sentry', logo: 'sentry' },
    ],
  },
  {
    name: 'Design',
    shape: 'star',
    hue: 'pink',
    skills: [
      { name: 'Figma', logo: 'figma', core: true },
      { name: 'UX research', glyph: 'eye', core: true },
      { name: 'Design docs', glyph: 'doc' },
    ],
  },
  {
    name: 'AI-native',
    shape: 'circle',
    hue: 'green',
    skills: [
      { name: 'Claude Code', logo: 'claude', core: true },
      { name: 'Cursor', logo: 'cursor' },
      { name: 'Agent skills', glyph: 'wand' },
    ],
  },
]

export const passiveSkill = 'Noticing the moment software feels slow, confusing or rude. Then fixing it.'
