# Wiring Diagram — Block/System Level

Last updated: 2026-07-22

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

![Wiring diagram — solar array splits into 3 branches: a tentative
voltage-sense tap to the flight controller's VBAT pin, the FPV rail, and
the main battery bus, which converge again only at the shared flight
controller box.](wiring_diagram.svg)

Text version of the same diagram, for diffing/searching:

```
Solar Array — 7x SunPower C60 (series), Voc≈5.0V Vmp≈4.06V
  -> 5A Current Sensor (measures total array output, before the 3-way
     split below)
  -> splits into 3 independent branches:

BRANCH A — voltage-sense tap (TENTATIVE, still being decided)
  Ideal Diode Pair (Pololu Power ORing, 6A) — used as a single diode,
  not as a 2-input OR
    -> Flight Controller VBAT pin (the pin wired to the FC's onboard
       voltage-sense ADC) — used to monitor solar array/cell voltage via
       FC telemetry
    -> Undecided whether this stays, or gets replaced with a plain Ideal
       Diode Module like Branches B/C (see Known unknowns below)

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
         -> 5V Regulator -> Flight Controller, via the servo rail     -- parallel
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

## In-flight vs. bench-test instrumentation

All 4 current-sensing devices (the 5A array sensor, the 5A ESC-leg
sensor, and the 2 2A current meters) are **bench-test-only**. The
ATOMRC F405 NAVI flight controller has no free ADC channels beyond the
one wired to VBAT — none of these current readings can be logged or
telemetered in flight. They're only readable on the ground (e.g. by eye,
or with an external logger), during bench testing.

**In flight, only one voltage reading is available at all** — via
Branch A's tap into the FC's VBAT pin. Since Branch A is currently wired
to the **solar array**, not the main battery, that one in-flight reading
is solar array voltage, not main battery voltage. With the current
wiring, there is no way to monitor main battery voltage in flight. This
is worth confirming is intentional before finalizing Branch A — see
`CLAUDE.md` open questions.

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
- **At the 5V Regulator's output (servo rail) — recommended, not yet
  built.** Regulators generally need local output capacitance for
  stability and load-transient response; this isn't specific to this
  build the way the battery/array reasoning is. The servo rail is a
  textbook case for needing it — servo current draw comes in bursts
  when they move, a well-known cause of downstream brownouts even with
  a regulator/BEC upstream — and the consequence here is worse than
  usual, since this same rail also powers the Flight Controller. Check
  whether the (still-unspecified) regulator module already has onboard
  bypass capacitors before assuming it needs more.
- Avoid tantalum for any of these — reverse-voltage risk given this
  diode topology.
- **Candidate part confirmed 2026-07-22:** user has RLTZ series DIP
  solid-state (polymer) capacitors on hand — 680µF, 16V, ESR 15mΩ, 4.1A
  rms ripple rating, 8×12mm. Good fit for all three locations above
  (~3.1–3.8x voltage margin at each, low ESR matches the transient-
  response need). Polarized — verify correct polarity when installing
  at each location. Not yet installed anywhere.

## Known unknowns / TBD

- **Branch A is tentative.** Currently wired as described above, but
  still being decided — may be replaced with a plain Ideal Diode Module
  like Branches B/C. Don't treat Branch A as final.
- **Branch A power vs. sense.** Not confirmed whether the FC's VBAT pin,
  in this wiring, only feeds the FC's voltage-sense ADC, or also
  supplies the FC's operating power (VBAT pads are dual-purpose power +
  sense on many flight controllers). If it's also a power path, Branch A
  isn't purely instrumentation.
- **Current-sensor count/type doesn't reconcile with `specs/components.md`.**
  This session describes 4 distinct current-sensing devices: a 5A sensor
  between the array and the 3-way split, a 5A sensor between Branch C's
  node and the ESC, and a 2A current meter on each of Branch B's and
  Branch C's outputs. `specs/components.md` previously listed only
  "SparkFun ACS723 breakouts ×3" as the current-sensing hardware, with no
  distinction between 2A and 5A ratings. Are the "2A current meters" a
  different, previously undocumented product from the ACS723 breakouts?
  Is the ACS723 count/rating wrong? Needs reconciling before either count
  is treated as correct — see `specs/components.md` and `CLAUDE.md` open
  questions.
- **5V Regulator and 2A Current Meters are newly documented and
  unweighed.** Not previously in `specs/components.md`'s weight table —
  their weight isn't in the ~247g listed-components total or the AUW
  estimate.
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
in `specs/`.
