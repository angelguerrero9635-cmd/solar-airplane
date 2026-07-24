"""
Power budget & wing loading calculator for the solar glider project.

Run this whenever a component or geometry value changes, and update
calculations/power_budget.md with the new output rather than letting the
markdown fall out of sync.

Usage:
    python3 power_budget.py
"""

# --- Airframe geometry -------------------------------------------------
# Clark-Y airfoil, updated 2026-07-22 (was SD7037, 1.21m x 0.15m).
WINGSPAN_M = 1.20
CHORD_M = 0.20
WING_AREA_M2 = WINGSPAN_M * CHORD_M  # simple rectangular approximation

# --- Mass ----------------------------------------------------------------
# Sum of known/weighed components (grams). Update from specs/components.md.
KNOWN_COMPONENTS_G = {
    "motor": 5.61,
    "propeller": 14.52,
    "esc": 5.07,
    "flight_controller": 10.79,
    "gps": 13.23,
    "receiver": 1.50,
    "telemetry_radio": 16.14,
    "fpv_cam_vtx": 4.73,
    "main_battery": 47.1,
    "fpv_battery": 11.2,
    "solar_cells": 98.0,  # 7 cells x 14 g/cell (see decisions/0001-cell-series-count.md)
    "servos": 13.0,
    "ideal_diode_modules": 0.27 * 2,
    "capacitor": 0.7,
    "regulator_5v": 0.6,  # Pololu S7V7F5 step-up/step-down, mfr. spec, no header pins
}
# Branch A (the planned solar+battery ideal-diode-pair OR-ing tap for VBAT)
# is eliminated as of 2026-07-24 - VBAT now wires directly to the ESC's
# red (power) pin, i.e. Branch C's bus, instead. The Ideal Diode Pair
# (1.46g) is removed from the build entirely, not just unused - see
# specs/wiring_diagram.md.
# The original 3 SparkFun ACS723 breakouts (1.27g each, 3.81g total) are
# retired as of 2026-07-22 - not used at all anymore, replaced by a
# different 4-sensor bench-only setup (2x 5A sensor, 2x 2A current meter -
# see specs/wiring_diagram.md). None of these current-sensing devices fly,
# so none belong in KNOWN_COMPONENTS_G at all.

# Components physically removed before flight (see
# specs/wiring_diagram.md's "In-flight vs. bench-test instrumentation") -
# excluded from flight-configuration weight, since the FAA's 250g rule is
# takeoff weight: everything attached at the moment of flight. Currently
# empty: the only past bench-only entry (current_sensors) was removed
# from KNOWN_COMPONENTS_G entirely rather than kept and excluded, since
# it's retired, not just non-flying. Kept as a mechanism for any future
# component that's weighed but never flown.
BENCH_ONLY_COMPONENTS = set()

# Estimate for airframe structure not individually weighed yet.
# Replace with a real scale measurement ASAP.
ESTIMATED_UNLISTED_G = 100.0  # midpoint of 90-110g estimate

# 2026-07-22: hard design goal, not just a nice-to-have - see CLAUDE.md
# Section 1. US FAA recreational registration exemption for aircraft
# under this takeoff weight.
WEIGHT_TARGET_G = 250.0

# --- Cruise power assumptions -------------------------------------------
W_PER_KG_LOW = 50   # light glider, some parasitic drag from payload
W_PER_KG_HIGH = 70

# --- Solar array (SunPower C60) ------------------------------------------
CELL_VOC = 0.72
CELL_VMP = 0.58
CELL_IMP = 5.9  # amps, per string (series doesn't change current)
N_CELLS_SERIES = 7  # update as the string is modified; see decisions/0001-cell-series-count.md

# --- Wing mass vs. span sensitivity (chord fixed) -------------------------
# 2026-07-22: estimate, NOT measured. Models foam-wing-only mass so wing
# loading can be recomputed for candidate spans without holding AUW
# artificially constant (that was a real error in an earlier chat-only
# version of this analysis - see calculations/power_budget.md).
#
# Sources: EPP foam density 20-30 kg/m^3 is typical for RC use (lighter end
# preferred, since it directly lowers wing loading - same priority as this
# project). Clark-Y thickness ratio (11.7% of chord) is a well-established
# figure. AIRFOIL_AREA_COEFFICIENT is a standard engineering rule-of-thumb
# for airfoil cross-section area (~0.7 x t_max x chord) - NOT a Clark-Y-
# specific figure, treat as approximate.
AIRFOIL_THICKNESS_RATIO = 0.117
AIRFOIL_AREA_COEFFICIENT = 0.7
FOAM_DENSITY_KG_M3_LOW = 20
FOAM_DENSITY_KG_M3_HIGH = 30


