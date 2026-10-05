---
title: 'Claude Code basics: CLAUDE.md, skills, hooks and the rest'
description: 'A map of the files that shape Claude Code: what each one is for, where it lives, and when it loads.'
date: 2026-08-18
tags: ['claude-code', 'ai', 'tools']
---

[Claude Code](https://code.claude.com/docs) is Anthropic's coding agent. It reads your code, runs commands and edits files, in a loop, until the job is done: an agent in the sense of [LLMs vs AI agents](/blog/llms-vs-ai-agents/). It works in the terminal, in code editors, and in desktop and web apps.

It's capable out of the box. What makes it fit _your_ project is a handful of plain text files, mostly Markdown. There are quite a few, with similar names, so here's a map. It follows the [official docs](https://code.claude.com/docs) at the time of writing, but this area moves quickly, so check there for the details.

## The map

| Piece        | File            | Loads                                            |
| ------------ | --------------- | ------------------------------------------------ |
| Instructions | `CLAUDE.md`     | Every session                                    |
| Rules        | `rules/*.md`    | Every session, or when matching files are opened |
| Auto memory  | `MEMORY.md`     | Every session                                    |
| Skills       | `SKILL.md`      | When used; only the description loads up front   |
| Subagents    | `agents/*.md`   | When a task is handed to one                     |
| Hooks        | `settings.json` | Whenever their event fires                       |

Most of these live in a `.claude/` folder, in your project or in your home folder. The sections below give the exact paths.

## CLAUDE.md: standing instructions

`CLAUDE.md` is a Markdown file Claude reads at the start of every session. Put in what you'd tell a new teammate on their first day: how to build and test, the conventions, the traps.

```markdown
# Notes for Claude

- Run `npm test` before calling a change done
- TypeScript, strict mode, no `any`
- API routes live in `src/api/`, one file per route
- Never edit `src/generated/`; run `npm run codegen` instead

See @README.md for what the project does.
```

The last line is an import: `@` and a path pull another file in, so nothing needs copying.

It can live in a few places, and they add up rather than replace each other:

- `~/.claude/CLAUDE.md` is yours, for every project.
- `./CLAUDE.md` (or `./.claude/CLAUDE.md`) is the project's, committed so the team shares it.
- `./CLAUDE.local.md` is yours, for this project only. Keep it out of git.

Organisations can also set one for every machine they manage. Files in parent folders load at launch; ones in subfolders load when Claude starts working in them. To get going, run `/init` and Claude drafts one by looking through your codebase.

Keep it short, since every line costs context in every session. Be specific, too: "use 2-space indentation" is easier to follow than "keep the code tidy".

And remember it's context, not a contract. Claude follows it well, but nothing forces it to. For rules that must never break, use a hook (more on those below).

### AGENTS.md

Several other coding tools read a file called `AGENTS.md` instead. If your project has one, there's no need to copy it: put a line saying `@AGENTS.md` in your `CLAUDE.md`, and one file serves every tool.

### Rules: .claude/rules/

When `CLAUDE.md` grows, split it into topic files in `.claude/rules/`, like `testing.md` or `api.md`. A rule without frontmatter loads like `CLAUDE.md` does. A rule with `paths` loads only when Claude reads or edits a matching file, so the API rules stay out of the way while you're working on CSS:

```markdown
---
paths:
  - 'src/api/**/*.ts'
---

- Validate every request body
- Return errors in the shared `{ error, code }` shape
```

### Auto memory: MEMORY.md

Claude also keeps notes for itself: a build command it worked out, a correction you gave it, a preference you mentioned. They live in `~/.claude/projects/<project>/memory/`, on your machine and outside the repo. `MEMORY.md` is the index, one line per note, and its first 200 lines load into every session. The details sit in topic files beside it, read when needed.

It's plain Markdown, so you can read, edit or delete any of it. `/memory` lets you browse it, and you can switch it off if you'd rather Claude didn't keep notes.

## Skills: playbooks on demand

A skill is a folder with a `SKILL.md` in it: frontmatter saying what the skill is for, then the instructions. Templates, scripts or reference docs can sit in the folder too.

```markdown
---
description: Drafts release notes from recent commits. Use for a changelog.
---

## Recent commits

!`git log --oneline -20`

## Instructions

Group the commits above into Added, Changed and Fixed.
One plain-English line each, no commit hashes.
```

Save that as `.claude/skills/release-notes/SKILL.md`, and two things happen. You can run it by typing `/release-notes`. And Claude can reach for it on its own when you ask for release notes, because that matches the description. The line starting with `!` runs before Claude sees the skill, and is replaced by its output, so Claude starts with the real commits.

Skills are cheap to keep around. Only their descriptions sit in context; a skill's full instructions load when it's used. That makes skills the right home for long procedures that would bloat `CLAUDE.md`.

A few frontmatter fields worth knowing:

- `description` says what the skill does and when to use it. Claude decides from this, so write it with care.
- `disable-model-invocation: true` means only you can run it. Good for anything with side effects, like a deploy.
- `user-invocable: false` means only Claude can: background knowledge rather than a command.
- `allowed-tools` lists tools it may use without asking each time.
- `context: fork` runs it in a subagent, so its work stays out of your conversation.

Yours live in `~/.claude/skills/`, the project's in `.claude/skills/`, and plugins can bring their own.

If you've used `.claude/commands/` before: custom commands have been merged into skills. A file at `.claude/commands/deploy.md` still gives you `/deploy`, but a skill can do more, and wins if the two share a name. Skills also follow an open standard, [Agent Skills](https://agentskills.io), so they aren't tied to one tool.

## Hooks: things that must happen every time

Hooks are your own commands, run automatically at set points: when a session starts, before a tool runs, after a file is edited, when Claude finishes. The model doesn't get a say in whether they run. That's the difference from `CLAUDE.md`: an instruction is a request, a hook is a rule.

They live in a settings file: `~/.claude/settings.json` for all your projects, `.claude/settings.json` for the project, or `.claude/settings.local.json` for you alone. This one formats every file right after Claude edits it:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

Each hook gets the event as JSON on stdin: which tool, and with what input (these examples use `jq` to read it). The `matcher` picks the tools it fires for. The exit code is its answer:

- **Exit 0**: no objection, carry on.
- **Exit 2**: block it. Whatever the hook writes to stderr goes back to Claude, so it can change course.

That makes a `PreToolUse` hook a guard. This one keeps Claude's edits away from `.env` files:

```bash
#!/bin/bash
# .claude/hooks/no-env.sh: keep edits away from .env files
file=$(jq -r '.tool_input.file_path // empty')
if [[ "$(basename "$file")" == .env* ]]; then
  echo "Blocked: $file holds secrets; ask the user to change it." >&2
  exit 2
fi
exit 0
```

Register it like the formatter, under `PreToolUse` instead of `PostToolUse`, and make the script executable. It only watches the edit tools, not shell commands, so treat it as a guard rail rather than a vault.

There are lots of events. The ones you're likely to want first:

- `SessionStart`, when a session begins or resumes
- `UserPromptSubmit`, before Claude sees your prompt
- `PreToolUse` and `PostToolUse`, around every tool call (`PreToolUse` can block it)
- `Notification`, when Claude needs your attention: handy for a desktop ping
- `Stop`, when Claude finishes replying

Type `/hooks` to see what's set up. Hooks run with your permissions, so read one before you add it, as you would any script from the internet.

## Subagents: helpers with their own context

A subagent is a separate Claude with its own context window, instructions and tools. The main conversation hands it a job, it does the job, and only a summary comes back. That keeps big side tasks, like searching a large codebase or reading through logs, from flooding your conversation.

A few come built in, such as Explore, for read-only searching, and Plan, which researches the codebase in plan mode. Your own are Markdown files, in `.claude/agents/` for the project or `~/.claude/agents/` for you:

```markdown
---
name: test-writer
description: Writes and runs unit tests. Use after changing logic.
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---

You write focused unit tests. Match the project's existing test style,
cover the edge cases, run the tests, and report anything that fails, and why.
```

The body is the subagent's system prompt. `tools` limits what it can touch, and `model` lets a faster, cheaper model take simpler jobs. Claude reads the `description` to decide when to hand work over, or you can ask for a subagent by name.

## The rest, in a line each

- **`settings.json`** also holds permissions (what Claude may do without asking), the default model and environment variables. The more specific file wins: local beats project, and project beats your global settings.
- **Output styles**, in `.claude/output-styles/`, change how Claude talks, like explaining its choices as it works, or teaching you as it goes.
- **`.mcp.json`** connects outside tools, like an issue tracker or a database, through the [Model Context Protocol](https://modelcontextprotocol.io).
- **Plugins** bundle skills, subagents, hooks and MCP servers, so a whole setup can be installed in another repo in one go.

## What to reach for, and when

You don't need any of this on day one. Add each piece when you feel its absence:

- Claude gets the same thing wrong twice: add a line to `CLAUDE.md`.
- You keep typing the same prompt, or pasting the same checklist: make it a skill.
- A side task floods the conversation: hand it to a subagent.
- Something has to happen every single time: write a hook.
- Another repo needs the same setup: package it as a plugin.

---

All of it is plain text in your repo or home folder, so it can be reviewed, versioned and shared like any other code. Start with a short `CLAUDE.md`, and let the rest grow from there.
