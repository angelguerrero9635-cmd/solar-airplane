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
| *(cloud passed overhead — ESC browned out / shut down here)* | | |
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
  dropped solar output enough to brown out the ESC mid-test (motor
  stopped, presumably FC reset or lost power too). This is expected
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
