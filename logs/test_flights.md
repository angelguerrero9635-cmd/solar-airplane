# Test Flight / Bench Test Log

One entry per test. Include ground/bench tests, not just flights — most of
the early validation here (solar output, current draw) doesn't require
flying.

Template for each entry:

```
## YYYY-MM-DD — short title

**Type:** bench test | ground roll | flight
**Conditions:** sun (clear/partial/overcast), time of day, temperature
**Config:** cell count, battery SOC at start, any changes since last entry

**Readings:**
- Solar array voltage/current:
- Battery voltage/current:
- Avionics draw:
- Motor draw (if applicable):

**Observations:**

**Deviation from prediction:** (compare against calculations/power_budget.md
and battery_soc.md — note if reality diverges and by how much)

**Follow-up:**
```

---

## 2026-07-21 — Baseline 6-cell string measurement

**Type:** bench test
**Conditions:** (fill in — sun condition/time not recorded in original
conversation)
**Config:** 6-cell SunPower C60 series string, 1S 2600mAh main battery

**Readings:**
- Solar array current: 2.5A (into diode-OR node)
- Battery current under full motor load: 1.5A (battery still contributing
  despite solar input)
- Avionics-only draw (no motor): 1.5A, mostly supplied by battery, not solar
- Battery resting voltage: 3.93V (~73% SOC per battery_soc.py)

**Observations:** Solar contribution far below theoretical (~6A Imp) even
under no-load conditions. Root-caused to diode-OR voltage clamping — see
`decisions/0001-cell-series-count.md`.

**Deviation from prediction:** Significant — expected solar to comfortably
cover avionics draw with surplus to charge battery; instead battery covered
most of avionics load even at rest.

**Follow-up:** Add 7th cell in series (ADR 0001), re-measure under identical
bench conditions before re-testing in flight.
