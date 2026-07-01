# Speedaf-style Bleeding Wordmark Hero

Rework the `wordmark` variant of `src/components/layout/HeroBanner.tsx` so the ALISHIP logotype visually spills out of the orange header into the white content beneath — matching the Speedaf reference.

## Changes

### 1. `src/components/layout/HeroBanner.tsx`
- Split rendering by variant. Keep `compact` untouched (still shows site/role/settings).
- For `wordmark`:
  - Render only the giant "ALISHIP" text — no `express` tagline, no site row, no settings gear, no role badge (ignore those props in this variant).
  - Outer wrapper: `relative` container with a fixed orange block height (`h-32`).
  - Inner text element absolutely positioned, full-bleed edge-to-edge:
    - `absolute left-0 right-0 top-2`
    - `w-screen` with `ml-[calc(50%-50vw)]` to escape any parent horizontal padding
    - `overflow-visible`, no horizontal padding
  - Typography:
    - `font-family: 'Arial Black', sans-serif`, `font-weight: 900`, `font-style: italic`
    - `color: white`, `letter-spacing: -0.02em`, `line-height: 1`
    - `font-size: clamp(5rem, 32vw, 10rem)`
    - `text-align: center` (matches reference; letters span full width due to size)
  - The oversized text naturally extends ~30–50px below the `h-32` orange block into whatever renders next.

### 2. Consumer screens — accommodate the overlap
The wordmark hero is used in:
- `src/components/screens/ScanOpsScreen.tsx` (Office & Admin ScanOps)
- `src/routes/dc.index.tsx` (uses wordmark with siteName/roleBadge — those extras now suppressed by the variant)

For these, the first content card sits directly under the hero. Add a small top offset (e.g. wrap the content area with `pt-6` reduction / no change needed) — the white card already starts right after the orange block, so the italic descenders of ALISHIP naturally cross onto it. No structural change required beyond confirming the first child is a white/card surface with rounded top corners.

- In `ScanOpsScreen`: current spacing `space-y-3 px-3 py-3` — change first card wrapper to have `rounded-t-3xl` feel by keeping existing `rounded-2xl` card; ensure `py-3` top padding is enough so text bleeds onto the card, not into empty background. Keep as-is (background is already `bg-background` neutral; card is white).
- In `dc.index.tsx`: TileGrid tiles render on background. Wrap the TileGrid in a `rounded-3xl bg-card` container so the bleeding text lands on a white surface, matching the reference.

### 3. HomeDashboard
`HomeDashboard.tsx` uses a custom orange header (not `HeroBanner`) — leave unchanged. The user references Home/Profile/Admin "tabs" — those tabs use `ScanOpsScreen` / `dc.index` which already use `HeroBanner variant="wordmark"`, so the change propagates automatically.

## Technical notes
- Full-bleed trick `w-screen ml-[calc(50%-50vw)]` works inside any padded parent without needing to alter parents.
- `overflow-visible` on the orange block lets descenders of the italic "P"/"H" show below.
- No new dependencies. Pure Tailwind + inline style for the `clamp()` font-size (Tailwind arbitrary value `text-[clamp(5rem,32vw,10rem)]` also works).

## Out of scope
- Custom SVG logo mark (the reference has a stylized "S" with an arrow). We're staying with the ALISHIP wordmark in Arial Black italic as originally specified.
- HomeDashboard's orange header (uses its own layout, not HeroBanner).
