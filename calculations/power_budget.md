# Power Budget & Wing Loading — Calculations

Last updated: 2026-07-24. Companion script: `power_budget.py`.
Run the script to regenerate these numbers whenever weight or geometry
changes — don't hand-edit the results below without re-running it.

> ⚠️ **Theoretical update, not yet bench-confirmed.** These numbers reflect
> the 7-cell string decided in `decisions/0001-cell-series-count.md`, run
> through the calculator. The 6→7 cell change has not yet been physically
> re-measured on the bench — see open questions in `CLAUDE.md`.

> ⚠️ **Wing updated 2026-07-22:** Clark-Y airfoil, 1200mm span, 200mm chord
> (was SD7037, 1210mm span, 150mm chord). The AUW estimate below has not
> been revisited for the larger wing — see open questions in `CLAUDE.md`.

> ⚠️ **Span updated again, 2026-07-24: 1200mm → 1220mm**, to match the
> full 4ft (1220mm) length of the actual foam stock selected — Owens
> Corning FOAMULAR NGX Project Panels (XPS, R-7.5, 1.5in × 14.25in ×
> 48in) — with no trim waste, for easier manufacturing. Also replaces
> the foam density used throughout this file: previously a generic
> "20–30 kg/m³ typical RC EPP foam" placeholder, now the real sourced
> density for this specific product (~20.8–25.6 kg/m³ — see
> `specs/components.md`). Both changes are reflected in the numbers
> below; re-run `power_budget.py` if either changes again.

## Inputs

- Wingspan: 1.22 m
- Chord: 0.20 m → wing area ≈ 0.244 m² (24.4 dm²)
- Estimated AUW: ~332.7–352.7 g (⚠️ estimate, needs a real scale
  measurement; midpoint 342.7 g used below; predates the wing geometry
  change above, so the unlisted airframe mass this AUW assumes may be
  understated for the larger wing)
- Airfoil: Clark-Y (classic flat-bottom section, widely used in RC gliders
  and trainers)

> **Update (2026-07-23):** the 3 SparkFun ACS723 current sensors are
> retired — not used at all anymore, and removed from
> `KNOWN_COMPONENTS_G` entirely (previously they were counted in the
> total mass even though excluded from flight-configuration mass). This
> drops the total/AUW estimate by 3.81g (347.4g → 343.6g midpoint) but
> does **not** change `flight_listed_mass_g()` or the 250g headroom
> below — those already excluded the ACS723s as bench-only gear. See
> `specs/wiring_diagram.md` and `specs/components.md`.
>
> **Update (2026-07-23, later same day):** the 5V Regulator is now
> identified (Pololu S7V7F5) and weighed (0.6g mfr. spec), and is added
> to `KNOWN_COMPONENTS_G`. This raises the total/AUW estimate by 0.6g
> (343.6g → 344.2g midpoint) and **does** change
> `flight_listed_mass_g()` and the 250g headroom below (243.6g → 244.2g,
> 6.4g → 5.8g headroom) — unlike the ACS723 removal above, the 5V
> regulator is a real flight component, not bench-only gear.
>
> **Update (2026-07-24):** Branch A (the planned solar+battery diode-OR
> tap for VBAT) is eliminated entirely — VBAT now wires directly to the
> ESC's red pin instead. The Ideal Diode Pair (1.46g) is removed from
> `KNOWN_COMPONENTS_G`, dropping the total/AUW estimate by 1.46g
> (344.2g → 342.7g midpoint) and the flight-config mass and 250g
> headroom the same way (244.2g → 242.7g, 5.8g → 7.3g headroom) — this
> is a real flight component being removed, not a bench-only exclusion.

## Weight budget vs. the 250g target (added 2026-07-22)

**A long-term goal, not a requirement for the current design** — see
`CLAUDE.md` Section 1. Kept here as a reference point for future
component/design decisions, not a call to change the current build.
Script output (`flight_listed_mass_g()`, `weight_budget_headroom_g()`):

```
Flight-config listed mass (excl. bench-only gear): 242.7 g
Headroom under 250g target, before ANY airframe structure: 7.3 g
```

