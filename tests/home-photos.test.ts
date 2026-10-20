/**
 * Every photograph on the home page must be a real one.
 *
 * Written after twenty of twenty-four ids shipped broken: they came from
 * Unsplash's search API, whose `urls.raw` needs query parameters this site
 * does not send, so the bare id resolved to nothing and the page served
 * twenty empty rectangles. The ids below were each loaded in a browser
 * before being written into the source.
 *
 * This test cannot reach the network — the sandbox has no route to the image
 * host — so it checks the two things that failed in practice: that every id
 * on the page is one that was checked by hand, and that no photograph is
 * used so often it stops reading as a market.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Ids confirmed to load, in a browser, before being used anywhere. */
const VERIFIED = new Set([
  "photo-1537861295351-76bb831ece99", "photo-1562577309-d67db487e6cd",
  "photo-1519408469771-2586093c3f14", "photo-1580642682609-8b6ab251fbb7",
  "photo-1620545628446-6319bce6b95c", "photo-1621111848501-8d3634f82336",
  "photo-1632494873717-d630cd5f2634", "photo-1574100004472-e536d3b6bacc",
  "photo-1561070791-2526d30994b5", "photo-1626785774573-4b799315345d",
  "photo-1637270873552-80d3bb9569dd", "photo-1603201667246-3c45012c6d17",
  "photo-1534670007418-fbb7f6cf32c3", "photo-1761628332000-9da4f810183e",
  "photo-1613579917953-d35e6b72d32b", "photo-1528712306091-ed0763094c98",
  "photo-1556911220-e15b29be8c8f", "photo-1653233797467-1a528819fd4f",
  "photo-1518737003272-dac7c4760d5e", "photo-1556911073-a517e752729c",
  "photo-1636647511729-6703539ba71f", "photo-1606787503066-794bb59c64bc",
  "photo-1556910103-1c02745aae4d", "photo-1592837613828-4b65deb44f15",
  "photo-1556908153-1055164fe2df", "photo-1556909114-44e3e70034e2",
  "photo-1556911220-dabc1f02913a", "photo-1625631976982-c6df1654a6ea",
  "photo-1605433246995-23f532d1e001", "photo-1714683237282-4a4623333058",
  "photo-1676496962536-d8ef110ff6f0", "photo-1626444232874-e72c020eeb0e",
  "photo-1761971975962-9cc397e2ba2a", "photo-1763403921315-f2ef8697199f",
  "photo-1761971975651-4fdd4abc200f", "photo-1761971975973-cbb3e59263de",
  "photo-1666478042293-17ea55f33b52", "photo-1666478042301-8a0661bff75e",
  "photo-1666478042162-e3d894a0253e", "photo-1665781665930-43c9bfd33952",
  "photo-1671580704901-98cedb46e06b", "photo-1671581084718-c4c04fc00250",
  "photo-1671581081519-321ab53e0dac", "photo-1671581081106-283f2bcdef71",
  "photo-1671581084367-1bf522951eae", "photo-1613574714687-c33b9e90200d",
  "photo-1740710543611-80b658171bc3", "photo-1649479435119-1d987ed1ae36",
  "photo-1655175468016-a38acfa1277b", "photo-1613463251864-2a2bc3952817",
  "photo-1613463639651-4aca3f3dd83e", "photo-1611248293543-e71973f8b94b",
  "photo-1644375391877-0ae77eeed8fc", "photo-1601397210737-a5534480bdc5",
  "photo-1613746203812-717e6e5db3da", "photo-1614244139209-53c071a4737d",
  "photo-1676742663664-2da16ddcad7a", "photo-1609174112693-52fdcebffd89",
  "photo-1613666517563-d19a4585d1fe", "photo-1627815416399-ddaae0e2fa54",
  "photo-1588702547954-4800ead296ef", "photo-1588873281272-14886ba1f737",
  "photo-1619852182277-79aa23f82c8e", "photo-1616587226960-4a03badbe8bf",
  "photo-1673515335586-f9f662c01482", "photo-1673515334386-2b24073bb22f",
  "photo-1759984782106-4b56d0aa05b8", "photo-1616587896649-79b16d8b173d",
  "photo-1620894169431-a2231552593d", "photo-1516534775068-ba3e7458af70",
  "photo-1712904124132-857e6577aab9", "photo-1760346546839-aced24accdff",
  "photo-1588912914074-b93851ff14b8", "photo-1758599879065-46fd59235166",
  "photo-1590611437626-aa5651e85932", "photo-1573496359142-b8d87734a5a2",
  "photo-1494790108377-be9c29b29330", "photo-1573497019940-1c28c88b4f3e",
  "photo-1484863137850-59afcfe05386", "photo-1580894732444-8ecded7900cd",
  "photo-1581065178047-8ee15951ede6", "photo-1607990283143-e81e7a2c9349",
  "photo-1630939687530-241d630735df", "photo-1589386417686-0d34b5903d23",
  "photo-1573496527892-904f897eb744", "photo-1758691737605-69a0e78bd193",
  "photo-1600679472868-eae382e28b34", "photo-1789757165446-daec9334f72e",
  "photo-1750277389451-67259a1e451a", "photo-1623594675959-02360202d4d6",
  "photo-1544928147-79a2dbc1f389", "photo-1506806732259-39c2d0268443",
  "photo-1516783154360-123b392d0833", "photo-1522065893269-6fd20f6d7438",
  "photo-1618574760337-2750f6251d20", "photo-1757085242652-f8cd4d3de889",
  "photo-1480355781839-51097c7d4f9f", "photo-1673339065030-b3bdb45162f0",
  "photo-1672302255324-28009cc288b2", "photo-1659644569209-1c397e64f7c6",
  "photo-1665953499482-9d8ef74bd269", "photo-1628338243893-056573e389ea",
  "photo-1626252685643-8a305c55e98d", "photo-1560831340-b9679dc9e9f0",
  "photo-1695728130932-7b5967d59f52", "photo-1543871595-e11129e271cc",
  "photo-1758599880979-f6a64947b541", "photo-1780277993159-b4ca60e8922d",
  "photo-1787647090008-4b88ffc977b7", "photo-1765429158141-b283bbe7d0e4",
  "photo-1770393391946-7d9b658deec3", "photo-1775196610640-5e70ef38f846",
  "photo-1780585328302-747a6eee7694", "photo-1535473895227-bdecb20fb157",
]);

