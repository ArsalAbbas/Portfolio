// The tools I work with, by area. Logos are the official ones, in public/logos; things without
// an openly licensed logo get a simple drawn glyph instead.

import type { Glyph } from '../components/skills/glyphs'
import type { Hue, ShapeName } from './site'

export interface Skill {
  name: string
  /** a file in public/logos, without the .svg */
  logo?: string
  /** a drawn icon, for ideas, and for tools with no openly licensed logo */
  glyph?: Glyph
  /** what I reach for every day; drawn as a filled node */
  core?: boolean
}

export interface Branch {
  name: string
  shape: ShapeName
  hue: Hue
  skills: Skill[]
  /** what I've used it for at work, in a line: what it does, never how it works inside */
  usedFor?: string
}

export const branches: Branch[] = [
  {
    name: 'Voice AI',
    shape: 'triangle',
    hue: 'green',
    skills: [
      { name: 'LLM agents', glyph: 'bot', core: true },
      { name: 'WebRTC', logo: 'webrtc' },
    ],
    usedFor: 'a knowledge base for our voice agents, switching their models and memory, faster replies, and a voice assistant other apps can embed',
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
    usedFor: 'the APIs behind our consoles, and keeping calls reliable across telephony carriers',
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
    usedFor: 'a console for reviewing calls, a demo hub for our agents, and the web and mobile app our call agents work in, one codebase with React Native for Web',
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
    ],
  },
  {
    name: 'AI-native',
    shape: 'circle',
    hue: 'green',
    skills: [
      { name: 'Claude Code', logo: 'claude', core: true },
      { name: 'Conductor', glyph: 'workflow' },
      { name: 'Wispr Flow', glyph: 'mic' },
    ],
  },
]

export const passiveSkill = 'Noticing the moment software feels slow, confusing or rude. Then fixing it.'
