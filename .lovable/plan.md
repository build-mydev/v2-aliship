## Overview

Large static-UI build across 3 workstreams. Zero backend. All data from `src/data/static.ts`. Every sub-page uses `SubPageHeader`; main tabs use wordmark `HeroBanner`. All sheets/modals via shadcn `Sheet` + `useState`.

## Part 1 — Remove Driver role

- `src/data/static.ts`: drop `DRIVER001` user + `driver` from role union/helpers. Keep a `drivers` array (name + phone) for waybill/manifest form dropdowns only.
- Delete `src/routes/driver.*` route files.
- `src/components/screens/LoginScreen.tsx`: remove Driver quick-login chip.
- `src/components/layout/BottomNav.tsx`: remove driver config.
- Grep-purge any `role === 'driver'` branches.

## Part 2 — Super Admin pages

Shared building blocks (create/extend once, reuse everywhere):
- `FloatingAddButton` — fixed bottom-right, `bottom-20 right-4`, orange, opens a Sheet.
- `FormSheet` — bottom `Sheet` wrapper with title, scrollable body, sticky footer (orange pill Save + text Cancel).
- `FilterChips` — horizontal scroll row with active orange chip.
- `SearchBar` — gray bg, search icon left.
- `StatCard`, `SectionCard`, `TimelineRow`.

Routes (all under `src/routes/admin.*`, each a file that renders a screen component in `src/components/screens/admin/`):

1. `/admin/sites` — SearchBar + chips (All/HQ/DC/Office/Branch) + 6 site cards (Mombasa HQ, Nairobi DC, Nakuru DC, Mombasa CBD Office, Bamburi Office, Nairobi CBD Office). Floating "+" → Add Site sheet with conditional Parent DC field.

2. `/admin/users` — Search + chips (All/Super Admin/DC Admin/Office Admin/Rider) + 5 user cards with colored role badges + rider sub-info. Floating "+" → Add User sheet with role-conditional rider fields (Vehicle Type, Max Parcels auto-fill, Zones).

3. `/admin/accounts` — Search + chips (All/Prepaid/Credit) + 2 summary cards + 4 account cards (ALS001, JUM001, SEN001, MAL001) with colored balance. Floating "+" → Add Account sheet (Credit Limit conditional).

4. `/admin/accounts/$id` — Detail: summary card with Top Up button + Top Up modal + 5-row transaction history + Generate Statement button.

5. `/admin/investigations` — 3 tabs (Under Investigation / Lost / All Exceptions) with orange underline. Cards with Days Open, Last Action, "View Audit Trail" + "Intercept" buttons. Intercept sheet with status/site selects + reason textarea.

6. `/admin/audit` — Date range + tracking search + "Show impersonated only" toggle + 5-entry timeline (one flagged with 🔐 and gray bg) + "Load More" button.

7. `/admin/settings` — 3 grouped cards (Operations / Financial / Rider Capacity). Each row → edit sheet (title, current value, input, Save/Cancel).

8. `/admin/impersonate` — Yellow info banner + search + user cards with "Impersonate" outline pill → confirm modal → yellow fixed banner (`useState`) at `bottom-16` with Exit button.

9. `/admin/reports` — Date + site dropdown, 2x2 stat grid, Volume by Site with progress bars, Credit Aging list, Rider Performance list, Export Report button.

## Part 3 — DC Admin screens

- `/dc` — Wordmark banner + top card (Waybill Entry, Print) + Scan Operations 3-col grid (Arrival, Departure, Bag, Vehicle Sealing, Unsealing, Exception).
- `/dc/menu` — Wordmark + site info + Inbound card + Expected from Offices card (3 office rows with status badges) + Outgoing Today card + 2x2 stat grid + Sign Out.
- `/dc/scan/$type` — Reuse existing `ScanPageForType` with `/dc/` prefix.
- Bottom nav: Home | Profile (2 tabs).

## Part 4 — Rider screens

- `/rider` — Wordmark + rider info row + Today's Summary (3 tiles: Assigned 8 / Delivered 5 / Pending 3) + My Parcels list (3 cards with Delivered/Attempt/more buttons).
- `/rider/menu` — Wordmark + profile card (avatar, employee, site, vehicle, zones) + menu list (Create Waybill, Delivery History, Track Parcel) + Capacity indicator (progress bar, 53%, warning at >80%) + Sign Out.
- `/rider/waybill/new` — Same form as office waybill, minus Settlement/Freight, footer button "Submit for Confirmation".
- `/rider/history` — Filters + summary row + 5 history cards with status badges (Delivered/Attempted/On Hold).
- `/rider/parcel/$id` — Info card + 5 stacked action buttons + three bottom sheets (Delivered with photo/POD/M-Pesa mock, Reschedule with static date/time, Wrong Address with required notes) + attempt counter + yellow warning banner.
- Bottom nav: Home | Profile (2 tabs).

## Static data additions in `src/data/static.ts`

- `sites` (6 entries with type, county, active).
- `users` (5 entries with role, site, avatar initials, rider metadata).
- `accounts` (4 entries with type, balance, contact).
- `transactions` (5 entries for ALS001).
- `investigations` (3 parcels).
- `auditEntries` (5 entries, one impersonated).
- `settings` (grouped values).
- `reports` (stats, volume-by-site, credit aging, rider perf).
- `riderParcels` (3 out-for-delivery), `riderHistory` (5).
- `drivers` (kept for form dropdowns).

## Rules enforced

- No `fetch`/supabase/network anywhere.
- All sheets: shadcn `Sheet side="bottom"` with rounded top.
- Sticky action buttons at `bottom-16` (above nav).
- Wordmark banner only on `/office`, `/admin`, `/dc`, `/rider` home + menu.
- `SubPageHeader` on every other route.
- All Links use TanStack `<Link to params>` — no href interpolation.
- Build the whole thing in one pass; verify with build output at the end.

## Out of scope

Real camera, real M-Pesa, backend, auth persistence, driver role.
