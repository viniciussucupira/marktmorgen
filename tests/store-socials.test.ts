import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MAX_SOCIALS, SOCIALS, SOCIAL_NETWORKS, linkIcon, networkFor, parseSocials, socialShown, socialUrl } from "@/lib/store-socials";
import { BLOCK_WORDS } from "@/lib/buyer-words/blocks";

describe("store profiles elsewhere", () => {
  it("builds a network's own profile address from a handle, with or without @", () => {
    assert.equal(socialUrl("instagram", "@ana.cooks"), "https://www.instagram.com/ana.cooks");
    assert.equal(socialUrl("instagram", "ana.cooks"), "https://www.instagram.com/ana.cooks");
    assert.equal(socialUrl("tiktok", "@ana"), "https://www.tiktok.com/@ana");
    assert.equal(socialUrl("youtube", "ana"), "https://www.youtube.com/@ana");
    assert.equal(socialUrl("x", "@ana_x"), "https://x.com/ana_x");
    assert.equal(socialUrl("substack", "ana"), "https://ana.substack.com/");
    assert.equal(socialUrl("whatsapp", ("+" + "1 (555) 010-0000")), "https://wa.me/15550100000");
  });

  it("keeps a pasted address only on the network's own host, over https", () => {
    assert.equal(socialUrl("instagram", "https://instagram.com/ana"), "https://instagram.com/ana");
    assert.equal(socialUrl("instagram", "instagram.com/ana"), "https://instagram.com/ana");
    assert.equal(socialUrl("youtube", "https://youtu.be/abc"), "https://youtu.be/abc");
    assert.equal(socialUrl("instagram", "https://evil.example/instagram.com"), "");
    assert.equal(socialUrl("instagram", "https://instagram.com.evil.example/ana"), "");
    assert.equal(socialUrl("instagram", "http://instagram.com/ana"), "");
    assert.equal(socialUrl("instagram", "https://user:pw@instagram.com/ana"), "");
    assert.equal(socialUrl("instagram", "javascript:alert(1)"), "");
    assert.equal(socialUrl("spotify", "https://open.spotify.com/artist/1"), "https://open.spotify.com/artist/1");
  });

  it("refuses handles with spaces or odd characters, and networks with no handle form", () => {
    assert.equal(socialUrl("instagram", "ana cooks"), "");
    assert.equal(socialUrl("instagram", "<b>"), "");
    assert.equal(socialUrl("spotify", "ana"), "");
    assert.equal(socialUrl("discord", "ana"), "");
    assert.equal(socialUrl("instagram", ""), "");
    assert.equal(socialUrl("instagram", 5), "");
  });

  it("makes an email a mailto link and a website any public https address", () => {
    assert.equal(socialUrl("email", "ana@example.com"), "mailto:ana@example.com");
    assert.equal(socialUrl("email", "mailto:ana@example.com"), "mailto:ana@example.com");
    assert.equal(socialUrl("email", "ana@"), "");
    assert.equal(socialUrl("website", "example.com"), "https://example.com/");
    assert.equal(socialUrl("website", "https://ana.example/shop"), "https://ana.example/shop");
    assert.equal(socialUrl("website", "https://localhost/x"), "");
    assert.equal(socialUrl("website", "https://127.0.0.1/"), "");
    assert.equal(socialUrl("website", "http://example.com"), "");
  });

  it("parses a kept list safely: known networks, no repeats, at most the limit", () => {
    const list = parseSocials([
      { network: "instagram", url: "ana" },
      { network: "instagram", url: "@ana" },
      { network: "myspace", url: "ana" },
      { network: "tiktok", url: "bad handle" },
      null,
      "x",
      { network: "email", url: "ana@example.com" },
    ]);
    assert.deepEqual(list, [
      { network: "instagram", url: "https://www.instagram.com/ana" },
      { network: "email", url: "mailto:ana@example.com" },
    ]);
    assert.deepEqual(parseSocials("nope"), []);
    const many = Array.from({ length: 20 }, (_, i) => ({ network: "website", url: `https://site${i}.example` }));
    assert.equal(parseSocials(many).length, MAX_SOCIALS);
  });

  it("is idempotent: a saved address parses to itself", () => {
    for (const network of SOCIAL_NETWORKS) {
      const sample = network === "email" ? "ana@example.com" : SOCIALS[network].profile ? (network === "whatsapp" ? ("+" + "15550100000") : "ana") : `https://${SOCIALS[network].hosts[0] ?? "ana.example"}/ana`;
      const url = socialUrl(network, sample);
      assert.ok(url, network);
      assert.deepEqual(parseSocials([{ network, url }]), [{ network, url }], network);
    }
  });

  it("picks the network from a pasted address", () => {
    assert.equal(networkFor("https://www.instagram.com/ana"), "instagram");
    assert.equal(networkFor("tiktok.com/@ana"), "tiktok");
    assert.equal(networkFor("https://twitter.com/ana"), "x");
    assert.equal(networkFor("ana@example.com"), "email");
    assert.equal(networkFor("https://ana.example"), null);
    assert.equal(networkFor("ana"), null);
  });

  it("gives each link on the store page a plain icon for where it goes", () => {
    assert.deepEqual(
      ["https://www.youtube.com/@ana", "https://calendly.com/ana", "https://podcasts.apple.com/x", "https://ana.substack.com", "https://www.etsy.com/shop/ana", "https://example.com", "not a url"].map(linkIcon),
      ["video", "calendar", "mic", "mail", "basket", "link", "link"],
    );
  });

  it("shows where a link goes without the scheme", () => {
    assert.equal(socialShown("https://www.instagram.com/ana"), "instagram.com/ana");
    assert.equal(socialShown("mailto:ana@example.com"), "ana@example.com");
  });

  it("names a profile in every language for screen readers", () => {
    for (const [code, words] of Object.entries(BLOCK_WORDS)) {
      const said = words.socialOn("Ana", "Instagram");
      assert.ok(said.includes("Ana") && said.includes("Instagram"), code);
      assert.ok(words.socialsLabel && words.socialEmail && words.socialWebsite, code);
    }
  });
});
