/**
 * A certificate of completion as a PDF file (added 11 October 2026), next to
 * the page it already was (app/[handle]/certificate/[id]).
 *
 * The page printed or saved as a PDF from the browser, which depends on the
 * browser, its print settings and the student knowing where "Save as PDF" is.
 * This draws the same sheet as a file: US Letter, landscape, the store's
 * color, the student's name, the course, who taught it and when, and the
 * certificate's id with the address that checks it. Everything on it is read
 * from the record kept when it was issued (lib/certificate.ts), so the file
 * says exactly what the page says.
 *
 * The letters are Noto Sans and Noto Serif (SIL Open Font License, lib/fonts),
 * cut down to Latin, Greek and Cyrillic (with Vietnamese) when they were
 * added, so a name in Polish, Czech, Turkish, Greek or Russian is spelled
 * right. A name in a script they do not cover —
 * Chinese, Arabic, Hindi — is not drawn as empty boxes: canDraw says no, and
 * the page, which the browser draws with its own fonts, is the certificate.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, type PDFFont, type PDFPage, degrees, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const W = 792;
const H = 612;

type Fonts = { sans: Uint8Array; semi: Uint8Array; serif: Uint8Array };
let fonts: Promise<Fonts> | null = null;

/** The three faces, read once per server. */
function loadFonts(): Promise<Fonts> {
  // Each path written out whole, so the deployment's file tracing sees them
  // (next.config.ts lists the folder too).
  fonts ??= Promise.all([
    readFile(join(process.cwd(), "lib/fonts/NotoSans-Regular.ttf")),
    readFile(join(process.cwd(), "lib/fonts/NotoSans-SemiBold.ttf")),
    readFile(join(process.cwd(), "lib/fonts/NotoSerif-Bold.ttf")),
  ]).then(([sans, semi, serif]) => ({ sans: new Uint8Array(sans), semi: new Uint8Array(semi), serif: new Uint8Array(serif) }));
  return fonts;
}

/** Whether every letter of these words is in the faces the file is drawn with. */
let faces: Promise<ReturnType<typeof fontkit.create>[]> | null = null;

export async function canDraw(...texts: string[]): Promise<boolean> {
  faces ??= loadFonts().then((loaded) => [loaded.sans, loaded.serif].map((bytes) => fontkit.create(bytes as unknown as Buffer)));
  const read = await faces;
  return texts.every((text) =>
    Array.from(text).every((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code < 32 || read.every((face) => face.hasGlyphForCodePoint(code));
    }),
  );
}

export type CertificateSheet = {
  name: string;
  title: string;
  storeName: string;
  /** The words around them, in the store's language (lib/buyer-words/courses.ts). */
  kicker: string;
  certifies: string;
  hasCompleted: string;
  taughtBy: string;
  idLine: string;
  checkLine: string;
  /** "Sample", across the sheet, for the creator's preview; empty on a real one. */
  stamp: string;
  /** The store's color, #rrggbb. */
  accent: string;
};

function color(hex: string) {
  const value = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#5a36ee";
  return rgb(parseInt(value.slice(1, 3), 16) / 255, parseInt(value.slice(3, 5), 16) / 255, parseInt(value.slice(5, 7), 16) / 255);
}

/** The largest size from `max` down at which `text` fits `width`, never under `min`. */
function fit(font: PDFFont, text: string, max: number, min: number, width: number): number {
  for (let size = max; size > min; size -= 1) if (font.widthOfTextAtSize(text, size) <= width) return size;
  return min;
}

/** One line, centered, shortened with an ellipsis if even the smallest size is too wide. */
function centered(page: PDFPage, font: PDFFont, text: string, y: number, max: number, min: number, ink: ReturnType<typeof rgb>, width = W - 200) {
  const size = fit(font, text, max, min, width);
  let line = text;
  while (line.length > 1 && font.widthOfTextAtSize(line, size) > width) line = `${Array.from(line).slice(0, -2).join("")}…`;
  page.drawText(line, { x: (W - font.widthOfTextAtSize(line, size)) / 2, y, size, font, color: ink });
}

/** The certificate, drawn as a one-page PDF. */
export async function certificatePdf(sheet: CertificateSheet): Promise<Uint8Array> {
  const loaded = await loadFonts();
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`${sheet.kicker} — ${sheet.name}`);
  pdf.setAuthor(sheet.storeName);
  pdf.setCreator(sheet.storeName);
  pdf.setProducer(sheet.storeName);
  const sans = await pdf.embedFont(loaded.sans, { subset: true });
  const semi = await pdf.embedFont(loaded.semi, { subset: true });
  // Embedded whole: cut to the letters this sheet uses, its glyphs come out
  // blank (pdf-lib's subsetting and this face disagree), and whole it is
  // already reduced to Latin, Greek and Cyrillic, about 160 KB.
  const serif = await pdf.embedFont(loaded.serif, { subset: false });
  const page = pdf.addPage([W, H]);
  const accent = color(sheet.accent);
  const ink = rgb(0.09, 0.08, 0.12);
  const soft = rgb(0.36, 0.35, 0.42);

  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.992, 0.988, 0.98) });
  page.drawRectangle({ x: 24, y: 24, width: W - 48, height: H - 48, borderColor: accent, borderWidth: 6 });
  page.drawRectangle({ x: 38, y: 38, width: W - 76, height: H - 76, borderColor: accent, borderWidth: 1, opacity: 0, borderOpacity: 0.6 });

  centered(page, semi, sheet.storeName.toLocaleUpperCase(), H - 92, 13, 9, accent);
  centered(page, serif, sheet.kicker, H - 150, 34, 22, ink);
  centered(page, sans, sheet.certifies, H - 205, 14, 10, soft);
  centered(page, serif, sheet.name, H - 265, 44, 22, ink);
  page.drawLine({ start: { x: W / 2 - 150, y: H - 282 }, end: { x: W / 2 + 150, y: H - 282 }, thickness: 1, color: accent });
  centered(page, sans, sheet.hasCompleted, H - 318, 14, 10, soft);
  centered(page, semi, sheet.title, H - 360, 26, 13, ink);
  centered(page, sans, sheet.taughtBy, H - 396, 13, 9, soft);

  // The seal: a ring in the store's color with a check mark drawn as two strokes.
  const cx = 120;
  const cy = 108;
  page.drawCircle({ x: cx, y: cy, size: 34, color: accent });
  page.drawCircle({ x: cx, y: cy, size: 27, borderColor: rgb(1, 1, 1), borderWidth: 1.5, opacity: 0 });
  page.drawLine({ start: { x: cx - 12, y: cy }, end: { x: cx - 3, y: cy - 10 }, thickness: 4, color: rgb(1, 1, 1) });
  page.drawLine({ start: { x: cx - 3, y: cy - 10 }, end: { x: cx + 14, y: cy + 11 }, thickness: 4, color: rgb(1, 1, 1) });

  const proofSize = 9.5;
  page.drawText(sheet.idLine, { x: W - 70 - sans.widthOfTextAtSize(sheet.idLine, proofSize), y: 112, size: proofSize, font: sans, color: soft });
  page.drawText(sheet.checkLine, { x: W - 70 - sans.widthOfTextAtSize(sheet.checkLine, proofSize), y: 96, size: proofSize, font: sans, color: soft });

  if (sheet.stamp) {
    const size = 120;
    const width = semi.widthOfTextAtSize(sheet.stamp, size);
    page.drawText(sheet.stamp, { x: (W - width * 0.8) / 2, y: H / 2 - 120, size, font: semi, color: accent, opacity: 0.12, rotate: degrees(20) });
  }
  return pdf.save();
}
