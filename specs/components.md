# Component Specifications

Last updated: 2026-07-23

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
| ESC | E-Power 1S 5A ESC (A), model BE001 | 5.07 g (measured — authoritative; mfr. spec sheet says 7.3g, see below) | 1S, 5V max (per mfr. spec — see below) | Identified 2026-07-22 from the product's own spec sheet/packaging. Continuous 5A, burst 7A for 30–45s. Size 15×20mm, servo wire 250mm. **No BEC included — receiver/servo rail gets power directly from the battery, not from the ESC**, which is exactly why this build's separate 5V Regulator (Branch C) exists. Connectors: 2P battery plug (51005) or 1.25mm-pitch 2P battery plug (unclear which this unit uses), 2.54mm-pitch 3P plug, 1.00mm-pitch 3P servo plug — see `specs/wiring_diagram.md`. |

## Avionics

| Component | Spec | Weight | Voltage range | Notes |
|---|---|---|---|---|
| Flight Controller | ATOMRC F405 NAVI (full size) | 10.79 g | VBAT rated 12–30V (3–6S) | **VBAT now fed from Branch C's bus via the ESC's red pin (changed 2026-07-24, was Branch A's diode-OR tap)** — far below the rated range, and now known to swing much wider than previously assumed (~2.7–4.5V, based on battery-only load test data, vs. the old ~4.4–4.6V Branch A estimate) since it directly reflects bus sag under motor load. See "Voltage limits & compatibility" below. |
| GPS | BN-880 | 13.23 g | 2.8–6.0V (typ. 3.3V/5V) | Powered via FC 5V rail — comfortably within range. |
| Receiver | Happymodel EP1 ELRS | 1.50 g | 3.5–8.4V, 5V recommended (TCXO variant: 3.5–5V) | Which variant this build uses isn't recorded; either way, powered via FC 5V rail is within range. |
| Telemetry Radio | 915 MHz | 16.14 g | Unspecified | No specific model recorded. |
| FPV Camera/VTX | AKK BA3 AIO Analog Camera + VTX | 4.73 g | 3.2–5.5V | On Branch B — fits comfortably within the ~3.6–4.6V that branch can see. |
| Servos | 4× DM-S0020 micro | 3.25 g each (13 g total) | 4.8–6.0V typical (some listings: 3.7–6.0V) | Powered via 5V regulator/servo rail — nominal 5V has little margin if the regulator sags below the tighter 4.8V floor some listings cite. |

## Power system

| Component | Spec | Weight | Voltage range | Notes |
|---|---|---|---|---|
| Main Battery | 18650 Li-ion, 2600 mAh, 1S | 47.1 g | ~2.5–3.0V (cutoff) to 4.2V (full charge), nominal 3.6–3.7V | Standard Li-ion figures. On Branch C — resting voltage → SOC curve in `calculations/battery_soc.md`. **Confirmed 2026-07-23: the pack's BMS actively disconnects the battery above ~4.2V** — this is a protective cutoff, not just a voltage ceiling the cell happens to sit under. The exact threshold is **variable, not razor-precise** (observed ~4.26V, battery "topped off"/not contributing, in a same-day bench test — see `logs/test_flights.md`). Whenever solar charging pushes the pack to full while still connected, the BMS opens the connection entirely. **Also confirmed 2026-07-23: the same BMS has a separate protection that trips around ~2.9–3A of motor draw**, latching the battery off the bus entirely until physically disconnected/reconnected — root-caused via direct testing that ruled out the ESC/FC as the cause (see `logs/test_flights.md`). **Tested and refined twice same day:** an initial hypothesis (undervoltage trip from load-induced sag) was tested at a second starting voltage (3.88V vs. the first test's 4.01V) and **overturned** — both tests tripped at essentially the same *current* (~2.9–3A) despite the 0.13V difference in starting voltage, which points to a genuine **overcurrent protection**, largely independent of SOC within the range tested, rather than a voltage-triggered one. ~0.3Ω of combined internal+wiring resistance measured consistently across both tests. This reads as a fixed ceiling present throughout the usable SOC range, not one that only bites late in a discharge cycle — a flight-safety-relevant limit, not just a bench curiosity. See the high-priority open question in `CLAUDE.md` §5. See "Voltage limits & compatibility" below for why the overvoltage side matters more than it sounds. |
| FPV Battery | 1S 400 mAh LiPo | 11.2 g | ~3.0–3.3V (cutoff) to 4.2V (full charge), nominal 3.7V | Standard 1S LiPo figures. On Branch B — fed from solar via a dedicated ideal diode + 2A current meter, in parallel with the FPV camera/VTX. **Not fully isolated from solar the way earlier docs implied** — see `specs/wiring_diagram.md`. |
| Solar Cells | SunPower C60 × 7 (series), Voc≈5.0V/Vmp≈4.06V theoretical, up to 2.4A each nameplate | 98 g total (14 g each) | Self-generates ~4.4–5.1V (Voc); see `specs/datasheets/sunpower_c60.md` | Not a "rated input" component — it's the source. **Updated 2026-07-22 from 6→7 cells per decisions/0001 — partially bench-confirmed 2026-07-22: measured Voc 4.57V, ~9–11% below the ~5.0–5.1V theoretical (see `logs/test_flights.md`). True Vmp and motor-load behavior still pending — see CLAUDE.md open questions.** |
| ~~Ideal Diode — Branch A~~ | **REMOVED from the build, 2026-07-24** | — | — | Branch A (the planned solar+battery diode-OR tap) is eliminated entirely — the Pololu Power ORing Ideal Diode Pair is no longer part of this build, not just unused. VBAT now wires directly to the ESC's red (power) pin — i.e., Branch C's bus — instead. See `specs/wiring_diagram.md`. Weight (1.46g) removed from the totals below. |
| Ideal Diode — Branch B | Pololu Ideal Diode Module | 0.27 g | Rated 4–60V input | Solar array → 2A current meter → FPV Camera/VTX + FPV Battery (parallel). Has separate IN−/OUT− negative pins (not a shared pass-through ground) — see `specs/wiring_diagram.md`. |
| Ideal Diode — Branch C | Pololu Ideal Diode Module | 0.27 g | Rated 4–60V input | Solar array → 2A current meter → Main Battery + ESC (via 5A sensor) + 5V Regulator (parallel). **Array's measured operating voltage sits close to this diode family's 4V floor** — see "Voltage limits & compatibility" below. Has separate IN−/OUT− negative pins (not a shared pass-through ground) — see `specs/wiring_diagram.md`. |
| 5V Regulator | Pololu S7V7F5 (5V Step-Up/Step-Down Voltage Regulator) — feeds Flight Controller via the servo rail | 0.6 g (mfr. spec, no header pins) | Input 2.7–11.8V | **Identified 2026-07-23.** On Branch C. Buck-**boost** topology — able to regulate up to 5V even when its input dips below 5V, which is exactly the situation on Branch C's bus (~3.6–4.6V, below what a buck-only regulator's 5V output would need). Up to 1A step-down / ~500mA step-up, >90% typical efficiency. Now included in the weight totals below. **⚠️ Input headroom concern flagged 2026-07-24, not yet confirmed:** a battery-only load test already logged a bus reading of 2.76V at 2.9A motor current — only 0.06V above this regulator's documented 2.7V minimum input. At a lower starting battery voltage, the same current draw could plausibly sag the shared bus below 2.7V before the battery's own overcurrent protection even trips, meaning this regulator (not the battery BMS) could become the actual limiting factor at low SOC, with FC brownout/reset as the symptom rather than a full bus outage. See `CLAUDE.md` §5 and `logs/test_flights.md`. |
| 5A Current Sensors (bench-only) | ×2 (array-total sensor + Branch C ESC-leg sensor) | n/a — never flown, no need to weigh | Unspecified | **Clarified 2026-07-23:** these are the "5A sensor" devices in `specs/wiring_diagram.md`, distinct from the retired ACS723s below. Bench-test-only, confirmed 2026-07-23 — none of these current-sensing devices are used in flight, so none need weighing for flight-configuration purposes. |
| 2A Current Meters | ×2 (one per Branch B and Branch C output) | n/a — never flown, no need to weigh | Unspecified | **Clarified 2026-07-23:** bench-test-only, confirmed never used in flight. Together with the 2 5A sensors above, these are "the 4 new sensors" — a separate bench-only setup from the retired ACS723s below, not an overlapping/duplicate count. |
| Current Sensors (RETIRED) | SparkFun ACS723 breakouts ×3 | 1.27 g each (3.81 g total) — **removed from weight totals entirely, 2026-07-23** | Vcc supply rated 4.5–5.5V | **Retired 2026-07-23 — not used at all anymore**, replaced by the separate 4-sensor bench-only setup above (2× 5A sensor + 2× 2A current meter). Kept here only as a historical record; excluded from `calculations/power_budget.py`'s `KNOWN_COMPONENTS_G`. |
| Capacitor (ESC) | Electrolytic bulk, at the ESC input | 0.7 g | Unspecified | No model/voltage rating recorded. Confirmed 2026-07-22 to be located at the ESC input (previously just "bus smoothing" with no location). Branch C's bus could see up to ~4.6–5.1V in a fault condition (main battery disconnected, array still connected) — confirm the eventual model has adequate voltage margin above that. |
| Capacitor (Main Battery) — **candidate part identified, not yet installed** | RLTZ series DIP solid-state (polymer) capacitor, 680µF/16V, ESR 15mΩ, 8×12mm | TBD (small, not yet weighed) | ≥4.2V (battery max) with margin | **Candidate confirmed 2026-07-22** — from the user's own on-hand stock (product label photo). 16V rating gives ~3.8x margin over battery max; ESR/ripple-current specs are well-suited to the observed transient issue. Polarized — verify correct polarity when installing. See "Voltage limits & compatibility" below. |
| Capacitor (Solar Array) — **candidate part identified, not yet installed** | RLTZ series DIP solid-state (polymer) capacitor, 680µF/16V, ESR 15mΩ, 8×12mm | TBD (small, not yet weighed) | ≥5.1V (theoretical Voc) with margin | **Candidate confirmed 2026-07-22** — same part as above, from the user's on-hand stock. ~3.1x voltage margin over theoretical Voc. Polarized — verify correct polarity when installing. See "Voltage limits & compatibility" below. |
| Capacitor (5V Regulator VIN) — **installed 2026-07-23** | RLTZ series DIP solid-state (polymer) capacitor, 680µF/16V, ESR 15mΩ, 8×12mm | TBD (small, not yet weighed) | ≥5V, easily covers the regulator's own spec | **Confirmed installed 2026-07-23**, at VIN specifically — the regulator (Pololu S7V7F5) datasheet recommends a ≥33µF electrolytic (≥16V) here for stability; the 680µF part exceeds that with room to spare. **A separate, still-undecided capacitor at the regulator's *output*** (servo rail) addresses a different concern (transient response for bursty servo current) — not yet built or decided, see "Voltage limits & compatibility" below. |

