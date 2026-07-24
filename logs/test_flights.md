# Test Flight / Bench Test Log

One entry per test. Include ground/bench tests, not just flights — most of
the early validation here (solar output, current draw) doesn't require
flying.

Note: the full **Readings** template below (voltage *and* current for
each leg) is only fillable for `bench test`/`ground roll` entries, where
sensors can be read directly. For `flight` entries, only the single VBAT
voltage reading is available in the air (see `CLAUDE.md` §4 and
`specs/wiring_diagram.md`) — leave other reading fields blank rather than
estimating them.

Template for each entry:

```
## YYYY-MM-DD — short title

**Type:** bench test | ground roll | flight
**Conditions:** sun (clear/partial/overcast), time of day, temperature
**Config:** cell count, battery SOC at start, any changes since last entry

**Readings:**
- Solar array voltage/current:
- Battery voltage/current:
- Avionics draw:
- Motor draw (if applicable):

**Observations:**

**Deviation from prediction:** (compare against calculations/power_budget.md
and battery_soc.md — note if reality diverges and by how much)

**Follow-up:**
```

---

## 2026-07-24 — Battery-only load test #3: first simultaneous VBAT + bus voltage reading

> ⚠️ **Unresolved discrepancy — VBAT does not track bus voltage as the
> 2026-07-24 wiring change predicted.** See Observations below. Flagging
> rather than reconciling — need to confirm exactly where "FC volts" was
> probed before drawing conclusions.

**Type:** bench test
**Conditions:** not recorded.
**Config:** Main battery only — wired to ESC and to the Flight
Controller/5V Regulator. No solar, no camera, no FPV battery. Starting/
ending battery voltage **not recorded this time** (earlier tests logged
this — worth capturing next time). Same physical setup as the two
2026-07-23 battery-only tests, but this is the **first test to read VBAT
(FC volts) simultaneously with bus voltage**, plus a one-time servo-rail
check at the start (5.00V).

**Readings** (motor current vs. bus voltage vs. FC volts/VBAT vs. throttle):

| Motor current | Bus voltage | FC volts (VBAT) | Throttle |
|---|---|---|---|
| 0A | 3.42V | 4.48V | 0 |
| 0.5A | 3.24V | 4.48V | 4 |
| 1A | 3.06V | 4.48V | 17 |
| 1.5A | 2.86V | 4.50V | 31 |
| 2A | 2.55V | 4.57V | 50 |
| 2.25A | 2.45V | 4.53V | 60 |

Could not reach 2.5A before the battery's protection latched off.

