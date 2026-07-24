# Wiring Diagram — Block/System Level

Last updated: 2026-07-24

> ⚠️ **Major revision (2026-07-24):** Branch A (the planned solar+battery
> ideal-diode-pair OR-ing tap for VBAT) has been **eliminated entirely**.
> VBAT now wires directly to the **ESC's red (power) pin** — i.e.,
> Branch C's bus — instead. See "In-flight vs. bench-test
> instrumentation" below for the reasoning and what this means for the
> one available in-flight reading.

> This is a **block-level power and signal diagram**, built from the
> documented component list plus the diode/branch topology below, which
> was confirmed directly. Where interconnections still aren't confirmed,
> they're marked TBD rather than guessed.

> ⚠️ **Correction (2026-07-22):** an earlier version of this diagram
> assumed the 3 ideal-diode outputs rejoined at one shared battery-bus
> node. That was wrong — confirmed directly that each of the 3 diodes'
> outputs goes to a **different destination** (see the 3 branches below).
> Only Branch A's diode input and Branch B/C's diode inputs share the
> solar array; nothing downstream of the diodes is shared between
> branches.

## Main power & signal path

The solar array feeds 2 independent ideal-diode branches (Branch A no
longer exists — see the 2026-07-24 revision note above). Both diodes
share the same input (the solar array); their outputs are **not**
rejoined — each branch powers something different.

![Wiring diagram — solar array splits into 2 branches (FPV rail, main
battery bus), which converge again only at the shared flight controller
box. The flight controller's VBAT pin wires directly to the ESC's red
power pin on Branch C, instead of a separate diode-OR tap. Every
positive and negative/return line is drawn in full, routed to avoid
crossing component boxes, with a small hump wherever two lines must
cross without connecting (e.g. the VBAT tap over the 5V regulator's
power line). All ground legs — Solar Array, FPV Camera/VTX, FPV
Battery, ESC, Main Battery, 5V Regulator, and the FC's own independent
ground (star ground) — run into one wide negative return bus at the
bottom.](wiring_diagram.svg)

Text version of the same diagram, for diffing/searching:

```
Solar Array — 7x SunPower C60 (series), Voc≈5.0V Vmp≈4.06V
  -> 5A Current Sensor (measures total array output, before the 2-way
     split below)
  -> splits into 2 independent branches:

BRANCH B — FPV rail
  Ideal Diode Module #1 (Pololu Ideal Diode Module)
    -> 2A Current Meter
         -> FPV Camera/VTX — AKK BA3 AIO Analog Cam + VTX     -- parallel
         -> FPV Battery — 1S 400 mAh LiPo                      -- parallel

BRANCH C — main battery bus
  Ideal Diode Module #2 (Pololu Ideal Diode Module)
    -> 2A Current Meter
         -> Main Battery — 18650 Li-ion, 2600 mAh, 1S               -- parallel
         -> 5A Current Sensor -> ESC -> Motor (T-Motor M1104 KV7500,
            6x3 prop)                                                -- parallel
              -> ESC red (power) pin -> Flight Controller VBAT pin
                 (NEW, 2026-07-24 — replaces the old Branch A
                 diode-OR tap; see "In-flight vs. bench-test
                 instrumentation" below)
         -> 5V Regulator (Pololu S7V7F5) -> Flight Controller, via the
            servo rail                                                -- parallel
              -> GPS — BN-880
              -> Receiver — Happymodel EP1 ELRS
              -> Telemetry Radio — 915 MHz
              -> Servos x4 — DM-S0020 micro
```

Note: Branch B's FPV rail is fed from solar (via Branch B's diode +
2A current meter) — it is **not** fully isolated from solar power the way
earlier documentation implied. It remains electrically separate from
Branch C's main battery bus, though — the two branches never rejoin.

Note (2026-07-22): the ESC (E-Power BE001) has **no built-in BEC** — its
own spec sheet says the receiver/servo rail is meant to be powered
directly from the battery, not from the ESC. This is exactly why this
build has a separate 5V Regulator on Branch C to power the FC via the
servo rail, rather than relying on ESC-supplied power — see
`specs/components.md`.

## Negative/return path

Everything above describes the positive-side branch topology. The
negative/ground return side had a real, confirmed problem as of
2026-07-23: **the FC's only negative/return path was *through* the
ESC** — no independent ground wire ran from the FC directly to the
battery/array negative bus, whenever the FC was powered via battery or
solar (i.e., essentially always).

