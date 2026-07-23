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

**Weight target: eventually ≤250g takeoff weight (2026-07-22, not a
requirement for the current design).** In the US, aircraft under
0.55lb/250g flown recreationally are exempt from FAA registration
(still need the free TRUST test), per 14 CFR / the FAA's recreational
exception. The rule is based on **takeoff weight — everything attached
at the moment of flight** — confirmed current as of this search,
2026-07-22 (Sources below). Worth double-checking current requirements
before relying on this, since rules can change and this isn't legal
advice.

**The current design (7 cells, Clark-Y wing) is not being redone to
hit this now** — those were good decisions for the problems they
solved (diode-OR clamping, wing loading) and stand as-is. But **weight
is a significant, ongoing factor going forward**: future component
choices, wing/geometry iterations, and anything added to the build
should be weighed partly against this target, not decided on
performance/reliability alone. See Section 5 for the honest current-
design math (kept on record for reference, not as a call to action).

**Current phase:** Prototyping (see `docs/roadmap.md` for phase definitions).

## 2. Current airframe & power architecture

- Foam wing, **Clark-Y** airfoil, 1200mm span, 200mm chord, carbon fiber
  spars (updated 2026-07-22, was SD7037, 1210mm span, 150mm chord)
- Carbon fiber tube/rod fuselage, 3D printed motor mount
- **Wing area:** ~0.24 m² (24.0 dm²)
- **Estimated AUW:** ~334.2–354.2g (see `calculations/power_budget.md`;
  updated for the 7-cell solar string, theoretical pending bench
  confirmation — this estimate predates the 2026-07-22 wing change and
  hasn't been revisited for it; updated 2026-07-23 to drop the retired
  ACS723 current sensors, 3.81g, and again 2026-07-23 to add the
  now-identified/weighed 5V Regulator, 0.6g)
- **Wing loading:** ~13.9–14.8 g/dm² (sailplane range; lower than the
  previous ~18.5–19.6 g/dm² since the larger chord outweighs the slightly
  shorter span)
- Power path: solar array → 3 independent ideal-diode branches, **not
  rejoined downstream** — Branch A taps FC VBAT as a 2-input OR (solar
  array + main battery, **planned 2026-07-23, second input not yet
  wired**) for a contextually meaningful in-flight voltage reading,
  Branch B feeds the FPV rail, Branch C feeds the main battery
  bus/ESC/FC power (see `specs/wiring_diagram.md` for the full diagram —
  corrected 2026-07-22, an earlier version of this file wrongly assumed
  the branches rejoined at one shared bus)

## 3. Key components (see `specs/components.md` for full table + sources)

| Component | Spec | Weight |
|---|---|---|
| Motor | T-Motor M1104 KV7500 | 5.61 g |
| Propeller | 6×3 | 14.52 g |
| ESC | E-Power 1S 5A ESC (BE001), no BEC | 5.07 g (measured; mfr. spec sheet says 7.3g) |
| Flight Controller | ATOMRC F405 NAVI (full size) | 10.79 g |
| GPS | BN-880 | 13.23 g |
| Receiver | Happymodel EP1 ELRS | 1.50 g |
| Telemetry | 915 MHz radio | 16.14 g |
| FPV | AKK BA3 AIO Analog Cam + VTX | 4.73 g |
| Main Battery | 18650 Li-ion, 2600 mAh, 1S | 47.1 g |
| FPV Battery | 1S 400 mAh LiPo | 11.2 g |
| Solar Cells | SunPower C60, currently 7 in series (updated from 6, 2026-07-22) | 98 g (14 g ea.) |
| Servos | 4× DM-S0020 micro | 13 g total |
| Ideal Diode — Branch A | Pololu Power ORing, 2-input OR (solar + main battery, 2nd input planned/not yet wired), → FC VBAT | 1.46 g |
| Ideal Diode — Branch B | Pololu Ideal Diode Module, → FPV rail | 0.27 g |
| Ideal Diode — Branch C | Pololu Ideal Diode Module, → main battery bus | 0.27 g |
| 5V Regulator | Pololu S7V7F5 (step-up/step-down), feeds FC via servo rail (Branch C) | 0.6 g |
| 5A/2A Current Sensors (bench-only) | ×4 total (2× 5A, 2× 2A), never flown | n/a — no need to weigh |
| Current Sensors (RETIRED) | SparkFun ACS723, ×3 — not used at all anymore (retired 2026-07-22) | excluded from totals |
| Capacitor | Electrolytic bulk | 0.7 g |