**Observations:**
- **VBAT (FC volts) does not track bus voltage.** Per `specs/
  wiring_diagram.md`'s 2026-07-24 change, VBAT wires directly to the
  ESC's red (power) pin — the same node as "bus voltage" in this table.
  If that's correct, VBAT and bus voltage should be nearly identical
  (it's a sense line, negligible current, no meaningful IR drop). Instead
  bus voltage crashes from 3.42V to 2.45V while VBAT stays flat around
  4.48–4.57V, tracking close to the 5V servo-rail reading (5.00V at the
  start) instead. **Not reconciled yet — open question below.**
- Bus voltage sag is roughly linear with current: endpoints (0A, 3.42V)
  and (2.25A, 2.45V) give **V ≈ 3.42 − 0.43×I**, i.e. ~0.43Ω effective
  resistance — same ballpark as the two 2026-07-23 tests (~0.3Ω), though
  a bit higher (hand-read analog panel meters this time — see
  `photos/2026-07-24-test-bench/` — so some imprecision is expected).
  The 1.5A→2A step sags more than the surrounding steps (−0.31V over
  0.5A vs. ~−0.18–0.20V elsewhere); could be a real nonlinearity as the
  battery nears its protection threshold, or just meter-reading noise —
  not enough points to tell.
- Bus voltage reached 2.45V without tripping, and the trip happened when
  *current* was pushed past ~2.25A — consistent with the 2026-07-23
  finding that this is overcurrent protection (OCP), not a fixed-voltage
  cutoff (the earlier, superseded UVP hypothesis pegged the cutoff
  around 2.9–3.0V; this test sustained well below that on voltage alone).
- **But the trip current here (~2.25–2.5A) is lower than both
  2026-07-23 tests (~2.9–3A).** Same battery, same "battery-only"
  config in principle. Two candidate explanations, not distinguished by
  this data alone:
  1. The BMS's OCP threshold is on **total battery current**, not motor
     current alone — if avionics draw (servos moving under load this
     time vs. idle before, GPS acquiring, etc.) was higher in this test
     than in the 2026-07-23 tests, the same *total* trip current would
     show up as a *lower* motor-current reading, since the 5A sensor on
     the ESC leg only measures the motor branch, not total battery
     output.
  2. Genuine run-to-run variability in the trip threshold itself (BMS
     protection points are rarely razor-precise).
  Cannot tell which without measuring avionics current simultaneously
  with motor current — see Follow-up.

**Deviation from prediction:** The VBAT-tracks-bus-voltage assumption
from the 2026-07-24 wiring change is directly contradicted by this data,
if "FC volts" was in fact read from the VBAT pin.

**Follow-up:**
- **Confirm exactly where "FC volts" was measured** — the FC's dedicated
  VBAT pad/pin directly (multimeter), or via OSD/telemetry software, or
  possibly the servo rail's 5V itself? This determines whether VBAT
  genuinely isn't reaching the ESC red pin as wired (a real build issue)
  or whether this was a measurement-point mix-up.
- Measure avionics (FC+servos+GPS+telemetry) current separately from
  motor current in the next test, to test the "total current, not motor
  current alone" OCP hypothesis above.
- Record starting/ending battery voltage next time, per the established
  template.

---

## 2026-07-24 — Test bench photos (record keeping only, no readings)

**Type:** bench test
**Conditions:** (not recorded)
**Config:** full bench layout as currently wired — 7-cell solar array,
FC + 4 servos + camera/VTX + GPS + telemetry radio + motor/prop, plus the
bench-only current-sensing instrumentation (analog ammeters).

**Readings:** none taken — photos only, for visual record keeping.

**Observations:** 3 photos of the full bench saved to
`photos/2026-07-24-test-bench/` (`bench-overview.jpeg`,
`bench-array-and-fc.jpeg`, `bench-meters-and-motor.jpeg`). Visually
consistent with the documented build: 7 solar cells in series, BN-880 GPS
and 915MHz telemetry radio labels match `specs/components.md`. Component
identity for the analog ammeters and the two battery packs visible was
**not** confirmed against the photos — see open question below.

**Deviation from prediction:** n/a — no measurements taken.

**Follow-up:** if useful later, identify which analog meter corresponds
to which branch (5A array sensor vs. the 2× 2A current meters) and which
battery pack is the main 18650 vs. the FPV 1S pack, then cross-reference
against `specs/wiring_diagram.md`.

---

## 2026-07-23 — Battery-only load test #2, lower starting SOC (overturns the UVP hypothesis)

**Type:** bench test
**Conditions:** not recorded (no solar involved).
**Config:** Same as the test below — main battery only, no solar, no
camera/camera battery. This test specifically repeats that same sweep
at a **lower starting voltage** (3.88V vs. the earlier test's 4.01V) to
test whether the trip is voltage-triggered (UVP) or current-triggered
(OCP) — see that entry's Follow-up. Battery voltage: 3.88V at start,
3.85V at end.

**Readings** (motor current vs. bus voltage, measured at the ESC):

| Motor current | Bus voltage |
|---|---|
| 0A | 3.78V |
| 0.5A | 3.57V |
| 1A | 3.40V |
| 1.5A | 3.23V |
| 2A | 3.10V |
| 2.5A | 2.94V |
| 2.75A | 2.87V |
| 2.9A | 2.76V |
| — | **Cutout shortly after reaching 2.9A** |

**Observations:**
- **This overturns the undervoltage (UVP) hypothesis from the test
  below — the evidence now points to a current-triggered protection
  (OCP) instead.** A linear fit to this run gives **V ≈ 3.75 − 0.33×I**
  (~0.33Ω combined resistance) — consistent with the earlier test's
  ~0.32Ω, which is a good sanity check on the measurement itself. But
  the **trip behavior doesn't match what UVP would predict**:
  - If the trip were a fixed *loaded voltage* threshold (~2.9–3.0V, as
    the first test's failure point suggested), this test — starting
    0.13V lower — should have failed at a **lower current** than the
    first test, since less headroom was available. Instead, it kept
    working down to **2.76V at 2.9A**, well below where the first test
    already failed (~2.89–2.96V), and only cut out **after** reaching
    2.9A.
  - The **trip current** was essentially the same in both tests
    (~2.75–3A in the first, ~2.9A+ in this one) **despite the 0.13V
    difference in starting voltage.** That's the signature of a
    current-triggered protection (OCP), not a voltage-triggered one —
    if voltage mattered, the trip current should have shifted with
    starting SOC; it didn't.
  - **Conclusion: within the 3.88–4.01V range tested, this looks like a
    genuine overcurrent protection tripping around ~2.9–3A of motor
    current, largely independent of battery SOC/resting voltage** — the
    original, simpler framing from the first root-cause finding, not
    the SOC-dependent undervoltage refinement proposed after the first
    test alone. A UVP protection may still exist on this BMS as a
    separate safeguard, but it isn't what's limiting behavior in either
    of these tests, since the current-based trip happens first.
- **This changes the flight-safety framing:** rather than "margin
  shrinks as the battery depletes," the more supported picture now is a
  **fixed ~2.9–3A motor-current ceiling that applies throughout the
  usable SOC range** — arguably a *more* serious constraint for the
  current cruise-power estimate, since it means the ceiling is present
  from takeoff, not just something that emerges late in a flight.

**Deviation from prediction:** N/A — this test's purpose was to
distinguish between two hypotheses from the prior entry, not to compare
against a `power_budget.md` figure.

**Follow-up:**
- A third data point at a still-lower starting voltage (e.g., ~3.5V)
  would strengthen confidence that the ~2.9–3A trip current holds across
  the *whole* usable range, not just the 3.88–4.01V window tested so far.
- Update `CLAUDE.md`'s high-priority open question and
  `calculations/power_budget.md`'s energy-balance verdict — both
  currently describe the SOC-dependent (UVP) framing, which this test
  doesn't support.
- The ~2.9–3A ceiling now looks like a hard design constraint to
  resolve (current-limiting the ESC, choosing a lower-current-draw
  prop/motor combination, or a different battery/BMS with a higher OCP
  threshold), not something that can be managed by just watching SOC
  during flight.

**Update (2026-07-24) — throttle position was different between the two
tests, and this reframes the whole picture:** user reports needing
**more throttle** in this (lower-voltage) test to reach the same 2.9A
than in the first (higher-voltage) test. This is expected motor/ESC
behavior — at a lower bus voltage, a given throttle % delivers less
effective voltage to the motor, so more throttle is needed to reach the
same current — and it resolves an apparent tension: the *current* at
which the OCP trips stays ~constant (confirming OCP over UVP), but the
*throttle position* needed to reach that current is strongly voltage-
dependent. **User's theory, which fits the data well:**
- **At high battery voltage** (near full charge), the ~2.9–3A OCP trip
  is reachable at low-to-moderate throttle — most of the throttle range
  is unsafe.
- **As the battery depletes**, reaching the same trip current requires
  progressively more throttle, so the "unsafe" portion of the throttle
  range shrinks toward the top end.
- **At some low-enough battery voltage, even full throttle can no
  longer push the motor past the ~2.9–3A trip current at all** — the
  bus voltage ceiling is now too low for the motor/prop combination to
  draw that much current regardless of duty cycle. At that point the
  *entire* throttle range becomes usable again, from the OCP's
  perspective.
- **But at that same low end, a different problem likely takes over:
  the 5V Regulator (Pololu S7V7F5, input range 2.7–11.8V) may not have
  enough input headroom to hold FC power stable when current is being
  diverted to the ESC/motor.** The regulator's input is the same shared
  bus this test measured. **This is not just theoretical — this test's
  own last reading (2.76V at 2.9A) is only 0.06V above the regulator's
  documented 2.7V minimum input.** At a still-lower starting battery
  voltage, the same current draw could plausibly sag bus voltage *below*
  2.7V before the battery's own OCP even trips, meaning the regulator
  itself — not the battery protection — could become the actual limit,
  with a different symptom (FC brownout/reset from regulator dropout,
  not a full bus power-loss requiring battery reconnect).
- **Net picture: three regimes across a discharge cycle** — (1) high
  voltage, OCP trips easily, most throttle unsafe; (2) mid voltage, OCP
  trips only at high throttle, safe range growing; (3) low voltage, OCP
  no longer reachable, but the 5V regulator's input headroom becomes the
  new constraint instead. The "safe" middle ground may be narrower than
  either single failure mode suggests on its own.
- **Not yet confirmed** — this is a well-reasoned theory from the
  pattern in the data so far, not a directly tested conclusion. See
  Follow-up.

**Follow-up (added 2026-07-24):**
- **Log throttle position (not just current) at every step in future
  tests** — now recognized as a meaningful, SOC-dependent variable in
  its own right, not just a means to reach a target current.
- **Directly monitor the 5V Regulator's own output** (not just bus/
  input voltage) during a high-current pull at low starting SOC, to
  test the regulator-headroom hypothesis — does FC power actually
  glitch/reset before or separately from the battery's OCP tripping?
- Find the starting battery voltage at which full throttle no longer
  reaches ~2.9A (confirms regime 3 above), then check whether the
  regulator's output is already unstable at that point.

---

## 2026-07-23 — Battery-only load test: motor amps vs. bus voltage (refines the BMS-trip finding)

> ⚠️ **Superseded by the follow-up test above:** the UVP hypothesis
> proposed in this entry didn't hold up against a second test at a
> different starting voltage — see the entry above for the correction
> (evidence now points to a current-triggered protection instead).
> Kept here for the record of how the hypothesis was reached.

**Type:** bench test
**Conditions:** not recorded (sun irrelevant — no solar connected).
**Config:** 7-cell string **not connected** — main battery only, wired
directly to ESC and Flight Controller. No camera or camera battery
connected. This isolates the battery's own loaded-voltage behavior with
no solar/diode-OR interaction at all. Battery voltage: 4.01V at start,
3.96V at end (small drop, short test).

**Readings** (motor current vs. bus voltage, measured right at the ESC):

| Motor current | Bus voltage | Notes |
|---|---|---|
| 0A | 3.85V | Baseline sag from 4.01V resting even at zero motor current (avionics/FC quiescent draw) |
| 0.5A | — | **Motor doesn't spin** at this commanded level |
| 1A | 3.50V | |
| 1.5A | 3.38V | |
| 2A | 3.21V | |
| 2.5A | 3.03V | |
| 2.75A | 2.96V | |
| 3A | — | **No power to bus** |

**Observations:**
- **This refines, and partly revises, the earlier "battery BMS
  overcurrent protection" framing (previous entry above).** The voltage
  sag here is smooth and consistent with simple IR (internal
  resistance) drop under load, and the bus fails right as loaded
  voltage crosses into the **2.9–3.0V range** — which is exactly the
  battery's own documented low-voltage cutoff territory (~2.5–3.0V, see
  `specs/components.md`'s Main Battery row). This looks more like an
  **undervoltage protection (UVP) trip triggered by load-induced sag**
  than a protection keyed purely on current. A linear fit to this data
  (excluding the "doesn't spin" point) gives roughly **V ≈ 3.85 −
  0.32×I** — i.e., ~0.3Ω of combined internal resistance (cell ESR +
  wiring/connectors + ESC input, all lumped together as measured from
  battery to ESC). That fit predicts ~2.9V right around 2.97A,
  consistent with the observed failure at 3A.
- **This means the "~3A limit" isn't a fixed ceiling independent of
  battery state — it's specific to this test's starting voltage
  (~4.01V resting).** At a higher resting voltage (e.g. freshly topped
  off nearer 4.2V), the same current would sag to a *less* severe
  voltage, likely allowing more current before hitting the same ~2.9V
  UVP threshold. Conversely, as the battery depletes over the course of
  a flight, its resting voltage drops, meaning **the same cruise
  current that's fine early in a flight could trip this protection
  later, even with no change in commanded throttle** — a more
  concerning framing than a flat current cap, since "it worked at
  takeoff" wouldn't guarantee it keeps working as the battery drains.
  Not confirmed as UVP vs. a coincidental OCP without a repeat test at
  a different starting SOC — see Follow-up.
- **Motor doesn't spin at 0.5A** — there's a minimum current
  (somewhere between 0.5A and 1A) below which the motor can't overcome
  static friction/cogging torque to start rotating. Below that point,
  current is being drawn without producing thrust.
- This test used **no solar contribution at all** — in the actual
  flight configuration, solar would offset some of the battery's share
  of a given total current demand, likely giving somewhat more headroom
  than shown here. This test is a useful worst-case reference (heavy
  shade, night, or low-light conditions), not necessarily representative
  of best-case daytime cruise.

**Deviation from prediction:** N/A — direct characterization test, not
a comparison against a specific power-budget number.

**Follow-up:**
- **Repeat this same current sweep at a different starting battery
  voltage** (e.g., freshly topped off near 4.2V, and again at a lower
  SOC) to test the UVP hypothesis: if the trip consistently happens
  around the same ~2.9–3.0V loaded voltage regardless of starting SOC
  (just at a different current each time), that confirms undervoltage
  protection rather than a fixed-current OCP.
- Repeat with solar reconnected to see how much headroom solar
  contribution actually adds at a given total current demand.
- This ~0.3Ω combined resistance estimate is rough (6 data points, one
  test) — a repeat test would tighten it and let it feed into
  `calculations/power_budget.md` as a real (not assumed) internal
  resistance figure.
- Update the high-priority cruise-power-vs-BMS-trip open question in
  `CLAUDE.md` §5 with this SOC-dependent framing.

---

## 2026-07-23 — Motor-load shutdown root-caused: battery BMS, not ESC/FC

**Type:** bench test
**Conditions:** not recorded.
**Config:** 7-cell SunPower C60 series string, battery connected, motor
load test (specific readings not recorded in this entry — this logs the
diagnostic conclusion, not a fresh set of readings).

**Readings:** Not recorded numerically for this entry — see prior
motor-load entries below for current data up to 3A. This entry captures
a diagnostic conclusion from direct testing, not a new data sweep.

**Observations:**
- **User has directly ruled out the ESC as the cause of the system
  shutting off around ~3A of motor draw.** When it happens, the
  **entire main bus loses power** (not just the motor/ESC), and the
  battery must be **physically disconnected and reconnected** before
  anything powers back on.
- **Root cause: the main battery's BMS protection**, not the ESC or the
  FC. The symptom (whole-bus power loss, requiring a physical
  disconnect/reconnect to reset) is the classic signature of a BMS
  protection circuit latching its output FET(s) off — most likely
  **overcurrent protection**, given it correlates with motor draw level
  rather than a charge state. This is a **different BMS protection**
  from the ~4.2V overvoltage/"topped off" cutoff documented in the
  2026-07-23 entry above — same BMS chip, two separate protections.
  Exact current trip threshold not yet characterized (only known to be
  at or below ~3A of motor draw).
- **This closes the long-running ESC-vs-FC-vs-ground-bounce brownout
  mystery** first flagged in the 2026-07-22 "Brownout troubleshooting"
  entry below. The FC ground-isolation fix (built 2026-07-23) was a
  real improvement and is worth keeping, but it was never the actual
  explanation for these shutdowns — see `CLAUDE.md` §4 and
  `specs/wiring_diagram.md`'s "Negative/return path" section.
- **⚠️ Flight-safety-relevant implication, not just a bench curiosity:**
  since the battery is the dominant power source on Branch C under real
  load, tripping this protection doesn't just reduce thrust — it kills
  power to the **entire aircraft**, including the FC, receiver, and
  servos, until manually reset. A motor demand above ~3A in flight would
  mean total loss of flight control, not a graceful power reduction.
  **This may conflict with the estimated cruise power range** (~17–24W,
  see `calculations/power_budget.md`) — at a ~3.7–4.2V bus, that's
  roughly 4–6.5A of total system current, meaning the motor's share
  alone could plausibly sit at or above the ~3A trip level during
  ordinary cruise, not just at an extreme. Needs real motor-load data
  with voltage logged to confirm whether achievable cruise current
  actually stays under the trip threshold.

**Deviation from prediction:** N/A — diagnostic finding, not a
comparison against a specific numeric prediction.

**Follow-up:**
- Characterize the actual BMS overcurrent trip threshold precisely
  (ramp motor current slowly, in fine increments, right up to the trip
  point, with the trip current logged).
- Check whether the estimated cruise power range is achievable at all
  without tripping this protection — this is now a real viability
  question, not just a characterization exercise.
- Consider whether a different battery/BMS with a higher overcurrent
  threshold is needed, given how directly this constrains usable motor
  power.
- Re-run the planned motor-load test (voltage + current + temperature
  logged at every 0.5A step) with this now-understood failure mode in
  mind — expect and note the exact current at which the bus drops, not
  just "it stopped working."

---

## 2026-07-23 — Bench test: battery-connected, no motor load, before/after camera

**Type:** bench test
**Conditions:** not recorded (sun level, temperature).
**Config:** 7-cell SunPower C60 series string. Both batteries (Main +
FPV) connected. No motor load. Two sub-steps: (1) camera not connected,
(2) camera connected.

**Readings:**

Step 1 — no camera:
- Solar (array) voltage: 4.53V
- Main bus voltage (Branch C, post-diode): 4.25V
- Main battery voltage: 4.26V
- Solar current: 0.65A
- Battery: not visibly contributing — described as "topped off"

Step 2 — camera connected:
- Solar current: 0.8A (up from 0.65A)
- Camera/FPV battery voltage: 4.21V
- Main bus voltage: 4.20V (down from 4.25V)
- Solar (array) voltage: 4.46V (down from 4.53V)

Step 3 — later same session, system now hot, everything connected, still
no motor load:
- Main bus voltage: 4.11V (down from 4.20V in Step 2)
- Solar (array) voltage: 4.43V (down from 4.46V in Step 2)
- No current reading recorded for this step.

**Observations:**
- **System heat measurably reduces array voltage — confirmed, not just
  a suspected factor.** User's own observation: "now that the system is
  hot the array is less effective." Step 3 (hot, everything connected,
  no motor load) reads lower than Step 2 (same config, presumably
  cooler) on both array voltage (4.46V→4.43V, -0.03V) and bus voltage
  (4.20V→4.11V, -0.09V) — consistent with the well-known negative
  temperature coefficient of silicon solar cell voltage (Voc/Vmp drop as
  cell temperature rises). This directly bears on the still-open "Voc
  shortfall vs. theoretical" question below — temperature is now a
  confirmed contributing factor, not just a hypothesized one, though
  still not quantified (no actual temperature reading was logged, just
  "hot").
- **The bus voltage drop (-0.09V) was 3x larger than the array voltage
  drop (-0.03V) between Step 2 and Step 3 — not yet explained.** If only
  the array's own Voc/Vmp shifted with temperature, and current draw
  stayed the same, the bus should have sagged by a similar amount, not
  three times as much. No current was logged for Step 3, so this can't
  be resolved from this data alone — possible explanations, none
  confirmed: current draw was also higher in Step 3 (unrecorded), the
  diode/sensor path's own resistance is temperature-sensitive too, or
  something else entirely. Log current at every step next time to
  settle this.
- **Battery "topped off," not contributing, at 4.26V — refines the
  2026-07-23 BMS-disconnect finding.** Previously documented as "BMS
  disconnects above 4.2V"; this reading (battery sitting at 4.26V,
  matching/exceeding bus voltage, not sourcing or sinking current) is
  consistent with that, but confirms the actual threshold is **variable
  around 4.2V, not razor-precise at exactly 4.20V** (user's own words:
  "BMS cap is variable"). Whether the battery is actually
  BMS-disconnected right now vs. simply at rest with no voltage
  difference to drive current isn't distinguished by this reading alone
  — both would look the same from the outside (no net current).
