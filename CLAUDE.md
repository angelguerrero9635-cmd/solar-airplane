# CLAUDE.md — Solar Glider Project Rulebook

> **Read this file first, every session, before doing anything else.**
> This is the persistent memory for the project. It should always reflect the
> current state of the design. When something changes (a component, a
> calculation, a decision), update this file in the same session.

## 1. Project summary

A 1.2m wingspan solar-electric FPV glider. Goal: maximize sustained/extended
flight duration using solar charging, starting as a prototyping exercise and
evolving toward a documented, reproducible design that could eventually be
shared, kitted, or sold.

**Weight target: eventually ≤250g takeoff weight (2026-07-22, not a
requirement for the current design).** In the US, aircraft under
0.55lb/250g flown recreationally are exempt from FAA registration
(still need the free TRUST test), per 14 CFR / the FAA's recreational
exception. The rule is based on **takeoff weight — everything attached
at the moment of flight** — confirmed current as of this search,
2026-07-22 (Sources below). Worth double-checking current requirements
before relying on this, since rules can change and this isn't legal
advice.

**The current design (7 cells, Clark-Y wing) is not being redone to
hit this now** — those were good decisions for the problems they
solved (diode-OR clamping, wing loading) and stand as-is. But **weight
is a significant, ongoing factor going forward**: future component
choices, wing/geometry iterations, and anything added to the build
should be weighed partly against this target, not decided on
performance/reliability alone. See Section 5 for the honest current-
design math (kept on record for reference, not as a call to action).

**Current phase:** Prototyping (see `docs/roadmap.md` for phase definitions).

## 2. Current airframe & power architecture

- Foam wing, **Clark-Y** airfoil, **1220mm span** (updated 2026-07-24,
  was 1200mm — matches the full 4ft length of the actual foam stock
  selected, Owens Corning FOAMULAR NGX Project Panels, XPS, R-7.5,
  1.5in×14.25in×48in, with no trim waste), 200mm chord, carbon fiber
  spars (span originally updated 2026-07-22, was SD7037, 1210mm span,
  150mm chord)
- Carbon fiber tube/rod fuselage, **1220mm length** (sized 2026-07-24,
  same length as wingspan), wing LE at 380mm from fuselage front. 3D
  printed motor mount.
- **Empennage sized 2026-07-24 (first tail spec for this aircraft):**
  horizontal stabilizer 320mm × 80mm (256 cm², Vh ≈ 0.414), vertical
  stabilizer 120mm × 80mm (96 cm², Vv ≈ 0.0255), via the tail volume
  coefficient method at a 790mm tail moment arm. Material/weight **not
  yet decided** — see `specs/components.md`'s "Empennage sizing"
  section for the full derivation. Not yet validated against an actual
  CG/stability check.
- **Wing area:** ~0.244 m² (24.4 dm²)
- **Estimated AUW:** ~332.7–352.7g (see `calculations/power_budget.md`;
  updated for the 7-cell solar string, theoretical pending bench
  confirmation — this estimate predates the 2026-07-22/07-24 wing
  changes and hasn't been revisited for them; updated 2026-07-23 to drop
  the retired ACS723 current sensors, 3.81g, updated again 2026-07-23 to
  add the now-identified/weighed 5V Regulator, 0.6g, and again 2026-07-24
  to drop Branch A's now-eliminated Ideal Diode Pair, 1.46g)
- **Wing loading:** ~13.6–14.5 g/dm² (sailplane range; lower than the
  previous ~18.5–19.6 g/dm² since the larger chord outweighs the slightly
  shorter span)
- **Wing foam material identified, 2026-07-24:** Owens Corning FOAMULAR
  NGX Project Panels (XPS, R-7.5 at 1.5in = R-5/in, matching the base
  "15 PSI"/FOAMULAR 150 grade). Real sourced density ~20.8–25.6 kg/m³
  (mfr. datasheet minimum 1.30 lb/ft³, plus a working upper bound above
  that minimum) — replaces the generic "20–30 kg/m³ typical RC EPP foam"
  placeholder previously used in `calculations/power_budget.py`. See
  `specs/components.md`.
- Power path: solar array → **2** independent ideal-diode branches
  (**reduced from 3, 2026-07-24** — Branch A eliminated entirely), **not
  rejoined downstream** — Branch B feeds the FPV rail, Branch C feeds
  the main battery bus/ESC/FC power. **VBAT now wires directly to the
  ESC's red pin on Branch C** (changed 2026-07-24, replacing the old
  Branch A diode-OR tap) — see `specs/wiring_diagram.md` for the full
  diagram and reasoning (corrected 2026-07-22, an earlier version of
  this file wrongly assumed the branches rejoined at one shared bus)

## 3. Key components (see `specs/components.md` for full table + sources)

