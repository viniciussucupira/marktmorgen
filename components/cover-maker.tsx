"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  COVER_DESIGNS,
  COVER_HEIGHT,
  COVER_WIDTH,
  MAX_COVER_LABEL,
  MAX_COVER_SUB,
  MAX_COVER_TITLE,
  type CoverColors,
  type CoverDesign,
  coverColors,
  coverSeed,
  coverText,
  fitText,
} from "@/lib/cover-maker";
import { FONTS, type FontId } from "@/lib/store-look";

/** What a cover is drawn from: the store's color, letters and name, and the words the creator chose. */
export type CoverLook = { accent: string; font: FontId; name: string };

type Words = { title: string; label: string; sub: string; name: string };

const W = COVER_WIDTH;
const H = COVER_HEIGHT;

/** The family the store's headings are set in, as the page has loaded it (app/layout.tsx). */
function familyFor(font: FontId): string {
  const variable = FONTS.find((each) => each.id === font)?.head || "--font-body";
  const value = typeof document === "undefined" ? "" : getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value ? `${value}, system-ui, sans-serif` : "system-ui, sans-serif";
}

function setFont(pen: CanvasRenderingContext2D, weight: number, size: number, family: string) {
  pen.font = `${weight} ${size}px ${family}`;
}

function spacing(pen: CanvasRenderingContext2D, value: string) {
  if ("letterSpacing" in pen) (pen as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = value;
}

type Block = { align: "left" | "center"; x: number; width: number; title: string; color: string; subColor: string; maxLines?: number; max?: number };

/** The title and the line under it, set to fit; returns how tall they are, drawn from `top` (or only measured). */
function titleBlock(pen: CanvasRenderingContext2D, family: string, words: Words, block: Block, top: number, draw: boolean): number {
  const measureAt = (weight: number) => (text: string, size: number) => {
    setFont(pen, weight, size, family);
    return pen.measureText(text).width;
  };
  spacing(pen, "0px");
  const title = fitText(words.title || " ", block.width, block.maxLines ?? 5, block.max ?? 150, 64, measureAt(800));
  const lead = Math.round(title.size * 1.08);
  let height = title.lines.length * lead;
  const sub = words.sub ? fitText(words.sub, block.width, 3, 54, 40, measureAt(500)) : null;
  const subLead = sub ? Math.round(sub.size * 1.35) : 0;
  if (sub) height += 44 + sub.lines.length * subLead;
  if (!draw) return height;
  pen.textAlign = block.align;
  pen.textBaseline = "alphabetic";
  const x = block.align === "center" ? block.x + block.width / 2 : block.x;
  setFont(pen, 800, title.size, family);
  pen.fillStyle = block.color;
  title.lines.forEach((line, i) => pen.fillText(line, x, top + title.size * 0.92 + i * lead));
  if (sub) {
    setFont(pen, 500, sub.size, family);
    pen.fillStyle = block.subColor;
    const start = top + title.lines.length * lead + 44;
    sub.lines.forEach((line, i) => pen.fillText(line, x, start + sub.size * 0.95 + i * subLead));
  }
  return height;
}

function label(pen: CanvasRenderingContext2D, family: string, text: string, x: number, y: number, color: string, align: "left" | "center") {
  if (!text) return;
  setFont(pen, 700, 40, family);
  spacing(pen, "7px");
  pen.textAlign = align;
  pen.fillStyle = color;
  pen.fillText(text.toLocaleUpperCase(), x, y);
  spacing(pen, "0px");
}

function byline(pen: CanvasRenderingContext2D, family: string, text: string, x: number, y: number, color: string, align: "left" | "center") {
  if (!text) return;
  setFont(pen, 600, 46, family);
  spacing(pen, "0px");
  pen.textAlign = align;
  pen.fillStyle = color;
  const fitted = fitText(text, W - 220, 1, 46, 30, (t, size) => {
    setFont(pen, 600, size, family);
    return pen.measureText(t).width;
  });
  setFont(pen, 600, fitted.size, family);
  pen.fillText(fitted.lines[0] ?? "", x, y);
}

function circle(pen: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha = 1) {
  pen.save();
  pen.globalAlpha = alpha;
  pen.fillStyle = color;
  pen.beginPath();
  pen.arc(x, y, r, 0, Math.PI * 2);
  pen.fill();
  pen.restore();
}

/** One design, drawn on a pen already scaled to 1200 by 1500. */
export function drawCover(pen: CanvasRenderingContext2D, design: CoverDesign, words: Words, colors: CoverColors, family: string) {
  const seed = coverSeed(`${words.title}|${design}`);
  const wobble = (n: number, range: number) => ((seed >> n) % range) - range / 2;
  const M = 110;
  pen.save();
  pen.clearRect(0, 0, W, H);
  if (design === "book") {
    pen.fillStyle = colors.solid;
    pen.fillRect(0, 0, W, H);
    // Shapes behind the words only ever add to their contrast (lib/cover-maker.ts, solidShade).
    circle(pen, W - 120 + wobble(1, 120), 260 + wobble(5, 120), 340, colors.solidShade, 0.55);
    circle(pen, W - 60, H - 140, 200, colors.solidShade, 0.35);
    pen.fillStyle = colors.spine;
    pen.fillRect(0, 0, 72, H);
    pen.fillStyle = colors.solidShade;
    pen.fillRect(72, 0, 5, H);
    const x = M + 40;
    label(pen, family, words.label, x, 230, colors.solidInk, "left");
    const block: Block = { align: "left", x, width: W - x - M, title: words.title, color: colors.solidInk, subColor: colors.solidInk };
    const height = titleBlock(pen, family, words, block, 0, false);
    titleBlock(pen, family, words, block, Math.max(300, (H - height) / 2 + 40), true);
    if (words.name) {
      pen.fillStyle = colors.solidInk;
      pen.fillRect(x, H - 220, 90, 6);
    }
    byline(pen, family, words.name, x, H - 130, colors.solidInk, "left");
  } else if (design === "glow") {
    pen.fillStyle = colors.deep;
    pen.fillRect(0, 0, W, H);
    for (const [cx, cy, r] of [
      [180 + wobble(3, 160), 240 + wobble(9, 160), 760],
      [W - 140 + wobble(7, 160), H - 260 + wobble(13, 160), 820],
    ] as const) {
      const light = pen.createRadialGradient(cx, cy, 0, cx, cy, r);
      light.addColorStop(0, colors.glow);
      light.addColorStop(1, `${colors.glow}00`);
      pen.fillStyle = light;
      pen.fillRect(0, 0, W, H);
    }
    label(pen, family, words.label, W / 2, 250, colors.deepInk, "center");
    const block: Block = { align: "center", x: M, width: W - 2 * M, title: words.title, color: colors.deepInk, subColor: colors.deepInk };
    const height = titleBlock(pen, family, words, block, 0, false);
    titleBlock(pen, family, words, block, Math.max(320, (H - height) / 2), true);
    byline(pen, family, words.name, W / 2, H - 140, colors.deepInk, "center");
  } else if (design === "split") {
    const cut = 640;
    pen.fillStyle = colors.solid;
    pen.fillRect(0, 0, W, cut);
    circle(pen, W - 260 + wobble(2, 140), cut - 40, 300, colors.solidShade, 0.6);
    circle(pen, W - 520 + wobble(6, 140), cut + 30, 170, colors.solidShade, 0.45);
    pen.fillStyle = colors.paper;
    pen.fillRect(0, cut, W, H - cut);
    const initial = Array.from(words.title.trim())[0] ?? "";
    if (initial) {
      setFont(pen, 800, 420, family);
      pen.textAlign = "left";
      pen.fillStyle = colors.solidShade;
      pen.globalAlpha = 0.7;
      pen.fillText(initial.toLocaleUpperCase(), M - 20, cut - 70);
      pen.globalAlpha = 1;
    }
    label(pen, family, words.label, M, 170, colors.solidInk, "left");
    const block: Block = { align: "left", x: M, width: W - 2 * M, title: words.title, color: colors.paperInk, subColor: colors.paperInk, maxLines: 4, max: 132 };
    titleBlock(pen, family, words, block, cut + 90, true);
    byline(pen, family, words.name, M, H - 110, colors.paperAccent, "left");
  } else if (design === "frame") {
    pen.fillStyle = colors.paper;
    pen.fillRect(0, 0, W, H);
    pen.strokeStyle = colors.accent;
    pen.lineWidth = 26;
    pen.strokeRect(60, 60, W - 120, H - 120);
    pen.lineWidth = 3;
    pen.strokeRect(108, 108, W - 216, H - 216);
    pen.fillStyle = colors.accent;
    pen.save();
    pen.translate(W / 2, 330);
    pen.rotate(Math.PI / 4);
    pen.fillRect(-14, -14, 28, 28);
    pen.restore();
    label(pen, family, words.label, W / 2, 270, colors.paperAccent, "center");
    const block: Block = { align: "center", x: 170, width: W - 340, title: words.title, color: colors.paperInk, subColor: colors.paperInk, max: 136 };
    const height = titleBlock(pen, family, words, block, 0, false);
    titleBlock(pen, family, words, block, Math.max(420, (H - height) / 2 + 20), true);
    byline(pen, family, words.name, W / 2, H - 190, colors.paperAccent, "center");
  } else if (design === "stripes") {
    pen.fillStyle = colors.tint;
    pen.fillRect(0, 0, W, H);
    const band = 560;
    pen.save();
    pen.beginPath();
    pen.rect(0, 0, W, band);
    pen.clip();
    const width = 90;
    for (let i = -20; i < 40; i += 1) {
      pen.fillStyle = i % 2 ? colors.accent : colors.light;
      pen.beginPath();
      pen.moveTo(i * width, 0);
      pen.lineTo(i * width + width, 0);
      pen.lineTo(i * width + width - band, band);
      pen.lineTo(i * width - band, band);
      pen.closePath();
      pen.fill();
    }
    pen.restore();
    pen.fillStyle = colors.spine;
    pen.fillRect(0, band, W, 14);
    label(pen, family, words.label, M, band + 130, colors.tintAccent, "left");
    const block: Block = { align: "left", x: M, width: W - 2 * M, title: words.title, color: colors.tintInk, subColor: colors.tintInk, maxLines: 4, max: 132 };
    titleBlock(pen, family, words, block, band + (words.label ? 170 : 110), true);
    byline(pen, family, words.name, M, H - 110, colors.tintAccent, "left");
  } else {
    pen.fillStyle = colors.tint;
    pen.fillRect(0, 0, W, H);
    // Dots only where no word sits: across the top, and in the lower corner.
    for (let y = 70; y < 470; y += 56) {
      for (let x = 70; x < W; x += 56) circle(pen, x, y, 9, colors.accent, 0.35);
    }
    for (let y = H - 300; y < H - 40; y += 56) {
      for (let x = W - 330; x < W - 40; x += 56) circle(pen, x, y, 9, colors.accent, 0.35);
    }
    circle(pen, W - 230 + wobble(4, 100), 300 + wobble(8, 100), 150, colors.accent);
    label(pen, family, words.label, M, 580, colors.tintAccent, "left");
    const block: Block = { align: "left", x: M, width: W - 2 * M, title: words.title, color: colors.tintInk, subColor: colors.tintInk, maxLines: 4, max: 140 };
    titleBlock(pen, family, words, block, words.label ? 630 : 560, true);
    byline(pen, family, words.name, M, H - 110, colors.tintAccent, "left");
  }
  pen.restore();
}

/** Draws a design at a given width, the canvas being 4 to 5. */
function paint(canvas: HTMLCanvasElement, width: number, design: CoverDesign, words: Words, colors: CoverColors, family: string) {
  canvas.width = width;
  canvas.height = Math.round((width * H) / W);
  const pen = canvas.getContext("2d");
  if (!pen) return;
  pen.setTransform(width / W, 0, 0, width / W, 0, 0);
  drawCover(pen, design, words, colors, family);
}

/**
 * The cover maker: the words, six designs drawn from them, and a button that
 * hands the chosen one, at full size, to the picture's own upload.
 */
export function CoverMaker({
  look,
  defaults,
  busy,
  onUse,
  onClose,
}: {
  look: CoverLook;
  defaults: { title: string; label: string; sub: string };
  busy: boolean;
  onUse: (file: File, alt: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(coverText(defaults.title, MAX_COVER_TITLE));
  const [line, setLine] = useState(coverText(defaults.label, MAX_COVER_LABEL));
  const [sub, setSub] = useState(coverText(defaults.sub, MAX_COVER_SUB));
  const [withName, setWithName] = useState(Boolean(look.name));
  const [design, setDesign] = useState<CoverDesign>("book");
  const [ready, setReady] = useState(false);
  const [making, setMaking] = useState(false);
  const canvases = useRef<Record<string, HTMLCanvasElement | null>>({});
  const preview = useRef<HTMLCanvasElement | null>(null);
  const family = useRef("system-ui, sans-serif");
  const colors = coverColors(look.accent);
  const words: Words = {
    title: coverText(title, MAX_COVER_TITLE),
    label: coverText(line, MAX_COVER_LABEL),
    sub: coverText(sub, MAX_COVER_SUB),
    name: withName ? coverText(look.name, 60) : "",
  };

  useEffect(() => {
    let live = true;
    family.current = familyFor(look.font);
    const weights = [500, 600, 700, 800];
    Promise.all(weights.map((weight) => document.fonts.load(`${weight} 64px ${family.current}`).catch(() => [])))
      .catch(() => [])
      .then(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, [look.font]);

  useEffect(() => {
    if (!ready) return;
    for (const each of COVER_DESIGNS) {
      const canvas = canvases.current[each.id];
      if (canvas) paint(canvas, 360, each.id, words, colors, family.current);
    }
    if (preview.current) paint(preview.current, 600, design, words, colors, family.current);
    // Words and colors are read whole on every draw; these are what change them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, title, line, sub, withName, look.accent, design]);

  function use() {
    if (!words.title || busy || making) return;
    setMaking(true);
    const canvas = document.createElement("canvas");
    paint(canvas, W, design, words, colors, family.current);
    canvas.toBlob((blob) => {
      setMaking(false);
      if (!blob) return;
      onUse(new File([blob], "cover.png", { type: "image/png" }), words.title);
    }, "image/png");
  }

  const id = useId().replace(/:/g, "");

  return (
    <section className="mt-3 rounded-2xl border border-line bg-paper p-3 sm:p-4" aria-labelledby={`${id}-h`}>
      <h3 id={`${id}-h`} className="text-sm font-bold text-ink">
        Make a cover
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        Drawn in your store&apos;s color and letters from the words below. Nothing is sent until you press Use this cover.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <div className="grid content-start gap-3">
          <label className="block">
            <span className="field-label">Title on the cover</span>
            <input className="field mt-1" maxLength={MAX_COVER_TITLE} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block">
            <span className="field-label">Small line above the title</span>
            <input className="field mt-1" maxLength={MAX_COVER_LABEL} value={line} onChange={(e) => setLine(e.target.value)} placeholder="For example: Ebook" />
          </label>
          <label className="block">
            <span className="field-label">Line under the title</span>
            <input className="field mt-1" maxLength={MAX_COVER_SUB} value={sub} onChange={(e) => setSub(e.target.value)} placeholder="Optional" />
          </label>
          {look.name ? (
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" className="h-5 w-5" checked={withName} onChange={(e) => setWithName(e.target.checked)} />
              Put {look.name} at the bottom
            </label>
          ) : null}
        </div>
        <canvas
          ref={preview}
          role="img"
          aria-label="The cover as it will be"
          data-preview=""
          width={600}
          height={750}
          className="mx-auto block aspect-[4/5] w-44 rounded-xl bg-sand shadow-md ring-1 ring-line sm:w-full"
        />
      </div>
      <fieldset className="mt-4">
        <legend className="field-label">Design</legend>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {COVER_DESIGNS.map((each) => {
            const chosen = design === each.id;
            return (
              <label
                key={each.id}
                className={`flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-1.5 transition focus-within:ring-2 focus-within:ring-violet-brand ${
                  chosen ? "border-violet-brand bg-violet-brand/5" : "border-line hover:border-violet-brand/50"
                }`}
              >
                <input type="radio" name={`${id}-design`} value={each.id} checked={chosen} onChange={() => setDesign(each.id)} className="sr-only" />
                <canvas
                  ref={(node) => {
                    canvases.current[each.id] = node;
                  }}
                  role="img"
                  aria-label={`The ${each.label} design`}
                  data-design={each.id}
                  width={360}
                  height={450}
                  className="block aspect-[4/5] w-full rounded-lg bg-sand"
                />
                <span className="text-center text-xs font-bold text-ink">{each.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <p className="mt-2 text-xs text-ink-soft">1200 × 1500 pixels. Every word is drawn with enough contrast to read, whatever your color.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary btn-sm" disabled={!words.title || busy || making || !ready} aria-busy={busy || making} onClick={use}>
          {busy || making ? "Making it…" : "Use this cover"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={onClose}>
          Cancel
        </button>
      </div>
    </section>
  );
}