- **Connecting the camera pulled down both array and bus voltage
  slightly** (array 4.53V→4.46V, bus 4.25V→4.20V) while solar current
  rose (0.65A→0.8A) — consistent with the array being a current source
  whose operating voltage sags as more total current is drawn across
  all branches (Branch B's camera add pulls down the shared array
  voltage upstream of the 3-way split, which also nudges Branch C's
  post-diode voltage down with it). Coherent with the diode-OR
  clamping behavior already documented, not a new phenomenon.
- **Array voltage stayed well clear of the ESC's 5V max** in both
  steps (4.46–4.53V), even with the battery not contributing — a
  reassuring data point for the reopened "ESC 5V max vs. array Voc"
  question in `CLAUDE.md`, though **not conclusive**: this test had no
  motor load, so it doesn't cover the specific scenario flagged there
  (motor idle + battery BMS-disconnected simultaneously).
- **Discrepancy with the documented "~1.5A avionics baseline draw"
  (`CLAUDE.md` §4) — explained 2026-07-23, closed.** That figure comes
  from the 2026-07-21 6-cell baseline entry below, at 3.93V battery
  resting voltage (~73% SOC) — a lower bus voltage than this test's
  7-cell, topped-off-battery condition (4.20–4.25V). The avionics needed
  1.5A at that lower voltage to draw roughly the same power; at this
  test's higher voltage, less current does the same job. Since the
  design is sticking with 7 cells for now, the older 6-cell figure isn't
  the relevant baseline and doesn't need further reconciling — this
  test's ~0.65–0.8A is the current baseline going forward.