| Component | Spec | Weight |
|---|---|---|
| Motor | T-Motor M1104 KV7500 | 5.61 g |
| Propeller | 6×3 | 14.52 g |
| ESC | E-Power 1S 5A ESC (BE001), no BEC | 5.07 g (measured; mfr. spec sheet says 7.3g) |
| Flight Controller | ATOMRC F405 NAVI (full size) | 10.79 g |
| GPS | BN-880 | 13.23 g |
| Receiver | Happymodel EP1 ELRS | 1.50 g |
| Telemetry | 915 MHz radio | 16.14 g |
| FPV | AKK BA3 AIO Analog Cam + VTX | 4.73 g |
| Main Battery | 18650 Li-ion, 2600 mAh, 1S | 47.1 g |
| FPV Battery | 1S 400 mAh LiPo | 11.2 g |
| Solar Cells | SunPower C60, currently 7 in series (updated from 6, 2026-07-22) | 98 g (14 g ea.) |
| Servos | 4× DM-S0020 micro | 13 g total |
| Ideal Diode — Branch B | Pololu Ideal Diode Module, → FPV rail | 0.27 g |
| Ideal Diode — Branch C | Pololu Ideal Diode Module, → main battery bus | 0.27 g |
| Ideal Diode — Branch A (REMOVED) | Eliminated from the build, 2026-07-24 — VBAT now wires directly to the ESC's red pin (Branch C's bus) instead | excluded from totals |
| 5V Regulator | Pololu S7V7F5 (step-up/step-down), feeds FC via servo rail (Branch C) | 0.6 g |
| 5A/2A Current Sensors (bench-only) | ×4 total (2× 5A, 2× 2A), never flown | n/a — no need to weigh |
| Current Sensors (RETIRED) | SparkFun ACS723, ×3 — not used at all anymore (retired 2026-07-22) | excluded from totals |
| Capacitor | Electrolytic bulk | 0.7 g |

## 4. Known constraints & hard-won lessons

These are load-bearing facts. Don't re-derive them from scratch — reuse and
update instead.

- **SunPower C60 per-cell specs:** Voc ≈ 0.72V, Vmp ≈ 0.58V, Isc ≈ 6.0–6.3A,
  Imp ≈ 5.8–6.0A, Pmax ≈ 3.4–3.6W, 125×125mm, ~7g bare.
- **Array voltage drops measurably as the system heats up** (confirmed
  2026-07-23 — see `logs/test_flights.md`): consistent with the
  well-known negative temperature coefficient of silicon solar cell
  voltage. Not yet quantified (no actual temperature logged, just a
  "hot" vs. "cooler" comparison) — a real, confirmed factor in the
  still-open Voc-shortfall question below, not the whole explanation.
  Bench tests should log actual temperature at each reading going
  forward, not just note whether things feel warm.
- **Diode-OR voltage clamping problem:** analyzed for Branch C (solar
  array → its ideal diode → main battery bus — see
  `specs/wiring_diagram.md` for the 3-branch topology; this hasn't been
  separately analyzed for Branch B's FPV battery, which may have similar
  dynamics). With a simple ideal-diode OR between solar array and battery
  bus, the array gets pulled toward bus voltage (~3.9–4.2V) rather than
  operating at its own Vmp. Since solar cells are
  current sources whose output current falls steeply above Vmp (toward Voc),
  this clamps available current well below the array's real capability.
  This is why a 6-cell series string (Vmp ≈ 3.5V) delivered only ~2.5A into a
  ~3.9V bus instead of its ~6A Imp capability.
