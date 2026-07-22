# Battery State of Charge (SOC) — Voltage Curve & Coulomb Counting

Last updated: 2026-07-21. Companion script: `battery_soc.py`.

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

## Better option: coulomb counting

The project already has 3× SparkFun ACS723 current sensors on the power
path. These can integrate current over time (∫I dt) for a materially more
accurate SOC estimate than voltage lookup alone, especially useful given how
flat the voltage curve is mid-range.

**Not yet implemented — see open questions in CLAUDE.md.**
Rough plan: log current sensor readings at a fixed interval (e.g. 1 Hz) from
the flight controller or a logging script, integrate to get Ah consumed/
gained, and subtract/add from the 2600 mAh nominal capacity.
