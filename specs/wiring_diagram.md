# Wiring Diagram — Block/System Level

Last updated: 2026-07-23

> This is a **block-level power and signal diagram**, built from the
> documented component list plus the diode/branch topology below, which
> was confirmed directly. Where interconnections still aren't confirmed,
> they're marked TBD rather than guessed.

> ⚠️ **Correction (2026-07-22):** an earlier version of this diagram
> assumed the 3 ideal-diode outputs rejoined at one shared battery-bus
> node. That was wrong — confirmed directly that each of the 3 diodes'
> outputs goes to a **different destination** (see the 3 branches below).
> Only Branch A's diode input and Branch B/C's diode inputs share the
> solar array; nothing downstream of the diodes is shared between
> branches.

## Main power & signal path

The solar array feeds 3 independent ideal-diode branches. All 3 diodes
share the same input (the solar array); their outputs are **not**
rejoined — each branch powers something different.

![Wiring diagram — solar array splits into 3 branches: a voltage-sense
OR-ing tap to the flight controller's VBAT pin (planned to also take a
second input from the main battery), the FPV rail, and the main battery
bus, which converge again only at the shared flight controller
box.](wiring_diagram.svg)

Text version of the same diagram, for diffing/searching:

```
Solar Array — 7x SunPower C60 (series), Voc≈5.0V Vmp≈4.06V
  -> 5A Current Sensor (measures total array output, before the 3-way
     split below)
  -> splits into 3 independent branches:

BRANCH A — VBAT OR-ing tap (PLANNED CHANGE, 2026-07-23 — decided in
concept, not yet physically built)
  Ideal Diode Pair (Pololu Power ORing, 6A) — used as a true 2-input OR
    Input 1: Solar Array (existing, confirmed)
    Input 2: Main Battery (NEW — planned, not yet wired)
    -> Output -> Flight Controller VBAT pin (the pin wired to the FC's
       onboard voltage-sense ADC)
    Purpose: a contextually meaningful in-flight voltage reading.
       Whichever input is higher wins (ideal-diode OR-ing behavior; each
       diode only conducts when its own input exceeds the shared output,
       so the two inputs never back-feed each other) — solar array
       voltage when solar exceeds battery voltage, main battery voltage
       when running on battery power (e.g. at night, in shade, or if
       solar output sags). This replaces the previous single-diode,
       solar-only tap and directly resolves the "no in-flight battery
       monitoring" gap flagged below.

BRANCH B — FPV rail
  Ideal Diode Module #1 (Pololu Ideal Diode Module)
    -> 2A Current Meter
         -> FPV Camera/VTX — AKK BA3 AIO Analog Cam + VTX     -- parallel
         -> FPV Battery — 1S 400 mAh LiPo                      -- parallel

BRANCH C — main battery bus
  Ideal Diode Module #2 (Pololu Ideal Diode Module)
    -> 2A Current Meter
         -> Main Battery — 18650 Li-ion, 2600 mAh, 1S               -- parallel
         -> 5A Current Sensor -> ESC -> Motor (T-Motor M1104 KV7500,
            6x3 prop)                                                -- parallel
         -> 5V Regulator (Pololu S7V7F5) -> Flight Controller, via the
            servo rail                                                -- parallel
              -> GPS — BN-880
              -> Receiver — Happymodel EP1 ELRS
              -> Telemetry Radio — 915 MHz
              -> Servos x4 — DM-S0020 micro
```

Note: Branch B's FPV rail is fed from solar (via Branch B's diode +
2A current meter) — it is **not** fully isolated from solar power the way
earlier documentation implied. It remains electrically separate from
Branch C's main battery bus, though — the two branches never rejoin.

Note (2026-07-22): the ESC (E-Power BE001) has **no built-in BEC** — its
own spec sheet says the receiver/servo rail is meant to be powered
directly from the battery, not from the ESC. This is exactly why this
build has a separate 5V Regulator on Branch C to power the FC via the
servo rail, rather than relying on ESC-supplied power — see
`specs/components.md`.

## Negative/return path (confirmed 2026-07-23 — a real build issue, not planned)

Everything above describes the positive-side branch topology. The
negative/ground return side has a real, currently-confirmed problem:
**the FC's only negative/return path right now is *through* the ESC**
— there is no independent ground wire from the FC directly to the
battery/array negative bus. This applies whenever the FC is powered via
battery or solar (i.e., essentially always in this build).