**Why this mattered:** the ongoing "ESC brownout" troubleshooting (see
`logs/test_flights.md`) had observed the ESC and FC shutting down
*together*, and it was genuinely unclear whether that was (a) the ESC
failing, (b) the FC failing, or (c) a **ground-bounce artifact of the
shared return path** — a large current pulse through the ESC's ground
segment has some resistance/inductance, and if that segment sat
between the FC's ground reference and the true system ground (battery/
array negative), the FC's ground reference would shift during that
pulse even if the FC's own 5V supply (from the Branch C regulator) was
otherwise fine. That alone could look exactly like a brownout to the
FC, independent of whatever was actually happening to the ESC.

**Fix confirmed built, 2026-07-23:** an independent ground wire now
runs from the FC directly to the battery/array negative bus (a proper
star-ground point), rather than routing the FC's return current through
the ESC's ground path. A real improvement in its own right, and it
resolved the *mechanism* that made ESC vs. FC brownout attribution
ambiguous — but it turned out **neither** the ESC nor the FC was
actually the cause. Direct testing since has ruled out the ESC: the
shutdown around ~3A motor draw takes the entire bus down and needs the
battery physically disconnected/reconnected to recover — the signature
of the battery's own BMS protection latching off, not a device failure.
Two follow-up battery-only load tests at different starting voltages
(4.01V and 3.88V, both ~0.3Ω combined resistance) tripped at
essentially the same **current** (~2.9–3A) rather than the same
voltage — pointing to a genuine **overcurrent protection**, largely
independent of SOC, rather than the undervoltage hypothesis first
proposed. See `CLAUDE.md` §4 and `logs/test_flights.md` for the full
finding.

**Also confirmed built, 2026-07-23:** the capacitor at the 5V
Regulator's VIN (see `specs/components.md`'s capacitor priority list,
item 1 of 4) — the first of the recommended capacitors to be
installed.

**Diagram note:** `wiring_diagram.svg` depicts the negative-path
topology (see its legend) — gray solid = confirmed normal ground (ESC,
Main Battery, 5V Regulator, and the FC too, each routed to a "NEGATIVE
RETURN BUS" element).

**Updated 2026-07-24 — the Ideal Diode Modules have negative pins too:**
earlier versions of this diagram (and an earlier version of this note)
treated ground as a simple plane that the diode modules sat on top of,
with the Solar Array's and Branch B's negative legs shown only as a
short label rather than a fully-routed line. That undersold the real
hardware: the Pololu Ideal Diode Module has **separate IN− and OUT−
pins** on the input and output sides — it is not a two-terminal part
with a shared/pass-through ground. The negative return has to go
*through* each module's own IN−/OUT− pair, the same way the positive
side already does, not around it.

The diagram now routes this explicitly: the Solar Array's negative
terminal feeds a distribution line that reaches **both** diode
modules' IN− pins (Branch B's Ideal Diode Module #1 and Branch C's
Ideal Diode Module #2), since both share the same solar input. Each
module's OUT− pin then continues downstream on its own branch — Branch
C's OUT− joins the ESC/Main Battery/5V Regulator ground lane on its way
to the negative return bus. The distribution line crosses the Branch
B/C split's positive line once (both are needed at that point, at
different heights) — the diagram marks that with a hump per the
legend, since it's a crossing, not a connection.

