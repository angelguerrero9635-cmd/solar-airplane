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
- Determine the true max motor/current draw — this test stopped at 3A;
  unclear if that's a real ceiling (ESC/motor limit) or just where
  testing stopped.
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
