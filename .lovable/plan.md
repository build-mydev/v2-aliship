# Step 2 — Enable Camera (Capacitor)

Add native camera capture on Android/iOS with a graceful web fallback (file input) so the browser preview keeps working.

## 1. Install Capacitor + Camera plugin

- `@capacitor/core`, `@capacitor/camera`
- `@capacitor/android` (used later in Step 5, safe to add now)
- Add `capacitor.config.ts` at project root:
  - `appId: com.aliship.app`
  - `appName: ALISHIP`
  - `webDir: dist`

Note: we won't run `npx cap add android` here — that's Step 5. This step is JS-only so the web preview and the eventual APK both work.

## 2. Create a single camera helper

New file: `src/lib/camera.ts`

- `capturePhoto(): Promise<string | null>` returns a data URL (or object URL on web).
- On native (`Capacitor.isNativePlatform()`): use `Camera.getPhoto({ source: CameraSource.Camera, resultType: DataUrl, quality: 70, allowEditing: false })`.
- On web: fall back to a hidden `<input type="file" accept="image/*" capture="environment">` and resolve with a data URL via `FileReader`.
- `captureSignature()` stays out of scope — POD signature already uses a drawn tile.

Rationale: one call site, no plugin imports scattered across screens, preview keeps rendering.

## 3. Reusable capture tile

Update `IconTile` usage in `src/components/screens/ScanPageForType.tsx` so the "Take A Picture" tiles become a new small component:

New file: `src/components/layout/PhotoCaptureTile.tsx`
- Props: `label`, `icon`, `iconClass`, `onCapture(dataUrl)`.
- Shows the current thumbnail if a photo was captured (replaces the icon).
- Calls `capturePhoto()` on tap; stores result via `useState` in the parent.

## 4. Wire into screens

Only presentation wiring — no data/network changes.

- `ScanPageForType.tsx`
  - `ArrivalScan`: replace Take A Picture tile with `PhotoCaptureTile`.
  - `DeliveredScan`: POD photo tile → `PhotoCaptureTile`. Signature tile stays as-is.
  - `ExceptionEntry`: Take A Picture tile → `PhotoCaptureTile` (this is the damage/exception photo).
  - `ReturnEntry`: Take A Picture tile → `PhotoCaptureTile`.
- `src/routes/rider.parcel.$id.tsx`: if a damage/exception sheet has a photo slot, wire it here too (verify during build).
- `src/components/screens/WaybillEntry.tsx`: if it has a parcel photo tile, wire it; otherwise skip.

Captured photos live in local component state only for now — Supabase upload is Step 3.

## 5. Verify

- Build passes.
- Preview: tapping any camera tile opens the file picker and shows the thumbnail after selection.
- Native path is behind `Capacitor.isNativePlatform()`, so the browser never touches the plugin.

## Out of scope (later steps)

- `npx cap add android`, permissions in `AndroidManifest.xml`, APK build → Step 5.
- Uploading captured photos to storage → Step 3.
