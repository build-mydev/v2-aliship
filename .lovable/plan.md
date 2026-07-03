# Batch 2 — Auth & Site Context + Parcel Status Library

## 1. New file: `src/lib/parcel-status.ts`
Create verbatim from spec: `PARCEL_STATUSES` const map, `ParcelStatus` type, `TERMINAL_STATUSES`, `EXCEPTION_STATUSES`, `RETURN_STATUSES`, `ACTIVE_STATUSES`, `ALLOWED_TRANSITIONS` graph, `statusBadgeClass()` helper, and `SCAN_CONFIG` map (pickup / departure / arrival / collection / out_delivery / delivered / return_delivered / hold / exception / return_entry).

## 2. Update `src/lib/auth-context.tsx`
- Extend `loadProfileAndRole` to also fetch site info via `user_sites` joined to `sites` (limit 1). Fallback to `profiles.site_id` if no `user_sites` row exists.
- Add to `AuthState` and provider value:
  - `siteId: string | null`
  - `siteName: string | null`
  - `siteType: 'hq' | 'dc' | 'office' | 'branch' | null`
  - `needsSiteAssignment: boolean` (true when role ≠ `super_admin` and no `siteId`)
- Keep existing `rolePath()` mapping (already matches spec).
- Do not break existing consumers — all new fields are additive.

## 3. New hook: `src/hooks/use-user-site.ts`
Thin wrapper returning `{ siteId, siteName, siteType, isHQ, isDC, isOffice, isBranch, isSuperAdmin }` derived from `useAuth()`.

## 4. Holding page for unassigned users
- New component `src/components/AccountPendingSetup.tsx`: centered rounded-2xl card, orange Building icon, title "Account Pending Setup", message about contacting admin, shows user email + role badge, red ghost Sign Out button.
- Wire into `src/routes/__root.tsx` (or the existing role gate): when `!loading && session && role !== 'super_admin' && needsSiteAssignment` on any `/admin|/dc|/office|/rider` route, render `<AccountPendingSetup />` instead of the child route. Login screen and change-password screen remain unaffected.

## 5. Replace old status strings
Files to touch:
- `src/data/static.ts` — remap mock parcel `status` values and any status-typed arrays; import `ParcelStatus` type and type the fields.
- `src/routes/rider.history.tsx`
- `src/components/screens/OpsListScreen.tsx`
- `src/components/screens/HomeDashboard.tsx`

Mapping applied everywhere:
```text
Pending Pickup   → Pending Confirmation
Picked Up        → Arrived at Origin Office
In Transit       → Departed to DC
At DC            → Arrived at DC
Exception        → Under Investigation
On Hold          → On Hold - Rescheduled
Cancelled        → Rejected
Returned         → Return Initiated
```
`Out for Delivery`, `Delivered`, `Return Delivered`, `Lost` unchanged. Any component still rendering a status pill switches to `statusBadgeClass(status)` from `parcel-status.ts`. No raw string literals for statuses in typed positions — use `ParcelStatus`.

## 6. Verification
- Build passes with zero TS errors.
- Login → each role still redirects via `rolePath()`.
- A test user with role but no site sees the holding page; super_admin bypasses it.
- `rg` shows no remaining old status strings outside migrations.

## Out of scope
No DB migrations, no changes to server functions, no UI redesign of dashboards beyond string swaps and badge helper adoption.
