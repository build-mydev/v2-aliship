# ALISHIP Static UI Rebuild Plan

Mobile-first static logistics UI. Zero backend. All mock data in `src/data/static.ts`. Full navigation via TanStack Router file-based routes.

## Design tokens & fonts

Update `src/styles.css`:
- Primary `#FF6600` (orange), primary-foreground white
- Background near-white, cards white, soft gray borders, rounded-2xl, soft shadow scale
- No external font loading. Add CSS classes:
  - `.font-wordmark` → `'Arial Black', 'Helvetica Neue', Arial, sans-serif; font-weight:900; font-style:italic`
  - Base body → `system-ui, -apple-system, sans-serif`

All component colors via tokens (`bg-primary`, `bg-card`, `text-muted-foreground`, `border-border`, `text-destructive`). No hex/`text-white`/`bg-black` in components.

## Static data (`src/data/static.ts`)

Exports: `sites`, `parcels` (status enum: pending/in_transit/arrived/out_for_delivery/delivered/exception/investigation), `manifests`, `bags`, `users`, `accounts`, `codRecords`, `auditLog`, `appSettings`, `dashboardCounts`, `riders`, `roleProfiles`, `demoRoles`.

Helpers:
- `type Role = 'super_admin'|'office'|'dc_admin'|'driver'|'rider'`
- `rolePath(role)` → `/admin | /office | /dc | /driver | /rider`
- `siteForRole(role)` → mock site
- `logout()` → clears localStorage keys (`aliship.role`, `aliship.employeeNo`), then `window.location.href = '/'`
- `demoRoles` map: `ADMIN001→super_admin`, `OFFICE001→office`, `DC001→dc_admin`, `RIDER001→rider`, `DRIVER001→driver`

## Layout primitives (`src/components/layout/`)

- `HeroBanner` — variants `wordmark` | `compact`; giant italic ALISHIP wordmark on primary bg; optional site-info sub-bar (site name, role chip, settings gear)
- `SubPageHeader` — 56px primary bar; back chevron (uses `useRouter().history.back()`), centered white title
- `BottomNav` — fixed `bottom-0 inset-x-0 z-50`; role-aware tabs; primary active state
- `PageLayout` — flex column min-h-screen; content wrapper adds `pb-16` when bottom nav present
- `PageToolbar` — sticky search + filter chips
- `CardList` / `CardListItem` — rounded cards, icon + title + subtitle + badge + chevron
- `DetailHeader` — big title, subtitle, status badge
- `FormShell` — form container; sticky action bar helper
- `StickyActionBar` — `fixed inset-x-0 bottom-16` (above bottom nav)
- `SectionBlock` — labeled section wrapper
- `TileGrid` / `Tile` — 2-col colored icon squares for scan ops
- `StaticScanPage` — generic scan-type page (SubPageHeader, one scan input, Save, empty scanned list)

## Routes (file-based, `src/routes/`)

### Auth
- `index.tsx` — Login screen: centered, orange halo, rounded-3xl orange tile with white `Package` icon, italic ALISHIP wordmark + "express" tagline, "Default" dropdown chip, floating-label Employee No. + Password, orange pill Login button, demo IDs helper, version footer. On submit: lookup `demoRoles`, store role + employee no. in localStorage, navigate to `rolePath(role)`.

### Office (role: office)
- `office.tsx` — layout with `<Outlet/>` + BottomNav (Home, Profile)
- `office.index.tsx` — ScanOpsScreen (wordmark hero + 11-tile grid: Waybill Entry, Print, Departure/Arrival/Bag/Delivery/POD/Return/Handover/Exception/Rider Scan)
- `office.menu.tsx` — HomeDashboard (compact hero, Cash Pending Settlement card, inbound stats grid, Delivery Monitor list, Sign Out at bottom)
- `office.waybill.new.tsx` — Waybill Entry (Express/LTL tabs, e-waybill chip, two info cards, sticky Place An Order pill)
- `office.print.tsx` — Print (Query Print / Scan Code Print tabs, empty state, fixed bottom bar with Choose All + Bluetooth + Print above BottomNav)
- `office.scan.$type.tsx` — Departure Scan gets custom layout; other types render `StaticScanPage`

