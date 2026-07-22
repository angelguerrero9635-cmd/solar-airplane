# Wiring Diagram — Block/System Level

Last updated: 2026-07-22

> This is a **block-level power and signal diagram inferred from the
> documented component list and power path** (see `CLAUDE.md` §2–3 and
> `specs/components.md`), not a diagram traced from the physical build.
> Where exact interconnections aren't documented elsewhere in this repo,
> they're marked TBD below rather than guessed.

## Main power & signal path

```
                       ┌───────────────────────────┐
                       │  Solar Array               │
                       │  7× SunPower C60 (series)   │
                       │  Voc≈5.0V  Vmp≈4.06V        │
                       └─────────────┬───────────────┘
                                     │
                       ┌─────────────▼───────────────┐
                       │  Ideal Diode Pair             │
                       │  (Pololu Power ORing, 6A)     │
                       │  — solar/battery OR node       │
                       └─────────────┬───────────────┘
                                     │
                 ┌───────────────────┼────────────────────┐
                 │                   │                    │
      ┌──────────▼─────────┐ ┌───────▼────────┐  ┌────────▼─────────┐
      │ Ideal Diode          │ │ Main Battery    │  │ Bulk Capacitor    │
      │ Modules ×2           │ │ Bus              │  │ (bus smoothing)   │
      │ (charging paths —     │ │ 18650 Li-ion,   │  │                   │
      │ exact wiring to the   │ │ 2600 mAh, 1S    │  │                   │
      │ OR node above: TBD)   │ │                 │  │                   │
      └──────────────────────┘ └───────┬────────┘  └───────────────────┘
                                        │
                  ┌─────────────────────┼──────────────────────┐
                  │                     │                      │
          ┌───────▼───────┐   ┌─────────▼─────────┐  ┌─────────▼─────────┐
          │ ESC → Motor    │   │ Flight Controller   │  │ Current Sensors    │
          │ T-Motor M1104  │   │ ATOMRC F405 NAVI     │  │ ACS723 ×3          │
          │ KV7500, 6×3    │   │                     │  │ (exact placement    │
          │ prop           │   │                     │  │  on which leg: TBD) │
          └────────────────┘   └─────────┬─────────┘  └────────────────────┘
                                          │
                ┌──────────────┬──────────┴──────────┬──────────────┐
                │              │                      │              │
        ┌───────▼──────┐ ┌─────▼──────┐   ┌───────────▼────────┐ ┌───▼────────┐
        │ GPS           │ │ Receiver    │   │ Telemetry Radio     │ │ Servos ×4  │
        │ BN-880        │ │ Happymodel  │   │ 915 MHz             │ │ DM-S0020   │
        │               │ │ EP1 ELRS    │   │                     │ │ micro      │
        └───────────────┘ └────────────┘   └─────────────────────┘ └────────────┘
```

## FPV rail (independent)

```
┌───────────────────────┐      ┌─────────────────────────────┐
│ FPV Battery             │────► │ FPV Camera/VTX                │
│ 1S 400 mAh LiPo         │      │ AKK BA3 AIO Analog Cam + VTX  │
└───────────────────────┘      └─────────────────────────────┘
```

Runs on its own 1S rail, isolated from the main solar/avionics bus — see
`specs/components.md` ("Separate rail for FPV gear").

## Known unknowns / TBD

- **Diode pair ↔ diode modules interconnection.** `specs/components.md`
  lists the Ideal Diode Pair (OR node) and the two additional Ideal Diode
  Modules as both part of the charging path, but doesn't document how
  they're wired relative to each other. Treat that part of the diagram as
  approximate until traced from the actual build.
- **Current sensor placement.** The 3 ACS723 current sensors' exact
  positions (solar leg vs. battery leg vs. avionics/motor load) aren't
  documented — `CLAUDE.md` only records a measured ~1.5A avionics
  baseline, not which sensor took that reading.
- **No wire gauge, connector type, or physical routing captured here.**
  This is a topology/block diagram, not a build guide.

## Source

Derived entirely from the component list and power path description
already in `specs/components.md` and `CLAUDE.md` §2–3 — not from an
as-built photo or continuity trace. Update this file whenever the power
path or component list changes, same as everything else in `specs/`.
