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
- **Estimated AUW:** ~337–357g (see `calculations/power_budget.md`; updated
  for the 7-cell solar string, theoretical pending bench confirmation —
  this estimate predates the 2026-07-22 wing change and hasn't been
  revisited for it)
- **Wing loading:** ~14.0–14.9 g/dm² (sailplane range; lower than the
  previous ~18.5–19.6 g/dm² since the larger chord outweighs the slightly
  shorter span)
- Power path: solar array → 3 independent ideal-diode branches, **not
  rejoined downstream** — Branch A (tentative) taps FC VBAT for
  cell-voltage monitoring, Branch B feeds the FPV rail, Branch C feeds
  the main battery bus/ESC/FC power (see `specs/wiring_diagram.md` for
  the full diagram — corrected 2026-07-22, an earlier version of this
  file wrongly assumed the branches rejoined at one shared bus)

## 3. Key components (see `specs/components.md` for full table + sources)

| Component | Spec | Weight |
|---|---|---|
| Motor | T-Motor M1104 KV7500 | 5.61 g |
| Propeller | 6×3 | 14.52 g |
| ESC | E-Power 1S 5A ESC (BE001), no BEC | 5.07 g (mfr. spec says 7.3g, unreconciled) |
| Flight Controller | ATOMRC F405 NAVI (full size) | 10.79 g |
| GPS | BN-880 | 13.23 g |
| Receiver | Happymodel EP1 ELRS | 1.50 g |
| Telemetry | 915 MHz radio | 16.14 g |
| FPV | AKK BA3 AIO Analog Cam + VTX | 4.73 g |
| Main Battery | 18650 Li-ion, 2600 mAh, 1S | 47.1 g |
| FPV Battery | 1S 400 mAh LiPo | 11.2 g |
| Solar Cells | SunPower C60, currently 7 in series (updated from 6, 2026-07-22) | 98 g (14 g ea.) |
| Servos | 4× DM-S0020 micro | 13 g total |
| Ideal Diode — Branch A (tentative) | Pololu Power ORing, used as single diode, → FC VBAT | 1.46 g |
| Ideal Diode — Branch B | Pololu Ideal Diode Module, → FPV rail | 0.27 g |
| Ideal Diode — Branch C | Pololu Ideal Diode Module, → main battery bus | 0.27 g |
| 5V Regulator | Feeds FC via servo rail (Branch C) | TBD |
| 2A Current Meters | ×2, Branch B + C outputs | TBD |
| Current Sensors | SparkFun ACS723, ×3 (count doesn't yet reconcile — see open questions) | 1.27 g ea. |
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
- **Avionics baseline draw:** ~1.5A (measured, no motor running).
- **Estimated cruise power draw:** ~17–24W depending on drag/weight (see
  `calculations/power_budget.md`).
- **In-flight telemetry is limited to one voltage reading.** The ATOMRC
  F405 NAVI has no free ADC channels beyond VBAT, so none of the 4
  current-sensing devices (see `specs/wiring_diagram.md`) can be logged
  or telemetered in flight — they're bench-test-only. And since VBAT is
  currently wired to the solar array (Branch A, tentative), not the main
  battery, the one in-flight reading available is **solar array
  voltage, not main battery voltage** — there is no in-flight main
  battery voltage monitoring with the current wiring.
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
  battery connected but solar barely supporting (shade), ESC brownouts
  got *more* frequent, not less — hypothesized as the battery's own ESR
  causing terminal voltage to sag under fast current steps. Separately,
  the solar array alone (full sun) struggles at higher current spikes
  too, consistent with the diode-OR clamping behavior above. A capacitor
  is already at the ESC input; capacitors at the battery terminals and
  the array output are recommended but not yet built — see
  `specs/wiring_diagram.md` and `specs/components.md`.

## 5. Open questions / next steps

- [ ] **250g is a long-term goal, not a current blocker (2026-07-22) —
      kept for reference, not an active task.** The current design (7
      cells, Clark-Y wing) isn't being changed to hit this now. Honest
      math is in `calculations/power_budget.md`'s "Weight budget vs. the
      250g target": flight-configuration listed components alone leave
      only ~6.4g of headroom before any airframe structure is added, and
      the two biggest levers (Solar Cells 98g, Main Battery 47.1g) are
      also the two most central to the project's mission. Relevant
      whenever future components or design changes are being weighed —
      factor this target in alongside performance/reliability, without
      treating it as something that needs resolving today.
- [ ] **ESC weight discrepancy (2026-07-22).** Now identified as E-Power
      BE001 (from its own spec sheet) — mfr. spec says 7.3g, but this
      file/`specs/components.md` already had 5.07g recorded before the
      model was known. Not reconciled — reweigh the actual unit to
      confirm which figure is real before trusting the AUW total.
- [ ] **ESC's 5V max rating vs. array's theoretical Voc (2026-07-22).**
      The E-Power BE001 is rated "1S, 5V max." The array's theoretical
      Voc (~5.0–5.1V) is right at/above that in a fault scenario (main
      battery disconnected, array still connected to Branch C) — though
      the *measured* Voc (4.57V) has more margin. Not confirmed as an
      actual problem, just close enough to check rather than assume
      safe — see `specs/components.md`.
- [ ] **Branch A (VBAT voltage-sense tap) is undecided.** Currently wired
      solar array → Ideal Diode Pair (used as a single diode) → Flight
      Controller VBAT pin, to monitor cell voltage via FC telemetry — but
      not finalized; may be replaced with a plain Ideal Diode Module like
      Branches B/C. Also unconfirmed whether this VBAT connection is
      purely a sense tap or also delivers power to the FC. See
      `specs/wiring_diagram.md`.
- [ ] **VBAT is rated far above what it's actually fed (2026-07-22).**
      The ATOMRC F405 NAVI's VBAT input is manufacturer-rated 12–30V
      (3–6S), but Branch A feeds it ~4.4–4.6V — a 1S-equivalent voltage,
      far below spec. The FC's voltage-divider scaling is likely
      calibrated for a 3–6S pack, so the raw reading probably needs
      manual recalibration to mean anything. Not confirmed whether
      under-ranging like this is safe for this specific board (usually
      fine for a sense pin, but unverified here) — see
      `specs/components.md`.
- [ ] **Current-sensor count/type doesn't reconcile.** 2026-07-22 wiring
      details describe 4 distinct current-sensing devices (2× 5A sensor,
      2× 2A current meter), but `specs/components.md` previously listed
      only 3 ACS723 breakouts with no rating distinction. Confirm whether
      the 2A meters are a separate product from the ACS723s, or whether
      the ACS723 count/rating needs correcting, before treating either as
      final.
- [ ] **5V Regulator and 2A Current Meters are unweighed.** Newly
      documented 2026-07-22, not yet in the ~247g listed-components total
      or the AUW estimate — weigh once specced/sourced.
- [ ] **The Clark-Y / 1200×200mm wing update (2026-07-22) hasn't been
      re-weighed — and a physics estimate suggests the AUW is probably
      too low.** Wing area and wing loading in this file,
      `specs/components.md`, and `calculations/power_budget.md`/`.py` have
      all been updated for the new geometry, but the ~90–110g unlisted
      airframe mass estimate (and therefore the ~337–357g AUW) still
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
- [ ] **Build and validate the recommended battery/array/regulator
      capacitors (2026-07-22).** Recommended in `specs/wiring_diagram.md`
      and `specs/components.md` to address the ESC-brownout-under-battery
      and solar-current-spike findings, plus standard regulator-stability
      practice for the 5V regulator's servo rail (which also powers the
      FC). Candidate part confirmed 2026-07-22 (RLTZ series 680µF/16V,
      ESR 15mΩ, from user's on-hand stock — good fit at all 3 locations),
      but none are installed yet. Re-test after installing to confirm
      brownout frequency actually improves — the reasoning is sound but
      unvalidated. Also check whether the regulator module already has
      onboard bypass caps before assuming it needs more, and observe
      correct polarity when installing (these are polarized parts).
- [ ] Decide whether an MPPT/buck stage is needed long-term vs. static
      series-cell matching
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
- [ ] **Decide whether Branch A should sense main battery instead of
      solar array.** As wired, the one in-flight voltage reading (VBAT)
      shows solar array voltage, not main battery voltage — meaning no
      in-flight main battery monitoring exists currently. Confirm this
      tradeoff is intended, especially since Branch A's whole wiring is
      still tentative anyway.
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