- **Fix decided, theoretical:** moved from 6 to 7 series cells (2026-07-22)
  to raise string Vmp closer to typical battery voltage (a "poor man's
  MPPT" — static rather than dynamic matching). Calculated Vmp moves from
  ~3.48V to ~4.06V. **Partially bench-confirmed 2026-07-22** — measured
  Voc 4.57V (below the ~5.0–5.1V theoretical — see
  `logs/test_flights.md`), and sag under battery-only load is much
  smaller than the 6-cell baseline's collapse. Not a full confirmation
  yet: no true Vmp measurement, and the motor-load test is still
  pending — see `decisions/0001-cell-series-count.md` and open
  questions below.
- **Avionics baseline draw (current, 7-cell config):** ~0.65–0.8A
  (measured 2026-07-23, battery topped off/not contributing — see
  `logs/test_flights.md`). **Explained, not a live discrepancy
  (2026-07-23):** the older ~1.5A figure was measured at a lower bus
  voltage (2026-07-21, 6-cell string, ~73% battery SOC, 3.93V) — the
  avionics needed 1.5A at that lower voltage to draw roughly the same
  power. Since the design is sticking with 7 cells for now, that older
  reading isn't the relevant baseline going forward and doesn't need
  further reconciling.
- **Estimated cruise power draw:** ~17–24W depending on drag/weight (see
  `calculations/power_budget.md`).
- **In-flight telemetry is limited to one voltage reading.** The ATOMRC
  F405 NAVI has no free ADC channels beyond VBAT, so none of the
  current-sensing devices (see `specs/wiring_diagram.md`) can be logged
  or telemetered in flight — they're all bench-test-only (the original 3
  ACS723s are retired/not used at all; the current 4-device bench set is
  a separate, still-in-use setup). The VBAT voltage sensor **has been
  calibrated** (confirmed 2026-07-23), so the raw reading is trustworthy.
  **VBAT's source changed 2026-07-24:** no longer Branch A's diode-OR
  tap (eliminated) — now wired directly to the **ESC's red pin**, i.e.
  Branch C's bus. The one in-flight reading is now **bus voltage**
  (reflecting whichever of solar/battery is effectively dominant at
  that bus node, same as the old OR-ing plan would have given, just via
  Branch C's existing topology rather than a dedicated diode pair) —
  see `specs/wiring_diagram.md`.
- **"All-day" (dawn-to-dusk) flight is not currently realistic** with 6–8
  cells of this size; midday net-positive is achievable, morning/evening is
  battery-buffered only.
- **Solar-only operation (no battery) can't ride through a passing
  cloud.** Bench-confirmed 2026-07-22 (see `logs/test_flights.md`): with
  no batteries connected, a brief cloud shadow browned out the ESC
  mid-motor-load-test. Battery buffering (as in the actual flight
  config) is required for continuous operation through variable
  lighting — not yet confirmed whether it actually prevents this failure
  mode, since that hasn't been separately tested.
- **Brownouts happen even with the battery connected, under current
  spikes.** Bench-observed 2026-07-22 (see `logs/test_flights.md`): with
  battery connected but solar barely supporting (shade), brownouts
  got *more* frequent, not less — hypothesized as the battery's own ESR
  causing terminal voltage to sag under fast current steps. Separately,
  the solar array alone (full sun) struggles at higher current spikes
  too, consistent with the diode-OR clamping behavior above. A capacitor
  is already at the ESC input; capacitors at the battery terminals and
  the array output are recommended but not yet built — see
  `specs/wiring_diagram.md` and `specs/components.md`.
- **RESOLVED 2026-07-23 — the "brownouts" are the main battery's BMS
  protection tripping, not the ESC or the FC. A same-day hypothesis
  that this was undervoltage-triggered was tested and overturned — the
  evidence points to a current-triggered protection (OCP) instead.**
  User directly ruled out the ESC as the cause of the system shutting
  off around ~2.9–3A of motor draw: when it happens, the **entire main
  bus loses power**, and the battery must be physically disconnected
  and reconnected before anything powers back on — the signature of a
  BMS protection trip latching the battery off the bus. Two follow-up
  battery-only load tests (no solar, battery→ESC/FC direct) at
  different starting voltages (4.01V and 3.88V resting) both show
  ~0.3Ω combined sag resistance, but the **trip current stayed the same
  (~2.9–3A) despite the 0.13V difference in starting voltage** — if the
  trip were voltage-triggered, the lower-starting test should have
  failed at a lower current, but instead it kept working down to a
  *lower* bus voltage (2.76V) than where the first test had already
  failed (~2.9V), before finally cutting out at a similar current. **The
  simplest explanation consistent with both tests is a genuine
  overcurrent protection around ~2.9–3A, largely independent of battery
  SOC within the range tested** — not the SOC-dependent undervoltage
  mechanism first proposed. Since the battery is the dominant power
  source on Branch C under real load, losing it collapses the whole
  bus — solar alone can't sustain FC/receiver/servo power at that
  demand. **This closes out the long-running ESC-vs-FC-vs-ground-bounce
  ambiguity**: it was never either device failing, and the FC ground
  isolation fix (below) was a real improvement worth having but wasn't
  the actual fix for this failure mode. **Practically important: this
  reads as a fixed ~2.9–3A ceiling present throughout the flight, not
  just something that emerges as the battery depletes** — arguably a
  more serious constraint for the cruise-power estimate than the
  earlier SOC-dependent framing suggested. See `logs/test_flights.md`
  (three entries, 2026-07-23) and `specs/wiring_diagram.md`'s
  "Negative/return path" section.
- **The main battery's BMS also disconnects it above ~4.2V (variable
  threshold, confirmed 2026-07-23) — a separate protection on the same
  BMS, not the same trip as the overcurrent one above.** This is an
  active protective cutoff, not just a voltage ceiling: whenever solar
  charges the pack to full while still connected, the BMS opens the
  connection entirely. The exact threshold isn't razor-precise — a
  same-day bench test observed the battery at 4.26V, "topped off" and
  not contributing (see `logs/test_flights.md`).

## 5. Open questions / next steps

- [ ] **Empennage material/weight not yet decided (2026-07-24), and the
      tail sizing hasn't been checked against actual CG.** Horizontal
      (320×80mm) and vertical (120×80mm) stabilizers are sized via the
      tail volume coefficient method — see `specs/components.md`'s
      "Empennage sizing" section — but that method only sizes tail area
      for a *typical* moment arm/coefficient; it doesn't confirm the
      aircraft will actually balance correctly once built. Needs: (1) a
      material decision (same FOAMULAR NGX foam as the wing, balsa, thin
      foam board, etc.) so weight can be added to
      `calculations/power_budget.py`'s `KNOWN_COMPONENTS_G`, and (2) a
      real CG check once the airframe is assembled — battery/motor/
      component placement relative to the wing's aerodynamic center
      determines actual static margin, which this sizing pass didn't
      address.