### Admin (role: super_admin) — mirrors office plus tools
- `admin.tsx` — layout + BottomNav (Home, Profile, Admin Tools)
- `admin.index.tsx` — ScanOps grid (same as office)
- `admin.menu.tsx` — HomeDashboard
- `admin.tools.tsx` — 2-col tile grid: Sites, Users, Accounts, Reports, Investigations, Audit Log, Settings, Impersonate
- `admin.waybill.new.tsx`, `admin.print.tsx`, `admin.scan.$type.tsx` — reuse office components
- `admin.sites.tsx`, `admin.users.tsx`, `admin.accounts.tsx`, `admin.accounts.$id.tsx`, `admin.reports.tsx`, `admin.investigations.tsx`, `admin.audit.tsx`, `admin.settings.tsx`, `admin.impersonate.tsx` — CardList-based static lists/details

### Shared waybill address pages
- `waybill.sender.tsx` — Sender card (PaperPlane), sticky Confirm pill
- `waybill.receiver.tsx` — Receiver card (Mail), sticky Confirm pill

### DC (role: dc_admin)
- `dc.tsx` — layout + BottomNav (Home, Profile)
- `dc.index.tsx` — ScanOps grid: Arrival Scan, Departure Scan, Bag Scan, Vehicle Sealing Scan, Unsealing Scan, Exception Entry
- `dc.menu.tsx` — DC Dashboard: wordmark hero, DC name + "DC ADMIN" badge, 4 stat cards (Parcels at DC 47, Expected Incoming 12, Outgoing Today 8, Exceptions 2), Inbound section (Yet to Arrive 3, Arrived-Pending 2), Sign Out button at bottom
- `dc.scan.$type.tsx` — StaticScanPage (covers `departure`, `arrival`, others)

### Rider (role: rider) / Driver (role: driver)
- `rider.tsx` / `rider.index.tsx` / `rider.menu.tsx` — hero + a couple stat cards + menu CardList + Sign Out at bottom
- `driver.tsx` / `driver.index.tsx` / `driver.menu.tsx` — same pattern

## BottomNav & sticky rules

- BottomNav: `fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border`, active tab uses `text-primary`
- Main content wrapper for role layouts: `pb-16` so content clears the nav
- Sticky sub-page action bars (Place An Order, Confirm, Save, Print toolbar): `fixed inset-x-0 bottom-16 z-40`
- SubPageHeader used on ALL non-tab sub-pages; back chevron calls router history back

## Sign Out placement

On every profile/dashboard route (`/office/menu`, `/admin/menu`, `/dc/menu`, `/rider/menu`, `/driver/menu`):
- Bottom of scrollable content, above BottomNav padding
- Divider line above
- Full-width red ghost button: `border border-destructive text-destructive bg-transparent hover:bg-destructive/10`, label "Sign Out"
- Click → `logout()`

## Technical details

- Router: rely on generated `routeTree.gen.ts`; each new route uses `createFileRoute("...")` with slash-separated path matching filename dots
- `useNavigate`/`Link` from `@tanstack/react-router`
- shadcn/ui already present; use `Button`, `Input`, `Select`, `Checkbox`, `Tabs`, `Card`, `Badge`
- Icons via `lucide-react` (Package, PaperPlane→`Send`, Mail, ChevronLeft, ChevronRight, Search, Bluetooth, Settings, LogOut, etc.)
- localStorage keys: `aliship.role`, `aliship.employeeNo`
- Login accepts any password; if employee no. not in `demoRoles`, show inline error

## Deliverables checklist

1. Design tokens + system-font wordmark in `styles.css`
2. `src/data/static.ts` with all mocks + helpers
3. All layout primitives
4. Login screen at `/`
5. Office, Admin, DC, Rider, Driver route trees
6. All sub-pages (waybill, print, scan variants, admin tools list/detail)
7. Sign Out on every dashboard
8. Zero console/build errors, all navigation works