**Deviation from prediction:** N/A — this is characterization data, not
a comparison against a specific `calculations/power_budget.md` estimate.
The array voltages here (4.46–4.53V) sit between the previously
measured Voc (4.57V, near-zero current) and the theoretical Vmp
(~4.06V) — consistent with light loading (0.65–0.8A, well under the
array's ~5.9A Imp) keeping the array on the flatter, near-Voc part of
its I-V curve rather than near true Vmp. Still not a Vmp measurement.

**Follow-up:**
- ~~Reconcile the avionics-baseline-draw discrepancy~~ — done, see
  Observations above (explained by the voltage difference between the
  6-cell and 7-cell tests; moot anyway since the design is sticking
  with 7 cells).
- ~~Combine motor load with a topped-off/BMS-disconnected battery for
  the ESC-Voc question~~ — no longer needed: the ESC-Voc question is
  resolved on corrected topology grounds (the ESC sees bus voltage, not
  panel voltage, and motor load only widens that gap) — see `CLAUDE.md`
  and `specs/components.md`, 2026-07-23.
- Confirm whether the battery was actually BMS-disconnected during this
  test or just at voltage equilibrium with the bus — not distinguishable
  from these readings alone (still open, lower priority now).
- **Log actual temperature (not just "hot"/"cool") and current at every
  step in future tests** — Step 3 confirmed heat measurably affects
  array (and possibly bus) voltage, but without a temperature reading or
  a current reading for that step, it can't be quantified or fully
  explained (see the unexplained 3x bus-vs-array voltage drop above).
  The upcoming motor-load test should track temperature at each step,
  not just once at the start, since the array/electronics will likely
  keep heating up as the test progresses — otherwise temperature drift
  and current-driven sag become impossible to tell apart.

---

## 2026-07-22 — Brownout troubleshooting: battery collapse + solar current spikes

**Type:** bench test
**Conditions:** two sub-conditions compared — (1) battery connected,
solar barely supporting (under shade), (2) solar array alone, full sun.
Exact light levels/temperature not recorded.
**Config:** 7-cell SunPower C60 series string. A capacitor (or
capacitors — count not recorded) has **already been added at the ESC**
input, prior to this entry.

**Readings:** Qualitative only — no specific voltage/current numbers
recorded for this entry, just symptom descriptions below.

**Observations:**
- **With battery connected and solar barely supporting (shade):** ESC
  browns out *more* frequently than expected. Hypothesis (user's own,
  not yet independently confirmed): the battery's own terminal voltage
  collapses under current spikes — consistent with a small 1S cell's
  internal resistance (ESR) causing a fast transient voltage sag under a
  sudden current step, faster than the cell's electrochemical response
  can follow. The existing ESC-side capacitor doesn't address this,
  since it buffers the load side, not the battery's own transient
  response or the wiring resistance between battery and ESC.
- **Solar array alone, full sun:** fine at lower currents, but has
  trouble (implied: voltage collapse / instability) at higher current
  spikes. Consistent with the already-documented diode-OR clamping
  behavior (`CLAUDE.md` §4) — the array is a current-limited source at
  its current operating point, and a sudden demand spike beyond what it
  can supply *at that instant* pulls the post-diode node down until
  something buffers it.
- Both symptoms fit the same underlying pattern: **insufficient local
  bulk capacitance at the source (battery, and separately the array/
  diode node) to absorb fast current transients**, distinct from the
  capacitor already added at the ESC (which only helps the load end).
- Possible (unconfirmed) connection to the "overhead current jump"
  flagged in the 2026-07-22 motor-load test entry — if some of that
  extra 0.5A→1.0A jump reflects transient/spike behavior not fully
  captured by the current sensors' response time, these two findings
  may be related. Not established, just worth keeping in mind while
  investigating both.

**Deviation from prediction:** N/A — this is troubleshooting a real
failure mode (brownouts), not a prediction from `calculations/
power_budget.md`.

**Follow-up:**
- Add a capacitor at/near the main battery terminals — see the new
  recommendation in `specs/wiring_diagram.md` and `specs/components.md`.
- Add a capacitor at/near the solar array output (before or at the
  diode input) — same reasoning, see recommendation.
- Re-test after adding both to confirm whether brownout frequency
  actually improves — the real proof is empirical, not this reasoning
  alone.
- Record actual voltage/current numbers next time (with an
  oscilloscope or fast-logging meter if available) — this entry is
  qualitative only, which limits how precisely the fix can be verified.

**Update (2026-07-23):** it's **not actually confirmed whether this is
the ESC or the FC (or both) shutting down** — both shut down together
in these events, and it turns out the FC currently has no independent
ground/negative return: **the only negative path for the FC right now
is through the ESC**, whenever it's connected to battery or solar. That
shared return path means "ESC browns out" above isn't a confirmed
ESC-specific diagnosis — it could be the ESC, the FC, or a ground-bounce
artifact of the shared path itself (a large current pulse through the
ESC's ground segment could shift the FC's ground reference even if the
FC's own 5V supply is otherwise fine). Distinguishing these needs the
negative paths physically separated (an independent FC ground return
direct to the battery/array negative bus, not routed through the ESC)
— see `specs/wiring_diagram.md` and the new open question in
`CLAUDE.md`. Until that's done, read every "ESC browned out" /
"brownout" reference in this file as "the system (ESC and/or FC,
indistinguishable) shut down," not a confirmed ESC-specific failure.

**Update (2026-07-23, later):** the FC ground isolation fix described
above is now **built** — the FC has its own independent ground return,
no longer routed through the ESC — so a *future* re-test of this
brownout scenario can distinguish ESC vs. FC. It doesn't retroactively
explain what happened in this entry, though, and there's now a
**4th possible confound for this entry specifically**: the main
battery's BMS disconnects it automatically above 4.2V (confirmed
2026-07-23), and this entry didn't record battery SOC/voltage at the
start. If the pack was near full charge during this test, the BMS may
have silently dropped it out mid-test, removing its buffering right
when it may have been needed — indistinguishable, after the fact, from
an ESC or FC failure. Log battery SOC/voltage explicitly in the re-test.