- [ ] **⚠️ HIGH PRIORITY (2026-07-23/24): three-regime theory of usable
      throttle across the battery's discharge cycle — plausible, not
      yet confirmed.** The ~2.9–3A motor-draw shutdown is root-caused to
      the battery's BMS overcurrent protection (see Section 4) — which
      kills power to the *entire* aircraft, not just the motor, until
      manually reset. The trip **current** stays roughly constant
      (~2.9–3A) across different starting battery voltages (4.01V,
      3.88V), but the **throttle position** needed to reach that current
      is strongly voltage-dependent (less throttle needed at higher
      battery voltage — ordinary motor/ESC behavior, since a given
      throttle % delivers less effective voltage at a lower bus). This
      leads to a working theory of three regimes across a discharge
      cycle:
      1. **High battery voltage:** OCP trips at low-to-moderate
         throttle — most of the throttle range is unsafe.
      2. **Mid voltage:** OCP trips only at high throttle — safe range
         grows as voltage drops.
      3. **Low voltage:** full throttle can no longer reach ~2.9–3A at
         all (the motor/prop combination can't draw that much current
         from a bus this low). Hypothesized: **the 5V Regulator's own
         input headroom (2.7–11.8V) becomes the limiting factor**, with
         FC brownout/reset as the symptom. **Still unconfirmed either
         way, 2026-07-24 — two tests, same 2.25V number, likely
         different causes, not yet reconciled:**
         - A battery-fed motor test found the **ESC** consistently
           cutting out around **2.25V bus**, at low current (~1–1.5A) —
           resets via throttle-to-zero, no physical reconnect needed
           (unlike the battery OCP trip). That test's FC was powered in
           part via USB, though, so it's uninformative about the
           regulator's own headroom.
         - A separate **solar-only** test (no batteries at all) found
           the **regulator/FC** cutting out first, also at **2.25V
           bus** — but that test pushed the array to ~3A, above its
           ~2.4A/cell nameplate rating, so the cutoff may just be the
           array's own I-V curve collapsing past its rated current,
           not the regulator's true dropout point.
         - **The matching 2.25V figure across two different sources
           (battery vs. solar) and two different reported symptoms
           (ESC vs. regulator/FC) is suspicious enough to flag
           directly: it's plausible both tests are actually seeing the
           *same* regulator/FC-side dropout, with the first test's "ESC
           cutout" really being the ESC losing a valid throttle signal
           once the FC's servo-rail-side logic lost power (masked by
           USB keeping the FC's MCU alive) — rather than two
           independent, coincidentally-identical thresholds.** Not
           distinguished yet. The regulator-headroom hypothesis remains
           **neither confirmed nor refuted**. See `logs/
           test_flights.md`'s two 2026-07-24 entries ("ESC cuts out at
           2.25V" and "Solar-only load test") for the full readings and
           the specific follow-up test proposed to tell these apart.
      **If this holds, the actually-safe throttle/voltage envelope may
      be narrower than either failure mode looks in isolation.** Needs:
      (1) throttle position logged alongside current in future tests,
      (2) the 5V Regulator's own *output* monitored directly (not just
      bus voltage) during a high-current pull at low starting SOC to
      test the regulator-headroom hypothesis, (3) a third battery-only
      test at a still-lower starting voltage to find where full
      throttle stops reaching the OCP trip current, and (4) real
      motor-load data with solar reconnected to see how much headroom
      solar contribution restores. Whatever the outcome, this is a
      design constraint to characterize precisely before treating
      cruise flight as viable at the estimated power budget — not
      something to resolve by assumption. See `logs/test_flights.md`'s
      2026-07-23/24 entries.
      **✅ OCP risk largely mitigated 2026-07-24 via a different
      mechanism than a voltage alarm: an INAV throttle scale of 0.45.**
      This caps commanded throttle to 45% of the transmitter's full
      range, and validated across a full battery discharge cycle
      (2.2A at full charge → ~2A for most of the cycle → 1.5A near
      depletion — all below every observed OCP trip current, 2.25–3A)
      and under solar power including sun/shade transitions at full
      power (up to 3A total, no trip — see Follow-up note on why this
      doesn't contradict the ~2.9A battery-only trip current). This
      sidesteps the "absolute voltage doesn't predict OCP" problem
      entirely by capping the current directly instead of trying to
      infer it from voltage. **Does not address the separate ESC/
      regulator low-voltage cutout (~2.25V bus)** — that's voltage-
      triggered, not current-triggered, and the 1.5A reading late in
      the battery cycle is uncomfortably close to the ~1–1.5A logged in
      the "ESC cuts out at 2.25V" entry. A voltage safeguard is still
      needed for that mechanism specifically. See `logs/test_flights.md`'s
      2026-07-24 "Throttle scale 0.45 validated" entry.
      **Bonus finding from the solar test above: evidence that OCP
      monitors current out of the battery itself, not total bus
      current.** 3A total motor current (mostly solar-sourced) didn't
      trip OCP, while ~2.9A total current tripped it in the battery-only
      2026-07-23 tests — consistent with the BMS watching the battery's
      own output, not the combined bus. Doesn't resolve the separate
      "why did load test #3 trip at a lower current" question (still
      open, possibly avionics-draw-related).
      **Planned mitigation for the ESC/regulator voltage cutout — a
      single fixed VBAT floor doesn't account for varying SOC/solar/
      throttle combinations.**
      The original proposal (a flat ~3.0V alarm) assumed the "safe" bus
      voltage is roughly constant — but the OCP trip is current-triggered,
      not voltage-triggered, so the *absolute* bus voltage at trip scales
      with starting SOC (less sag needed to reach the same trip current
      when SOC is higher). A flat floor low enough to preserve range at
      low SOC gives **no warning at all** for a sudden high-current trip
      at high SOC, which back-of-envelope resistance math suggests could
      happen as high as ~3.2–3.3V on a well-charged pack — above any
      reasonable fixed floor.
      **New proposal, not yet implemented or validated: a sag-relative
      threshold instead of a fixed floor.** Sag from a resting/low-
      throttle baseline to last-good-reading-before-trouble is far more
      consistent across different starting SOC than absolute voltage is:
      | Test | Start | Last good | Sag |
      |---|---|---|---|
      | 07-23 #1 | 4.01V | 2.96V @ 2.75A | 1.05V |
      | 07-23 #2 | 3.88V | 2.76V @ 2.9A | 1.12V |
      | 07-24 #3 | 3.54V | 2.45V @ 2.25A | 1.09V |
      Absolute trip voltage spans 0.5V across these three tests; sag
      spans only ~0.07V — despite different starting SOC *and* test #3
      tripping at a notably lower current (still unexplained — see
      above). Proposed model: (1) an **absolute floor around 2.5–2.6V**
      for the ESC/regulator's own low-voltage cutout (a hardware limit,
      independent of sag dynamics), plus (2) a **relative alarm at
      ~0.8V sag** from a rolling low-throttle baseline (refreshed
      whenever throttle returns to idle), for the OCP mechanism —
      whichever triggers first is the action point. This automatically
      adapts to solar contribution and battery SOC without modeling
      either separately, since it's tracking real-time observed bus
      behavior rather than a precomputed assumption.
      **Not yet validated — only 3 sag data points, and depends on
      resolving:** (a) whether OCP is motor-current-only or total-current
      (test #3's lower trip current is still unexplained and could mean
      the sag budget isn't truly constant once avionics draw varies),
      (b) whether ~1.0V sag holds up with more tests across a wider SOC
      range, (c) whether the FC/OSD platform can implement a rolling-
      baseline relative alarm at all, or whether this has to be
      approximated as a per-flight manual pre-flight calculation instead.
      See `logs/test_flights.md`'s 2026-07-24 "Battery-only load test #3"
      entry for the full sag table and reasoning.
- [x] ~~VBAT does not appear to track bus voltage (2026-07-24).~~
      **Resolved same day — not a wiring defect.** The battery-only
      test that surfaced this had the ESC red pin **deliberately
      disconnected** from VBAT, specifically to measure bus voltage and
      VBAT independently. With that pin disconnected, VBAT correctly
      wasn't reading the sagging bus. See `logs/test_flights.md`'s
      2026-07-24 "Battery-only load test #3" entry for the resolution.
      Superseded by the next item, which is the real finding.
- [ ] **⚠️ HIGH PRIORITY (2026-07-24): connecting VBAT to the ESC red pin
      changes the 5A sensor's reading by ~0.5A — likely a USB-backfeed
      bench artifact, not a real change in motor current. Every prior
      trip-current test was run with that pin disconnected, and may not
      transfer to real in-flight readings either way.** Reframed same
      day: connecting VBAT while the motor was running dropped the 5A
      sensor's reading by ~0.5A at the same throttle. **Leading
      hypothesis (reasoned from the topology, not yet isolated):** the
      FC — plausibly via its USB connection to a laptop, an independent
      power source — may be **backfeeding current into the main bus**
      through the VBAT wire once it's tied to the ESC red pin. The 5A
      sensor sits in-line on the trunk-to-ESC path only, not on the VBAT
      tap, so it would miss any current arriving via that alternate
      path — meaning the *sensor reading* drops without the *motor*
      necessarily receiving less current at all. If confirmed, **this
      is a bench-test artifact specific to having USB connected, with no
      in-flight equivalent** (no USB in flight). Secondary, previously-
      leading hypothesis: FC firmware voltage-aware throttle behavior
      (sag compensation/current limiter) — not ruled out, but less
      likely given USB was known to be connected in at least one
      closely-related test this session.
      **Why this matters either way:** every OCP trip-current measurement
      logged so far — both 2026-07-23 tests (~2.9–3A) and the 2026-07-24
      test above (~2.25–2.5A) — was run with VBAT **disconnected**. In
      flight, VBAT is connected but USB is not — a combination no bench
      test has cleanly isolated yet. **If backfeed is confirmed, it also
      calls into question the "ESC cuts out at 2.25V" and "regulator/FC
      cuts out" test results above**, since both may have had USB
      involved. See `logs/test_flights.md`'s 2026-07-24 "Connecting VBAT
      to the ESC red pin" entry (includes the reframing and the specific
      test — repeat with USB disconnected — that would settle this).