**If this is pursued later, it'll mean reducing the component list,
not just building the airframe lighter.** Flight-configuration listed
components (242.7g — the retired ACS723 current sensors and Branch A's
now-eliminated Ideal Diode Pair are no longer counted at all, while the
now-identified/weighed 5V Regulator, 0.6g, is included — see the
2026-07-23/24 updates above) leave only ~7.3g of headroom before adding
the 3 recommended capacitors, or *any* airframe structure at all. The
"Wing loading vs. span" section below estimates the foam wing **alone**
at a minimum of ~61g (900mm span, low end of the actual FOAMULAR NGX
density) — already ~54g over that 7.3g headroom before spars, fuselage,
mount, wiring, or adhesives are added.

The two largest single line items in the component list — Solar Cells
(98g) and Main Battery (47.1g) — are also the two most central to this
project's actual mission (solar charging, energy storage), so cutting
either would be a real tradeoff against the project's core purpose,
not a free win.

Worth keeping in mind: the Clark-Y wing enlargement (chosen to lower
wing loading) and the 7th solar cell (chosen to fix the diode-OR
clamping problem) both moved weight in the wrong direction for this
target — good calls for the problems they solved, not being revisited
now, but worth factoring in alongside performance/reliability for
future changes.

## Wing loading

342.7 g over 24.4 dm² → **~14.0 g/dm²** (range ~13.6–14.5 g/dm² across the
332.7–352.7 g AUW estimate). Notably lower than the previous SD7037 wing
(18.2 dm², ~19.1 g/dm²) — the larger chord (150mm → 200mm) outweighs the
slightly shorter span (1210mm → 1220mm). Still glider territory, likely
even lower cruise power requirements relative to weight than before, though
that also assumes the airframe mass doesn't grow proportionally with the
extra wing area.

## Wing loading vs. span, chord fixed at 200mm (2026-07-22, estimate; span
and foam density updated 2026-07-24)

Prompted by a question about whether a smaller span (down to ~900mm,
the minimum needed to fit 7 SunPower C60 cells at 125mm each) would be
better. An earlier chat-only version of this analysis held AUW constant
across spans — that was wrong, since a bigger span at fixed chord means
more foam wing (and more spar length), so AUW should scale with span
too. This section corrects that, using `power_budget.py`'s
`wing_loading_by_span()`.

**Method:** models the *foam wing alone* as a solid, untapered airfoil
section (cross-section ≈ 0.7 × thickness × chord — a standard
engineering rule-of-thumb for airfoil area, not Clark-Y-specific) ×
foam density × span. "Everything else" (listed components, spars,
fuselage, mount, wiring, adhesives) is netted out from the current
342.7g AUW estimate at the current 1220mm span, so the model reproduces
that figure exactly at 1220mm and only the wing-foam portion scales for
other spans.

**Sources:** foam density updated 2026-07-24 to the actual material
selected — Owens Corning FOAMULAR NGX Project Panels (XPS, R-7.5, 1.5in
× 14.25in × 48in). R-7.5 at 1.5in = R-5/in, matching Owens Corning's
base "15 PSI" grade (FOAMULAR 150), whose datasheet states a minimum
density of 1.30 lb/ft³ (~20.8 kg/m³); 1.6 lb/ft³ (~25.6 kg/m³) is used
as a working upper bound since actual density typically runs above the
stated minimum. Replaces the earlier generic "20–30 kg/m³ typical RC
EPP foam" placeholder now that a specific real product is selected —
see `specs/components.md`. Clark-Y thickness ratio (11.7% of chord) is
a well-established figure. The 0.7 area coefficient is a general
airfoil-shape approximation, not sourced specifically for Clark-Y —
treat it as approximate.