def wing_foam_mass_g(span_m, chord_m, density_kg_m3):
    """Estimated foam-only wing mass (g), assuming a solid foam core with a
    constant airfoil section along the span (untapered). Does NOT include
    spars, fuselage, mount, wiring, or adhesives - see non_wing_mass_g()."""
    t_max_m = AIRFOIL_THICKNESS_RATIO * chord_m
    cross_section_area_m2 = AIRFOIL_AREA_COEFFICIENT * t_max_m * chord_m
    volume_m3 = cross_section_area_m2 * span_m
    return volume_m3 * density_kg_m3 * 1000  # kg -> g


def non_wing_mass_g(density_kg_m3):
    """'Everything except the foam wing' (listed components + spars +
    fuselage + mount + wiring + adhesives), netted out from the current
    documented AUW estimate at the current WINGSPAN_M/CHORD_M so this model
    reproduces that figure at the current span. Not an independent
    measurement - inherits any error in the current AUW estimate."""
    current_wing = wing_foam_mass_g(WINGSPAN_M, CHORD_M, density_kg_m3)
    return total_mass_g() - current_wing


def wing_loading_by_span(span_m, density_kg_m3, chord_m=CHORD_M):
    """Returns (total_mass_g, wing_mass_g, area_dm2, wing_loading_g_dm2) for
    a candidate span at the given foam density, holding chord fixed."""
    wing_mass = wing_foam_mass_g(span_m, chord_m, density_kg_m3)
    total = non_wing_mass_g(density_kg_m3) + wing_mass
    area_dm2 = span_m * chord_m * 100
    return total, wing_mass, area_dm2, total / area_dm2


def total_mass_g():
    return sum(KNOWN_COMPONENTS_G.values()) + ESTIMATED_UNLISTED_G


def flight_listed_mass_g():
    """Listed components minus bench-only gear (see BENCH_ONLY_COMPONENTS) -
    the portion of the listed-components weight that's actually on the
    aircraft at takeoff. Excludes airframe structure (wing/spars/fuselage/
    mount/wiring/adhesives) entirely - see wing_foam_mass_g() for that."""
    return sum(
        g
        for name, g in KNOWN_COMPONENTS_G.items()
        if name not in BENCH_ONLY_COMPONENTS
    )


def weight_budget_headroom_g():
    """Grams remaining under WEIGHT_TARGET_G after flight-configuration
    listed components, before any airframe structure is added at all."""
    return WEIGHT_TARGET_G - flight_listed_mass_g()


def wing_loading_g_dm2(mass_g):
    wing_area_dm2 = WING_AREA_M2 * 100  # 1 m^2 = 100 dm^2
    return mass_g / wing_area_dm2


def cruise_power_w(mass_g):
    mass_kg = mass_g / 1000
    return mass_kg * W_PER_KG_LOW, mass_kg * W_PER_KG_HIGH


def solar_string_voltage(n_cells):
    return n_cells * CELL_VOC, n_cells * CELL_VMP


def solar_theoretical_power_w(n_cells):
    _, vmp_string = solar_string_voltage(n_cells)
    return vmp_string * CELL_IMP


def main():
    mass_g = total_mass_g()
    print(f"Total estimated mass: {mass_g:.1f} g")

    flight_mass = flight_listed_mass_g()
    headroom = weight_budget_headroom_g()
    print(
        f"Flight-config listed mass (excl. bench-only gear): "
        f"{flight_mass:.1f} g"
    )
    print(
        f"Headroom under {WEIGHT_TARGET_G:.0f}g target, before ANY "
        f"airframe structure: {headroom:.1f} g"
    )

    wl = wing_loading_g_dm2(mass_g)
    print(f"Wing loading: {wl:.1f} g/dm^2")

    low, high = cruise_power_w(mass_g)
    print(f"Estimated cruise power: {low:.1f}-{high:.1f} W")

    for n in (6, 7, 8):
        voc, vmp = solar_string_voltage(n)
        p = solar_theoretical_power_w(n)
        print(
            f"{n}-cell string: Voc={voc:.2f}V  Vmp={vmp:.2f}V  "
            f"theoretical Pmax={p:.1f}W (at true Vmp, MPPT-matched)"
        )

    print(
        "\nWing loading vs. span (chord fixed at "
        f"{CHORD_M * 1000:.0f}mm) - foam density {FOAM_DENSITY_KG_M3_LOW}-"
        f"{FOAM_DENSITY_KG_M3_HIGH} kg/m^3, ESTIMATE not measured:"
    )
    for span_mm in (900, 1000, 1100, 1200, 1300, 1500):
        span_m = span_mm / 1000
        _, wing_low, area_dm2, wl_low = wing_loading_by_span(
            span_m, FOAM_DENSITY_KG_M3_LOW
        )
        total_high, wing_high, _, wl_high = wing_loading_by_span(
            span_m, FOAM_DENSITY_KG_M3_HIGH
        )
        print(
            f"  {span_mm}mm: area={area_dm2:.1f}dm^2  "
            f"wing mass={wing_low:.1f}-{wing_high:.1f}g  "
            f"wing loading={wl_low:.1f}-{wl_high:.1f} g/dm^2"
        )


if __name__ == "__main__":
    main()