- [ ] **Thrust at operating current is estimated, not measured
      (2026-07-24).** `specs/components.md`'s Motor row now has a rough
      ~30–45g estimate at 2.5A, built entirely from assumptions (motor/
      ESC efficiency, an assumed 5–7 g/W for this prop) — no thrust-stand
      data exists for this motor/6×3-prop combo, and manufacturer thrust
      tables weren't fetchable (network policy blocked T-Motor/Pyrodrone/
      GetFPV/drone-fpv-racer.com). **A smaller prop would likely reduce
      thrust-per-watt, not improve it** — momentum theory says a larger
      disk (prop diameter) needs less induced velocity to produce the
      same thrust, so bigger is generally more efficient, all else equal.
      **Real caveat specific to this build:** the M1104 KV7500 is a tiny
      motor normally paired with 2–2.5" props, not this 6" one — if it's
      "overpropped" (can't spin this prop up to an efficient RPM), actual
      efficiency could be worse than the theory suggests, and a smaller
      prop might paradoxically test better in practice. **Not resolved
      without real data** — needs either a thrust-stand measurement or an
      RPM reading under load at 2.5A to know which effect dominates for
      this specific motor/prop pairing before treating any prop-size
      change as an improvement.
- [ ] **Branch B's ground is fully isolated from the rest of the
      aircraft (confirmed 2026-07-24) — intentional or a wiring gap?**
      The FPV Camera/VTX and FPV Battery grounds tie to Ideal Diode
      Module #1's OUT− pin, forming one local loop — but that loop is
      **not** connected to the Negative Return Bus (Main Battery/ESC/FC
      ground). This corrects an earlier assumption in
      `specs/wiring_diagram.md` that it did converge with the bus. Since
      Branch B's only ground reference is the Solar Array's negative
      (shared with Diode #2's input), the FPV rail's ground floats
      relative to the main battery/ESC/FC ground plane whenever the
      array isn't actively feeding it. FPV video-ground isolation from
      motor/ESC switching noise is a legitimate and common design
      choice, so this may be deliberate — but it hasn't been confirmed
      as intentional vs. an overlooked connection. Needs a decision: tie
      Branch B's ground to the main bus, or document the isolation as
      permanent design intent (and check for any downstream
      implications, e.g. FPV video noise/ground-loop behavior either
      way). See `specs/wiring_diagram.md`'s 2026-07-24 correction and
      `specs/wiring_diagram.svg`.
- [ ] **250g is a long-term goal, not a current blocker (2026-07-22) —
      kept for reference, not an active task.** The current design (7
      cells, Clark-Y wing) isn't being changed to hit this now. Honest
      math is in `calculations/power_budget.md`'s "Weight budget vs. the
      250g target": flight-configuration listed components alone leave
      only ~7.3g of headroom before any airframe structure is added, and
      the two biggest levers (Solar Cells 98g, Main Battery 47.1g) are
      also the two most central to the project's mission. Relevant
      whenever future components or design changes are being weighed —
      factor this target in alongside performance/reliability, without
      treating it as something that needs resolving today.
- [x] ~~ESC weight discrepancy (2026-07-22).~~ **Resolved 2026-07-23 —
      the measured weight (5.07g) is authoritative.** The E-Power BE001's
      own spec sheet says 7.3g, but that's the manufacturer's stated
      figure, not a measurement of the actual unit in this build — the
      5.07g figure already in `specs/components.md` and
      `calculations/power_budget.py` was a real scale weighing and
      stands. No change needed to the AUW total; the two figures simply
      aren't the same kind of number (spec-sheet nominal vs. this unit's
      actual scale weight).
- [x] ~~ESC's 5V max rating vs. array's theoretical Voc.~~ **Re-resolved
      2026-07-23 — accepted as-is, corrected topology understanding.**
      An earlier pass reopened this over the BMS-disconnect finding,
      worrying that with the battery disconnected the ESC would see the
      array's own voltage (up near Voc) directly. **That premise was
      wrong: the ESC sits on the bus side of Branch C's diode module,
      never the raw panel side, battery connected or not.** Bench data
      (`logs/test_flights.md`, 2026-07-23) already shows a real gap
      between panel and bus voltage even under light, no-motor load
      (panel 4.53V vs. bus 4.25V; panel 4.46V vs. bus 4.20V) — and that
      gap grows larger under motor load, not smaller. So the ESC's
      actual exposure has more margin below 5V than the array's own Voc
      figures suggested, in every load condition, not just the "any
      load connected" case the original reasoning pictured. **Decision:
      not a concern for the current 7-cell design.** Revisit only if
      array efficiency improves (closing the 4.57V measured vs.
      ~5.0–5.1V theoretical Voc gap) or cell count goes to 8
      (theoretical Voc ~5.76V) — both would raise panel (and
      correspondingly bus) voltage closer to the ESC's ceiling. See
      `specs/components.md`.
- [x] ~~Branch A (VBAT voltage-sense tap) is undecided.~~ **Decided in
      concept, 2026-07-23 — since superseded, 2026-07-24: Branch A was
      eliminated entirely rather than built as the 2-input OR described
      below (see the "Physically wire Branch A" item above). Kept here
      as historical record of how that decision evolved.** Not a plain
      Ideal Diode Module like Branches B/C after all. Branch A's Ideal
      Diode Pair becomes a true
      2-input OR: Input 1 = solar array (existing), Input 2 = main
      battery (**new — planned, not yet physically wired**), Output =
      FC VBAT pin. Gives a contextually meaningful in-flight reading —
      solar voltage when solar is dominant, battery voltage when running
      on battery power. **Sense-vs-power question resolved 2026-07-23
      (bench-confirmed, corrected from an earlier same-day theoretical
      guess):** connecting voltage to VBAT **does power on part of the
      flight controller** — Branch A is a real power input, not purely
      instrumentation. It does **not** power the servo rail, though —
      that stays dependent on the separate external 5V Regulator on
      Branch C. (An earlier pass at this question theorized, from the
      F405 NAVI's published 12–30V-input onboard BEC specs, that
      Branch A's ~4.4–4.6V would be too low to power anything on the
      board — direct bench testing shows that reasoning was wrong for
      at least part of the FC, even if the servo-rail BEC specifically
      needs more than Branch A provides.) Practical implication: with
      Branch A currently solar-only, that partial FC power depends on
      solar being present — the planned battery-input OR-ing change
      (above) also means that partial-FC-power domain stays up on
      battery alone, not just on sun. See `specs/wiring_diagram.md`.
- [x] ~~Physically wire Branch A's new main-battery input.~~
      **Superseded 2026-07-24 — Branch A eliminated entirely, not
      built as planned.** Instead of adding a second input to Branch
      A's diode pair, the whole Branch A concept is scrapped: VBAT now
      wires directly to the **ESC's red (power) pin**, i.e. Branch C's
      bus. Reasoning: bus voltage (what the ESC/motor/regulator actually
      experience, including sag under load) is more useful in-flight
      telemetry than a dedicated solar-or-battery OR-ing reading would
      have been, especially given the active battery-BMS/overcurrent
      investigation (Section 4/5) where bus voltage is exactly the
      metric that matters. In practice the reading still behaves
      similarly — Branch C's existing topology already blends solar
      (via its own diode) and battery (direct parallel) at that bus
      node — just without a second, dedicated diode pair. The Ideal
      Diode Pair (1.46g) is removed from the build and the weight
      totals. See `specs/wiring_diagram.md` and
      `specs/components.md`.
- [x] ~~VBAT is rated far above what it's actually fed (2026-07-22).~~
      **Resolved 2026-07-23** — the voltage sensor has been calibrated
      for this lower range; the raw VBAT reading is now trustworthy. The
      ATOMRC F405 NAVI's VBAT input remaining manufacturer-rated for
      12–30V (3–6S) while actually fed ~4.4–4.6V is noted for
      completeness (see `specs/components.md`) but isn't a live concern.
- [x] ~~Current-sensor count/type doesn't reconcile.~~ **Resolved
      2026-07-23** — the original 3 SparkFun ACS723 breakouts are
      retired, not used at all anymore. The 4 distinct current-sensing
      devices (2× 5A sensor, 2× 2A current meter) are a separate,
      current bench-only setup, not the same hardware and not a
      count/rating discrepancy.
- [x] ~~5V Regulator is unweighed.~~ **Resolved 2026-07-23 — identified
      as a Pololu S7V7F5 (5V Step-Up/Step-Down Voltage Regulator),
      0.6g mfr. spec (no header pins), now in the ~242.7g
      listed-components total and the AUW estimate.** Input range
      2.7–11.8V comfortably covers Branch C's bus (~3.6–4.6V) — its
      buck-**boost** topology is exactly why it works on a bus that dips
      below 5V, where a buck-only regulator's output wouldn't hold. One
      new item this surfaced: Pololu's own spec calls for a ≥33µF/16V+
      capacitor at the regulator's *input* for stability, distinct from
      the servo-rail-output capacitor already recommended for transient
      response — see `specs/components.md` for both. (The 5A/2A
      bench-only current sensors, by contrast, are confirmed 2026-07-23
      to never need weighing — none of them fly.)
- [ ] **The Clark-Y / 1220×200mm wing update (2026-07-22, span updated
      again 2026-07-24) hasn't been re-weighed — and a physics estimate
      suggests the AUW is probably too low.** Wing area and wing loading
      in this file, `specs/components.md`, and
      `calculations/power_budget.md`/`.py` have all been updated for the
      new geometry, but the ~90–110g unlisted airframe mass estimate (and
      therefore the ~332.7–352.7g AUW) still reflects the old
      SD7037/1210×150mm wing. A larger chord likely means more foam and
      skin material. **Stronger evidence now (2026-07-22), on firmer
      footing since 2026-07-24:** a foam-density-based estimate
      (`calculations/power_budget.md`'s "Wing loading vs. span" section),
      now using the real sourced density of the actual FOAMULAR NGX foam
      selected rather than a generic placeholder, puts the foam wing
      *alone* at ~83–102g at the current 1220mm span — comparable to or
      more than the entire 90–110g bucket that's supposed to also cover
      spars, fuselage, mount, wiring, and adhesives. Confirm real weight
      once built — this isn't just a stale estimate anymore, there's a
      concrete reason to think it's genuinely too low.
- [ ] **The 6→7 cell update is partially bench-confirmed (2026-07-22),
      not fully.** `calculations/power_budget.py`/`.md`, `specs/components.md`,
      and this file's component table were updated to reflect 7 cells and
      theoretical Vmp/Pmax back when the cell was added; a bench
      measurement now exists (`logs/test_flights.md`, 2026-07-22 entry) —
      Voc 4.57V (below the ~5.0–5.1V theoretical) and a much smaller load
      sag than the 6-cell baseline. Still pending: a true Vmp measurement
      and the motor-load test. Don't treat the theoretical Pmax/Vmp
      figures as validated until those land.
- [ ] **Voc shortfall vs. theoretical (2026-07-22) — temperature now
      confirmed as a real contributing factor, still not quantified.**
      Measured 7-cell Voc (4.57V) is ~9–11% below the datasheet-derived
      theoretical (~5.0–5.1V) — see `logs/test_flights.md`. **Update
      2026-07-23:** a same-day bench test directly observed array
      voltage dropping as the system heated up (4.46V→4.43V between two
      readings at the same load, system described as "hot" for the
      second) — consistent with the well-known negative temperature
      coefficient of silicon solar cell voltage. This confirms
      temperature as a real factor, not just a hypothesized one, but no
      actual temperature was logged (just "hot"/"cool"), so the
      magnitude isn't quantified and this doesn't fully explain the
      9–11% shortfall on its own. Still worth checking: cell tolerance,
      and the array's operating voltage sitting close to the ideal
      diodes' rated 4V floor (see `specs/components.md`). Log actual
      temperature next time, not just a qualitative impression.
- [ ] Confirm actual Vmp of the array after adding the 7th cell (measured
      at the true max-power operating point, not just Voc under one load
      — see the caveat in the 2026-07-22 `logs/test_flights.md` entry).
      A motor-load test now exists (2026-07-22, solar-only, no
      batteries) with current readings up to 3A motor load, but no
      voltage was logged at any step — still no true Vmp point.
- [ ] **Overhead current jump during motor-load test (2026-07-22).**
      Solar output exceeded motor load by a steady 0.5A at low load but
      jumped to a steady 1.0A from 1.5A load upward (see
      `logs/test_flights.md`). Not distinguished between resistive/diode
      losses and the array's own I-V curve behavior (more current
      available as the bus sags further below Vmp) — needs voltage
      logged alongside current to resolve. Possibly related to the
      battery/array current-spike brownouts below — not established.
- [ ] **Build and validate the recommended capacitors — 1 of 4 locations
      done, prioritized 2026-07-23.** Candidate part confirmed 2026-07-22
      (RLTZ series 680µF/16V, ESR 15mΩ, from user's on-hand stock — good
      fit everywhere). Priority order and status:
      1. **5V Regulator VIN — confirmed installed, 2026-07-23.** Pololu's
         own datasheet spec for the S7V7F5, closer to
         required-for-stability than optional.
      2. Main battery terminals — not yet built. Fixes an
         already-measured brownout.
      3. Solar array output — not yet built. Fixes a separately-measured
         brownout (transient response, distinct from the 7-cell fix's
         steady-state clamping fix).
      4. 5V Regulator output (servo rail) — not yet built, not yet
         decided. Good practice, no specific measured failure there yet.
      See `specs/components.md` and `specs/wiring_diagram.md`. The FC's
      ground return is now independent of the ESC (see the resolved item
      above), so a re-test after installing the remaining 3 capacitors
      will actually be able to attribute results to a specific cause.
      Observe correct polarity when installing (polarized parts).
      **Weigh the actual on-hand parts** before assuming they don't
      matter against the ~7.3g remaining 250g headroom — no sourced
      weight found for this specific RLTZ part yet.
- [x] ~~Isolate the FC's and ESC's negative/return paths.~~ **Confirmed
      built 2026-07-23** — an independent ground wire now runs from the
      FC directly to the battery/array negative bus (star ground),
      replacing the old ESC-routed path. See `specs/wiring_diagram.md`'s
      "Negative/return path" section (diagrammed in `wiring_diagram.svg`
      too). A worthwhile fix on its own merits, though it turned out not
      to be the actual explanation for the brownouts — see the resolved
      item in Section 4 (it's the battery's BMS protection tripping,
      confirmed 2026-07-23).
- [x] ~~Decide whether an MPPT/buck stage is needed long-term vs. static
      series-cell matching.~~ **Resolved 2026-07-23 — sticking with
      static series-cell matching, no MPPT/buck stage for this design.**
      The 7-cell string's bench performance so far (much smaller load
      sag than the 6-cell baseline) supports matching solar output to
      bus load this way; the added weight/complexity/cost of a real
      MPPT stage isn't justified for this design. Revisit only if future
      bench data (true Vmp, motor-load test) shows the static match
      falling short.
