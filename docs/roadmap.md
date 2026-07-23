# Roadmap: Prototype → Production

Update the **Current phase** marker in `CLAUDE.md` as this progresses.

## Phase 1 — Prototyping (current)

Goal: prove the core concept (solar-extended flight) works and is
understood well enough to explain and reproduce.

- [x] Baseline airframe built and weighed component-by-component
- [x] Initial 6-cell solar string wired and bench-tested
- [ ] Diagnose and resolve solar/battery voltage-matching issue (ADR 0001)
- [ ] Confirm real AUW on a scale (replace estimate in power_budget.md)
- [ ] Confirm cruise power draw via bench test at cruise throttle
- [ ] First flight with current-sensor logging
- [ ] Validate predicted vs. actual solar contribution across a full sunny
      day (multiple log entries in `logs/test_flights.md`)

**Exit criteria:** power budget model (calculations/) matches measured
in-flight data within a reasonable margin, and the design reliably extends
flight time versus battery-only baseline.

## Phase 2 — Design iteration

Goal: move from "it works once" to a repeatable, documented design.

- [x] ~~Decide MPPT vs. static series-matching as the long-term charging
      architecture.~~ **Resolved 2026-07-23 — static series-matching,
      no MPPT/buck stage.** See `decisions/0001-cell-series-count.md`'s
      2026-07-23 update and `CLAUDE.md` §5.
- [ ] Coulomb-counting SOC implementation using current-sensing hardware
      (replace/augment voltage-lookup SOC). **⚠️ Needs reconciling before
      this is actionable** (flagging, not resolving): the ACS723 sensors
      this item originally referenced are retired/not used at all
      anymore (`CLAUDE.md` §5, 2026-07-22), and none of the current
      bench-only current sensors (2× 5A, 2× 2A) can be logged in flight
      — the FC has no free ADC channel beyond VBAT (`CLAUDE.md` §4). A
      coulomb-counting SOC implementation would need either a different
      FC/logger with a spare current-sense ADC input, or a different
      approach entirely — worth deciding before treating this item as
      just "implement it."
- [ ] Structural pass: confirm carbon spar/fuselage sizing is appropriate,
      not just "it hasn't broken yet"
- [ ] Formalize a bill of materials with costs, not just weights
      (specs/components.md currently tracks weight/specs only)
- [ ] Multiple build iterations logged as dated entries, with ADRs for any
      architecture-level changes (motor, cell count/type, battery chemistry)

**Exit criteria:** a second unit could be built from the repo's docs alone,
by someone other than the original builder, and perform comparably.

## Phase 3 — Pre-production

Goal: de-risk anything that doesn't scale from "one prototype" to "multiple
units."

- [ ] Sourcing check: are all components (esp. SunPower C60 cells, which show
      signs of limited/changing availability from some vendors) reliably
      available at volume, or is a substitute needed?
- [ ] Cost analysis at small-batch volume (10s of units) vs. one-off
      prototype cost
- [ ] Basic reliability/durability testing beyond a handful of flights
- [ ] Regulatory check-in (FAA Part 107 / relevant hobby-class rules,
      especially if this is ever sold as a kit vs. flown personally)
- [ ] Decide production model: kit vs. fully assembled vs. plans/open design

**Exit criteria:** a clear go/no-go decision on whether and how to bring
this to market, backed by real cost and sourcing data rather than estimates.

## Phase 4 — Market introduction

Goal: only entered if Phase 3 supports it.

- [ ] Finalize BOM and assembly documentation for external builders/buyers
- [ ] Manufacturing/kitting plan
- [ ] Positioning: hobbyist kit, educational product, or something else —
      revisit this once real performance data exists, since the honest
      capability ("extends flight" vs. "flies all day") should drive the
      framing, not the other way around

---

**Note:** this roadmap is intentionally conservative about advancing phases.
Each phase's exit criteria should be met with real measured data logged in
this repo (`logs/`, `calculations/`), not estimates or single successful
trials.