**Why this matters:** the ongoing "ESC brownout" troubleshooting (see
`logs/test_flights.md`) has observed the ESC and FC shutting down
*together*, and it's genuinely unclear whether that's (a) the ESC
failing, (b) the FC failing, or (c) a **ground-bounce artifact of the
shared return path** — a large current pulse through the ESC's ground
segment has some resistance/inductance, and if that segment sits
between the FC's ground reference and the true system ground (battery/
array negative), the FC's ground reference shifts during that pulse
even if the FC's own 5V supply (from the Branch C regulator) is
otherwise fine. That alone could look exactly like a brownout to the
FC, independent of whatever is actually happening to the ESC.

**Recommended fix, not yet built:** run an independent ground wire from
the FC directly to the battery/array negative bus (a proper star-ground
point), rather than letting the FC's return current flow through the
ESC's ground path. This is worth doing **before** the next round of
brownout re-testing (e.g. after installing the recommended capacitors),
since without it, a re-test still can't attribute an improvement (or
lack of one) to the ESC, the FC, or the ground path itself — see the
open question in `CLAUDE.md`.

## In-flight vs. bench-test instrumentation

None of the current-sensing devices shown in this diagram are used in
flight, or fly at all — every one of them is **bench-test-only** gear,
confirmed 2026-07-23. Two generations of this gear exist:

- **Retired (2026-07-22), not used at all anymore:** the original 3
  SparkFun ACS723 breakouts. Removed from the weight totals entirely —
  see `specs/components.md` and `calculations/power_budget.py`.
- **Current bench-only set, still shown in this diagram for now:** the
  4 devices depicted above (2× 5A current sensor, 2× 2A current meter).
  None of these are physically present at takeoff and none need to be
  weighed for flight-configuration purposes, but they're kept in this
  diagram since bench testing is still ongoing.

Separately, the ATOMRC F405 NAVI flight controller has no free ADC
channels beyond the one wired to VBAT — none of these current readings
could be logged or telemetered in flight even if they did fly. They're
only readable on the ground (e.g. by eye, or with an external logger),
during bench testing.

**In flight, only one voltage reading is available at all** — via
Branch A's tap into the FC's VBAT pin. The voltage sensor feeding this
reading **has been calibrated** (confirmed 2026-07-23 — see
`CLAUDE.md` open questions, resolved). The remaining limitation isn't
calibration, it's *what* that one reading represents: fed only from the
solar array, it can't reflect battery condition. **Branch A's planned
2-input OR-ing change (above) is the fix for this** — once the new
battery input line is physically built, the single VBAT reading becomes
solar voltage when solar is dominant, or battery voltage when running on
battery power, instead of solar-only. Until that line is actually wired,
the in-flight reading is still solar-array-only as before.

## Recommended physical wiring (proposed — not yet built)

> ⚠️ This section is a **recommendation**, not a description of what's
> actually built. Nothing below is confirmed — it's what to use if/when
> the physical wiring is done. Biased toward bare-wire solder joints over
> connectors wherever disconnect/modularity isn't essential, since every
> connector adds weight and a resistance joint (relevant given the
> existing diode-OR voltage clamping problem — see `CLAUDE.md` §4).

**Wire gauge**, by current level (none of these legs should exceed
~5–6A even at theoretical peak):

- **26 AWG silicone wire** — signal/low-current legs: Branch A's VBAT
  sense tap, FPV camera/VTX pigtail, GPS/receiver/telemetry UART leads,
  servo signal wires.
- **24 AWG silicone wire** — higher-current legs: solar array output
  before the 3-way split, Branch C's main battery/ESC leg.
- Silicone (not PVC) insulation throughout — stays flexible at thin
  gauges, standard for this build class.

**Connectors, by branch:**

- **Solar array → all 3 diode inputs:** direct solder, no connector.
  Permanent assembly; a connector here only adds weight and resistance.
- **Branch A (diode → FC VBAT):** solder directly to the FC's
  VBAT+/GND pads. Full-size FCs like the F405 NAVI typically expose these
  as bare solder pads for exactly this kind of custom power input.
  **New second input (planned, not yet wired):** a tap from the main
  battery's positive terminal into the Ideal Diode Pair's second input —
  26 AWG is plenty, since this is a sense tap (negligible current), not
  a power leg.
