"use client";

import { pixelSettingsConfirmed } from "@/lib/marketing-settings-response";

import { useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/toast";
import { PIXEL_INFO, PIXEL_KINDS, type PixelKind, type Pixels, hasPixels, readPixels } from "@/lib/pixels";
import { STUDIO_MESSAGES } from "@/lib/studio-messages";

const MESSAGES: Record<string, string> = {
  ...STUDIO_MESSAGES,
  none: "This account has no store yet.",
  signed_out: "Your session ended. Log in again.",
  unavailable: "Stores are not switched on yet, so nothing was saved.",
  server_error: "Something went wrong on our side. Try again in a moment.",
};

const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

/** The creator's Meta, Google, TikTok and Pinterest ids, on their store's pages. */
export function PixelEditor({ pixels, canViewAttribution = false }: { pixels: Pixels; canViewAttribution?: boolean }) {
  const router = useRouter();
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const [draft, setDraft] = useState<Record<PixelKind, string>>(() => ({
    meta: pixels.meta ?? "",
    google: pixels.google ?? "",
    tiktok: pixels.tiktok ?? "",
    pinterest: pixels.pinterest ?? "",
  }));
  const [busy, setBusy] = useState(false);
  const [bad, setBad] = useState<PixelKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const on = PIXEL_KINDS.filter((kind) => pixels[kind]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;
    setError(null);
    const local = readPixels(draft);
    if (!local.ok) {
      setBad(local.bad);
      return;
    }
    setBad(null);
    setBusy(true);
    try {
      const response = await fetch("/api/store/pixels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixels: local.pixels }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: unknown; pixels?: unknown; error?: string; bad?: PixelKind };
      if (pixelSettingsConfirmed(response.ok, data, local.pixels)) {
        if (disclosure.current) disclosure.current.open = false;
        toast("Pixels saved.");
        router.refresh();
        return;
      }
      if (data.error === "format" && data.bad && PIXEL_KINDS.includes(data.bad)) setBad(data.bad);
      else setError((typeof data.error === "string" && Object.prototype.hasOwnProperty.call(MESSAGES, data.error) ? MESSAGES[data.error] : undefined) ?? "Your pixel IDs are still here. Saving could not be confirmed. Reload to check the saved IDs before trying again.");
    } catch {
      setError(MESSAGES.server_error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="pixels-title">
      <h2 id="pixels-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
        Ad pixels
      </h2>
      <p className="mt-2 text-ink-soft">
        Put your Meta, Google, TikTok or Pinterest pixel on your store, so the ads you run can see who visits, who
        starts to pay and who buys, with the amount. Included in your plan.
      </p>

      <nav aria-label="Pixels and attribution" className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <a href="#pixels-title" className="link inline-flex min-h-11 items-center">Pixel IDs</a>
        {canViewAttribution ? <a href="#numbers" className="link inline-flex min-h-11 items-center">Attribution by channel</a> : null}
      </nav>
      <p className="mt-3 text-sm text-ink-soft" data-pixel-consent>Saving an ID does not override consent. Visitors in the configured consent regions, including Brazil, or with an unknown country are asked first. A browser’s Global Privacy Control signal prevents advertising pixels. Attribution is a separate reading of existing payment records; it is not proof that an ad caused a sale.</p>
      <p className="mt-4 text-sm font-semibold text-ink">
        {hasPixels(pixels)
          ? `On: ${on.map((kind) => `${PIXEL_INFO[kind].name} (${pixels[kind]})`).join(", ")}`
          : "No pixel on your store."}
      </p>
      <details ref={disclosure} className="mt-4">
        <summary role="button" aria-disabled={!ready} onClick={(event) => { if (!ready) event.preventDefault(); }} className="btn btn-secondary w-fit cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          {hasPixels(pixels) ? "Change pixels" : "Add a pixel"}
        </summary>
        <form onSubmit={save} className="mt-5" noValidate aria-busy={busy}>
          <fieldset disabled={!ready || busy} className="min-w-0 space-y-4"><legend className="sr-only">Advertising pixel IDs</legend>
          {PIXEL_KINDS.map((kind) => {
            const info = PIXEL_INFO[kind];
            const invalid = bad === kind;
            return (
              <div key={kind} className="block">
                <label htmlFor={`px-${kind}`} className="field-label">{info.label}</label>
                <input
                  id={`px-${kind}`}
                  type="text"
                  inputMode={kind === "meta" || kind === "pinterest" ? "numeric" : "text"}
                  autoComplete="off"
                  spellCheck={false}
                  value={draft[kind]}
                  placeholder={info.example}
                  aria-invalid={invalid}
                  aria-describedby={`px-${kind}-help`}
                  onChange={(e) => setDraft({ ...draft, [kind]: e.target.value })}
                  className="field font-mono"
                />
                <span id={`px-${kind}-help`} className={`mt-1 block text-xs ${invalid ? "font-semibold text-danger" : "text-ink-soft"}`}>
                  {invalid ? `That is not a ${info.label}. A ${info.label} looks like ${info.example}. ${info.where}` : `${info.where} Leave it empty to turn it off.`}
                </span>
              </div>
            );
          })}

          <div className="rounded-[10px] bg-paper px-4 py-3 text-sm text-ink-soft ring-1 ring-line">
            <p>
              Sent to them: a page view on every page of your store, a checkout started when someone presses buy or
              books, a lead when someone asks for something free, and a purchase with its amount once it is paid.
            </p>
            <p className="mt-2">
              These platforms set cookies, so visitors in the EU, Iceland, Liechtenstein, Norway, the UK, Switzerland and
              Brazil, and visitors whose country is not known, are asked first and nothing loads unless they say yes.
              Everywhere else the pixels load unless the visitor&apos;s browser sends a Global Privacy Control signal. The ads, and what you do with what they measure, are yours: say in your own privacy
              notice that you use them.
            </p>
          </div>

          {error ? <p className="notice notice-error" role="alert">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button type="submit" aria-busy={busy} disabled={busy} className="btn btn-primary">
              {busy ? "Saving…" : "Save pixels"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (disclosure.current) disclosure.current.open = false;
                setBad(null);
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
          </fieldset>
        </form>
      </details>
    </section>
  );
}
