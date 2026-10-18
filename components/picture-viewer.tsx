"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { blockWords } from "@/lib/buyer-words/blocks";
import { NewTab } from "@/components/new-tab";

/**
 * A sales page's pictures, seen large without leaving the page (added
 * 8 October 2026). Each picture in a pictures block is a link to the file
 * itself, marked with its block (components/sales-blocks.tsx); this takes
 * over a plain click on one and opens the block's pictures in a dialog —
 * previous and next by button, arrow key or swipe, Escape or Close to go
 * back to where the reader was. Without script, or with a key held to open a
 * new tab, the link does what it always did.
 *
 * The native <dialog> keeps the keyboard inside it while open and hands
 * focus back to the picture it was opened from.
 */
type Shown = { src: string; alt: string; caption: string; width: number; height: number };

export function PictureViewer({ lang }: { lang: unknown }) {
  const w = blockWords(lang);
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<{ items: Shown[]; at: number } | null>(null);
  const swipe = useRef<number | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>("a[data-picture-group]");
      if (!link) return;
      const group = link.dataset.pictureGroup ?? "";
      const links = [...document.querySelectorAll<HTMLAnchorElement>("a[data-picture-group]")].filter((a) => a.dataset.pictureGroup === group);
      const items = links.map((a) => {
        const img = a.querySelector("img");
        return {
          src: a.href,
          alt: img?.alt ?? "",
          caption: a.dataset.caption ?? "",
          width: Number(img?.getAttribute("width")) || 1200,
          height: Number(img?.getAttribute("height")) || 800,
        };
      });
      event.preventDefault();
      setState({ items, at: Math.max(0, links.indexOf(link)) });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const box = dialog.current;
    if (state && box && !box.open) box.showModal();
  }, [state]);

  const go = useCallback((by: -1 | 1) => {
    setState((now) => (now && now.items.length > 1 ? { ...now, at: (now.at + by + now.items.length) % now.items.length } : now));
  }, []);

  const shown = state?.items[state.at] ?? null;
  const many = (state?.items.length ?? 0) > 1;

  return (
    <dialog
      ref={dialog}
      className="pv-dialog"
      aria-label={shown?.alt || w.viewerOriginal}
      onClose={() => setState(null)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(-1);
        if (event.key === "ArrowRight") go(1);
      }}
      onClick={(event) => {
        // A click on the dark around the picture closes it, as on every gallery.
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      {shown && state ? (
        <div
          className="pv-frame"
          onPointerDown={(event) => {
            swipe.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (swipe.current === null) return;
            const moved = event.clientX - swipe.current;
            swipe.current = null;
            if (Math.abs(moved) > 48) go(moved < 0 ? 1 : -1);
          }}
        >
          <div className="pv-top">
            {many ? <p className="pv-count" aria-live="polite">{w.viewerCount(state.at + 1, state.items.length)}</p> : <span />}
            <button type="button" className="pv-button" onClick={() => dialog.current?.close()} aria-label={w.viewerClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={shown.src} src={shown.src} alt={shown.alt} width={shown.width} height={shown.height} className="pv-image" />
          <div className="pv-bottom">
            {many ? (
              <button type="button" className="pv-button" onClick={() => go(-1)} aria-label={w.viewerPrev}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m15 6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
            <div className="pv-caption">
              {shown.caption ? <p>{shown.caption}</p> : null}
              <a href={shown.src} target="_blank" rel="noopener noreferrer" className="pv-original">
                {w.viewerOriginal}
              <NewTab /></a>
            </div>
            {many ? (
              <button type="button" className="pv-button" onClick={() => go(1)} aria-label={w.viewerNext}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