## 4. Known constraints & hard-won lessons

These are load-bearing facts. Don't re-derive them from scratch — reuse and
update instead.

- **SunPower C60 per-cell specs:** Voc ≈ 0.72V, Vmp ≈ 0.58V, Isc ≈ 6.0–6.3A,
  Imp ≈ 5.8–6.0A, Pmax ≈ 3.4–3.6W, 125×125mm, ~7g bare.
- **Diode-OR voltage clamping problem:** analyzed for Branch C (solar
  array → its ideal diode → main battery bus — see
  `specs/wiring_diagram.md` for the 3-branch topology; this hasn't been
  separately analyzed for Branch B's FPV battery, which may have similar
  dynamics). With a simple ideal-diode OR between solar array and battery
  bus, the array gets pulled toward bus voltage (~3.9–4.2V) rather than
  operating at its own Vmp. Since solar cells are
  current sources whose output current falls steeply above Vmp (toward Voc),
  this clamps available current well below the array's real capability.
  This is why a 6-cell series string (Vmp ≈ 3.5V) delivered only ~2.5A into a
  ~3.9V bus instead of its ~6A Imp capability.
- **Fix decided, theoretical:** moved from 6 to 7 series cells (2026-07-22)
  to raise string Vmp closer to typical battery voltage (a "poor man's
  MPPT" — static rather than dynamic matching). Calculated Vmp moves from
  ~3.48V to ~4.06V. **Partially bench-confirmed 2026-07-22** — measured
  Voc 4.57V (below the ~5.0–5.1V theoretical — see
  `logs/test_flights.md`), and sag under battery-only load is much
  smaller than the 6-cell baseline's collapse. Not a full confirmation
  yet: no true Vmp measurement, and the motor-load test is still
  pending — see `decisions/0001-cell-series-count.md` and open
  questions below.
- **Avionics baseline draw:** ~1.5A (measured, no motor running, from
  the 2026-07-21 **6-cell** baseline test at ~73% battery SOC — see
  `logs/test_flights.md`). **⚠️ Possibly stale for the current 7-cell
  config:** a 2026-07-23 bench test with the battery topped off showed
  only 0.65–0.8A total draw with the battery not visibly contributing —
  see that entry's flagged discrepancy before treating either number as
  authoritative.
- **Estimated cruise power draw:** ~17–24W depending on drag/weight (see
  `calculations/power_budget.md`).
- **In-flight telemetry is limited to one voltage reading.** The ATOMRC
  F405 NAVI has no free ADC channels beyond VBAT, so none of the
  current-sensing devices (see `specs/wiring_diagram.md`) can be logged
  or telemetered in flight — they're all bench-test-only (the original 3
  ACS723s are retired/not used at all; the current 4-device bench set is
  a separate, still-in-use setup). The VBAT voltage sensor **has been
  calibrated** (confirmed 2026-07-23), so the raw reading is trustworthy
  — but as currently wired, VBAT is fed only from the solar array
  (Branch A), so the one in-flight reading is **solar array voltage,
  not main battery voltage**. **Planned fix (2026-07-23, not yet
  built):** Branch A's Ideal Diode Pair becomes a true 2-input OR (solar
  array + main battery → VBAT), so the single reading becomes solar
  voltage when solar is dominant, or battery voltage when running on
  battery power — see `specs/wiring_diagram.md`.