- **Branch B (FPV rail):** match whatever connector the FPV battery
  already ships with (PH2.0/JST-PH 2-pin is standard on 1S ~400mAh
  packs) rather than introducing a different connector family on the
  diode/meter side. Camera/VTX: direct solder pigtail, standard for AIO
  cams.
- **Branch C (main bus):** match whatever connector the main 18650 pack
  uses (often none — solder directly if the pack ships connector-less).
  5V regulator output → FC servo rail: use a spare **servo header pin**
  (2.54mm pitch, 3-pin) for +5V/GND — don't introduce a new connector
  type just for this. **ESC connectors are fixed by the actual unit, not
  a recommendation** — the E-Power BE001 ships pre-wired with a 2P
  battery plug (51005) or 1.25mm-pitch 2P battery plug (unclear which
  this unit uses) on the power side, and a 1.00mm-pitch 3P servo plug on
  the signal side. Match whichever battery-side plug this unit actually
  has rather than re-terminating it.
- **GPS/Receiver/Telemetry → FC:** if not already pigtailed from the
  factory, **JST-SH 1.0mm ("GH1.25"-style)** is the common convention for
  UART peripherals in this size class.
- **Bench-test current sensors:** since these are temporary by design
  (see "In-flight vs. bench-test instrumentation" above), don't build
  permanent connectors for them — clip leads or an undoable in-line
  solder joint is appropriate.

**Bulk capacitors** (added 2026-07-22, after bench troubleshooting
brownouts — see `logs/test_flights.md`):

- **At the ESC input** — already built, confirmed reality, not a
  recommendation. Buffers the load side.
- **At the main battery terminals — recommended, not yet built.**
  Addresses the battery's own voltage collapse under current spikes
  (ESR-limited transient response), which the ESC-side cap doesn't
  reach. Low-ESR electrolytic or polymer, ~220–470µF, placed as close to
  the terminals as practical.
- **At the solar array output, before/at the diode split —
  recommended, not yet built.** Addresses the array struggling with
  current spikes even in full sun, consistent with the diode-OR
  clamping behavior. Same type/value guidance as above.
- **At the 5V Regulator (Pololu S7V7F5) — recommended, not yet built,
  location updated 2026-07-23.** Two distinct reasons for a cap here,
  now that the regulator is identified:
  - **At the output (servo rail)** — the original reasoning: regulators
    generally need local output capacitance for load-transient
    response, and servo current draw comes in bursts when they move, a
    well-known cause of downstream brownouts. The consequence here is
    worse than usual, since this same rail also powers the Flight
    Controller.
  - **At the input (VIN)** — Pololu's own datasheet for the S7V7F5
    calls for a ≥33µF electrolytic (≥16V) here for regulator stability,
    a separate concern from the output-side reasoning above.
  The already-selected RLTZ 680µF/16V candidate part comfortably covers
  either location's requirement — decide whether to install it at VIN,
  at the output, or both (weight budget is tight, so this is worth a
  deliberate choice rather than doing both by default). See
  `specs/components.md`.
- Avoid tantalum for any of these — reverse-voltage risk given this
  diode topology.
- **Candidate part confirmed 2026-07-22:** user has RLTZ series DIP
  solid-state (polymer) capacitors on hand — 680µF, 16V, ESR 15mΩ, 4.1A
  rms ripple rating, 8×12mm. Good fit for all locations above
  (~3.1–3.8x voltage margin at each, low ESR matches the transient-
  response need). Polarized — verify correct polarity when installing
  at each location. Not yet installed anywhere.