> ⚠️ **Correction (2026-07-24):** the sentence above previously said
> Branch B's OUT− "converges with the FPV Camera/VTX and FPV Battery
> grounds before reaching the negative return bus." **That's wrong —
> confirmed directly:** the FPV Camera/VTX and FPV Battery grounds tie
> to Ideal Diode Module #1's OUT− pin (forming one local loop: Diode
> #1 OUT− + Camera + Battery), but **that loop is not connected to the
> Negative Return Bus at all.** Branch B's ground is fully isolated
> from Branch C's — not just the positive side (already known — the
> two branches' positive paths never rejoin), but the *return* side
> too. `wiring_diagram.svg` now draws Branch B's ground lane ending in
> an open circle rather than an arrow into the bus, to make this
> explicit (see the updated legend).
>
> **Implication, not yet resolved:** since Branch B's only ground
> reference is the Solar Array's negative terminal (via Diode #1's
> IN−, shared with Diode #2), and that never ties to the main
> battery/ESC/FC ground plane, the FPV rail's ground floats relative to
> the rest of the aircraft whenever the solar array isn't the thing
> powering it (e.g. on battery-only bench tests with the array
> disconnected, or if Diode #1 is reverse-biased and not conducting).
> Whether this is deliberate (FPV video ground isolation from
> motor/ESC switching noise is a common and often desirable practice)
> or a wiring gap that should be closed is an open question — see
> `CLAUDE.md` §5.

## In-flight vs. bench-test instrumentation

None of the current-sensing devices shown in this diagram are used in
flight, or fly at all — every one of them is **bench-test-only** gear,
confirmed 2026-07-23. Two generations of this gear exist:

- **Retired (2026-07-22), not used at all anymore:** the original 3
  SparkFun ACS723 breakouts. Removed from the weight totals entirely —
  see `specs/components.md` and `calculations/power_budget.py`.
- **Current bench-only set, still shown in this diagram for now:** the
  4 devices depicted above (2× 5A current sensor, 2× 2A current meter).
  None of these are physically present at takeoff and none need to be
  weighed for flight-configuration purposes, but they're kept in this
  diagram since bench testing is still ongoing.

Separately, the ATOMRC F405 NAVI flight controller has no free ADC
channels beyond the one wired to VBAT — none of these current readings
could be logged or telemetered in flight even if they did fly. They're
only readable on the ground (e.g. by eye, or with an external logger),
during bench testing.

**In flight, only one voltage reading is available at all** — VBAT.
**Changed 2026-07-24: Branch A (the planned solar+battery diode-OR tap)
has been eliminated entirely.** VBAT now wires directly to the **ESC's
red (power) pin** — i.e., Branch C's main bus — instead of through a
dedicated diode pair. Rationale: Branch C's bus is exactly the voltage
the ESC, motor, and 5V Regulator actually experience, including sag
under motor load — and that's precisely the metric the recent
battery-BMS/overcurrent investigation (see `CLAUDE.md` §4–5 and
`logs/test_flights.md`) has been characterizing as flight-safety
relevant. A dedicated OR-ing tap would have given a more abstract
"whichever source is higher" reading; direct bus voltage is the more
useful one to actually monitor in flight, close to real time, against
the OCP trip point and the 5V regulator's own input floor.

In practice this still behaves similarly to what the OR-ing tap would
have given: Branch C's existing topology already blends solar (via its
own diode) and battery (direct parallel connection) at that same bus
node, so the reading isn't purely "battery-only" — it reflects
whichever effectively dominates the bus at the time, same as before,
just without a second, dedicated diode pair to achieve it.