---

## 2026-07-22 — Motor-load test, solar-only (no batteries)

**Type:** bench test
**Conditions:** 4:43pm. Partly cloudy — a cloud passed overhead mid-test
(see Observations). Temperature not recorded.
**Config:** 7-cell SunPower C60 series string. **No batteries connected**
(neither main nor FPV) and no camera connected — only the Flight
Controller and ESC/motor, powered directly by the array with no battery
buffer at all. This isolates solar-only behavior under motor load.

**Readings:**

| Motor load | Solar output | Overhead (solar − load) |
|---|---|---|
| none (FC only) | 0.5A | — |
| minimum spin | 0.75A (motor draw, no paired solar reading) | — |
| 1A | 1.5A | 0.5A |
| 1.5A | 2.5A | **1.0A** |
| 2A | 3A | 1.0A |
| *(cloud passed overhead — system browned out / shut down here; ESC vs. FC not yet distinguishable, see 2026-07-23 note above)* | | |
| 2.5A | 3.5A | 1.0A |
| 3A | 4A | 1.0A |

No bus voltage was logged at any step — only currents.

**Observations:**
- The overhead (solar output minus motor load) is a clean 0.5A at the
  lowest point (1A load) but **jumps to a stable 1.0A at every load
  point from 1.5A up** (1.5A, 2A, 2.5A, 3A all show exactly +1.0A). Real-
  time question raised during the test: "why 1A to controller now? Or
  losses?" Two plausible explanations, not distinguished by this data:
  1. **Resistive/diode losses scaling with current** — plausible, though
     the Pololu ideal diodes are typically low forward-voltage-drop
     devices, so this would need to be fairly significant loss to
     account for a full extra 0.5A.
  2. **The array's own I-V curve** — as the bus sags further under
     heavier load, the array's operating point moves further below Vmp
     toward Isc, where a photovoltaic string can supply more raw current
     for comparatively little further voltage drop (the "current
     source" flat region of a solar I-V curve — see
     `specs/datasheets/sunpower_c60.md`). If so, the extra current may
     genuinely be available from the array rather than "lost" — but
     without a voltage reading at each step, this can't be confirmed
     over the loss hypothesis. It's also not confirmed where the extra
     current actually goes (FC draw increasing with something? Genuinely
     just heat?).
  - Can't be resolved from this data alone — needs bus voltage logged
    alongside current at each step next time.
