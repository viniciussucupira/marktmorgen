import { confirmedMailPictureUrl } from "@/lib/mail-picture-response";
import { done, is, part } from "./check";
part("Confirmed email picture responses");
const url = "https://marktmorgen.com/api/image/" + "a".repeat(24) + "/" + "b".repeat(32) + ".jpg";
is("confirmed local picture", confirmedMailPictureUrl(true, { ok: true, url }), url);
is("failed HTTP cannot claim success", confirmedMailPictureUrl(false, { ok: true, url }), null);
for (const value of [null, [], "text", 1, {}, { ok: "yes", url }, { ok: 1, url }, { ok: false, url }, { ok: true }, { ok: true, url: 42 }]) {
  is("malformed reply " + JSON.stringify(value), confirmedMailPictureUrl(true, value), null);
}
for (const invalid of ["https://other.example/photo.jpg", "javascript:alert(1)", url + "?track=1", url.replace(".jpg", ".png"), url.replace("/api/image/", "/api/other/"), url + "\n", url.replace("https:", "http:"), url.replace("a".repeat(24), "a".repeat(23))]) {
  is("unsupported picture " + invalid, confirmedMailPictureUrl(true, { ok: true, url: invalid }), null);
}
done();
