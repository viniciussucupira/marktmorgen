import { newTabWords } from "@/lib/new-tab-words";

/**
 * Said, not shown, inside every link that opens a new tab: a screen reader
 * reads "Its page (opens in a new tab)", so nobody is surprised to find the
 * back button does nothing (WCAG technique G201).
 *
 * Given the store's language, the words are written in it. Inside a part
 * drawn without one (a lesson's comment, a block of a sales page), the span is
 * left empty and app/globals.css writes the words in the language of the
 * nearest `lang` the page declares (every store page declares its own), as
 * generated content, which screen readers read as part of the link's name.
 */
export function NewTab({ language }: { language?: unknown }) {
  return <span className="new-tab-note sr-only">{language === undefined ? null : ` ${newTabWords(language)}`}</span>;
}
