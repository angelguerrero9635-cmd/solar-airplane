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

| Component | Spec | Weight | Voltage range | Notes |
|---|---|---|---|---|
| Motor | T-Motor M1104 KV7500 | 5.61 g | Rated 2–4S (~7.4–16.8V) | High KV, small brushless outrunner. **Runs at 1S (~3.6–4.2V) in this build** — see "Voltage limits & compatibility" below. |
| Propeller | 6×3 | 14.52 g | n/a | |
| ESC | Micro brushless ESC, 5A, 1S | 5.07 g | 1S (~3.0–4.2V) | Confirmed 2026-07-22 (5A rating, 1S). Exact brand/model still not recorded — the product link given couldn't be resolved (Amazon is blocked by this environment's network policy), so full specs (BEC output, exact max current, etc.) aren't available. **Fits its actual Branch C bus voltage (~3.6–4.2V) with no mismatch**, unlike the motor/FC findings below. |

## Avionics

| Component | Spec | Weight | Voltage range | Notes |
|---|---|---|---|---|
| Flight Controller | ATOMRC F405 NAVI (full size) | 10.79 g | VBAT rated 12–30V (3–6S) | **Branch A feeds VBAT ~4.4–4.6V, far below this rated range** — see "Voltage limits & compatibility" below. |
| GPS | BN-880 | 13.23 g | 2.8–6.0V (typ. 3.3V/5V) | Powered via FC 5V rail — comfortably within range. |
| Receiver | Happymodel EP1 ELRS | 1.50 g | 3.5–8.4V, 5V recommended (TCXO variant: 3.5–5V) | Which variant this build uses isn't recorded; either way, powered via FC 5V rail is within range. |
| Telemetry Radio | 915 MHz | 16.14 g | Unspecified | No specific model recorded. |
| FPV Camera/VTX | AKK BA3 AIO Analog Camera + VTX | 4.73 g | 3.2–5.5V | On Branch B — fits comfortably within the ~3.6–4.6V that branch can see. |
| Servos | 4× DM-S0020 micro | 3.25 g each (13 g total) | 4.8–6.0V typical (some listings: 3.7–6.0V) | Powered via 5V regulator/servo rail — nominal 5V has little margin if the regulator sags below the tighter 4.8V floor some listings cite. |

## Power system

| Component | Spec | Weight | Voltage range | Notes |
|---|---|---|---|---|
| Main Battery | 18650 Li-ion, 2600 mAh, 1S | 47.1 g | ~2.5–3.0V (cutoff) to 4.2V (full charge), nominal 3.6–3.7V | Standard Li-ion figures. On Branch C — resting voltage → SOC curve in `calculations/battery_soc.md` |
| FPV Battery | 1S 400 mAh LiPo | 11.2 g | ~3.0–3.3V (cutoff) to 4.2V (full charge), nominal 3.7V | Standard 1S LiPo figures. On Branch B — fed from solar via a dedicated ideal diode + 2A current meter, in parallel with the FPV camera/VTX. **Not fully isolated from solar the way earlier docs implied** — see `specs/wiring_diagram.md`. |
| Solar Cells | SunPower C60 × 7 (series), Voc≈5.0V/Vmp≈4.06V theoretical, up to 2.4A each nameplate | 98 g total (14 g each) | Self-generates ~4.4–5.1V (Voc); see `specs/datasheets/sunpower_c60.md` | Not a "rated input" component — it's the source. **Updated 2026-07-22 from 6→7 cells per decisions/0001 — partially bench-confirmed 2026-07-22: measured Voc 4.57V, ~9–11% below the ~5.0–5.1V theoretical (see `logs/test_flights.md`). True Vmp and motor-load behavior still pending — see CLAUDE.md open questions.** |
| Ideal Diode — Branch A | Pololu Power ORing Ideal Diode Pair (6A), used as a single diode | 1.46 g | Rated 4–60V input | Solar array → Flight Controller VBAT pin, for cell-voltage monitoring. **Tentative — may be replaced with a plain Ideal Diode Module like Branches B/C; not finalized.** See `specs/wiring_diagram.md`. |
| Ideal Diode — Branch B | Pololu Ideal Diode Module | 0.27 g | Rated 4–60V input | Solar array → 2A current meter → FPV Camera/VTX + FPV Battery (parallel). See `specs/wiring_diagram.md`. |
| Ideal Diode — Branch C | Pololu Ideal Diode Module | 0.27 g | Rated 4–60V input | Solar array → 2A current meter → Main Battery + ESC (via 5A sensor) + 5V Regulator (parallel). **Array's measured operating voltage sits close to this diode family's 4V floor** — see "Voltage limits & compatibility" below. See `specs/wiring_diagram.md`. |
| 5V Regulator | Unspecified model — feeds Flight Controller via the servo rail | TBD (not yet weighed) | Unspecified | **Newly documented, 2026-07-22 — not previously in this table.** On Branch C. Not yet included in the weight totals below. |
| 2A Current Meters | ×2 (one per Branch B and Branch C output) | TBD (not yet weighed) | Unspecified | **Newly documented, 2026-07-22.** May or may not overlap with the "Current Sensors" row below — see open question in `CLAUDE.md`. Not yet included in the weight totals below. |
| Current Sensors | SparkFun ACS723 breakouts ×3 | 1.27 g each (3.81 g total) | Vcc supply rated 4.5–5.5V | The sensor IC's own supply requirement — separate from the ~3.6–4.6V branch current it measures, so it needs its own 5V-ish supply, consistent with its bench-test-only status (see `specs/wiring_diagram.md`). **Count/placement doesn't yet reconcile with the 4 current-sensing points described 2026-07-22** (2× 5A sensor + 2× 2A current meter, above) — see open question in `CLAUDE.md`. |
| Capacitor | Electrolytic bulk | 0.7 g | Unspecified | No model/voltage rating recorded. Branch C's bus could see up to ~4.6–5.1V in a fault condition (main battery disconnected, array still connected) — confirm the eventual model has adequate voltage margin above that. |