- **Recommended install priority (2026-07-23), 4 locations total:**
  (1) 5V Regulator VIN — Pololu's own datasheet spec, closer to
  required-for-stability than optional; (2) main battery terminals —
  fixes an already-measured brownout; (3) solar array output — fixes a
  separately-measured brownout (transient response, distinct from the
  7-cell fix's steady-state clamping fix); (4) 5V Regulator output
  (servo rail) — good practice, but no specific measured failure there
  yet. The on-hand RLTZ part covers all four with margin — no sourcing
  decision, just install order. Weigh the actual parts before assuming
  they don't affect the ~5.8g remaining 250g headroom — no sourced
  weight found for this specific part yet.

## Known unknowns / TBD

- **ESC vs. FC brownout attribution (confirmed 2026-07-23, not yet
  resolved).** See "Negative/return path" above — the FC's ground
  return currently runs through the ESC, so it's unconfirmed whether
  the observed "brownouts" are the ESC, the FC, or a shared-ground-path
  artifact. Needs the negative paths physically separated before this
  can be answered.
- **Branch A's OR-ing plan is decided in concept, not yet physically
  built (2026-07-23).** The 2-input OR (solar array + main battery ->
  VBAT) described above is the intended final design — no longer
  "tentative, may be replaced with a plain diode module" as earlier
  drafts of this doc said. What's still outstanding is purely physical:
  the second input wire (main battery -> diode pair) doesn't exist yet.
- ~~**Branch A power vs. sense.**~~ **Resolved 2026-07-23, bench-
  confirmed** (correcting an earlier same-day theoretical pass on this
  same question): connecting voltage to VBAT **does power on part of
  the flight controller** — Branch A is a real power input, not purely
  a sense tap. It does **not** power the servo rail — that stays
  dependent on the separate external 5V Regulator on Branch C, as
  already documented above. (The F405 NAVI's published spec sheet lists
  onboard 5V/servo and 9V/VTX BECs fed from a 12–30V BAT input, which
  led to a first-pass guess that Branch A's ~4.4–4.6V would be too low
  to power anything on the board at all — direct bench testing shows
  that guess was wrong for at least part of the FC, even though the
  servo-rail BEC specifically does need more voltage than Branch A
  provides.) Practically: with Branch A currently solar-only, that
  partial FC power depends on solar being present — one more reason the
  planned battery-input OR-ing change above matters, since it keeps
  that power domain up on battery alone too, not just on sun.
- ~~Current-sensor count/type doesn't reconcile with
  `specs/components.md`.~~ **Resolved 2026-07-23:** the original 3
  SparkFun ACS723 breakouts are retired, not used at all anymore. The 4
  distinct current-sensing devices this doc describes (2× 5A sensor, 2×
  2A current meter) are a separate, current bench-only setup — not the
  same hardware as the retired ACS723s, and not a count/rating
  discrepancy to reconcile.
- ~~5V Regulator is still unweighed.~~ **Resolved 2026-07-23** —
  identified as a Pololu S7V7F5 (5V Step-Up/Step-Down Voltage
  Regulator), 0.6g mfr. spec, now in `specs/components.md`'s weight
  table and the AUW estimate. Its buck-**boost** topology (input
  2.7–11.8V) is why it can hold a 5V output even on Branch C's sub-5V
  bus, where a buck-only regulator's output would collapse.
- **Recommended battery/array/regulator capacitors not yet built or
  validated (2026-07-22).** The reasoning is sound (ESR/transient
  response for the battery and array; standard regulator design
  practice for the 5V regulator's servo-rail output), but whether they
  actually fix the observed brownouts hasn't been tested — see
  `logs/test_flights.md`'s follow-up.
- **ESC battery-plug variant unconfirmed.** The E-Power BE001 ships with
  either a 2P plug (51005) or a 1.25mm-pitch 2P plug on the battery
  side, per its own product images — which one this specific unit has
  isn't confirmed. Minor, but matters for matching connectors elsewhere
  on Branch C.
- **Physical wiring (gauge/connectors) is only a recommendation so far,
  not a confirmed build.** See "Recommended physical wiring" above —
  it's proposed, pending your decision to actually build it that way.
  No physical routing (how wires are run through the airframe) is
  captured here regardless.

## Source

The branch topology (3 independent diode branches, their specific
destinations, the 5V regulator, and the current-sensor placements) was
confirmed directly, 2026-07-22. Everything else is derived from the
component list already in `specs/components.md`. The physical-wiring
recommendation is exactly that — a recommendation, not a confirmed
build. The visual diagram (`wiring_diagram.svg`) is a hand-drawn
rendering of the same topology described in the text version above;
update both together if the topology changes, same as everything else
in `specs/`. **Scope note (2026-07-23):** both the text diagram and the
SVG depict the *positive*-side branch topology only — neither currently
shows ground/negative return routing. See "Negative/return path" above
for the confirmed (and currently problematic) negative-side topology,
which isn't reflected in the SVG.
