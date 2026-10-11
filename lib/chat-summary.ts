/**
 * The weekly and monthly numbers posted to a Slack or Discord channel (added
 * 11 October 2026), as Polar sends its summary to Slack and Baremetrics
 * posts to it: a team that lives in a chat sees the week where it already
 * looks, without anybody forwarding an email.
 *
 * The creator pastes an incoming webhook address made in their own Slack
 * (Apps, Incoming Webhooks) or Discord (Server settings, Integrations,
 * Webhooks). Only those two kinds of address are taken, so this can never be
 * pointed at anything else, and the address is sealed before it is kept
 * (lib/secret-box.ts), because whoever holds it can post to that channel. A
 * message is sent when it is saved, so a wrong address is said to be wrong at
 * once. What is posted is the same summary the email carries — totals,
 * channels, what is worth knowing — never a buyer's name or address.
 *
 *   nl:chatsum:<handle>   sealed address
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { seal, unseal } from "@/lib/secret-box";

export type ChatKind = "slack" | "discord";

const key = (handle: string) => `nl:chatsum:${handle}`;
const context = (handle: string) => `chat-summary|${handle}`;
const SLACK = /^https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9_/-]{10,200}$/;
const DISCORD = /^https:\/\/(?:discord|discordapp)\.com\/api\/webhooks\/\d{5,30}\/[A-Za-z0-9_-]{20,200}$/;

/** Which chat an address belongs to, or null when it is neither. */
export function chatKind(raw: unknown): ChatKind | null {
  const text = typeof raw === "string" ? raw.trim() : "";
  return SLACK.test(text) ? "slack" : DISCORD.test(text) ? "discord" : null;
}

/** What is posted, in the shape each takes: Slack's text with its three marks escaped, Discord's content under its 2,000 characters and with nobody pinged. */
export function chatBody(kind: ChatKind, text: string): Record<string, unknown> {
  if (kind === "slack") return { text: text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 3900) };
  return { content: text.length > 1990 ? `${text.slice(0, 1985)}…` : text, allowed_mentions: { parse: [] } };
}

/** Posts one message to an address; whether the chat took it. */
export async function postToChat(url: string, text: string): Promise<boolean> {
  const kind = chatKind(url);
  if (!kind) return false;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chatBody(kind, text)),
      redirect: "error",
      signal: AbortSignal.timeout(8_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Which chat the store posts to, never the address. */
export async function chatSetup(handle: string): Promise<ChatKind | null> {
  const url = await chatAddress(handle);
  return url ? chatKind(url) : null;
}

/** The kept address, opened; null with none, or one that can no longer be read. */
export async function chatAddress(handle: string): Promise<string | null> {
  if (!isRedisConfigured()) return null;
  const [raw] = await redisPipeline([["GET", key(handle)]]);
  if (typeof raw !== "string" || !raw) return null;
  const opened = unseal(raw, context(handle));
  return opened.ok && chatKind(opened.value) ? opened.value : null;
}

/**
 * Keeps an address, after a first message to it went through; or forgets it
 * (empty). "invalid" for an address of neither kind, "refused" when the chat
 * did not take the first message.
 */
export async function setChatAddress(handle: string, storeName: string, raw: unknown): Promise<"saved" | "removed" | "invalid" | "refused"> {
  const url = typeof raw === "string" ? raw.trim() : "";
  if (!url) {
    await redisPipeline([["DEL", key(handle)]]);
    return "removed";
  }
  if (!chatKind(url)) return "invalid";
  const ok = await postToChat(url, `Marktmorgen will post ${storeName}'s numbers here: the week every Monday, and the month on the 1st.`);
  if (!ok) return "refused";
  await redisPipeline([["SET", key(handle), seal(url, context(handle))]]);
  return "saved";
}

/** A message from the email's text, without the email's own last lines about stopping it. */
export function forChat(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/^You get this |^To stop |stop it: https?:\/\//.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
