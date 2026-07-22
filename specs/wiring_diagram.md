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
- **No wire gauge, connector type, or physical routing captured here.**
  This is a topology/block diagram, not a build guide.

## Source

The branch topology (3 independent diode branches, their specific
destinations, the 5V regulator, and the current-sensor placements) was
confirmed directly, 2026-07-22. Everything else is derived from the
component list already in `specs/components.md`. Update this file
whenever the power path or component list changes, same as everything
else in `specs/`.