- **"All-day" (dawn-to-dusk) flight is not currently realistic** with 6–8
  cells of this size; midday net-positive is achievable, morning/evening is
  battery-buffered only.
- **Solar-only operation (no battery) can't ride through a passing
  cloud.** Bench-confirmed 2026-07-22 (see `logs/test_flights.md`): with
  no batteries connected, a brief cloud shadow browned out the ESC
  mid-motor-load-test. Battery buffering (as in the actual flight
  config) is required for continuous operation through variable
  lighting — not yet confirmed whether it actually prevents this failure
  mode, since that hasn't been separately tested.
- **Brownouts happen even with the battery connected, under current
  spikes.** Bench-observed 2026-07-22 (see `logs/test_flights.md`): with
  battery connected but solar barely supporting (shade), brownouts
  got *more* frequent, not less — hypothesized as the battery's own ESR
  causing terminal voltage to sag under fast current steps. Separately,
  the solar array alone (full sun) struggles at higher current spikes
  too, consistent with the diode-OR clamping behavior above. A capacitor
  is already at the ESC input; capacitors at the battery terminals and
  the array output are recommended but not yet built — see
  `specs/wiring_diagram.md` and `specs/components.md`.
- **Whether it's the ESC, the FC, or both browning out in the past
  bench data is not confirmed — but the shared-ground mechanism causing
  that ambiguity is now fixed (2026-07-23).** The FC and ESC used to
  share a single ground/return path — the FC had no independent ground
  wire to the battery/array negative bus, only a path through the ESC
  — so every "brownout" observed so far in `logs/test_flights.md` could
  have been the ESC failing, the FC failing, or a ground-bounce
  artifact of the shared path itself. **An independent FC ground wire
  (star ground) is now installed**, so a *future* re-test can actually
  distinguish these — but it doesn't retroactively resolve which one
  was happening in the existing data. See `specs/wiring_diagram.md`'s
  "Negative/return path" section.
- **The main battery's BMS disconnects it above ~4.2V (variable
  threshold, confirmed 2026-07-23) — a 4th possible confound for the
  existing brownout data.** This is an active protective cutoff, not
  just a voltage ceiling: whenever solar charges the pack to full while
  still connected, the BMS opens the connection entirely. The exact
  threshold isn't razor-precise — a same-day bench test observed the
  battery at 4.26V, "topped off" and not contributing (see
  `logs/test_flights.md`). None of the
  existing brownout bench entries in `logs/test_flights.md` recorded
  battery SOC/voltage at the time of failure, so it's not ruled out
  that some observed "brownouts" were actually the battery silently
  dropping out mid-test (removing its buffering right when it may have
  been needed), rather than the ESC, the FC, or ground bounce. Log
  battery SOC/voltage in future bench tests to rule this in or out.

## 5. Open questions / next steps

- [ ] **250g is a long-term goal, not a current blocker (2026-07-22) —
      kept for reference, not an active task.** The current design (7
      cells, Clark-Y wing) isn't being changed to hit this now. Honest
      math is in `calculations/power_budget.md`'s "Weight budget vs. the
      250g target": flight-configuration listed components alone leave
      only ~5.8g of headroom before any airframe structure is added, and
      the two biggest levers (Solar Cells 98g, Main Battery 47.1g) are
      also the two most central to the project's mission. Relevant
      whenever future components or design changes are being weighed —
      factor this target in alongside performance/reliability, without
      treating it as something that needs resolving today.
- [x] ~~ESC weight discrepancy (2026-07-22).~~ **Resolved 2026-07-23 —
      the measured weight (5.07g) is authoritative.** The E-Power BE001's
      own spec sheet says 7.3g, but that's the manufacturer's stated
      figure, not a measurement of the actual unit in this build — the
      5.07g figure already in `specs/components.md` and
      `calculations/power_budget.py` was a real scale weighing and
      stands. No change needed to the AUW total; the two figures simply
      aren't the same kind of number (spec-sheet nominal vs. this unit's
      actual scale weight).
