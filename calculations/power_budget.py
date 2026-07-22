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
    "ideal_diode_pair": 1.46,
    "ideal_diode_modules": 0.27 * 2,
    "current_sensors": 1.27 * 3,
    "capacitor": 0.7,
}

# Estimate for airframe structure not individually weighed yet.
# Replace with a real scale measurement ASAP.
ESTIMATED_UNLISTED_G = 100.0  # midpoint of 90-110g estimate

# --- Cruise power assumptions -------------------------------------------
W_PER_KG_LOW = 50   # light glider, some parasitic drag from payload
W_PER_KG_HIGH = 70

# --- Solar array (SunPower C60) ------------------------------------------
CELL_VOC = 0.72
CELL_VMP = 0.58
CELL_IMP = 5.9  # amps, per string (series doesn't change current)
N_CELLS_SERIES = 7  # update as the string is modified; see decisions/0001-cell-series-count.md


def total_mass_g():
    return sum(KNOWN_COMPONENTS_G.values()) + ESTIMATED_UNLISTED_G


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


if __name__ == "__main__":
    main()
