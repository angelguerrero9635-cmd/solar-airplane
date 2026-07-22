# Component Specifications

Last updated: 2026-07-22

## Airframe

| Component | Spec | Weight | Notes |
|---|---|---|---|
| Wing | Foam, Clark-Y airfoil, 1200mm span, 200mm chord | — | Wing area ≈ 0.24 m² (24.0 dm²). Updated 2026-07-22 from SD7037, 1210×150mm. |
| Spars | Carbon fiber | — | |
| Fuselage | Carbon fiber tube/rod | — | |
| Motor mount | 3D printed | — | |

## Propulsion

| Component | Spec | Weight | Notes |
|---|---|---|---|
| Motor | T-Motor M1104 KV7500 | 5.61 g | High KV, small brushless outrunner |
| Propeller | 6×3 | 14.52 g | |
| ESC | Micro brushless ESC | 5.07 g | |

## Avionics

| Component | Spec | Weight | Notes |
|---|---|---|---|
| Flight Controller | ATOMRC F405 NAVI (full size) | 10.79 g | |
| GPS | BN-880 | 13.23 g | |
| Receiver | Happymodel EP1 ELRS | 1.50 g | |
| Telemetry Radio | 915 MHz | 16.14 g | |
| FPV Camera/VTX | AKK BA3 AIO Analog Camera + VTX | 4.73 g | |
| Servos | 4× DM-S0020 micro | 3.25 g each (13 g total) | |

## Power system

| Component | Spec | Weight | Notes |
|---|---|---|---|
| Main Battery | 18650 Li-ion, 2600 mAh, 1S | 47.1 g | Resting voltage → SOC curve in `calculations/battery_soc.md` |
| FPV Battery | 1S 400 mAh LiPo | 11.2 g | Separate rail for FPV gear |
| Solar Cells | SunPower C60 × 7 (series), Voc≈5.0V/Vmp≈4.06V theoretical, up to 2.4A each nameplate | 98 g total (14 g each) | See `specs/datasheets/sunpower_c60.md` for full electrical curve. **Updated 2026-07-22 from 6→7 cells per decisions/0001 — theoretical, pending bench confirmation (see CLAUDE.md open questions).** |
| Ideal Diode Pair | Pololu Power ORing Ideal Diode Pair (6A) | 1.46 g | Solar/battery OR node — currently the suspected source of voltage clamping loss |
| Ideal Diode Modules | Pololu Ideal Diode Modules (charging paths) ×2 | 0.27 g each | |
| Current Sensors | SparkFun ACS723 breakouts ×3 | 1.27 g each (3.81 g total) | Used for measured current draw (avionics ≈1.5A baseline) — could support coulomb-counting SOC in place of pure voltage lookup |
| Capacitor | Electrolytic bulk | 0.7 g | Bus smoothing |

## Weight summary

- Listed components total: **~247 g** (updated from ~233 g for the 7th
  solar cell, +14 g)
- Estimated unlisted mass (foam wing, spars, fuselage tube, mount, wiring,
  adhesives): **~90–110 g** (estimate — replace with a real scale weight
  ASAP; this predates the 2026-07-22 Clark-Y/1200×200mm wing change, and
  the larger chord likely pushes it above this range)
- **Estimated AUW: ~337–357 g** (needs confirmation — see open questions in
  `CLAUDE.md`)
