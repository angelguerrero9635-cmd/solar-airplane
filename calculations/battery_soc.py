"""
Simple resting-voltage -> SOC lookup for a 1S Li-ion cell (18650, 2600mAh).

For anything beyond rough estimates, prefer coulomb counting via the
ACS723 current sensors already on the power path (see battery_soc.md).

Usage:
    python3 battery_soc.py 3.93
"""

import sys

# (voltage, SOC%) breakpoints, resting/no-load
CURVE = [
    (4.20, 100),
    (4.10, 90),
    (4.00, 80),
    (3.93, 73),
    (3.85, 60),
    (3.70, 40),
    (3.50, 10),
    (3.00, 0),
]


def soc_from_voltage(v):
    if v >= CURVE[0][0]:
        return 100.0
    if v <= CURVE[-1][0]:
        return 0.0
    for (v_hi, s_hi), (v_lo, s_lo) in zip(CURVE, CURVE[1:]):
        if v_lo <= v <= v_hi:
            # linear interpolation between breakpoints
            frac = (v - v_lo) / (v_hi - v_lo)
            return s_lo + frac * (s_hi - s_lo)
    return None


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 battery_soc.py <voltage>")
        sys.exit(1)
    v = float(sys.argv[1])
    soc = soc_from_voltage(v)
    print(f"{v:.2f}V -> approx {soc:.0f}% SOC (resting voltage estimate)")
