import { confirmedRecipientCount, mailAnswer } from "@/lib/mail-response";
import { done, is, part } from "./check";
part("Confirmed recipient previews");
for (const count of [0, 1, 500, Number.MAX_SAFE_INTEGER]) is("confirmed count " + count, confirmedRecipientCount({ok:true,count}), count);
for (const count of [undefined, null, "5", -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER+1, [], {}]) is("unknown count " + String(count), confirmedRecipientCount({ok:true,count}), null);
is("refusal is unknown", confirmedRecipientCount({ok:false,count:3}), null);
is("missing success is unknown", confirmedRecipientCount({count:3}), null);
is("failed HTTP success claim is unknown", confirmedRecipientCount(mailAnswer(false,{ok:true,count:3})), null);
done();
