## Delivery Monitor — make all stat columns expandable

Currently only **Un-Delivered** on each rider row in the Delivery Monitor expands to show a list of waybills. Extend the same behavior to the other stat columns so tapping any of them reveals the underlying parcels.

### Columns that become clickable
- Delivered
- Un-Delivered (already works)
- No Exception
- No Call Record

`Delivery Volume` stays as a plain non-clickable total.

### Behavior
- Tapping a stat toggles an inline list beneath that rider's row showing the waybill numbers for that category.
- Only one category expanded at a time per rider (tapping a different stat swaps the list).
- If the count is 0, the column stays non-interactive.
- The active column label + number get the orange/underlined treatment (same as today's Un-Delivered).
- Each waybill row remains a link to `ops/track`.

### Data
Extend the mock `RIDERS` array in `src/components/screens/OpsListScreen.tsx` so each rider has a small waybill list per category (`deliveredWaybills`, `unWaybills`, `noExcWaybills`, `noCallWaybills`). Lists are static mock strings sized to roughly match each count (cap at ~5 samples per category to keep the UI tidy).

### Files touched
- `src/components/screens/OpsListScreen.tsx` — update `RIDERS` data and the `DeliveryMonitorScreen` render to drive expansion from a `{ riderIndex, category }` state.

No routing, no new pages.