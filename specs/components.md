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
| Main Battery | 18650 Li-ion, 2600 mAh, 1S | 47.1 g | On Branch C (see `specs/wiring_diagram.md`) — resting voltage → SOC curve in `calculations/battery_soc.md` |
| FPV Battery | 1S 400 mAh LiPo | 11.2 g | On Branch B — fed from solar via a dedicated ideal diode + 2A current meter, in parallel with the FPV camera/VTX. **Not fully isolated from solar the way earlier docs implied** — see `specs/wiring_diagram.md`. |
| Solar Cells | SunPower C60 × 7 (series), Voc≈5.0V/Vmp≈4.06V theoretical, up to 2.4A each nameplate | 98 g total (14 g each) | See `specs/datasheets/sunpower_c60.md` for full electrical curve. **Updated 2026-07-22 from 6→7 cells per decisions/0001 — theoretical, pending bench confirmation (see CLAUDE.md open questions).** |
| Ideal Diode — Branch A | Pololu Power ORing Ideal Diode Pair (6A), used as a single diode | 1.46 g | Solar array → Flight Controller VBAT pin, for cell-voltage monitoring. **Tentative — may be replaced with a plain Ideal Diode Module like Branches B/C; not finalized.** See `specs/wiring_diagram.md`. |
| Ideal Diode — Branch B | Pololu Ideal Diode Module | 0.27 g | Solar array → 2A current meter → FPV Camera/VTX + FPV Battery (parallel). See `specs/wiring_diagram.md`. |
| Ideal Diode — Branch C | Pololu Ideal Diode Module | 0.27 g | Solar array → 2A current meter → Main Battery + ESC (via 5A sensor) + 5V Regulator (parallel). See `specs/wiring_diagram.md`. |
| 5V Regulator | Unspecified model — feeds Flight Controller via the servo rail | TBD (not yet weighed) | **Newly documented, 2026-07-22 — not previously in this table.** On Branch C. Not yet included in the weight totals below. |
| 2A Current Meters | ×2 (one per Branch B and Branch C output) | TBD (not yet weighed) | **Newly documented, 2026-07-22.** May or may not overlap with the "Current Sensors" row below — see open question in `CLAUDE.md`. Not yet included in the weight totals below. |
| Current Sensors | SparkFun ACS723 breakouts ×3 | 1.27 g each (3.81 g total) | Used for measured current draw (avionics ≈1.5A baseline). **Count/placement doesn't yet reconcile with the 4 current-sensing points described 2026-07-22** (2× 5A sensor + 2× 2A current meter, above) — see open question in `CLAUDE.md`. |
| Capacitor | Electrolytic bulk | 0.7 g | Bus smoothing |

## Weight summary

- Listed components total: **~247 g** (updated from ~233 g for the 7th
  solar cell, +14 g). **Does not yet include** the 5V Regulator or the 2A
  Current Meters newly documented 2026-07-22 — their weight is unknown.
- Estimated unlisted mass (foam wing, spars, fuselage tube, mount, wiring,
  adhesives): **~90–110 g** (estimate — replace with a real scale weight
  ASAP; this predates the 2026-07-22 Clark-Y/1200×200mm wing change, and
  the larger chord likely pushes it above this range)
- **Estimated AUW: ~337–357 g** (needs confirmation — see open questions in
  `CLAUDE.md`; also doesn't yet account for the newly documented 5V
  regulator / current meters above)
