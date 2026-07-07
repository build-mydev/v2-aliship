// ESC/POS command builder for 58mm thermal printer (paper width = 384 dots @ 203dpi).
// Renders text + rasterized QR/barcode blocks via GS v 0.

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

export const PAPER_DOTS = 384;

function concat(chunks: (Uint8Array | number[])[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + (c as ArrayLike<number>).length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    const arr = c instanceof Uint8Array ? c : Uint8Array.from(c);
    out.set(arr, off);
    off += arr.length;
  }
  return out;
}

const enc = new TextEncoder();

export const cmd = {
  init: () => new Uint8Array([ESC, 0x40]),
  feed: (n = 1) => new Uint8Array([ESC, 0x64, n]),
  cutPartial: () => new Uint8Array([GS, 0x56, 0x01]),
  align: (mode: "left" | "center" | "right") =>
    new Uint8Array([ESC, 0x61, mode === "left" ? 0 : mode === "center" ? 1 : 2]),
  bold: (on: boolean) => new Uint8Array([ESC, 0x45, on ? 1 : 0]),
  // Text size: n = width<<4 | height, values 0..7
  size: (w = 0, h = 0) => new Uint8Array([GS, 0x21, ((w & 0x7) << 4) | (h & 0x7)]),
  text: (s: string) => enc.encode(s),
  ln: (s = "") => enc.encode(s + "\n"),
  hr: (char = "-", n = 32) => enc.encode(char.repeat(n) + "\n"),
};

/**
 * Rasterize a monochrome 1-bit image (from a canvas) into ESC/POS `GS v 0`.
 * width & height are in pixels. `bits` is a bit-packed MSB row-major array
 * where 1 = black dot.
 */
export function rasterImage(width: number, height: number, bits: Uint8Array): Uint8Array {
  const bytesPerRow = Math.ceil(width / 8);
  const xL = bytesPerRow & 0xff;
  const xH = (bytesPerRow >> 8) & 0xff;
  const yL = height & 0xff;
  const yH = (height >> 8) & 0xff;
  return concat([[GS, 0x76, 0x30, 0x00, xL, xH, yL, yH], bits]);
}

/**
 * Convert a canvas' pixel data to a bit-packed 1-bit array (black-on-white,
 * simple threshold).
 */
export function canvasToBits(canvas: HTMLCanvasElement, threshold = 160): Uint8Array {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const img = ctx.getImageData(0, 0, width, height).data;
  const bytesPerRow = Math.ceil(width / 8);
  const out = new Uint8Array(bytesPerRow * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = img[i + 3];
      const lum = a === 0 ? 255 : (img[i] * 0.299 + img[i + 1] * 0.587 + img[i + 2] * 0.114);
      if (lum < threshold) {
        const byteIdx = y * bytesPerRow + (x >> 3);
        out[byteIdx] |= 0x80 >> (x & 7);
      }
    }
  }
  return out;
}

export function buildBytes(chunks: (Uint8Array | number[])[]): Uint8Array {
  return concat(chunks);
}
