# SunPower C60 — Extracted Specs

Source: SunPower C60/E60/E66 Gen3 datasheet + vendor listings (web search,
2026-07-21). Treat vendor-listed nameplate figures (e.g. "up to 2.4A") as
best-case/marketing numbers — the datasheet-derived I-V figures below are
more representative for design work.

## Per-cell electrical specs

| Parameter | Value |
|---|---|
| Dimensions | 125 × 125 mm |
| Weight (bare cell) | ~7 g |
| Open-circuit voltage (Voc) | ~0.72–0.73 V |
| Max-power voltage (Vmp) | ~0.58 V |
| Short-circuit current (Isc) | ~6.0–6.3 A |
| Max-power current (Imp) | ~5.8–6.0 A |
| Rated power (Pmax) | ~3.4–3.6 W |
| Cell technology | Monocrystalline, all-back-contact (Maxeon) |
| Thickness | ~200 µm (semiflexible variants available, flex up to 15°) |

## Series-string math (reference)

For N cells in series (current stays ~constant, voltage multiplies):

| N cells | Voc (approx) | Vmp (approx) |
|---|---|---|
| 6 (previous) | ~4.3 V | ~3.5 V |
| 7 (current) | ~5.0 V | ~4.06 V |
| 8 | ~5.8 V | ~4.6 V |

**Measured vs. theoretical (2026-07-22):** bench-measured Voc for the
7-cell string was **4.57V**, ~9–11% below the ~5.0–5.1V theoretical
above (implied per-cell Voc ~0.65V vs. the ~0.72–0.73V datasheet figure).
Not yet root-caused — see the 2026-07-22 entry in
`logs/test_flights.md` and open questions in `CLAUDE.md`. Treat the
theoretical figures in this table as upper bounds, not confirmed values,
until reconciled.

## Why this matters for this project

The array is connected to the battery bus through an ideal-diode OR, which
has no MPPT. This forces the array to operate at whatever voltage the bus
sits at (~3.9–4.2V), not at its own Vmp. Since these are current sources
whose output current falls off steeply above Vmp (approaching Voc), operating
above Vmp starves available current — this is the leading explanation for why
the 6-cell string (Vmp ≈ 3.5V) was only delivering ~2.5A into a ~3.9V bus
despite an Imp capability closer to 6A.

Adding a 7th cell moves Vmp to ~4.06V, close to typical battery voltage,
without requiring a buck/MPPT stage. This is being tracked as a design
decision — see `decisions/0001-cell-series-count.md`.
