import { Capacitor } from "@capacitor/core";

/**
 * Capture a photo. On native (Android/iOS) uses the Capacitor Camera plugin.
 * On web falls back to a hidden file input with `capture=environment` so
 * mobile browsers still open the camera, and desktop shows a file picker.
 * Returns a data URL, or null if the user cancelled.
 */
export async function capturePhoto(): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
    try {
      const photo = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      return photo.dataUrl ?? null;
    } catch {
      return null;
    }
  }
  return webFilePicker();
}

function webFilePicker(): Promise<string | null> {
  return new Promise(resolve => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.style.display = "none";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    // If dialog closes with no file, we can't reliably detect cancel; garbage collect on next tick.
    document.body.appendChild(input);
    input.click();
    setTimeout(() => input.remove(), 60_000);
  });
}
