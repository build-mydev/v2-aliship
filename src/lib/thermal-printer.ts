// Thermal printer service — Bluetooth LE for 58mm ESC/POS printers.
// Uses @capacitor-community/bluetooth-le on native (Android APK). On web,
// falls back to a no-op with a helpful error so the UI still builds & runs.

import { BleClient, numbersToDataView, type BleDevice } from "@capacitor-community/bluetooth-le";
import { Capacitor } from "@capacitor/core";

// Common service/characteristic UUIDs used by generic ESC/POS BLE printers.
// We probe several known service UUIDs; the first writable char wins.
const SERVICE_UUIDS = [
  "000018f0-0000-1000-8000-00805f9b34fb", // most Goojprt / MTP-2 / generic
  "0000ff00-0000-1000-8000-00805f9b34fb",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
];

const LAST_DEVICE_KEY = "aliship.printer.deviceId";

export type PrinterDevice = { deviceId: string; name?: string };

let currentDeviceId: string | null = null;
let currentServiceUuid: string | null = null;
let currentCharUuid: string | null = null;

function isNative() {
  return Capacitor.isNativePlatform();
}

export const thermalPrinter = {
  isNative,

  lastDeviceId(): string | null {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(LAST_DEVICE_KEY);
  },

  async initialize() {
    if (!isNative()) throw new Error("Bluetooth printing requires the Android app build.");
    await BleClient.initialize({ androidNeverForLocation: true });
  },

  async scan(onDevice: (d: PrinterDevice) => void, seconds = 8): Promise<void> {
    await this.initialize();
    await BleClient.requestLEScan({ allowDuplicates: false }, (result) => {
      const d: BleDevice = result.device;
      if (!d?.deviceId) return;
      onDevice({ deviceId: d.deviceId, name: d.name || result.localName || undefined });
    });
    await new Promise((r) => setTimeout(r, seconds * 1000));
    try { await BleClient.stopLEScan(); } catch { /* noop */ }
  },

  async connect(deviceId: string): Promise<void> {
    await this.initialize();
    await BleClient.connect(deviceId, () => {
      currentDeviceId = null;
      currentServiceUuid = null;
      currentCharUuid = null;
    });
    const services = await BleClient.getServices(deviceId);
    let picked: { s: string; c: string } | null = null;
    // Prefer known ESC/POS service UUIDs.
    for (const s of services) {
      const match = SERVICE_UUIDS.includes(s.uuid.toLowerCase());
      const char = s.characteristics.find((c) => c.properties.write || c.properties.writeWithoutResponse);
      if (match && char) { picked = { s: s.uuid, c: char.uuid }; break; }
      if (!picked && char) picked = { s: s.uuid, c: char.uuid };
    }
    if (!picked) throw new Error("Printer has no writable characteristic");
    currentDeviceId = deviceId;
    currentServiceUuid = picked.s;
    currentCharUuid = picked.c;
    if (typeof localStorage !== "undefined") localStorage.setItem(LAST_DEVICE_KEY, deviceId);
  },

  async disconnect(): Promise<void> {
    if (!currentDeviceId) return;
    try { await BleClient.disconnect(currentDeviceId); } catch { /* noop */ }
    currentDeviceId = null;
    currentServiceUuid = null;
    currentCharUuid = null;
  },

  isConnected(): boolean {
    return !!(currentDeviceId && currentServiceUuid && currentCharUuid);
  },

  currentDeviceId(): string | null {
    return currentDeviceId;
  },

  /** Send raw ESC/POS bytes in chunks (BLE MTU-safe). */
  async write(bytes: Uint8Array, chunkSize = 180): Promise<void> {
    if (!isNative()) throw new Error("Bluetooth printing requires the Android app build.");
    if (!currentDeviceId || !currentServiceUuid || !currentCharUuid) {
      throw new Error("Printer not connected");
    }
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const slice = bytes.slice(i, i + chunkSize);
      const dv = numbersToDataView(Array.from(slice));
      await BleClient.writeWithoutResponse(
        currentDeviceId,
        currentServiceUuid,
        currentCharUuid,
        dv,
      );
      // Small pause helps slower printers digest raster data
      await new Promise((r) => setTimeout(r, 15));
    }
  },
};
