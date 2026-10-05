---
title: 'LLMs vs AI agents'
description: 'An LLM answers; an agent gets things done. What the difference really is, and how to tell which one a problem needs.'
date: 2026-05-12
tags: ['ai', 'llms', 'agents']
---

People use "LLM" and "AI agent" as if they meant the same thing. They don't, and the difference changes how you build with them. The short version: an LLM answers, and an agent acts.

## An LLM: text in, text out

A large language model is trained on a huge amount of text to predict what comes next. Give it a prompt and it writes a continuation: an answer, a summary, some code.

Three things are worth knowing about one:

- **It doesn't remember.** Every request starts from zero. When a chatbot seems to remember your conversation, the app is sending the whole conversation again each time.
- **It only knows two things:** what it learned in training, and what's in its context window, the text sent along with the request. Anything newer, or private, has to be put there.
- **It can't do anything by itself.** It can write the email, the query or the shell command, but it can't send, run or check them.

That's not a flaw. For plenty of jobs, like drafting, summarising, classifying or translating, one good prompt with the right context is all you need.

## An agent: a model in a loop

An agent wraps the model in a loop and gives it tools. You hand it a goal rather than a prompt, and then:

1. The model decides on the next step.
2. If the step needs a tool, like searching the web, reading a file, running the tests or calling an API, the model asks for it, and the code around it runs it.
3. The result goes back to the model, which decides again.
4. The loop ends when the goal is met, or when something tells it to stop.

Anthropic's guide [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) sums agents up as "typically just LLMs using tools based on environmental feedback in a loop". The idea goes back to research like [ReAct](https://arxiv.org/abs/2210.03629), which had a model alternate between reasoning about a task and acting on it.

Stripped down, the whole loop fits in a few lines:

```ts
// an agent, minus the error handling
const messages = [{ role: 'user', content: goal }]

while (true) {
  const reply = await model(messages, tools)
  messages.push(reply)
  if (!reply.toolCall) return reply.text // nothing left to do

  const result = await runTool(reply.toolCall) // search, read a file, call an API
  messages.push({ role: 'tool', content: result })
}
```

The model is the same in both cases. What changes is everything around it.

## What turns a model into an agent

- **Tools.** The model can't run anything itself, so it asks: it replies with a structured request, like "call `search` with these words", and your code does the work and hands back the result. You'll see this called tool use, or function calling. The [Model Context Protocol](https://modelcontextprotocol.io) is an open standard for plugging tools in, so one integration can serve many apps.
- **Memory.** The context window is short-term memory, and it fills up. Anything that should last lives outside it: files, a database, notes the agent writes for itself.
- **A goal, and a way to stop.** "Fix the failing test" has a finish line. Agents also need limits: a maximum number of steps, a budget, a timeout.
- **Guardrails.** An agent acts on your behalf, so decide what it may do without asking. Reading is cheap. Deleting, paying and sending deserve a person's yes.

## Workflows: the middle ground

Not everything with tools is an agent. _Building effective agents_ draws a useful line between two kinds of system:

- In a **workflow**, your code decides the steps. The model does each step well, but the path is fixed: sort the support ticket, then draft a reply, then check the tone.
- In an **agent**, the model decides the steps. You can't know the path in advance, so you let it find one.

|              | Who decides the steps | Good for                          | Watch out for                       |
| ------------ | --------------------- | --------------------------------- | ----------------------------------- |
| One LLM call | You, in the prompt    | Drafting, summarising, extracting | Missing context                     |
| Workflow     | Your code             | Repeatable jobs with known steps  | Rigid when the task varies          |
| Agent        | The model             | Open-ended jobs, like fixing bugs | Cost, speed, mistakes that compound |

## Which one do you need?

Start with the simplest thing that could work, and add moving parts only when it falls short. That's the guide's main advice, and it's good advice.

- If one prompt with the right context does the job, stop there. It's the fastest, the cheapest and the easiest to test.
- If you know the steps, write a workflow. It's predictable, and each step can be tested on its own.
- Reach for an agent when the path can't be known up front: debugging, research, changes across a whole codebase.

Agents earn their keep on hard problems, but they cost more. More calls mean more waiting and more money, and a small slip early on can snowball over twenty steps.

## Making agents behave

A few habits that make agents more reliable:

- **Write tools for the model.** Clear names, a description of when to use each one, and errors that say what went wrong. The model only knows what the description tells it.
- **Keep the toolbox small.** A few tools that each do one thing beat a long menu of overlapping ones.
- **Show the steps.** Log every tool call, so when something goes wrong you can see where.
- **Set limits.** Cap the steps, the time and the spend, and ask before anything that can't be undone.
- **Test on real tasks.** Keep a set of examples with known good outcomes, and rerun them whenever the prompt, the tools or the model change.

---

An LLM is the engine. An agent is the engine with a steering wheel, a map and brakes. To watch the whole loop at work, try a coding agent: give it a failing test, and you'll see it read the code, make a change, run the test and try again.
