## Goal
Replace `ADMIN001`-style codes with numeric-only employee codes, seed the first super admin as `41168143 / 090241w`, and hard-scope all non-admin users (office, dc_admin, rider) to their assigned site — with riders further restricted to parcels assigned to them.

## Changes

### 1. Login format (numeric only)
- `src/lib/auth.functions.ts`: change `employeeEmail` to accept numeric-only codes → `${digits}@aliship.internal`. Add validator: `/^\d{6,}$/`.
- `src/routes/index.tsx`:
  - Employee No. input → `inputMode="numeric"`, `pattern="\d*"`, strip non-digits.
  - Remove the "Create first Super Admin" bootstrap UI entirely (super admin is seeded via migration).
  - Update placeholder/help text ("e.g. 254261516").
- `src/routes/change-password.tsx`: unchanged behavior but keep min 6 chars (numeric passwords allowed).

### 2. Seed first super admin (41168143)
- Run a migration + admin insert that:
  1. Creates the auth user with email `41168143@aliship.internal`, password `090241w`, email_confirmed.
  2. Inserts `profiles` row (`employee_no='41168143'`, `must_change_password=false` so you can log in directly, or `true` if you'd rather force a reset — I'll default to `false` since you gave the intended password).
  3. Inserts `user_roles` row with `super_admin`.
- Drop `bootstrapFirstAdmin` server fn (no longer needed).

### 3. Site assignment enforcement
- `provisionUser`: require `siteId` for roles `office`, `dc_admin`, `rider`; reject if missing. Super admin may have `siteId = null`.
- Validate `employeeNo` is numeric.

### 4. Hard site-scoped RLS on `parcels`
Replace existing parcel SELECT policy with:

- **Super admin**: sees all (`is_admin(auth.uid())`).
- **Office / DC admin**: sees parcels where `origin_site_id = my_site_id() OR dest_site_id = my_site_id()`.
- **Rider**: sees only parcels where `assigned_rider_id = auth.uid()`.

Add SECURITY DEFINER helper `public.my_site_id()` returning the caller's `profiles.site_id` (avoids RLS recursion on profiles).

Apply the same site-scope pattern to:
- `scan_events` (via join to parcel's site, or by recording `site_id` on the scan and filtering directly).
- `accounts` / `transactions` (scope by `site_id` column; super admin sees all).
- `audit_log`: super admin only.

Ensure `parcels.assigned_rider_id` column exists (add if missing, nullable uuid referencing `auth.users`).

### 5. UI consequences
- `/admin/users` provisioning form: make Site required for office/dc/rider; numeric-only employee code input.
- Office/DC/Rider dashboards will now naturally show only their site's data once queries are wired to live tables (already the case via RLS).

## Technical notes
- New helper:
  ```sql
  create or replace function public.my_site_id()
  returns uuid language sql stable security definer set search_path=public
  as $$ select site_id from public.profiles where user_id = auth.uid() $$;
  ```
- Parcels policy example:
  ```sql
  create policy "parcels_visibility" on public.parcels for select
  using (
    public.is_admin(auth.uid())
    or (public.has_role(auth.uid(),'rider') and assigned_rider_id = auth.uid())
    or ((public.has_role(auth.uid(),'office') or public.has_role(auth.uid(),'dc_admin'))
        and (origin_site_id = public.my_site_id() or dest_site_id = public.my_site_id()))
  );
  ```
- Seed super admin uses `supabaseAdmin.auth.admin.createUser` inside the migration workflow via a one-off insert (I'll use the insert tool after the migration to create the auth user, then insert profile + role rows).

## Out of scope (say the word to include)
- Wiring the admin Users page UI to actually call the updated `provisionUser` with site pickers.
- Migrating existing dashboards from static mock data to live site-scoped queries.
