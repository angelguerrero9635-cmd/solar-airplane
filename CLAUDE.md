# CLAUDE.md — Solar Glider Project Rulebook

> **Read this file first, every session, before doing anything else.**
> This is the persistent memory for the project. It should always reflect the
> current state of the design. When something changes (a component, a
> calculation, a decision), update this file in the same session.

## 1. Project summary

A 1.2m wingspan solar-electric FPV glider. Goal: maximize sustained/extended
flight duration using solar charging, starting as a prototyping exercise and
evolving toward a documented, reproducible design that could eventually be
shared, kitted, or sold.

**Current phase:** Prototyping (see `docs/roadmap.md` for phase definitions).

## 2. Current airframe & power architecture

- Foam wing, **Clark-Y** airfoil, 1200mm span, 200mm chord, carbon fiber
  spars (updated 2026-07-22, was SD7037, 1210mm span, 150mm chord)
- Carbon fiber tube/rod fuselage, 3D printed motor mount
- **Wing area:** ~0.24 m² (24.0 dm²)
- **Estimated AUW:** ~337–357g (see `calculations/power_budget.md`; updated
  for the 7-cell solar string, theoretical pending bench confirmation —
  this estimate predates the 2026-07-22 wing change and hasn't been
  revisited for it)
- **Wing loading:** ~14.0–14.9 g/dm² (sailplane range; lower than the
  previous ~18.5–19.6 g/dm² since the larger chord outweighs the slightly
  shorter span)
- Power path: solar array → ideal-diode OR → 1S Li-ion battery bus → ESC/motor
  and avionics

## 3. Key components (see `specs/components.md` for full table + sources)

| Component | Spec | Weight |
|---|---|---|
| Motor | T-Motor M1104 KV7500 | 5.61 g |
| Propeller | 6×3 | 14.52 g |
| ESC | Micro brushless ESC | 5.07 g |
| Flight Controller | ATOMRC F405 NAVI (full size) | 10.79 g |
| GPS | BN-880 | 13.23 g |
| Receiver | Happymodel EP1 ELRS | 1.50 g |
| Telemetry | 915 MHz radio | 16.14 g |
| FPV | AKK BA3 AIO Analog Cam + VTX | 4.73 g |
| Main Battery | 18650 Li-ion, 2600 mAh, 1S | 47.1 g |
| FPV Battery | 1S 400 mAh LiPo | 11.2 g |
| Solar Cells | SunPower C60, currently 7 in series (updated from 6, 2026-07-22) | 98 g (14 g ea.) |
| Servos | 4× DM-S0020 micro | 13 g total |
| Ideal Diode Pair | Pololu Power ORing (6A) | 1.46 g |
| Ideal Diode Modules | Pololu, ×2 (charging paths) | 0.27 g ea. |
| Current Sensors | SparkFun ACS723, ×3 | 1.27 g ea. |
| Capacitor | Electrolytic bulk | 0.7 g |

## 4. Known constraints & hard-won lessons

These are load-bearing facts. Don't re-derive them from scratch — reuse and
update instead.

- **SunPower C60 per-cell specs:** Voc ≈ 0.72V, Vmp ≈ 0.58V, Isc ≈ 6.0–6.3A,
  Imp ≈ 5.8–6.0A, Pmax ≈ 3.4–3.6W, 125×125mm, ~7g bare.
- **Diode-OR voltage clamping problem:** with a simple ideal-diode OR between
  solar array and battery bus, the array gets pulled toward bus voltage
  (~3.9–4.2V) rather than operating at its own Vmp. Since solar cells are
  current sources whose output current falls steeply above Vmp (toward Voc),
  this clamps available current well below the array's real capability.
  This is why a 6-cell series string (Vmp ≈ 3.5V) delivered only ~2.5A into a
  ~3.9V bus instead of its ~6A Imp capability.
