import { subjectTestPreview } from "@/lib/mail-test-preview";
import { done, is, part } from "./check";
const asked = { subjectB: "Second subject", share: 20, hours: 4, by: "visits" };
part("Preview allocation follows actual subject-test boundaries");
for (const [total, share, a, b, rest] of [[100,20,10,10,80],[101,30,15,15,71],[103,30,16,15,72],[105,50,27,26,52],[120,20,12,12,96],[1000,50,250,250,500]]) {
  const preview = subjectTestPreview("First subject", { ...asked, share }, total);
  is("allocation for " + total + " at " + share + "%", preview.state === "ready" ? [preview.a, preview.b, preview.rest] : null, [a,b,rest]);
  is("every confirmed recipient remains accounted for", preview.state === "ready" ? preview.a + preview.b + preview.rest : null, total);
}
part("Unknown or too small audiences cannot produce a usable preview");
for (const reach of [null, undefined, "100", NaN, Infinity, -1, 100.5, Number.MAX_SAFE_INTEGER + 1]) is("unknown audience " + String(reach), subjectTestPreview("First subject", asked, reach).state, "audience");
for (const reach of [0,1,99]) is("below minimum " + reach, subjectTestPreview("First subject", asked, reach).state, "small");
is("minimum audience works", subjectTestPreview("First subject", asked, 100).state, "ready");
part("Normalized identical or empty subjects stop the test");
for (const [a,b] of [["First subject","first subject"],[" First  subject ","FIRST SUBJECT"],["First subject","  "],["", "Second subject"],["A".repeat(150)+"x","A".repeat(150)+"y"]]) is("invalid pair after normalization", subjectTestPreview(a,{...asked,subjectB:b},100).state,"subject");
is("missing experiment settings refused", subjectTestPreview("First subject",null,100).state,"subject");
const normalized = subjectTestPreview("  First\n subject  ", { subjectB: " Second\t subject ", share: 123, hours: -1, by: "opens" }, 120);
is("preview uses the server normalized subjects and default choices", normalized, { state:"ready",subjectA:"First subject",subjectB:"Second subject",a:12,b:12,rest:96,share:20,hours:4,by:"visits" });
for (const by of ["sales","visits"] as const) {
  const p = subjectTestPreview("First subject",{...asked,by,hours:24},120);
  is("selected criterion remains explicit", p.state === "ready" ? [p.by,p.hours] : null,[by,24]);
}
const before = JSON.stringify(asked);
subjectTestPreview("First subject",asked,100);
is("preview never mutates experiment configuration",JSON.stringify(asked),before);
done();
