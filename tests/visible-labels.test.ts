/**
 * A label always visible (487 [IT4], item 4; added 1 November 2026;
 * docs/ease-patterns-audit.md): fields fixed in the first pass keep a label
 * a sighted person reads, tied to the field, not a name only a screen
 * reader hears.
 */
import { readFileSync } from "node:fs";
import { done, is } from "./check";

const podcast = readFileSync("components/podcast-editor.tsx", "utf8");
is("the episode's title has a visible label tied to it", podcast.includes('<label htmlFor={`${id}-title`} className="field-label">Episode title</label>') && podcast.includes("<input id={`${id}-title`}"), true);
is("and its notes", podcast.includes('<label htmlFor={`${id}-notes`} className="field-label">Episode notes</label>') && podcast.includes("<textarea id={`${id}-notes`}"), true);
is("no aria-label stands in for them any more", /aria-label="(Title|Notes)"/.test(podcast), false);
done();
