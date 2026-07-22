# Claude Code kickoff prompt

Paste the block below into Claude Code, run from inside the `solar-glider/`
folder (or point it at the folder path), to initialize this as a proper git
repo and get it working the way it's meant to.

---

```
This folder is a hardware project scaffold for a solar-electric FPV glider.
Before doing anything else, read CLAUDE.md in full — it's the persistent
project rulebook and must be read at the start of every session, not just
this one. Follow its "How to work in this repo" section for all future work.

Do the following now:

1. Initialize this as a git repository if it isn't already (git init), and
   create a .gitignore appropriate for a mixed markdown/Python project
   (Python cache/venv artifacts, OS files, editor files). Make an initial
   commit with a clear message.

2. Verify both scripts in calculations/ run cleanly:
   - calculations/power_budget.py
   - calculations/battery_soc.py
   Fix any issues if they don't run as-is.

3. Cross-check that specs/components.md, CLAUDE.md's component table, and
   calculations/power_budget.py's KNOWN_COMPONENTS_G dict all agree with
   each other. If any are inconsistent, reconcile them and note which was
   treated as source of truth.

4. Read decisions/0001-cell-series-count.md and logs/test_flights.md. This
   project just decided to move from a 6-cell to a 7-cell solar string.
   Update calculations/power_budget.py's N_CELLS_SERIES and
   solar_cells weight (14g x new count) to reflect 7 cells, re-run the
   script, and update calculations/power_budget.md's numbers to match the
   new output. Note in CLAUDE.md's "Open questions" section that this is a
   theoretical update pending real-world bench confirmation.

5. Set up a lightweight convention going forward: whenever I ask you to do a
   calculation in future sessions, add or update a script in calculations/
   rather than doing throwaway math in chat, and keep the matching .md
   explanation in sync. Whenever I report new measured data (voltage,
   current, weight, flight results), log it as a dated entry in
   logs/test_flights.md using the template at the top of that file, and
   check whether it changes any assumption elsewhere in the repo (flag
   anything that looks inconsistent rather than silently updating it).

6. After all of the above, give me a short summary of what's now in the
   repo, what you changed, and what the single most useful next physical
   test would be given the current open questions in CLAUDE.md.

Do not restructure the folder layout without asking me first — the
specs/calculations/decisions/logs/docs split is intentional and should stay
stable as the project grows.
```

---

## Notes on using this day-to-day

- **Every new Claude Code session:** it should read `CLAUDE.md` first
  automatically if you keep this as your project's system-level context file
  (most Claude Code setups pick up a `CLAUDE.md` at the project root
  automatically — if yours doesn't, just say "read CLAUDE.md first" at the
  start of each session).
- **Every new Claude Chat session** (e.g. coming back here to reason through
  a design decision before handing implementation to Claude Code): paste or
  upload `CLAUDE.md` at the start so the conversation starts from current
  project state instead of from scratch.
- **When you get new bench/flight data:** just tell Claude Code the raw
  numbers and ask it to log them — that's what step 5 above sets up as a
  standing convention.