## Voltage limits & compatibility (added 2026-07-22)

Two real mismatches turned up while researching rated voltage ranges for
the named components above, both worth flagging rather than assuming
away:

- **Flight Controller VBAT is rated far above what it's actually fed —
  recalibration done (resolved 2026-07-23), source changed 2026-07-24.**
  The ATOMRC F405 NAVI's VBAT input is manufacturer-rated for **12–30V
  (3–6S)**. VBAT is fed a 1S-equivalent voltage — well below that rated
  range, since the FC's onboard voltage-divider scaling ships
  calibrated for a 3–6S pack. **The voltage sensor has been calibrated
  for this lower range**, so the raw VBAT telemetry/OSD reading
  reflects actual voltage — this is no longer an open concern. (Under-
  voltage on a sense pin isn't typically damaging to the board; that
  was never separately confirmed for this specific board, but
  recalibration was the practical issue and it's done.) **VBAT's source
  changed 2026-07-24**: no longer Branch A's diode-OR tap (~4.4–4.6V
  range) — now the ESC's red pin, i.e. Branch C's bus directly, which
  swings much wider under load (~2.7–4.5V, per battery-only test data)
  — see `specs/wiring_diagram.md`.
- **VBAT does power part of the FC — bench-confirmed 2026-07-23,
  correcting an earlier same-day theoretical guess. Still applies after
  the 2026-07-24 wiring change.** Connecting voltage to VBAT powers on
  part of the flight controller; it does **not** power the servo rail,
  which stays dependent on the separate external 5V Regulator on
  Branch C. (A first pass at this question reasoned from the F405
  NAVI's published spec sheet — onboard 5V/5A servo BEC and 9V/2A VTX
  BEC fed from a 12–30V BAT input — that the ~4.4–4.6V VBAT was
  originally fed would be too low for the BAT pad to power anything at
  all. Direct bench testing shows that was wrong for at least part of
  the board, even though the servo-rail BEC specifically does need more
  voltage than VBAT supplies.) Doesn't change the physical build — the
  servo rail still needs Branch C's regulator either way — but resolves
  that VBAT also delivers real power to part of the FC, not purely
  instrumentation. Now that VBAT wires directly to Branch C's bus (no
  diode in between), this is, if anything, more directly true than
  before.
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
- **ESC's 5V max rating vs. the array's theoretical Voc — re-resolved
  2026-07-23, accepted as-is, no protection planned.** The E-Power
  BE001's own spec sheet states "Max Vol: 1S, 5V." The 7-cell array's
  theoretical Voc is ~5.0–5.1V, and measured Voc is 4.57V — both
  numbers that matter for the *array itself*, but **not what the ESC
  actually sees**.
  **Corrected topology understanding (2026-07-23):** an earlier pass at
  this question assumed that with the main battery disconnected, "the
  ESC sees array voltage directly." That's wrong — the ESC sits
  downstream of Branch C's Ideal Diode Module #2, on the **bus** side,
  never the raw panel/array side, regardless of whether the battery is
  connected. Bench data already shows a real, non-trivial gap between
  panel and bus voltage even under light load with no motor running
  (2026-07-23 test: panel 4.53V vs. bus 4.25V, and panel 4.46V vs. bus
  4.20V — see `logs/test_flights.md`) — this isn't a fault-scenario-only
  effect, it's present under normal light-load operation too. Under
  motor load, that sag is larger still (more current through the
  diode/sensor/wiring path between array and bus), pushing the ESC's
  actual exposure *further* below the array's own voltage, not closer
  to it.
  **Decision:** not a concern for the current 7-cell configuration —
  the bus voltage the ESC actually sees has meaningfully more margin
  below 5V than the array's own Voc figures suggested. Worth revisiting
  only if either (a) the array's real-world efficiency improves enough
  to close the gap between measured (4.57V) and theoretical (~5.0–5.1V)
  Voc, or (b) the cell count increases to 8 (theoretical Voc ~5.76V) —
  both would raise panel voltage, and by extension bus voltage, closer
  to the ESC's ceiling. No clamp/TVS protection planned under the
  current design.
