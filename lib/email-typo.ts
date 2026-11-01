/**
 * "Did you mean …?" under an email field (308 [TC1], added 1 November 2026).
 *
 * A buyer who types gmial.com never gets their download link, and a creator
 * who types hotmal.com never gets their login link. This looks at what was
 * typed after the @ and, when it is very close to an address provider that
 * many people in the US, Canada, the UK and the EU use, or ends in a very
 * common misspelling of .com, .net, .org or .co.uk, offers the corrected
 * address. It only offers: nothing is changed without the person's tap,
 * nothing is blocked, and what they typed can be sent as it is.
 *
 * Browser-safe and silent: plain data and a small function, run in the
 * browser, with no request to us or anyone. Nothing typed is kept or sent
 * because of it.
 *
 * Kept narrow on purpose, so an address that is right is never questioned:
 *   - only the part after the @ is ever suggested; the name before it is the
 *     person's own and is never touched;
 *   - a provider in the list, or any domain not close to one, is left alone;
 *   - a domain ending is corrected only from the explicit list below, never
 *     by closeness, because many real endings are one letter apart (.co and
 *     .com, .cm, .om, .ne, .new, .cam, .ong);
 *   - closeness is one edit (a letter added, missing, changed or two
 *     neighbors swapped) for a short domain, two for a long one, and two
 *     providers equally close mean nothing is said;
 *   - the right provider's name under another country's ending is left
 *     alone (outlook.pt is real), except for Gmail and iCloud, which have
 *     one domain only.
 */

/** Address providers widely used in the US, Canada, the UK and the EU. Lowercase. */
export const COMMON_PROVIDERS: readonly string[] = [
  // Global, and the US.
  "gmail.com", "googlemail.com", "yahoo.com", "ymail.com", "rocketmail.com", "hotmail.com", "outlook.com", "live.com", "msn.com",
  "icloud.com", "me.com", "mac.com", "aol.com", "protonmail.com", "proton.me", "pm.me", "mail.com", "gmx.com", "zoho.com",
  "fastmail.com", "hey.com", "comcast.net", "verizon.net", "att.net", "sbcglobal.net", "bellsouth.net", "cox.net", "charter.net",
  "earthlink.net", "optonline.net", "frontier.com", "windstream.net",
  // Canada.
  "yahoo.ca", "hotmail.ca", "live.ca", "outlook.ca", "shaw.ca", "rogers.com", "sympatico.ca", "bell.net", "telus.net", "videotron.ca",
  // The UK and Ireland.
  "yahoo.co.uk", "hotmail.co.uk", "live.co.uk", "outlook.co.uk", "btinternet.com", "sky.com", "virginmedia.com", "talktalk.net",
  "ntlworld.com", "blueyonder.co.uk", "yahoo.ie", "eircom.net",
  // France.
  "yahoo.fr", "hotmail.fr", "live.fr", "outlook.fr", "orange.fr", "wanadoo.fr", "free.fr", "sfr.fr", "laposte.net", "neuf.fr", "bbox.fr",
  // Germany, Austria and Switzerland.
  "yahoo.de", "hotmail.de", "outlook.de", "gmx.de", "gmx.net", "gmx.at", "gmx.ch", "web.de", "t-online.de", "freenet.de", "arcor.de",
  "posteo.de", "mailbox.org", "bluewin.ch", "hispeed.ch", "aon.at",
  // Spain, Italy and Portugal.
  "yahoo.es", "hotmail.es", "outlook.es", "telefonica.net", "yahoo.it", "hotmail.it", "outlook.it", "libero.it", "virgilio.it",
  "tiscali.it", "alice.it", "tin.it", "sapo.pt",
  // The Netherlands and Belgium.
  "ziggo.nl", "kpnmail.nl", "planet.nl", "home.nl", "hotmail.nl", "live.nl", "outlook.nl", "telenet.be", "skynet.be", "hotmail.be",
  // The Nordics, Poland and Czechia.
  "yahoo.se", "hotmail.se", "live.se", "telia.com", "hotmail.dk", "live.dk", "hotmail.no", "online.no", "wp.pl", "o2.pl", "onet.pl",
  "interia.pl", "seznam.cz",
];