This also **removes the diode that was previously in the VBAT sense
path** — a direct wire has no diode-drop error, which is a small
accuracy win given how tight the margins under discussion are (e.g.
the ~0.06V gap noted between one test's bus reading and the 5V
regulator's input minimum). The voltage sensor feeding VBAT **has been
calibrated** (confirmed 2026-07-23) and that calibration should still
hold, since it was calibrated against Branch C's own voltage range
already.

**Planned (2026-07-24, not yet implemented):** a low-voltage alarm/
limit on this VBAT reading, since it's now a direct real-time read of
the bus voltage the battery-BMS/overcurrent investigation has been
characterizing. ~3.0V is proposed as the lower limit — above the 5V
regulator's 2.7V minimum input and above where the battery-only tests
actually failed (last good readings 2.96V and 2.76V) — see `CLAUDE.md`
§5's high-priority item for the full reasoning.

## Recommended physical wiring (proposed — not yet built)

> ⚠️ This section is a **recommendation**, not a description of what's
> actually built. Nothing below is confirmed — it's what to use if/when
> the physical wiring is done. Biased toward bare-wire solder joints over
> connectors wherever disconnect/modularity isn't essential, since every
> connector adds weight and a resistance joint (relevant given the
> existing diode-OR voltage clamping problem — see `CLAUDE.md` §4).

**Wire gauge**, by current level (none of these legs should exceed
~5–6A even at theoretical peak):

- **26 AWG silicone wire** — signal/low-current legs: the ESC-red-pin
  →VBAT tap, FPV camera/VTX pigtail, GPS/receiver/telemetry UART leads,
  servo signal wires.
- **24 AWG silicone wire** — higher-current legs: solar array output
  before the 2-way split, Branch C's main battery/ESC leg.
- Silicone (not PVC) insulation throughout — stays flexible at thin
  gauges, standard for this build class.

**Connectors, by branch:**

- **Solar array → both diode inputs:** direct solder, no connector.
  Permanent assembly; a connector here only adds weight and resistance.
- **VBAT tap (2026-07-24, replaces the old Branch A diode-OR):** solder
  directly from the ESC's red (power) pin to the FC's VBAT+ pad, and
  the FC's VBAT- to the same negative bus everything else references.
  26 AWG is plenty — this is a sense tap (negligible current draw from
  the FC's ADC), not a power leg, even though it's wired straight to
  the main bus.
- **Branch B (FPV rail):** match whatever connector the FPV battery
  already ships with (PH2.0/JST-PH 2-pin is standard on 1S ~400mAh
  packs) rather than introducing a different connector family on the
  diode/meter side. Camera/VTX: direct solder pigtail, standard for AIO
  cams.
- **Branch C (main bus):** match whatever connector the main 18650 pack
  uses (often none — solder directly if the pack ships connector-less).
  5V regulator output → FC servo rail: use a spare **servo header pin**
  (2.54mm pitch, 3-pin) for +5V/GND — don't introduce a new connector
  type just for this. **ESC connectors are fixed by the actual unit, not
  a recommendation** — the E-Power BE001 ships pre-wired with a 2P
  battery plug (51005) or 1.25mm-pitch 2P battery plug (unclear which
  this unit uses) on the power side, and a 1.00mm-pitch 3P servo plug on
  the signal side. Match whichever battery-side plug this unit actually
  has rather than re-terminating it.
- **GPS/Receiver/Telemetry → FC:** if not already pigtailed from the
  factory, **JST-SH 1.0mm ("GH1.25"-style)** is the common convention for
  UART peripherals in this size class.
- **Bench-test current sensors:** since these are temporary by design
  (see "In-flight vs. bench-test instrumentation" above), don't build
  permanent connectors for them — clip leads or an undoable in-line
  solder joint is appropriate.

**Bulk capacitors** (added 2026-07-22, after bench troubleshooting
brownouts — see `logs/test_flights.md`):

- **At the ESC input** — already built, confirmed reality, not a
  recommendation. Buffers the load side.
- **At the main battery terminals — recommended, not yet built.**
  Addresses the battery's own voltage collapse under current spikes
  (ESR-limited transient response), which the ESC-side cap doesn't
  reach. Low-ESR electrolytic or polymer, ~220–470µF, placed as close to
  the terminals as practical.
- **At the solar array output, before/at the diode split —
  recommended, not yet built.** Addresses the array struggling with
  current spikes even in full sun, consistent with the diode-OR
  clamping behavior. Same type/value guidance as above.
- **At the 5V Regulator (Pololu S7V7F5) VIN — confirmed installed,
  2026-07-23.** Pololu's own datasheet for the S7V7F5 calls for a
  ≥33µF electrolytic (≥16V) at VIN for regulator stability — this is
  now built, using the on-hand RLTZ 680µF/16V candidate part. Still
  open: whether to also add one at the **output** (servo rail) —
  separate reasoning (regulators generally need local output
  capacitance for load-transient response, and servo current draw
  comes in bursts, a well-known brownout cause; the consequence is
  worse here since this same rail also powers the FC). Not yet decided
  or built — see `specs/components.md`.
- Avoid tantalum for any of these — reverse-voltage risk given this
  diode topology.
- **Candidate part confirmed 2026-07-22:** user has RLTZ series DIP
  solid-state (polymer) capacitors on hand — 680µF, 16V, ESR 15mΩ, 4.1A
  rms ripple rating, 8×12mm. Good fit for all locations above
  (~3.1–3.8x voltage margin at each, low ESR matches the transient-
  response need). Polarized — verify correct polarity when installing
  at each location. Not yet installed anywhere.
- **Recommended install priority (2026-07-23), 4 locations total:**
  (1) 5V Regulator VIN — Pololu's own datasheet spec, closer to
  required-for-stability than optional; (2) main battery terminals —
  fixes an already-measured brownout; (3) solar array output — fixes a
  separately-measured brownout (transient response, distinct from the
  7-cell fix's steady-state clamping fix); (4) 5V Regulator output
  (servo rail) — good practice, but no specific measured failure there
  yet. The on-hand RLTZ part covers all four with margin — no sourcing
  decision, just install order. Weigh the actual parts before assuming
  they don't affect the ~5.8g remaining 250g headroom — no sourced
  weight found for this specific part yet.

## Known unknowns / TBD

- ~~**ESC vs. FC brownout attribution.**~~ **Resolved 2026-07-23 —
  neither.** User has directly ruled out the ESC: the shutdown around
  ~3A motor draw takes down the *entire* main bus, and requires
  physically disconnecting/reconnecting the battery to restore power —
  the signature of the battery's own BMS protection latching off (most
  likely overcurrent protection), not a device failure. The FC ground
  isolation fix above was a real improvement in its own right, but
  wasn't the actual explanation for this failure mode. See
  `CLAUDE.md` §4 and `logs/test_flights.md`.
- ~~**Branch A's OR-ing plan is decided in concept, not yet physically
  built.**~~ **Superseded 2026-07-24 — Branch A eliminated entirely,**
  not built as previously planned. VBAT now wires directly to the
  ESC's red pin (Branch C's bus) instead — see "In-flight vs.
  bench-test instrumentation" above. Simpler (no dedicated diode pair,
  no second input wire to run) and gives a more directly useful
  reading for the flight-safety questions currently under
  investigation (bus voltage vs. the battery's OCP trip and the 5V
  regulator's input floor).
- **Branch A power vs. sense (2026-07-23 finding) — still applies to
  the new wiring, not invalidated by the topology change.** Bench
  testing found that connecting voltage to VBAT powers on part of the
  flight controller, not just the sense ADC. VBAT is now wired directly
  to Branch C's bus (the same node the ESC and 5V Regulator use), so
  this remains true — if anything, more directly so, since there's no
  longer a diode between VBAT and that bus. VBAT still does **not**
  power the servo rail — that stays dependent on the separate external
  5V Regulator on Branch C, as already documented above.
- ~~Current-sensor count/type doesn't reconcile with
  `specs/components.md`.~~ **Resolved 2026-07-23:** the original 3
  SparkFun ACS723 breakouts are retired, not used at all anymore. The 4
  distinct current-sensing devices this doc describes (2× 5A sensor, 2×
  2A current meter) are a separate, current bench-only setup — not the
  same hardware as the retired ACS723s, and not a count/rating
  discrepancy to reconcile.
- ~~5V Regulator is still unweighed.~~ **Resolved 2026-07-23** —
  identified as a Pololu S7V7F5 (5V Step-Up/Step-Down Voltage
  Regulator), 0.6g mfr. spec, now in `specs/components.md`'s weight
  table and the AUW estimate. Its buck-**boost** topology (input
  2.7–11.8V) is why it can hold a 5V output even on Branch C's sub-5V
  bus, where a buck-only regulator's output would collapse.
- **Recommended battery/array/regulator capacitors not yet built or
  validated (2026-07-22).** The reasoning is sound (ESR/transient
  response for the battery and array; standard regulator design
  practice for the 5V regulator's servo-rail output), but whether they
  actually fix the observed brownouts hasn't been tested — see
  `logs/test_flights.md`'s follow-up.
- **ESC battery-plug variant unconfirmed.** The E-Power BE001 ships with
  either a 2P plug (51005) or a 1.25mm-pitch 2P plug on the battery
  side, per its own product images — which one this specific unit has
  isn't confirmed. Minor, but matters for matching connectors elsewhere
  on Branch C.
- **Physical wiring (gauge/connectors) is only a recommendation so far,
  not a confirmed build.** See "Recommended physical wiring" above —
  it's proposed, pending your decision to actually build it that way.
  No physical routing (how wires are run through the airframe) is
  captured here regardless.

## Source

The branch topology (originally 3 independent diode branches, reduced
to 2 as of 2026-07-24 with Branch A's elimination; their specific
destinations, the 5V regulator, and the current-sensor placements) was
confirmed directly. Everything else is derived from the component list
already in `specs/components.md`. The physical-wiring recommendation is
exactly that — a recommendation, not a confirmed build. The visual
diagram (`wiring_diagram.svg`) is a hand-drawn rendering of the same
topology described in the text version above; update both together if
the topology changes, same as everything else in `specs/`.

**Diagram conventions (updated 2026-07-24):** every positive and
negative/return line is drawn in full — including the Solar Array's and
Branch B's (FPV Camera/VTX, FPV Battery) ground legs, previously
simplified to a short label. Lines are routed to avoid passing through
any component box. Where two lines must cross without connecting (e.g.
the VBAT tap crossing the 5V regulator's power line), a small semicircular
**hump** marks the crossing — see the diagram's own legend. Positive/
signal paths are solid cyan; ground/return paths are solid gray, both
routed into the single wide "NEGATIVE RETURN BUS" bar at the bottom for
the return side.
