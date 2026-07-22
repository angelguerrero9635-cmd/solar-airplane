# Power Budget & Wing Loading — Calculations

Last updated: 2026-07-21. Companion script: `power_budget.py`.
Run the script to regenerate these numbers whenever weight or geometry
changes — don't hand-edit the results below without re-running it.

## Inputs

- Wingspan: 1.21 m
- Chord: 0.15 m → wing area ≈ 0.182 m²
- Estimated AUW: 330–350 g (⚠️ estimate, needs a real scale measurement)
- Airfoil: SD7037 (proven low-Reynolds sailplane section)

## Wing loading

330–350 g over 18.2 dm² → **~18–19 g/dm²**. This is genuine glider territory,
meaning low cruise power requirements relative to weight — helped by the
airfoil choice, hurt somewhat by exposed FPV/GPS/telemetry antennas adding
parasitic drag versus a clean glider.

## Estimated cruise power

Using **50–70 W/kg** for a light glider airframe with some non-aerodynamic
payload drag (vs. 30–50 W/kg for a clean glider):

- At 0.33 kg: ~16.5–23.1 W
- At 0.35 kg: ~17.5–24.5 W

**Working estimate: ~17–24 W to sustain level cruise.**

## Solar output estimate (current 6-cell string)

- Rated Imp ≈ 5.8–6.0A at Vmp ≈ 3.5V per string → theoretical max ≈ ~20W
- Realistic outdoor derate (sun angle, clouds, heat, non-ideal MPPT-less
  matching): often 40–60% of nameplate → **~8–12W realistic midday**, before
  accounting for the voltage-clamping issue documented in
  `decisions/0001-cell-series-count.md` (which was suppressing this further,
  down to the observed ~2.5A × ~3.9V ≈ ~10W ceiling, worse at bus voltages
  above Vmp).

## Energy balance verdict (as of 6-cell string, pre-fix)

- Midday, good sun: solar output roughly comparable to or slightly under
  cruise draw — marginal, not clearly net-positive.
- Morning/evening/cloud: solar well under cruise draw, drawing down battery.
- Main battery (2600 mAh, 1S ≈ 9.6 Wh) at a 17–24 W deficit → only ~25–35 min
  of reserve.
- **Conclusion: sustained "all day" flight not realistic at 6 cells.**
  Extending flight meaningfully beyond battery-only endurance is realistic,
  especially concentrated around peak sun. Re-run this section after the
  7-cell string is measured in practice.

## To do

- [ ] Replace estimated AUW with a real measured weight
- [ ] Replace estimated cruise W/kg with a measured static current draw at
      cruise throttle (bench test with prop, no flight needed)
- [ ] Re-measure solar output after 7th cell is added
- [ ] Update this file's verdict once real numbers are in