- [ ] ~~ESC's 5V max rating vs. array's theoretical Voc (2026-07-22).~~
      **Re-opened 2026-07-23 — not reversed, but the premise behind
      "accepted as-is" needs a second look.** Original resolution:
      accept as-is, since reaching ~5V would need improved array
      efficiency at open circuit, and the "main battery disconnected"
      fault scenario was assumed rare. **New info undermines that
      premise:** the battery's own BMS disconnects it automatically
      every time it hits 4.2V (full charge) while solar is still
      charging it — a normal, recurring event on a sunny day, not a
      rare fault. If the motor happens to be idle at that instant (light
      avionics-only load), the array runs closer to its lightly-loaded
      voltage than the "sub-4V under load" assumption pictured. Measured
      Voc (4.57V) still has ~0.4V margin below 5V even unloaded, so the
      conclusion may still hold — but re-confirm rather than treat this
      as settled. **Partial, inconclusive data point (2026-07-23):** a
      bench test with the battery topped off (not contributing) and no
      motor load showed array voltage at 4.46–4.53V — comfortably under
      5V — but this wasn't the specific scenario in question (motor idle
      + battery genuinely BMS-disconnected simultaneously); see
      `logs/test_flights.md`. See `specs/components.md`.
- [x] ~~Branch A (VBAT voltage-sense tap) is undecided.~~ **Decided in
      concept, 2026-07-23** — not a plain Ideal Diode Module like
      Branches B/C after all. Branch A's Ideal Diode Pair becomes a true
      2-input OR: Input 1 = solar array (existing), Input 2 = main
      battery (**new — planned, not yet physically wired**), Output =
      FC VBAT pin. Gives a contextually meaningful in-flight reading —
      solar voltage when solar is dominant, battery voltage when running
      on battery power. **Sense-vs-power question resolved 2026-07-23
      (bench-confirmed, corrected from an earlier same-day theoretical
      guess):** connecting voltage to VBAT **does power on part of the
      flight controller** — Branch A is a real power input, not purely
      instrumentation. It does **not** power the servo rail, though —
      that stays dependent on the separate external 5V Regulator on
      Branch C. (An earlier pass at this question theorized, from the
      F405 NAVI's published 12–30V-input onboard BEC specs, that
      Branch A's ~4.4–4.6V would be too low to power anything on the
      board — direct bench testing shows that reasoning was wrong for
      at least part of the FC, even if the servo-rail BEC specifically
      needs more than Branch A provides.) Practical implication: with
      Branch A currently solar-only, that partial FC power depends on
      solar being present — the planned battery-input OR-ing change
      (above) also means that partial-FC-power domain stays up on
      battery alone, not just on sun. See `specs/wiring_diagram.md`.
- [ ] **Physically wire Branch A's new main-battery input (2026-07-23).**
      Decided in concept (see above), not yet built as of this writing —
      the second input wire (main battery positive → Ideal Diode Pair's
      second input) doesn't exist yet, unlike the FC ground isolation
      and 5V regulator VIN capacitor from the same evening's plan, both
      of which are now confirmed built (see resolved items above). Once
      wired, re-verify the VBAT reading actually tracks battery voltage
      when running on battery power (and solar voltage otherwise),
      rather than assuming the OR-ing behaves as expected.
- [x] ~~VBAT is rated far above what it's actually fed (2026-07-22).~~
      **Resolved 2026-07-23** — the voltage sensor has been calibrated
      for this lower range; the raw VBAT reading is now trustworthy. The
      ATOMRC F405 NAVI's VBAT input remaining manufacturer-rated for
      12–30V (3–6S) while actually fed ~4.4–4.6V is noted for
      completeness (see `specs/components.md`) but isn't a live concern.