- [ ] **Log a real bench test with current-sensor data** to
      `logs/test_flights.md` — current-sensor readings are bench-only
      (see Section 4); a real *test flight* will only yield the single
      VBAT voltage reading, not current data.
- [ ] Validate cruise power estimate against bench-measured current draw
      at cruise throttle — in-flight current draw can't be measured with
      this FC (no free ADC channel; see Section 4). If in-flight
      validation is wanted later, it needs a different approach (e.g. an
      add-on logger, or inferring from the one available voltage
      reading's discharge rate). The 2026-07-22 motor-load test has
      current data up to 3A load, but no voltage was recorded, so it
      can't yet be converted to Watts for comparison against
      `calculations/power_budget.md`'s estimate.
- [x] ~~Decide whether Branch A should sense main battery instead of
      solar array.~~ **Resolved 2026-07-23 — answer was "both," via
      OR-ing, not "instead of." Superseded 2026-07-24** by eliminating
      Branch A entirely — VBAT now reads Branch C's bus directly
      (ESC's red pin), which achieves the same "whichever source
      dominates" effect via Branch C's existing topology, without a
      dedicated diode pair. See the "Physically wire Branch A" item
      above.
- [ ] Re-run wing loading / power budget once final AUW is weighed (not
      estimated)

## 6. How to work in this repo

- **Specs** go in `specs/` — one component or datasheet extraction per file.
  Always cite the source (product page, datasheet, or "estimated from photos"
  if inferred).
- **Calculations** go in `calculations/` as both a runnable script (Python
  preferred) and a short `.md` explaining assumptions and results in plain
  language. Re-run and update numbers whenever a component changes — don't
  let stale numbers sit uncorrected.
- **Decisions** go in `decisions/` as numbered ADRs (Architecture Decision
  Records) — one file per significant design choice, using the template in
  `decisions/0000-template.md`. Include the alternatives considered and why
  they were rejected.
- **Test flight logs** go in `logs/test_flights.md`, one dated entry per
  flight, with conditions, readings, and any deviation from predicted values.
- **Roadmap** lives in `docs/roadmap.md` — update phase status as the project
  moves from prototyping toward production.
- The **dashboard** is a separate app/repo (`solar-airplane-dashboard`), not
  a folder in this repo. It's a read-only Next.js app over a bundled
  snapshot of this repo's markdown files, refreshed manually via its
  `scripts/sync-content.sh` — not a live view. All edits still happen here,
  through Claude Code. It does not run `calculations/*.py`; those stay
  code-only. See that repo's own README for setup/deploy details.
- When asked to do a calculation, prefer writing/updating a script in
  `calculations/` over doing throwaway math in chat, so the work is reusable.
- When a component changes, update the table in this file (Section 3) in the
  same session — this file should never fall out of sync with reality.
- When new measured data is reported (voltage, current, weight, flight
  results), log it as a dated entry in `logs/test_flights.md` using the
  template at the top of that file. Then check whether it changes any
  assumption elsewhere in the repo (specs, calculations, open questions) —
  **flag inconsistencies rather than silently updating them**, since
  measured data reconciling with a theoretical estimate is a judgment call
  the human should confirm, not something to auto-resolve.
