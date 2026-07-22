# Wiring Diagram — Block/System Level

Last updated: 2026-07-22

> This is a **block-level power and signal diagram**, built mostly from
> the documented component list and power path (see `CLAUDE.md` §2–3 and
> `specs/components.md`), plus the diode topology below which was
> confirmed directly. Where interconnections still aren't confirmed,
> they're marked TBD rather than guessed.

## Main power & signal path

All 3 ideal-diode devices (the Ideal Diode Pair + the 2 Ideal Diode
Modules) are wired **in parallel, directly to the panel array** — not
cascaded. Each is its own OR path from array to battery bus.

```
Solar Array — 7x SunPower C60 (series), Voc≈5.0V Vmp≈4.06V
  -> Ideal Diode Pair (Pololu Power ORing, 6A)          -- parallel path 1
  -> Ideal Diode Module #1 (Pololu Ideal Diode Module)  -- parallel path 2
  -> Ideal Diode Module #2 (Pololu Ideal Diode Module)  -- parallel path 3
  (all 3 paths above rejoin at the same node below)
       -> Main Battery Bus — 18650 Li-ion, 2600 mAh, 1S
       -> Bulk Capacitor (bus smoothing)
            -> ESC -> Motor — T-Motor M1104 KV7500, 6x3 prop
            -> Flight Controller — ATOMRC F405 NAVI
                 -> GPS — BN-880
                 -> Receiver — Happymodel EP1 ELRS
                 -> Telemetry Radio — 915 MHz
                 -> Servos x4 — DM-S0020 micro
            -> Current Sensors x3 — ACS723 (exact placement on which
               leg: TBD)
```

## FPV rail (independent)

```
FPV Battery — 1S 400 mAh LiPo
  -> FPV Camera/VTX — AKK BA3 AIO Analog Cam + VTX
```

Runs on its own 1S rail, isolated from the main solar/avionics bus — see
`specs/components.md` ("Separate rail for FPV gear").

## Known unknowns / TBD

- **Current sensor placement.** The 3 ACS723 current sensors' exact
  positions (solar leg vs. battery leg vs. avionics/motor load) aren't
  documented — `CLAUDE.md` only records a measured ~1.5A avionics
  baseline, not which sensor took that reading.
- **No wire gauge, connector type, or physical routing captured here.**
  This is a topology/block diagram, not a build guide.

## Source

The diode topology (3 parallel paths from the panel array) was confirmed
directly, 2026-07-22. Everything else is derived from the component list
and power path description already in `specs/components.md` and
`CLAUDE.md` §2–3, not from an as-built photo or continuity trace. Update
this file whenever the power path or component list changes, same as
everything else in `specs/`.