## Voltage limits & compatibility (added 2026-07-22)

Two real mismatches turned up while researching rated voltage ranges for
the named components above, both worth flagging rather than assuming
away:

- **Flight Controller VBAT is rated far above what Branch A feeds it.**
  The ATOMRC F405 NAVI's VBAT input is manufacturer-rated for **12–30V
  (3–6S)**. Branch A actually feeds VBAT a 1S-equivalent solar/battery
  voltage (~4.4–4.6V) — well below that rated range. The FC's onboard
  voltage-divider scaling is very likely calibrated in firmware for a
  3–6S pack, so the raw VBAT telemetry/OSD reading is unlikely to reflect
  actual voltage accurately unless the FC's voltage-scale/multiplier
  setting is manually recalibrated for this much lower range. Under-
  voltage on a sense pin isn't typically damaging to the board, but that
  hasn't been separately confirmed for this specific board — treat as
  unconfirmed, not assumed-safe. This adds to the existing open question
  about Branch A in `CLAUDE.md` (whether it stays wired this way at all).
- **The array's operating voltage sits close to the ideal diodes' rated
  floor.** All 3 ideal-diode devices (Branches A/B/C) are Pololu parts
  rated for a **4–60V** input range. The array's measured Voc (4.57V) and
  loaded voltage (4.41V, see `logs/test_flights.md`) both sit only
  slightly above that 4V floor. If array voltage drops further under
  heavier load or dimmer conditions, it could fall below the diodes'
  rated minimum input. This may be a contributing factor to the
  already-flagged Voc shortfall and clamping behavior — not confirmed,
  but a plausible piece of the picture worth checking during the
  upcoming motor-load test.
- **Motor is rated well above the 1S bus it actually runs on** (noted
  for completeness, not treated as a new problem): the T-Motor M1104
  KV7500 is manufacturer-rated for 2–4S (~7.4–16.8V); this build runs it
  at 1S (~3.6–4.2V), which is an intentional design choice already baked
  into this project's weight/thrust budget. Under-voltage on a brushless
  motor generally just yields lower RPM/thrust than the motor's
  potential rather than damage, but the actual achievable thrust at 1S
  hasn't been separately verified against this rating.

Everything still marked "Unspecified" in the tables above (telemetry
radio, 5V regulator, 2A current meters, capacitor) needs an actual model
number before a voltage range can be looked up rather than guessed. The
ESC is now partially specified (5A, 1S, confirmed 2026-07-22) but still
lacks an exact brand/model for full specs.

Sources: [T-Motor M1104 KV7500 — Pyrodrone](https://pyrodrone.com/products/t-motor-m1104-1104-7500kv-fpv-drone-motor-blue), [ATOMRC F405 NAVI manual — Manuals+](https://manuals.plus/m/f811e58145346816d35c9be11b74af1c32fead33f5805c4112f09a257ae97186), [BN-880 GNSS Module + Compass Datasheet](https://images-na.ssl-images-amazon.com/images/I/81xnOf7jqyL.pdf), [Happymodel EP1 receiver](https://www.happymodel.cn/index.php/2022/09/01/happymodel-ep1-dual-receiver-true-diversity-2-4ghz-expresslrs-rx/), [AKK BA3 AIO camera/VTX](https://www.akktek.com/akk-ba3.html), [Pololu Power ORing Ideal Diode Pair, 4-60V, 6A](https://www.pololu.com/product/5398), [Pololu Ideal Diode Reverse Voltage Protector family](https://www.pololu.com/category/329/reverse-voltage-protection-and-ideal-diodes), [SparkFun ACS723 Current Sensor Breakout Hookup Guide](https://learn.sparkfun.com/tutorials/current-sensor-breakout-acs723-hookup-guide/all), [DM-S0020 servo listings — Amazon](https://www.amazon.com/Geekstory-DM-S0020-Degree-Connector-4-8V-6V/dp/B0DG5GGLQB), [18650 Li-ion voltage window — Cellsaviors](https://cellsaviors.com/blog/min-max-voltage-18650).

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