- **The system cannot ride through a passing cloud without battery
  buffering.** With no batteries connected, a brief shading event
  dropped solar output enough to brown out the system mid-test (motor
  stopped, and the FC likely reset or lost power too — see the
  2026-07-23 update on the entry above: the ESC and FC currently share
  a single ground/return path, so this can't yet be attributed to one
  device specifically). This is expected
  given the test intentionally removed all battery buffering to isolate
  solar-only behavior — it validates why the actual flight
  configuration keeps the Main Battery on Branch C rather than running
  solar-only. Not yet tested: whether battery buffering (as in the real
  flight config) actually prevents this failure mode — see Follow-up.
- This is the first real motor-load current data for the 7-cell string,
  addressing part of the open question pending since ADR 0001 — but it's
  fixed load points, not a true Vmp/max-power sweep, and without voltage
  readings it can't be compared directly against
  `calculations/power_budget.md`'s Watt-based predictions.

**Deviation from prediction:** Can't quantify directly — no voltage was
recorded, so the current readings above can't be converted to Watts for
comparison against `calculations/power_budget.md`'s ~24W theoretical
ceiling. The overhead jump (0.5A → 1.0A) itself wasn't predicted by
anything in that file.

**Follow-up:**
- Repeat with bus voltage logged at each current step, to distinguish
  the "losses" vs. "I-V curve" explanations for the overhead jump.