- **Fix decided, theoretical:** moved from 6 to 7 series cells (2026-07-22)
  to raise string Vmp closer to typical battery voltage (a "poor man's
  MPPT" — static rather than dynamic matching). Calculated Vmp moves from
  ~3.48V to ~4.06V. **Not yet bench-confirmed** — see
  `decisions/0001-cell-series-count.md` and open questions below.
- **Avionics baseline draw:** ~1.5A (measured, no motor running).
- **Estimated cruise power draw:** ~17–24W depending on drag/weight (see
  `calculations/power_budget.md`).
- **"All-day" (dawn-to-dusk) flight is not currently realistic** with 6–8
  cells of this size; midday net-positive is achievable, morning/evening is
  battery-buffered only.

## 5. Open questions / next steps

- [ ] **The Clark-Y / 1200×200mm wing update (2026-07-22) hasn't been
      re-weighed.** Wing area and wing loading in this file,
      `specs/components.md`, and `calculations/power_budget.md`/`.py` have
      all been updated for the new geometry, but the ~90–110g unlisted
      airframe mass estimate (and therefore the ~337–357g AUW) still
      reflects the old SD7037/1210×150mm wing. A larger chord likely means
      more foam and skin material — confirm real weight once built.
- [ ] **The 6→7 cell update (2026-07-22) is theoretical only.**
      `calculations/power_budget.py`/`.md`, `specs/components.md`, and this
      file's component table have all been updated to reflect 7 cells and
      the new theoretical Vmp/Pmax numbers, but nothing has been physically
      changed or measured on the bench yet. Treat all 7-cell figures as
      predictions pending real-world confirmation — do not treat them as
      validated the way the 6-cell baseline in `logs/test_flights.md` is.
- [ ] Confirm actual Vmp of the array after adding the 7th cell (measured
      under real load, not just theoretical from datasheet)
- [ ] Decide whether an MPPT/buck stage is needed long-term vs. static
      series-cell matching
- [ ] Log a real test flight with current-sensor data to `logs/test_flights.md`
- [ ] Validate cruise power estimate against measured in-flight current draw
- [ ] Re-run wing loading / power budget once final AUW is weighed (not
      estimated)

## 6. How to work in this repo

- **Specs** go in `specs/` — one component or datasheet extraction per file.
  Always cite the source (product page, datasheet, or "estimated from photos"
  if inferred).
- **Calculations** go in `calculations/` as both a runnable script (Python
  preferred) and a short `.md` explaining assumptions and results in plain
  language. Re-run and update numbers whenever a component changes — don't
  let stale numbers sit uncorrected.
- **Decisions** go in `decisions/` as numbered ADRs (Architecture Decision
  Records) — one file per significant design choice, using the template in
  `decisions/0000-template.md`. Include the alternatives considered and why
  they were rejected.
- **Test flight logs** go in `logs/test_flights.md`, one dated entry per
  flight, with conditions, readings, and any deviation from predicted values.
- **Roadmap** lives in `docs/roadmap.md` — update phase status as the project
  moves from prototyping toward production.
- The **dashboard** is a separate app/repo (`solar-airplane-dashboard`), not
  a folder in this repo. It's a read-only Next.js app over a bundled
  snapshot of this repo's markdown files, refreshed manually via its
  `scripts/sync-content.sh` — not a live view. All edits still happen here,
  through Claude Code. It does not run `calculations/*.py`; those stay
  code-only. See that repo's own README for setup/deploy details.
- When asked to do a calculation, prefer writing/updating a script in
  `calculations/` over doing throwaway math in chat, so the work is reusable.
- When a component changes, update the table in this file (Section 3) in the
  same session — this file should never fall out of sync with reality.
- When new measured data is reported (voltage, current, weight, flight
  results), log it as a dated entry in `logs/test_flights.md` using the
  template at the top of that file. Then check whether it changes any
  assumption elsewhere in the repo (specs, calculations, open questions) —
  **flag inconsistencies rather than silently updating them**, since
  measured data reconciling with a theoretical estimate is a judgment call
  the human should confirm, not something to auto-resolve.
