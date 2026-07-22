# Solar Glider Project

A 1.21m wingspan solar-electric FPV glider — prototyping toward extended
(and eventually, if the numbers support it, sustained) flight duration using
solar charging.

**Start here:** [`CLAUDE.md`](./CLAUDE.md) — the persistent project summary
and rulebook. Claude (chat or Code) should read this file first, every
session, before responding to anything project-related. Humans should read
it too; it's the fastest way back into context after time away.

## Structure

- `CLAUDE.md` — read first, always. Project state, key facts, open
  questions.
- `specs/` — component specs and datasheet extractions
- `calculations/` — power budget, wing loading, battery SOC (markdown +
  runnable Python)
- `decisions/` — numbered ADRs for significant design choices
- `logs/` — dated bench test and flight test entries
- `docs/roadmap.md` — phase plan from prototype to potential market
  introduction

The dashboard is **not** a folder in this repo — it's a separate app/repo,
[`solar-airplane-dashboard`](https://github.com/angelguerrero9635-cmd/Solar-airplane-dashboard),
deployed independently (e.g. to Vercel). It reads and writes this repo's
markdown files over the GitHub API, as a nicer front-end than hand-editing
files or going through Claude Code. It does not run the Python scripts in
`calculations/` — those stay Claude Code's job. See that repo's own README
for setup.