- Repeat with batteries connected (the actual flight configuration) to
  see whether battery buffering prevents the cloud-brownout failure mode
  seen here.
- **Rewire the FC's ground return to be independent of the ESC before
  the next brownout re-test** (see 2026-07-23 update above) — otherwise
  a re-test still can't tell whether a fix (e.g. the recommended
  capacitors) actually helped the ESC, the FC, or just reduced
  ground-bounce on the shared path.
- ~~Determine the true max motor/current draw — this test stopped at
  3A; unclear if that's a real ceiling.~~ **Answered 2026-07-23: it is a
  real ceiling, but not an ESC/motor limit — it's the battery BMS's
  overcurrent protection tripping** (see the 2026-07-23 root-cause entry
  above). Precise trip threshold still not characterized.
- Note which current sensor was read for "solar output" at each step
  (the array-total 5A sensor vs. a branch-specific 2A meter) in future
  entries, for consistency — not specified in this one.

---

## 2026-07-22 — 7-cell string bench measurement (branches B & C)

**Type:** bench test
**Conditions:** (fill in — sun condition/time not recorded in original
conversation)
**Config:** 7-cell SunPower C60 series string (added 7th cell per ADR
0001). Main battery starting voltage 3.64V, FPV/video battery starting
voltage 3.66V.