const FILES = ["app/page.tsx", "components/home-parts.tsx", "components/home-static.tsx", "components/buyer-path.tsx"];

/*
 * The runner compiles each test into a temporary directory, so a path
 * relative to this file points at nothing. These resolve from the working
 * directory, which is the repository root under `npm test`.
 */
function idsIn(file: string): string[] {
  const src = readFileSync(join(process.cwd(), file), "utf8");
  return src.match(/photo-[0-9a-f]+-[0-9a-f]+/g) ?? [];
}

test("every photograph on the home page was checked by hand", () => {
  for (const file of FILES) {
    for (const id of idsIn(file)) {
      assert.ok(
        VERIFIED.has(id),
        `${file} uses ${id}, which is not in the checked list. Load it in a browser first, then add it.`,
      );
    }
  }
});

test("no photograph appears twice anywhere on the site", () => {
  /*
   * One image, one place. A face or an object the eye has already met
   * reads as the page running out of things to show, so the rule is not
   * "rarely repeated" but "never" — a thumbnail of a picture used large
   * somewhere else counts as the same picture.
   *
   * It counts two things, because the first version of this test counted
   * only one and shipped a repeat: ids written straight into a `src`, and
   * ids held in a constant, where the repeat is the constant being read
   * twice rather than the id being typed twice. A constant named once and
   * used in two <img> tags is still one picture in two places.
   *
   * The several ids inside a `srcSet` are resolutions of one picture, not
   * further uses of it, so they are not counted.
   */
  const where = new Map<string, string>();
  const claim = (id: string, file: string) => {
    const first = where.get(id);
    assert.ok(!first, `${id} is used in ${first} and again in ${file}. Every photograph belongs in one place only.`);
    where.set(id, file);
  };

  for (const file of FILES) {
    const src = readFileSync(join(process.cwd(), file), "utf8");

    for (const [, id] of src.matchAll(/src=\{(?:PHOTO|FACE)\("(photo-[0-9a-f]+-[0-9a-f]+)"/g)) {
      claim(id, file);
    }

    // `const NAME = "photo-…"` used in more than one <img src={…(NAME…)}>
    for (const [, name, id] of src.matchAll(/const ([A-Z][A-Z_0-9]*) = "(photo-[0-9a-f]+-[0-9a-f]+)"/g)) {
      const uses = src.match(new RegExp(`src=\\{\\s*(?:PHOTO|FACE)\\(\\s*${name}\\b`, "g"))?.length ?? 0;
      assert.ok(
        uses <= 1,
        `${file} draws ${name} (${id}) in ${uses} images. Give each one its own photograph.`,
      );
      if (uses === 1) claim(id, file);
    }
  }
});

test("the photographs in a list are all different from each other", () => {
  for (const file of FILES) {
    const src = readFileSync(join(process.cwd(), file), "utf8");
    const ids = [...src.matchAll(/photo:\s*"(photo-[0-9a-f]+-[0-9a-f]+)"/g)].map((m) => m[1]);
    const seen = new Set<string>();
    for (const id of ids) {
      assert.ok(!seen.has(id), `${file} lists ${id} twice.`);
      seen.add(id);
    }
  }
});

test("no British spelling in the things people sell", () => {
  /*
   * The site is American English. "Colour theory classes" shipped on the
   * market strip because the list was written in a hurry; this is the
   * cheapest possible guard against the next one.
   */
  const src = FILES.map(file => readFileSync(join(process.cwd(), file), "utf8")).join("\n");
  const labels = [...src.matchAll(/label:\s*"([^"]+)"/g)].map((m) => m[1]);
  const british = /\b\w*(colour|favourite|organis|centre|licence|catalogue|programme)\w*\b/i;
  for (const label of labels) {
    assert.ok(!british.test(label), `"${label}" is British English. This site is American English.`);
  }
});
