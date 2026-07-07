// Renders a Speedaf-style waybill label as ESC/POS bytes for a 58mm printer,
// including a Code128 barcode and a QR code alongside header/receiver/sender.
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { cmd, canvasToBits, rasterImage, buildBytes, PAPER_DOTS } from "./escpos";

export type WaybillPrintData = {
  waybill: string;
  cod?: number | string | null;
  origin?: string | null;      // e.g. "KE" or origin site code
  routeCode?: string | null;   // e.g. "MBDC-MCB"
  receiver: { name: string; phone?: string | null; ward?: string | null; town?: string | null; county?: string | null; address?: string | null };
  sender:   { name: string; phone?: string | null; address?: string | null };
  goods?: string | null;
  weightKg?: number | null;
  createdAt?: string | Date | null;
  brand?: string;   // "Aliship"
};

async function makeQr(text: string, size = 180): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 1,
    color: { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });
  const bits = canvasToBits(canvas);
  return rasterImage(canvas.width, canvas.height, bits);
}

function makeBarcode(text: string, width = PAPER_DOTS - 24, height = 70): Uint8Array {
  const canvas = document.createElement("canvas");
  // JsBarcode sizes are per module; compute width so full barcode fits ~360px.
  JsBarcode(canvas, text, {
    format: "CODE128",
    displayValue: true,
    fontSize: 16,
    margin: 4,
    height,
    width: 2,
    background: "#FFFFFF",
    lineColor: "#000000",
  });
  // Scale/crop to <= width if too wide
  if (canvas.width > width) {
    const scaled = document.createElement("canvas");
    scaled.width = width;
    scaled.height = Math.round((canvas.height * width) / canvas.width);
    const ctx = scaled.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
    const bits = canvasToBits(scaled, 128);
    return rasterImage(scaled.width, scaled.height, bits);
  }
  const bits = canvasToBits(canvas, 128);
  return rasterImage(canvas.width, canvas.height, bits);
}

function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

export async function renderWaybillEscPos(w: WaybillPrintData): Promise<Uint8Array> {
  const brand = w.brand ?? "Aliship";
  const qr = await makeQr(w.waybill);
  const barcode = makeBarcode(w.waybill);

  return buildBytes([
    cmd.init(),
    // Brand header
    cmd.align("center"),
    cmd.size(1, 1), cmd.bold(true), cmd.ln(brand.toUpperCase()),
    cmd.bold(false), cmd.size(0, 0), cmd.ln("express"),
    cmd.feed(1),

    // COD box
    cmd.align("left"),
    cmd.bold(true), cmd.size(0, 1),
    cmd.ln(`COD: ${w.cod == null || w.cod === "" ? "0" : w.cod}`),
    cmd.size(0, 0), cmd.bold(false),
    cmd.ln(`${w.origin ?? "KE"}    ${w.routeCode ?? ""}`),
    cmd.hr("-"),

    // Barcode + number
    cmd.align("center"),
    barcode,
    cmd.feed(1),

    // Receiver
    cmd.align("left"),
    cmd.bold(true), cmd.ln(`Receiver: ${w.receiver.name}${w.receiver.phone ? "   " + w.receiver.phone : ""}`),
    cmd.bold(false),
    cmd.ln([w.receiver.ward, w.receiver.town, w.receiver.county].filter(Boolean).join(" ")),
    w.receiver.address ? cmd.ln(w.receiver.address) : new Uint8Array(),
    cmd.hr("-"),

    // Sender
    cmd.bold(true), cmd.ln(`Sender: ${w.sender.name}${w.sender.phone ? "   " + w.sender.phone : ""}`),
    cmd.bold(false),
    w.sender.address ? cmd.ln(w.sender.address) : new Uint8Array(),
    cmd.hr("-"),

    // Goods
    cmd.ln("Once signed, shipment will be treated as delivered successfully"),
    cmd.ln(`Goods: ${w.goods ?? "-"}`),
    w.weightKg ? cmd.ln(`Total Weight: ${w.weightKg}`) : new Uint8Array(),
    cmd.ln(fmtDate(w.createdAt ?? new Date())),

    // QR block on right (printed centered under)
    cmd.align("center"),
    qr,
    cmd.feed(1),
    cmd.align("left"),
    cmd.ln("Signature: ______________________"),
    cmd.ln("Date: __________________________"),
    cmd.feed(3),
    cmd.cutPartial(),
  ]);
}
