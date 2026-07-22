# Solar Glider — Project Log Dashboard

A password-gated Next.js dashboard for the solar glider project. It reads
and writes files **directly in your docs repo** (`solar-airplane`) via the
GitHub API — there's no separate database. The repo stays the single source
of truth; this is just a nicer window into it than editing markdown files
by hand.

This is a **separate app from your docs repo**. It has its own GitHub repo
and its own Vercel project, and talks to your docs repo over the GitHub API
using a personal access token.

## What it does

- **Dashboard** (`/`) — view and edit `CLAUDE.md` directly
- **Specs** (`/specs`) — component table and datasheet extractions
- **Calc** (`/calculations`) — power budget and battery SOC write-ups
  (the `.py` scripts themselves stay code-only — keep running those through
  Claude Code, this just edits the accompanying `.md` explanations)
- **ADRs** (`/decisions`) — browse existing decision records, create new
  ones (auto-numbered) from a form
- **Logs** (`/logs`) — append structured, dated test entries to
  `logs/test_flights.md` without hand-editing markdown
- **Roadmap** (`/docs/roadmap.md`) — view and edit the phase plan

Every save is a real git commit to your docs repo, with a message like
`Update CLAUDE.md via dashboard`.

## Setup

### 1. Push this app to its own GitHub repo

```bash
cd solar-glider-dashboard
git init
git add .
git commit -m "Initial dashboard scaffold"
gh repo create solar-glider-dashboard --private --source=. --push
# or create the repo on github.com and `git remote add origin ...` + push
```

### 2. Create a GitHub Personal Access Token

Use a **fine-grained token** scoped to only the docs repo:

1. Go to <https://github.com/settings/personal-access-tokens/new>
2. Repository access → **Only select repositories** → pick
   `solar-airplane`
3. Permissions → **Contents: Read and write**
4. Generate, copy the token (starts with `github_pat_`)

### 3. Deploy to Vercel

1. Import the `solar-glider-dashboard` repo into Vercel
2. Add these environment variables (Project Settings → Environment
   Variables):

   | Variable | Value |
   |---|---|
   | `GITHUB_OWNER` | your GitHub username/org (owner of the docs repo) |
   | `GITHUB_REPO` | `solar-airplane` |
   | `GITHUB_BRANCH` | the branch to read/write — check whether that's `main` or the `claude/solar-fpv-glider-setup-oq43lr` branch your last Claude Code session pushed to |
   | `GITHUB_TOKEN` | the fine-grained PAT from step 2 |
   | `DASHBOARD_PASSWORD` | any passphrase you choose |

3. Deploy. Visit the URL, enter your passphrase, and you're in.

### 4. Local development (optional)

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

## Notes & limitations

- **Single-user, cookie-based auth.** This is a personal tool, not a
  multi-user app — the passphrase just gates a cookie. Don't reuse a
  sensitive password for it.
- **No merge conflict handling.** If you edit the same file on the website
  and in Claude Code at nearly the same time, whichever saves last wins
  (standard GitHub Contents API behavior — a stale `sha` will make a save
  fail with a clear error rather than silently overwriting, so you'd just
  need to reload and reapply your edit).
- **Doesn't run the Python scripts.** `calculations/power_budget.py` and
  `battery_soc.py` stay Claude Code's job — this dashboard only edits their
  companion markdown write-ups. If you want the website to actually execute
  those and show live output, that's a further step (Vercel serverless
  functions can run Python, but it's a bigger lift than this scaffold) —
  say the word if you want that added later.
- **Branch awareness.** Since your repo currently has work on a
  `claude/solar-fpv-glider-setup-oq43lr` branch, double check `GITHUB_BRANCH`
  points at wherever your latest committed state actually lives before
  relying on this for edits.