- **ESC weight discrepancy — resolved 2026-07-23, measured weight is
  authoritative.** The E-Power BE001 spec sheet states 7.3g, but that's
  the manufacturer's nominal figure, not a weighing of the actual unit
  in this build. The 5.07g already recorded in this table and in
  `calculations/power_budget.py` was a real scale measurement and
  stands as correct — no change to the AUW total.
- **Recommended: capacitors at the main battery, solar array, and 5V
  regulator output, in addition to the existing ESC-side one
  (2026-07-22).** Bench troubleshooting (see `logs/test_flights.md`)
  found the system browning out more with the battery connected under
  shade (**not confirmed whether it's the ESC or the FC specifically —
  they currently share a single ground/return path, see
  `specs/wiring_diagram.md`'s "Negative/return path" section, 2026-07-23**)
  (hypothesis: the battery's own ESR causes its terminal voltage to sag
  under fast current steps faster than its electrochemistry can
  respond), and separately, the solar array alone struggling at higher
  current spikes even in full sun (consistent with the diode-OR clamping
  behavior already documented). A cap only at the ESC buffers the load
  side, not the battery's or array's own transient response, or the
  wiring resistance between them. Recommend adding a low-ESR electrolytic
  or polymer capacitor (~220–470µF is a reasonable starting point given
  the few-amp current levels here; not tantalum, given reverse-voltage
  risk with this diode topology) near the battery terminals and near the
  array output. Separately, the 5V regulator's servo-rail output likely
  needs one too — not for this build's specific ESR/clamping reasons,
  but because regulators generally need local output capacitance for
  stability and transient response, and bursty servo current draw is a
  textbook cause of downstream brownouts. That consequence is higher
  here since the same rail powers the Flight Controller. **Update
  2026-07-23, now that the regulator is identified as a Pololu S7V7F5:**
  its own datasheet actually calls for a ≥33µF/16V+ capacitor at its
  *input* (VIN), for regulator stability — a different concern from the
  output-side servo-transient reasoning above. **The VIN capacitor is
  now confirmed installed (2026-07-23)**; the output-side one is still
  a separate, undecided recommendation — see the capacitor row in the
  table above. Battery terminals, array output, and the regulator
  output are still recommendations, not yet built — validate by
  re-testing whether brownout frequency actually improves once they
  are.
- **Recommended priority order (2026-07-23), 1 of 4 locations done:**
  1. **5V Regulator VIN — confirmed installed, 2026-07-23.** Pololu's
     own datasheet spec for regulator stability, closer to "required for
     correct operation" than "nice to have," especially since Branch
     C's bus already has other loads pulling current spikes.
  2. **Main battery terminals — not yet built.** Targets an
     already-measured bench problem (system browning out more with
     battery connected, under shade — ESC vs. FC attribution not
     confirmed for that past data, though the ground-path mechanism
     causing that ambiguity is now fixed, see
     `specs/wiring_diagram.md`).
  3. **Solar array output — not yet built.** Targets a
     separately-measured bench problem (array struggling under current
     spikes in full sun); addresses transient response, a different
     problem than the 7-cell fix's steady-state clamping fix, so still
     worth doing.
  4. **5V Regulator output (servo rail) — not yet built, not yet
     decided.** Standard good practice, lowest priority of the four
     since there's no specific measured failure here yet (preventive,
     not a fix for an observed problem).

  The on-hand RLTZ part covers all four with margin either way (≥33µF
  Pololu spec or ~220–470µF general guidance, vs. 680µF on hand) — no
  sourcing decision needed, just an install-location one. **Sequencing
  update (2026-07-23):** the FC's ground return is now independent of
  the ESC's (see `specs/wiring_diagram.md`), so the next brownout
  re-test — after installing the remaining 3 capacitors — will actually
  be able to attribute results to a specific device. **Weight caveat:**
  none of these caps have a confirmed weight yet; small 8×12mm DIP
  polymer caps like this are typically well under a gram each, but
  that's an estimate, not a sourced number for this specific RLTZ part
  (no datasheet found) — worth weighing on a scale before treating the
  ~7.3g remaining 250g headroom as unaffected.