- [x] ~~Current-sensor count/type doesn't reconcile.~~ **Resolved
      2026-07-23** — the original 3 SparkFun ACS723 breakouts are
      retired, not used at all anymore. The 4 distinct current-sensing
      devices (2× 5A sensor, 2× 2A current meter) are a separate,
      current bench-only setup, not the same hardware and not a
      count/rating discrepancy.
- [x] ~~5V Regulator is unweighed.~~ **Resolved 2026-07-23 — identified
      as a Pololu S7V7F5 (5V Step-Up/Step-Down Voltage Regulator),
      0.6g mfr. spec (no header pins), now in the ~244.2g
      listed-components total and the AUW estimate.** Input range
      2.7–11.8V comfortably covers Branch C's bus (~3.6–4.6V) — its
      buck-**boost** topology is exactly why it works on a bus that dips
      below 5V, where a buck-only regulator's output wouldn't hold. One
      new item this surfaced: Pololu's own spec calls for a ≥33µF/16V+
      capacitor at the regulator's *input* for stability, distinct from
      the servo-rail-output capacitor already recommended for transient
      response — see `specs/components.md` for both. (The 5A/2A
      bench-only current sensors, by contrast, are confirmed 2026-07-23
      to never need weighing — none of them fly.)
- [ ] **The Clark-Y / 1200×200mm wing update (2026-07-22) hasn't been
      re-weighed — and a physics estimate suggests the AUW is probably
      too low.** Wing area and wing loading in this file,
      `specs/components.md`, and `calculations/power_budget.md`/`.py` have
      all been updated for the new geometry, but the ~90–110g unlisted
      airframe mass estimate (and therefore the ~334.2–354.2g AUW) still
      reflects the old SD7037/1210×150mm wing. A larger chord likely means
      more foam and skin material. **Stronger evidence now (2026-07-22):**
      a foam-density-based estimate (`calculations/power_budget.md`'s
      "Wing loading vs. span" section) puts the foam wing *alone* at
      ~79–118g at the current span — comparable to or more than the
      entire 90–110g bucket that's supposed to also cover spars,
      fuselage, mount, wiring, and adhesives. Confirm real weight once
      built — this isn't just a stale estimate anymore, there's a
      concrete reason to think it's genuinely too low.
- [ ] **The 6→7 cell update is partially bench-confirmed (2026-07-22),
      not fully.** `calculations/power_budget.py`/`.md`, `specs/components.md`,
      and this file's component table were updated to reflect 7 cells and
      theoretical Vmp/Pmax back when the cell was added; a bench
      measurement now exists (`logs/test_flights.md`, 2026-07-22 entry) —
      Voc 4.57V (below the ~5.0–5.1V theoretical) and a much smaller load
      sag than the 6-cell baseline. Still pending: a true Vmp measurement
      and the motor-load test. Don't treat the theoretical Pmax/Vmp
      figures as validated until those land.
- [ ] **Voc shortfall vs. theoretical (2026-07-22).** Measured 7-cell Voc
      (4.57V) is ~9–11% below the datasheet-derived theoretical
      (~5.0–5.1V) — see `logs/test_flights.md`. Not yet investigated;
      possible causes include cell tolerance, temperature, or bench-test
      lighting conditions (not recorded for that entry). Repeat with
      conditions logged before concluding anything. Also worth checking:
      the array's operating voltage sits close to the ideal diodes' rated
      4V floor (see `specs/components.md`) — that's a plausible
      contributing factor to check, not a confirmed cause.
- [ ] Confirm actual Vmp of the array after adding the 7th cell (measured
      at the true max-power operating point, not just Voc under one load
      — see the caveat in the 2026-07-22 `logs/test_flights.md` entry).
      A motor-load test now exists (2026-07-22, solar-only, no
      batteries) with current readings up to 3A motor load, but no
      voltage was logged at any step — still no true Vmp point.
