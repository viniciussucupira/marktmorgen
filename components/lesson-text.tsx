import { Fragment } from "react";
import { NewTab } from "@/components/new-tab";

/**
 * A lesson's text, the way the creator typed it: paragraphs separated by a
 * blank line, lines starting with "- " as a list, and web addresses that can
 * be clicked. Nothing else is interpreted, so nothing a creator types can
 * turn into markup on a student's screen.
 */
const URL_PATTERN = /(https:\/\/[^\s<>"')\]]+)/g;

function Linked({ text }: { text: string }) {
  const parts = text.split(URL_PATTERN);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow ugc" className="break-words underline underline-offset-2">
            {part}
          <NewTab /></a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

const BULLET = /^[-•]\s+/;

/** A block split into runs: plain lines, and lines that are list items. */
function runs(block: string): { list: boolean; lines: string[] }[] {
  const out: { list: boolean; lines: string[] }[] = [];
  for (const line of block.split("\n")) {
    const list = BULLET.test(line);
    const last = out[out.length - 1];
    if (last && last.list === list) last.lines.push(line);
    else out.push({ list, lines: [line] });
  }
  return out;
}

export function LessonText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return (
    <div className="space-y-4 leading-relaxed">
      {blocks.flatMap((block, i) =>
        runs(block).map((run, j) =>
          run.list ? (
            <ul key={`${i}-${j}`} className="list-disc space-y-1 pl-6">
              {run.lines.map((line, k) => (
                <li key={k}>
                  <Linked text={line.replace(BULLET, "")} />
                </li>
              ))}
            </ul>
          ) : (
            <p key={`${i}-${j}`} className="whitespace-pre-line break-words">
              <Linked text={run.lines.join("\n")} />
            </p>
          ),
        ),
      )}
    </div>
  );
}
