# Power Budget & Wing Loading — Calculations

Last updated: 2026-07-22. Companion script: `power_budget.py`.
Run the script to regenerate these numbers whenever weight or geometry
changes — don't hand-edit the results below without re-running it.

> ⚠️ **Theoretical update, not yet bench-confirmed.** These numbers reflect
> the 7-cell string decided in `decisions/0001-cell-series-count.md`, run
> through the calculator. The 6→7 cell change has not yet been physically
> re-measured on the bench — see open questions in `CLAUDE.md`.

> ⚠️ **Wing updated 2026-07-22:** Clark-Y airfoil, 1200mm span, 200mm chord
> (was SD7037, 1210mm span, 150mm chord). The AUW estimate below has not
> been revisited for the larger wing — see open questions in `CLAUDE.md`.

## Inputs

- Wingspan: 1.20 m
- Chord: 0.20 m → wing area ≈ 0.24 m² (24.0 dm²)
- Estimated AUW: ~337–357 g (⚠️ estimate, needs a real scale measurement;
  midpoint 347.4 g used below; predates the wing geometry change above, so
  the unlisted airframe mass this AUW assumes may be understated for the
  larger wing)
- Airfoil: Clark-Y (classic flat-bottom section, widely used in RC gliders
  and trainers)

## Wing loading

347.4 g over 24.0 dm² → **~14.5 g/dm²** (range ~14.0–14.9 g/dm² across the
337–357 g AUW estimate). Notably lower than the previous SD7037 wing
(18.2 dm², ~19.1 g/dm²) — the larger chord (150mm → 200mm) outweighs the
slightly shorter span (1210mm → 1200mm). Still glider territory, likely
even lower cruise power requirements relative to weight than before, though
that also assumes the airframe mass doesn't grow proportionally with the
extra wing area.

## Estimated cruise power

Using **50–70 W/kg** for a light glider airframe with some non-aerodynamic
payload drag (vs. 30–50 W/kg for a clean glider). This range is unchanged
from the SD7037 wing — it's not re-derived for the new wing loading, so
it's worth revisiting once real cruise-throttle current draw is measured
on the Clark-Y wing (a ~14.5 g/dm² wing loading is closer to the "clean
glider" end of the range than the old ~19.1 g/dm² was):

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
- **Update (2026-07-22):** first bench numbers are in (see
  `logs/test_flights.md`) — Voc 4.57V (below theoretical) and much
  smaller load sag than the 6-cell case. This is encouraging but still
  not the measurement this verdict needs: no true Vmp reading, and no
  motor-load test yet, so the ~24W figure and this verdict stay
  unconfirmed for now.
- **Update (2026-07-22, motor-load test):** a solar-only (no battery)
  motor-load test now exists with current readings up to 3A motor load
  / 4A solar output — see `logs/test_flights.md`. Still can't convert to
  Watts or compare against the ~24W figure: no bus voltage was logged at
  any step. Also surfaced a new open question (an unexplained current
  "overhead" that jumps from 0.5A to 1.0A above motor load past 1.5A —
  see `CLAUDE.md`) and a real finding: this system can't ride through a
  passing cloud without battery buffering. Verdict stays unconfirmed
  until voltage is logged alongside current.

## To do

- [ ] Replace estimated AUW with a real measured weight, now that the wing
      is a different size (Clark-Y, 1200×200mm) than the estimate assumed
- [ ] Replace estimated cruise W/kg with a measured static current draw at
      cruise throttle (bench test with prop, no flight needed)
- [x] ~~Bench-measure the 7-cell string's actual voltage/current into the
      diode-OR node~~ — done 2026-07-22 for Branches B & C under
      battery-only and combined loads (see `logs/test_flights.md`); motor
      load still pending.
- [x] ~~Run the motor-load test for max current draw~~ — done 2026-07-22,
      solar-only (no batteries), current up to 3A motor load / 4A solar
      (see `logs/test_flights.md`). No voltage logged, so this doesn't
      close out the verdict below — repeat with voltage logged, and with
      batteries connected (the actual flight config).
- [ ] Determine true max motor/current draw — the 2026-07-22 test
      stopped at 3A; unclear if that's a real ceiling or just where
      testing stopped
- [ ] Update this file's verdict once real numbers are in