**Readings:**
- Solar array voltage, open circuit (no load): 4.57V
- Solar array voltage, main + FPV battery connected (Branches B & C, no
  camera/ESC/FC yet): 4.41V (sags 0.16V under this load)
- FPV/video battery charge current (Branch B, battery only): ~0.5A
- Main battery charge current (Branch C, battery only): ~0.8A
- Branch B total draw with camera added (camera + FPV battery together):
  ~0.5A — unchanged from battery-alone figure
- Main battery charge current with ESC + FC added to Branch C: ~0.2A
  (down from ~0.8A battery-alone — ESC/FC now consuming the rest of
  Branch C's ~0.8A)
- Motor draw: not yet tested (planned next)

**Observations:**
- Measured Voc (4.57V) is notably below the theoretical 7-cell Voc
  (~5.0–5.1V per `specs/datasheets/sunpower_c60.md`, 7× the ~0.72–0.73V/
  cell datasheet figure) — about 9–11% low. Per-cell implied Voc from
  this measurement is ~0.65V vs. the ~0.72–0.73V datasheet figure.
  Possible causes not yet investigated: cell tolerance, temperature, or
  (given this is a bench test, possibly indoors) lower illumination than
  the datasheet's test conditions — Voc drops measurably under reduced
  light for photovoltaic cells. Conditions weren't recorded for this
  entry — worth noting indoor/outdoor and light level in future entries
  to help isolate this.
- Array voltage sag under load (4.57V → 4.41V, ~3.5%) is much smaller
  than the 6-cell baseline's collapse toward bus voltage (see the
  2026-07-21 entry below) — encouraging for the diode-OR clamping fix
  (ADR 0001), though not yet a full confirmation: this wasn't a true Vmp
  measurement (that needs the array's actual max-power operating point,
  not just voltage under one load), and the motor hasn't been tested yet.
- Both Branch B (~0.5A) and Branch C (~0.8A) appear to deliver a roughly
  fixed total current regardless of downstream load composition — e.g.
  Branch C split ~0.6A to ESC/FC and ~0.2A to battery charging once
  ESC/FC were added, rather than the total draw increasing. Consistent
  with each branch being current-limited by its diode/array path, but
  this is an observation from 2 data points per branch, not confirmed.

**Deviation from prediction:** Voc measured ~9–11% below the calculated
7-cell theoretical value. Load sag is much smaller than the 6-cell
baseline (good sign), but this isn't the same measurement as a true Vmp
determination — don't treat the clamping problem as resolved yet.

**Follow-up:** Run the motor-load test (already planned) to get max
current draw and see whether Branch C can sustain useful charging under
real flight-representative load. Investigate the Voc shortfall — repeat
with recorded test conditions (indoor/outdoor, light level) to help
isolate cause. Consider whether the per-cell Voc estimate in
`specs/datasheets/sunpower_c60.md` needs a caveat for non-ideal
conditions.

---

## 2026-07-21 — Baseline 6-cell string measurement

**Type:** bench test
**Conditions:** (fill in — sun condition/time not recorded in original
conversation)
**Config:** 6-cell SunPower C60 series string, 1S 2600mAh main battery

**Readings:**
- Solar array current: 2.5A (into diode-OR node)
- Battery current under full motor load: 1.5A (battery still contributing
  despite solar input)
- Avionics-only draw (no motor): 1.5A, mostly supplied by battery, not solar
- Battery resting voltage: 3.93V (~73% SOC per battery_soc.py)

**Observations:** Solar contribution far below theoretical (~6A Imp) even
under no-load conditions. Root-caused to diode-OR voltage clamping — see
`decisions/0001-cell-series-count.md`.

**Deviation from prediction:** Significant — expected solar to comfortably
cover avionics draw with surplus to charge battery; instead battery covered
most of avionics load even at rest.

**Follow-up:** Add 7th cell in series (ADR 0001), re-measure under identical
bench conditions before re-testing in flight.