- [ ] **Overhead current jump during motor-load test (2026-07-22).**
      Solar output exceeded motor load by a steady 0.5A at low load but
      jumped to a steady 1.0A from 1.5A load upward (see
      `logs/test_flights.md`). Not distinguished between resistive/diode
      losses and the array's own I-V curve behavior (more current
      available as the bus sags further below Vmp) — needs voltage
      logged alongside current to resolve. Possibly related to the
      battery/array current-spike brownouts below — not established.
- [ ] **Build and validate the recommended capacitors — 1 of 4 locations
      done, prioritized 2026-07-23.** Candidate part confirmed 2026-07-22
      (RLTZ series 680µF/16V, ESR 15mΩ, from user's on-hand stock — good
      fit everywhere). Priority order and status:
      1. **5V Regulator VIN — confirmed installed, 2026-07-23.** Pololu's
         own datasheet spec for the S7V7F5, closer to
         required-for-stability than optional.
      2. Main battery terminals — not yet built. Fixes an
         already-measured brownout.
      3. Solar array output — not yet built. Fixes a separately-measured
         brownout (transient response, distinct from the 7-cell fix's
         steady-state clamping fix).
      4. 5V Regulator output (servo rail) — not yet built, not yet
         decided. Good practice, no specific measured failure there yet.
      See `specs/components.md` and `specs/wiring_diagram.md`. The FC's
      ground return is now independent of the ESC (see the resolved item
      above), so a re-test after installing the remaining 3 capacitors
      will actually be able to attribute results to a specific cause.
      Observe correct polarity when installing (polarized parts).
      **Weigh the actual on-hand parts** before assuming they don't
      matter against the ~5.8g remaining 250g headroom — no sourced
      weight found for this specific RLTZ part yet.
- [x] ~~Isolate the FC's and ESC's negative/return paths.~~ **Confirmed
      built 2026-07-23** — an independent ground wire now runs from the
      FC directly to the battery/array negative bus (star ground),
      replacing the old ESC-routed path. See `specs/wiring_diagram.md`'s
      "Negative/return path" section (diagrammed in `wiring_diagram.svg`
      too). **This fixes the mechanism, not the historical data** — a
      brownout re-test still needs to happen before concluding whether
      ESC or FC was actually failing in the existing bench entries;
      until then, treat this as "future tests are now trustworthy," not
      "the ESC/FC brownout question is answered."
- [x] ~~Decide whether an MPPT/buck stage is needed long-term vs. static
      series-cell matching.~~ **Resolved 2026-07-23 — sticking with
      static series-cell matching, no MPPT/buck stage for this design.**
      The 7-cell string's bench performance so far (much smaller load
      sag than the 6-cell baseline) supports matching solar output to
      bus load this way; the added weight/complexity/cost of a real
      MPPT stage isn't justified for this design. Revisit only if future
      bench data (true Vmp, motor-load test) shows the static match
      falling short.
- [ ] **Log a real bench test with current-sensor data** to
      `logs/test_flights.md` — current-sensor readings are bench-only
      (see Section 4); a real *test flight* will only yield the single
      VBAT voltage reading, not current data.
- [ ] Validate cruise power estimate against bench-measured current draw
      at cruise throttle — in-flight current draw can't be measured with
      this FC (no free ADC channel; see Section 4). If in-flight
      validation is wanted later, it needs a different approach (e.g. an
      add-on logger, or inferring from the one available voltage
      reading's discharge rate). The 2026-07-22 motor-load test has
      current data up to 3A load, but no voltage was recorded, so it
      can't yet be converted to Watts for comparison against
      `calculations/power_budget.md`'s estimate.
- [x] ~~Decide whether Branch A should sense main battery instead of
      solar array.~~ **Resolved 2026-07-23 — answer is "both," via
      OR-ing, not "instead of."** See the Branch A entry above: the
      Ideal Diode Pair becomes a 2-input OR (solar array + main battery),
      so the one in-flight VBAT reading reflects whichever source is
      higher, rather than trading one for the other.
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
