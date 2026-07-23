# Battery State of Charge (SOC) — Voltage Curve & Coulomb Counting

Last updated: 2026-07-23. Companion script: `battery_soc.py`.

## Voltage-based lookup (resting voltage only, no load)

| Voltage (V) | Approx. SOC |
|---|---|
| 4.20 | 100% |
| 4.10 | ~90% |
| 4.00 | ~80% |
| 3.93 | ~70–75% |
| 3.85 | ~60% |
| 3.70 | ~40% |
| 3.50 | ~10% |
| 3.00 | 0% (cutoff) |

**Caveats:**
- This curve is flat through the 3.7–4.0V middle range, so voltage-based SOC
  is imprecise there.
- Must be measured at rest (no load for a few minutes) — under load, internal
  resistance sag makes the pack read lower than true SOC.
- **The 4.20V/100% row is an active cutoff, not a soft ceiling (confirmed
  2026-07-23):** the pack's BMS actively disconnects the battery above
  ~4.2V — the exact threshold is variable, not razor-precise (observed
  4.26V, battery "topped off," in a same-day bench test — see
  `logs/test_flights.md`). Under solar charging, once the pack reaches full, it doesn't just stop
  accepting charge — it drops off the bus entirely until voltage falls back
  under the BMS's reconnect threshold (not yet characterized). Any SOC
  logic (voltage-lookup or coulomb-counting) needs to account for the
  battery being able to disappear from the circuit at 100% SOC, not just
  plateau there — see `specs/components.md` and `CLAUDE.md`'s open
  questions for the operational implications (this affects the ESC
  overvoltage-margin question and is a new possible confound in past
  brownout bench data).

## Better option: coulomb counting

**⚠️ Stale as written (flagged 2026-07-23, not resolved):** this section
originally assumed the 3 SparkFun ACS723 current sensors as the basis for
coulomb counting. Those are retired — not used at all anymore (see
`CLAUDE.md` §5, 2026-07-22) — and even the current bench-only current
sensors can't be logged in flight, since the FC has no free ADC channel
beyond VBAT (`CLAUDE.md` §4). Coulomb counting as described below would
need either a different FC/logger with a spare current-sense ADC input, or
a different approach entirely — this is the same gap already flagged in
`docs/roadmap.md`'s Phase 2 item, not a new one, just repeated here since
this file describes the same plan.

Rough plan (unchanged, still needs the hardware gap above resolved first):
log current sensor readings at a fixed interval (e.g. 1 Hz) from the flight
controller or a logging script, integrate to get Ah consumed/gained, and
subtract/add from the 2600 mAh nominal capacity.