/**
 * Misspelled domain endings and what they are surely meant to be. Each key
 * is not a domain ending in use (checked against the root zone's list as
 * known when this was written); one that becomes real is taken out.
 */
export const ENDING_TYPOS: Readonly<Record<string, string>> = {
  con: "com", cmo: "com", ocm: "com", cpm: "com", vom: "com", xom: "com", cim: "com", clm: "com", cok: "com", comm: "com",
  coom: "com", ccom: "com", comn: "com", coim: "com", cpom: "com", "com.com": "com",
  ner: "net", nte: "net", ent: "net", nett: "net", nwt: "net",
  ogr: "org", orgg: "org", prg: "org", irg: "org", otg: "org", rog: "org",
  "co.uj": "co.uk", "co.ik": "co.uk", "cp.uk": "co.uk", "co.ul": "co.uk", "co.jk": "co.uk", "couk": "co.uk", "co.uk.com": "co.uk",
};

const PROVIDERS = new Set(COMMON_PROVIDERS);
/**
 * Providers that have one domain only, anywhere: a Gmail address under another
 * ending is surely a slip. Every other provider has addresses under many
 * country endings (outlook.pt, yahoo.co.jp, protonmail.ch), so for them a
 * different ending after the right name is left alone.
 */
const ONE_DOMAIN = new Set(["gmail", "googlemail", "icloud"]);
const nameOf = (domain: string) => domain.slice(0, domain.indexOf(".") === -1 ? undefined : domain.indexOf("."));

/** Edits between two strings: a letter added, missing or changed, or two neighbors swapped. */
export function editsBetween(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** The closest provider within reach, or null when none is, or when two are equally close. */
function nearestProvider(domain: string): string | null {
  const reach = domain.length >= 10 ? 2 : 1;
  let best: string | null = null;
  let bestEdits = reach + 1;
  let tie = false;
  for (const provider of COMMON_PROVIDERS) {
    if (Math.abs(provider.length - domain.length) > reach) continue;
    const edits = editsBetween(domain, provider);
    if (edits < bestEdits) {
      best = provider;
      bestEdits = edits;
      tie = false;
    } else if (edits === bestEdits) {
      tie = true;
    }
  }
  return best && !tie && bestEdits <= reach ? best : null;
}

/**
 * The address the person probably meant, or null to say nothing. Only the
 * domain changes; what is before the @ stays exactly as typed.
 */
export function suggestEmail(typed: string): string | null {
  const value = typed.trim();
  if (value.length > 254) return null;
  const at = value.lastIndexOf("@");
  if (at <= 0 || at !== value.indexOf("@") || /\s/.test(value)) return null;
  const name = value.slice(0, at);
  const domain = value.slice(at + 1).toLowerCase().replace(/\.+$/, "");
  if (!domain || PROVIDERS.has(domain)) return null;

  // "gmail" with nothing after it: the provider's own name.
  if (!domain.includes(".")) {
    const named = COMMON_PROVIDERS.find((provider) => provider.endsWith(".com") && provider.slice(0, -4) === domain);
    return named ? `${name}@${named}` : null;
  }

  // A misspelled ending first, then the provider it may now spell.
  let fixed = domain;
  for (const [typo, meant] of Object.entries(ENDING_TYPOS).sort(([a], [b]) => b.length - a.length)) {
    if (fixed.endsWith(`.${typo}`)) {
      fixed = `${fixed.slice(0, -typo.length)}${meant}`;
      break;
    }
  }
  if (PROVIDERS.has(fixed)) return `${name}@${fixed}`;
  const near = nearestProvider(fixed);
  if (near && (nameOf(near) !== nameOf(fixed) || ONE_DOMAIN.has(nameOf(near)))) return `${name}@${near}`;
  return fixed !== domain ? `${name}@${fixed}` : null;
}
