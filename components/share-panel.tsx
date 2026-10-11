"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Icon } from "@/components/icons";
import { toast } from "@/components/toast";
import { POST_PLACES, postLink, postName, qrFileName, qrSvg, shareLinks, taggedFor } from "@/lib/share-links";

/**
 * Sharing a page (added 8 October 2026): its address to copy, a QR code to
 * print or put on a slide, and each network's own page to post it from,
 * every link tagged with where it went (lib/share-links.ts) so the studio's
 * numbers say which place brought the visits.
 *
 * The QR code is drawn here from the code's grid, as squares, never from
 * markup handed in, and downloaded as an SVG for print or a PNG for slides.
 */
export function SharePanel({ url, title, what = "page" }: { url: string; title: string; what?: string }) {
  const qrUrl = taggedFor(url, "qr");
  const grid = useMemo(() => {
    try {
      const code = QRCode.create(qrUrl, { errorCorrectionLevel: "M" });
      return { size: code.modules.size, modules: Array.from(code.modules.data, Boolean) };
    } catch {
      return null;
    }
  }, [qrUrl]);
  const svg = grid ? qrSvg(grid.modules, grid.size) : "";
  const [canShare, setCanShare] = useState(false);
  const [postPlace, setPostPlace] = useState("instagram");
  const [post, setPost] = useState("");
  const forPost = postName(post) ? postLink(url, postPlace, post) : "";
  useEffect(() => {
    const id = window.setTimeout(() => setCanShare(typeof navigator.share === "function"), 0);
    return () => window.clearTimeout(id);
  }, []);

  function save(blob: Blob, name: string) {
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1_000);
  }

  function savePng() {
    if (!grid) return;
    const scale = 16;
    const quiet = 4;
    const full = (grid.size + quiet * 2) * scale;
    const canvas = document.createElement("canvas");
    canvas.width = full;
    canvas.height = full;
    const pen = canvas.getContext("2d");
    if (!pen) return;
    pen.fillStyle = "#ffffff";
    pen.fillRect(0, 0, full, full);
    pen.fillStyle = "#000000";
    for (let y = 0; y < grid.size; y += 1) {
      for (let x = 0; x < grid.size; x += 1) {
        if (grid.modules[y * grid.size + x]) pen.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
      }
    }
    canvas.toBlob((blob) => {
      if (blob) save(blob, qrFileName(title, "png"));
    }, "image/png");
  }

  async function copy(text = url) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Link copied.");
    } catch {
      toast("Select the link and copy it.");
    }
  }

  return (
    <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
      <div className="min-w-0 space-y-4">
        <div>
          <label htmlFor="share-url" className="field-label">
            {`Link to this ${what}`}
          </label>
          <div className="flex flex-wrap gap-2">
            <input id="share-url" className="field min-w-0 flex-1" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
            <button type="button" onClick={() => void copy()} className="btn btn-secondary">
              <Icon name="copy" size={16} />
              Copy
            </button>
          </div>
        </div>
        <div>
          <p className="field-label">Post it</p>
          <div className="flex flex-wrap gap-2">
            {shareLinks(url, title).map((link) => (
              <a key={link.place} href={link.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm ring-1 ring-line">
                {link.label}
              </a>
            ))}
            {canShare ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm ring-1 ring-line"
                onClick={() => {
                  navigator.share({ title, url: taggedFor(url, "device") }).catch(() => {});
                }}
              >
                More…
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            Each opens that site&apos;s own page to post from, with the words in; nothing is posted for you. Each link is tagged, so your numbers show which one brought visitors and sales.
          </p>
        </div>
        <div>
          <p className="field-label">A link for one post</p>
          <div className="flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="share-post-place">
              Where the post goes
            </label>
            <select id="share-post-place" className="field w-auto" value={postPlace} onChange={(e) => setPostPlace(e.target.value)}>
              {POST_PLACES.map((p) => (
                <option key={p.place} value={p.place}>
                  {p.label}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="share-post-name">
              Name of the post
            </label>
            <input
              id="share-post-name"
              className="field min-w-0 flex-1"
              placeholder="A name for the post, like october-reel"
              maxLength={60}
              value={post}
              onChange={(e) => setPost(e.target.value)}
            />
          </div>
          {forPost ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <input aria-label="The post's link" className="field min-w-0 flex-1" readOnly value={forPost} onFocus={(e) => e.currentTarget.select()} />
              <button type="button" onClick={() => void copy(forPost)} className="btn btn-secondary">
                <Icon name="copy" size={16} />
                Copy
              </button>
            </div>
          ) : null}
          <p className="mt-1 text-xs text-ink-soft">
            Put this link in one post&apos;s caption or bio, and your numbers show what that post brought: visits, sales and revenue.
          </p>
        </div>
      </div>
      <figure className="flex flex-col items-center gap-2">
        {svg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt={`QR code that opens ${title}`} width={148} height={148} className="rounded-lg ring-1 ring-line" />
        ) : null}
        <figcaption className="text-center text-xs text-ink-soft">For print, slides and talks</figcaption>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm ring-1 ring-line" disabled={!svg} onClick={() => save(new Blob([svg], { type: "image/svg+xml" }), qrFileName(title, "svg"))}>
            <Icon name="download" size={15} />
            SVG
          </button>
          <button type="button" className="btn btn-ghost btn-sm ring-1 ring-line" disabled={!grid} onClick={savePng}>
            <Icon name="download" size={15} />
            PNG
          </button>
        </div>
      </figure>
    </div>
  );
}