- **Candidate capacitor part confirmed (2026-07-22).** User has RLTZ
  series DIP solid-state (polymer) capacitors on hand: 680µF, 16V rated,
  ESR 15mΩ, rated ripple current 4.1A rms, 8×12mm, polarized. Voltage
  margin is comfortable at all three locations above (~3.1–3.8x over
  each location's expected max voltage), the low ESR directly addresses
  the transient-response problem being solved, and the 8×12mm size keeps
  weight cost low. Good fit for all three — still not yet installed at
  any of them, and polarity must be observed when installing (unlike a
  ceramic cap, getting a polarized part backwards is a real failure
  mode, worth double-checking given the diode-OR context already at
  play here).

Everything still marked "Unspecified" in the tables above (telemetry
radio, 2A current meters, ESC capacitor) needs an actual model number
before a voltage range can be looked up rather than guessed. The ESC is
now fully identified (E-Power BE001, from its own spec sheet/packaging,
2026-07-22), and the 5V Regulator is now fully identified (Pololu
S7V7F5, 2026-07-23). The recommended capacitors (battery, array, 5V
regulator) are marked "TBD" rather than "Unspecified" since they're not
built yet at all, not just missing a model number.

Sources: [T-Motor M1104 KV7500 — Pyrodrone](https://pyrodrone.com/products/t-motor-m1104-1104-7500kv-fpv-drone-motor-blue), [ATOMRC F405 NAVI manual — Manuals+](https://manuals.plus/m/f811e58145346816d35c9be11b74af1c32fead33f5805c4112f09a257ae97186), [BN-880 GNSS Module + Compass Datasheet](https://images-na.ssl-images-amazon.com/images/I/81xnOf7jqyL.pdf), [Happymodel EP1 receiver](https://www.happymodel.cn/index.php/2022/09/01/happymodel-ep1-dual-receiver-true-diversity-2-4ghz-expresslrs-rx/), [AKK BA3 AIO camera/VTX](https://www.akktek.com/akk-ba3.html), [Pololu Power ORing Ideal Diode Pair, 4-60V, 6A](https://www.pololu.com/product/5398), [Pololu Ideal Diode Reverse Voltage Protector family](https://www.pololu.com/category/329/reverse-voltage-protection-and-ideal-diodes), [SparkFun ACS723 Current Sensor Breakout Hookup Guide](https://learn.sparkfun.com/tutorials/current-sensor-breakout-acs723-hookup-guide/all), [DM-S0020 servo listings — Amazon](https://www.amazon.com/Geekstory-DM-S0020-Degree-Connector-4-8V-6V/dp/B0DG5GGLQB), [18650 Li-ion voltage window — Cellsaviors](https://cellsaviors.com/blog/min-max-voltage-18650), E-Power 1S 5A ESC (BE001) product spec sheet/packaging photo (2026-07-22), F405 NAVI BEC/current-sensor specs (12–30V input, 120A current sensor, 5V/5A + 9V/2A onboard BECs) via [ATOMRC product listing](https://atomrc.com/products/atomrc-fixed-wing-flight-controller-f405-navi) and [SkyZoneFPV listing](https://www.skyzonefpv.com/products/atomrc-fixed-wing-flight-controller-f405-navi) — searched 2026-07-23; the manual PDF itself returned HTTP 403 through this sandbox's network policy. [Pololu S7V7F5 5V Step-Up/Step-Down Voltage Regulator](https://www.pololu.com/product/2119) — weight (0.6g, no headers), input range (2.7–11.8V), output current (1A step-down/~500mA step-up), efficiency (>90%), and the VIN capacitor recommendation (≥33µF, ≥16V) — searched 2026-07-23; direct fetch of pololu.com and robotshop.com both returned HTTP 403 through this sandbox's network policy, so these numbers rely on consistent search-result snippets rather than a directly-read primary source — worth a spot-check against the datasheet when convenient.

## Weight summary

- Listed components total: **~242.7 g** (updated 2026-07-24: Branch A's
  Ideal Diode Pair, 1.46g, is removed from the build entirely — see
  above. The 5V Regulator, identified 2026-07-23 as a Pololu S7V7F5 at
  0.6g, remains included; the 3 retired ACS723 current sensors, 3.81g,
  remain removed entirely, not just excluded as bench-only). **Does not
  yet include** the 5A/2A bench-only current sensors or the three
  newly-recommended capacitors (battery, array, regulator output) — the
  bench-only sensors never need weighing since none of them fly, and
  the capacitors aren't built yet.
- Estimated unlisted mass (foam wing, spars, fuselage tube, mount, wiring,
  adhesives): **~90–110 g** (estimate — replace with a real scale weight
  ASAP; this predates the 2026-07-22 Clark-Y/1200×200mm wing change, and
  the larger chord likely pushes it above this range)
- **Estimated AUW: ~332.7–352.7 g** (needs confirmation — see open
  questions in `CLAUDE.md`)

### Weight budget vs. the 250g target (added 2026-07-22)

**250g is a long-term goal, not a requirement for the current design**
— see `CLAUDE.md` Section 1. This math is kept on record as a reference
point for future component/design decisions, not a call to change
anything now:

- Listed components total is **~242.7g** of flight-configuration listed
  weight — updated 2026-07-24 to remove Branch A's Ideal Diode Pair
  (1.46g, eliminated from the build). The 5V Regulator (Pololu S7V7F5,
  0.6g) remains included. The retired ACS723 current sensors
  (bench-test-only, no longer used at all) stay removed from the total
  entirely, rather than carried in the total and separately excluded.
  None of the current-sensing hardware shown in
  `specs/wiring_diagram.md` (retired or current bench-only set) is
  attached at takeoff, consistent with the FAA's 250g rule being a
  takeoff-weight rule.
- That leaves **~7.3g** of headroom under 250g for the 3 recommended
  capacitors *and all airframe structure* (wing, spars, fuselage tube,
  motor mount, wiring, adhesives) combined.
- The wing mass model in `calculations/power_budget.md` puts the foam
  wing **alone** at a minimum of ~59g (900mm span, lowest typical RC
  foam density) — already ~52g over that ~7.3g of remaining headroom,
  before any spar, fuselage, mount, wiring, or adhesive weight is added
  at all.
- **If this target is pursued later, it'll mean reducing the component
  list, not just building the airframe lighter.** The current listed
  components alone, even excluding bench-only gear, leave no realistic
  room for a flyable airframe under 250g as currently specced. The two
  largest single line items — Solar Cells (98g) and Main Battery
  (47.1g) — are also the two most central to the project's actual
  mission (solar charging, energy storage), so any reduction there
  would be a real tradeoff, not a free win. Not an active task — see
  `CLAUDE.md` Section 5.

Sources: [FAA Recreational Flyers & Community-Based Organizations](https://www.faa.gov/uas/recreational_flyers), [Sub 250g Regulations — FPV Freedom Coalition](https://fpvfc.org/sub-250g-regulations), search conducted 2026-07-22.
