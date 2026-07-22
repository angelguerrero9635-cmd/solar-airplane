# ADR 0001: Solar cell series count (6 → 7)

- **Status:** accepted (pending real-world measurement to confirm)
- **Date:** 2026-07-21

## Context

The 6-cell SunPower C60 series string (Vmp ≈ 3.5V) was measured delivering
only ~2.5A into the battery bus (~3.9V) under load, despite the cells being
capable of ~5.8–6.0A at their true max-power point. Avionics alone draw
~1.5A, and under no-motor-load conditions the battery was still supplying
most of that current rather than the solar array — indicating the array
wasn't contributing meaningfully even at rest.

Root cause: the array connects to the battery bus via a simple ideal-diode
OR with no MPPT. This forces the array to operate at whatever voltage the
bus sits at, not at its own Vmp. Since Vmp (3.5V) sits below typical battery
voltage (3.9–4.2V), the array gets pulled past its optimal point toward Voc,
where available current falls off steeply.

## Options considered

1. **Add a full MPPT/buck-boost stage between array and bus.** Most
   technically correct fix — dynamically tracks true max power point
   regardless of bus voltage. Cost: added weight, complexity, and another
   point of failure. Not ruled out long-term, but heavier lift for a
   prototype iteration.
2. **Add series cells to raise string Vmp toward bus voltage ("poor man's
   MPPT").** Cheap, no new components, uses cells already on hand. Downside:
   static match only — as battery voltage changes over a charge/discharge
   cycle, or as temperature shifts cell Vmp, the match drifts. Overshooting
   (too many cells) reintroduces the same clamping problem from the other
   direction and would then need a buck regulator anyway.
3. **Do nothing / accept current output.** Rejected — leaves most of the
   array's rated capacity unused, undermining the entire point of adding
   solar.

## Decision

Add **1 cell** (6 → 7 in series). Calculated Vmp moves from ~3.5V to ~4.06V,
landing close to typical battery voltage (3.7–4.2V range) without requiring
a regulator. Adding 2 cells (→8) was rejected for this step: calculated Vmp
(~4.6V) overshoots typical battery voltage, likely re-clamping current from
the high side and requiring a buck converter to use effectively — deferred
unless the 7-cell result proves insufficient.

## Consequences

- New string Voc ≈ 5.0V. Confirm diode-OR components, current sensors, and
  the battery charge path tolerate this without a regulator (see CLAUDE.md
  §4 for the ACS723 sensors already in the current-sense path).
- Re-measure real-world string voltage and current under load after the 7th
  cell is added — theoretical Vmp doesn't guarantee actual operating point
  under the diode-OR topology; needs empirical confirmation.
- Update `calculations/power_budget.py` cell count and re-run the power
  budget once measured.
- Log the result as a new entry in `logs/test_flights.md` or a bench-test
  note if it's measured on the ground first.
- If 7 cells doesn't meaningfully close the gap, escalate to Option 1
  (MPPT/buck stage) rather than jumping straight to 8+ cells.
