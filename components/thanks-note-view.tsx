import { PlainText } from "@/components/sales-blocks";
import { VideoEmbed } from "@/components/video-embed";
import { linkHost } from "@/lib/product-link";
import type { ThanksNote } from "@/lib/thanks-note";
import { NewTab } from "@/components/new-tab";

/**
 * The creator's own note after paying (lib/thanks-note.ts), on the thank-you
 * page under what was bought: their words, their video, and one button that
 * opens in a new tab and says where it goes.
 */
export function ThanksNoteView({ note, heading, lang, preview = false }: { note: ThanksNote; heading: string; lang: string; preview?: boolean }) {
  return (
    <section aria-labelledby="note-title" className="st-card mt-6 p-7 sm:p-10">
      <h2 id="note-title" className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em]">
        {note.heading || heading}
      </h2>
      {note.body ? <PlainText text={note.body} preview={preview} className="mt-3" /> : null}
      {note.video ? (
        <div className="mt-5">
          <VideoEmbed video={note.video} title={note.heading || heading} poster={null} inert={preview} lang={lang} />
        </div>
      ) : null}
      {note.button ? (
        <div className="mt-6">
          <a href={preview ? undefined : note.button.url} target="_blank" rel="noopener noreferrer nofollow" className="btn st-btn">
            {note.button.label}
          <NewTab /></a>
          <p className="st-muted mt-2 text-xs">{linkHost(note.button.url)}</p>
        </div>
      ) : null}
    </section>
  );
}
