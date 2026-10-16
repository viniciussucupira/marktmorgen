import { mailAudienceWords, type MailAudienceSelection } from "@/lib/mail-audience-summary";
import { done, is, part } from "./check";
const products = [{ id: "entry", title: "Starter course" }, { id: "offer", title: "Advanced course" }];
const cases: { selection: MailAudienceSelection; kind: string; included: boolean; excluded: boolean }[] = [];
for (const who of ["all", "buyers", "leads"] as const) {
  for (const productId of [null, "entry"]) {
    for (const notProductId of [null, "offer"]) cases.push({ selection: { who, productId, notProductId }, kind: who, included: productId !== null, excluded: notProductId !== null });
  }
}
part("Audience restrictions remain visible in every combination");
for (const entry of cases) {
  const words = mailAudienceWords(entry.selection, products);
  is("correct buyer/lead restriction " + JSON.stringify(entry.selection), [words.includes("Buyers eligible"), words.includes("People who have not bought"), words.includes("Everyone eligible")], [entry.kind === "buyers", entry.kind === "leads", entry.kind === "all"]);
  is("included product restriction remains visible", words.includes("only people who have “Starter course”"), entry.included);
  is("excluded product restriction remains visible", words.includes("excluding people who have “Advanced course”"), entry.excluded);
  is("eligibility remains explicit", words.includes("eligible to receive emails"), true);
}
part("Missing titles do not silently erase product restrictions");
is("missing inclusion stays identifiable", mailAudienceWords({ who: "leads", productId: "missing-a", notProductId: "missing-b" }, []), "People who have not bought and are eligible to receive emails; only people who have product with unavailable title (ID: missing-a); excluding people who have product with unavailable title (ID: missing-b).");
is("blank current title retains product identity", mailAudienceWords({ productId: "entry" }, [{ id: "entry", title: "  " }]).includes("ID: entry"), true);
is("current names are trimmed", mailAudienceWords({ productId: "entry" }, [{ id: "entry", title: "  Renamed course  " }]).includes("“Renamed course”"), true);
is("legacy missing who keeps the documented all default", mailAudienceWords({ productId: null }, products), "Everyone eligible to receive emails.");
is("legacy product still restricts the default audience", mailAudienceWords({ productId: "entry" }, products), "Everyone eligible to receive emails; only people who have “Starter course”.");
const before = JSON.stringify({ cases, products });
for (const entry of cases) mailAudienceWords(entry.selection, products);
is("formatting does not mutate saved selections or catalog", JSON.stringify({ cases, products }), before);
is("same included/excluded product remains explicitly contradictory", mailAudienceWords({ productId: "entry", notProductId: "entry" }, products), "Everyone eligible to receive emails; only people who have “Starter course”; excluding people who have “Starter course”.");
done();
