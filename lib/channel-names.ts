/**
 * What each channel is called where a creator reads it: the studio's numbers,
 * the membership numbers and the emails about them. One list, so a channel
 * has one name everywhere.
 */
export const SOURCE_NAMES: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
  x: "X",
  threads: "Threads",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  snapchat: "Snapchat",
  reddit: "Reddit",
  linktree: "Linktree",
  google: "Google",
  bing: "Bing",
  duckduckgo: "DuckDuckGo",
  email: "Email",
  whatsapp: "WhatsApp",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  claude: "Claude",
  gemini: "Gemini",
  copilot: "Copilot",
  deepseek: "DeepSeek",
  grok: "Grok",
  qr: "QR code",
  affiliates: "Affiliates",
  device: "Shared from a phone",
  direct: "Direct, or an app that hides it",
};

/** A channel's name where money is concerned: "direct" there means nothing the store could name. */
export function channelName(source: string): string {
  if (source === "direct" || source === "") return "Direct or unknown";
  if (source === "unrecorded") return "Sold before channels were recorded";
  return SOURCE_NAMES[source] ?? source;
}
