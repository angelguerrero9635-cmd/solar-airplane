# Power Budget & Wing Loading — Calculations

Last updated: 2026-07-22. Companion script: `power_budget.py`.
Run the script to regenerate these numbers whenever weight or geometry
changes — don't hand-edit the results below without re-running it.

> ⚠️ **Theoretical update, not yet bench-confirmed.** These numbers reflect
> the 7-cell string decided in `decisions/0001-cell-series-count.md`, run
> through the calculator. The 6→7 cell change has not yet been physically
> re-measured on the bench — see open questions in `CLAUDE.md`.

## Inputs

- Wingspan: 1.21 m
- Chord: 0.15 m → wing area ≈ 0.182 m²
- Estimated AUW: ~337–357 g (⚠️ estimate, needs a real scale measurement;
  midpoint 347.4 g used below, +14 g vs. the 6-cell estimate for the 7th
  solar cell)
- Airfoil: SD7037 (proven low-Reynolds sailplane section)

## Wing loading

347.4 g over 18.2 dm² → **~19.1 g/dm²** (range ~18.5–19.6 g/dm² across the
337–357 g AUW estimate). Still genuine glider territory, meaning low cruise
power requirements relative to weight — helped by the airfoil choice, hurt
somewhat by exposed FPV/GPS/telemetry antennas adding parasitic drag versus
a clean glider.

## Estimated cruise power

Using **50–70 W/kg** for a light glider airframe with some non-aerodynamic
payload drag (vs. 30–50 W/kg for a clean glider):

- At 0.337 kg: ~16.9–23.6 W
- At 0.357 kg: ~17.9–25.0 W

**Working estimate: ~17–24 W to sustain level cruise** (script output at the
347.4 g midpoint: 17.4–24.3 W).

## Solar output estimate (7-cell string, theoretical)

- 7-cell string: Voc ≈ 5.04V, Vmp ≈ 4.06V → theoretical Pmax ≈ **24.0W** (at
  true Vmp, MPPT-matched) — up from ~20.5W theoretical at 6 cells.
- The point of the extra cell is to raise string Vmp from ~3.48V (6-cell)
  to ~4.06V (7-cell), landing close to typical battery bus voltage
  (3.9–4.2V) so the diode-OR node stops clamping the array away from its
  Vmp — see `decisions/0001-cell-series-count.md` for the full reasoning.
- **Not yet measured under load.** The 6-cell string's theoretical ~20.5W
  only delivered ~2.5A × ~3.9V ≈ ~10W in practice due to the clamping
  issue. Whether the 7-cell string actually reaches its theoretical ~24W
  (or lands somewhere between the 6-cell reality and the 7-cell theory)
  depends entirely on a real bench measurement, not this calculation.

## Energy balance verdict (as of 7-cell string, theoretical — pending bench test)

- If the 7-cell string performs at its theoretical ~24W ceiling: midday,
  good sun would put solar output at or above the ~17–24W cruise estimate —
  potentially net-positive at peak sun, a meaningful change from the 6-cell
  case.
- This verdict is **not yet trustworthy** — it assumes the diode-OR clamping
  problem is actually fixed by the voltage shift, which is a real-world
  question, not a calculation. Treat pre-bench-test.
- Main battery (2600 mAh, 1S ≈ 9.6 Wh) at a 17–24 W deficit → only ~25–35 min
  of reserve if solar contributes nothing net.
- **Conclusion: re-measure on the bench before revising this verdict
  further.** Do not treat the ~24W theoretical figure as achievable until
  confirmed — see `logs/test_flights.md` for the 6-cell baseline this needs
  to be compared against.

## To do

- [ ] Replace estimated AUW with a real measured weight
- [ ] Replace estimated cruise W/kg with a measured static current draw at
      cruise throttle (bench test with prop, no flight needed)
- [ ] **Bench-measure the 7-cell string's actual voltage/current into the
      diode-OR node** (same setup as the 6-cell baseline in
      `logs/test_flights.md`) and log the result
- [ ] Update this file's verdict once real numbers are in