| Span | Area | Wing mass (foam only) | Wing loading |
|---|---|---|---|
| 900mm (7-cell floor) | 18.0 dm² | 61–76g | ~17.5–17.8 g/dm² |
| 1000mm | 20.0 dm² | 68–84g | ~16.2–16.4 g/dm² |
| 1100mm | 22.0 dm² | 75–92g | ~15.1–15.2 g/dm² |
| 1200mm | 24.0 dm² | 82–101g | ~14.2 g/dm² |
| **1220mm (current)** | **24.4 dm²** | **83–102g** | **~14.0 g/dm²** |
| 1300mm | 26.0 dm² | 89–109g | ~13.4 g/dm² |
| 1500mm | 30.0 dm² | 102–126g | ~12.1–12.2 g/dm² |

**Corrected conclusion:** a bigger span still gives lower wing loading
within this realistic foam-density range — the trend from the earlier
(flawed) analysis was directionally right — but the improvement is more
modest than a constant-AUW comparison suggested, since part of the area
gain is offset by added wing weight. Going down to the 900mm floor is
somewhat less costly than the flawed analysis implied, and going bigger
than the current span is somewhat less beneficial.

**Important cross-check this surfaced:** at the current 1220mm span,
this model's foam-only wing mass estimate (83–102g, now with a real
sourced density rather than a generic placeholder) is comparable to or
*exceeds* the entire currently-documented "~90–110g estimated unlisted
mass" in `specs/components.md` — which is supposed to cover the wing
**and** spars, fuselage tube, motor mount, wiring, and adhesives
combined, not just the wing. That leaves little to nothing for
everything else in that bucket, which can't be right. This is a
concrete, physics-based reason (not just a vague suspicion) to believe
the current AUW estimate under-counts wing weight for the Clark-Y wing
— reinforcing the open question already flagged about this, not a new
one, and now on firmer footing since the foam density is a real
sourced figure rather than an assumption. Possible explanations: a
lightened (non-solid, e.g. ribbed) structure rather than a solid block,
the area-coefficient approximation running a bit high for the actual
shape, or the AUW estimate genuinely needing revising upward. Only a
real scale weight of the actual wing resolves this.

## Estimated cruise power

Using **50–70 W/kg** for a light glider airframe with some non-aerodynamic
payload drag (vs. 30–50 W/kg for a clean glider). This range is unchanged
from the SD7037 wing — it's not re-derived for the new wing loading, so
it's worth revisiting once real cruise-throttle current draw is measured
on the Clark-Y wing (a ~14.0 g/dm² wing loading is closer to the "clean
glider" end of the range than the old ~19.1 g/dm² was):

- At 0.3327 kg: ~16.6–23.3 W
- At 0.3527 kg: ~17.6–24.7 W

**Working estimate: ~17–24 W to sustain level cruise** (script output at the
342.7 g midpoint: 17.1–24.0 W).

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
- **⚠️ Update (2026-07-23) — the ~17–24W cruise estimate may not even be
  achievable without tripping the battery's BMS protection, and it
  looks like a fixed ceiling present from takeoff, not just late in a
  flight.** Root-cause testing has confirmed the ~2.9–3A-ish motor-draw
  shutdown seen in past tests is the battery's own BMS protection
  latching the whole bus off, not the ESC or FC (see
  `logs/test_flights.md`). An initial hypothesis that this was an
  undervoltage trip (with margin shrinking as the battery depletes) was
  tested at a second starting voltage and **overturned** — two
  battery-only tests (4.01V and 3.88V starting) tripped at essentially
  the same *current* (~2.9–3A), not the same voltage, pointing to a
  genuine overcurrent protection largely independent of SOC. At a
  ~3.7–4.2V bus, this 17–24W range works out to roughly 4–6.5A of total
  system current — with avionics at ~0.65–0.8A, the motor's share alone
  could plausibly exceed ~2.9–3A during *ordinary* cruise, not just at
  an extreme, **and this would apply throughout the flight, not only
  once the battery is depleted.** This turns the energy-balance verdict
  below from "is solar output enough" into a prior, more basic question:
  **can the design sustain cruise current at all without tripping the
  battery's overcurrent protection?** See the high-priority open
  question in `CLAUDE.md` §5.

## To do

- [ ] Replace estimated AUW with a real measured weight, now that the wing
      is a different size (Clark-Y, 1220×200mm) than the estimate assumed
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
