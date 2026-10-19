import {certificateLevels,pathCertificate,pathCertificateText,pathCertificateHtml,CERTIFICATE_WORDS,CERTIFICATE_PRIVACY,type PathCertificateInput} from "@/lib/path-certificate";
import {LEVEL_NAMES,LEVELS,forbiddenIn} from "@/lib/path-rules";
import {done,is,part} from "./check";
const input:PathCertificateInput={level:3,days:14,recordedAt:Date.UTC(2026,9,18),moneyCents:123400,currency:"usd",moneyAt:Date.UTC(2026,9,19)};
part("Only saved reached levels have private certificates");
is("every reached level is offered",certificateLevels(input),[0,1,2,3]);
for(const level of [-1,4,5,99,NaN,1.5])is("unreached or malformed selection",pathCertificate(input,level),null);
for(const changed of [{level:-1},{level:99},{level:NaN},{recordedAt:0},{recordedAt:1e20},{days:0}])is("unverifiable record has no certificate",certificateLevels({...input,...changed}),[]);
for(const level of certificateLevels(input)){
 const text=pathCertificateText(input,level)!;
 is("correct reached name",pathCertificate(input,level)?.level,LEVEL_NAMES[LEVELS[level]]);
 is("money private by default",/1,234|Sales kept after refunds:/.test(text),false);
 is("explicit money consent",pathCertificateText(input,level,true)?.includes("Sales kept after refunds: $1,234"),true);
 is("money reading separately dated",pathCertificateText(input,level,true)?.includes("Reading: 2026-10-19T00:00:00.000Z"),true);
 is("level recording time is not current money",pathCertificate(input,level)?.reading,"2026-10-18T00:00:00.000Z");
 const html=pathCertificateHtml(input,level)!;
 is("accessible language and heading",html.includes('lang="en-US"')&&html.includes("<main><h1>"),true);
 is("semantic date",html.includes('<time datetime="2026-10-18T00:00:00.000Z">'),true);
 is("no scripts or external resources",/<script|<iframe|<img|href=|src=|https?:\/\//i.test(html),false);
 is("bounded standalone file",Buffer.byteLength(html,"utf8")<4096,true);
 is("default artifact contains no money",html.includes("1,234"),false);
 is("artifact words",forbiddenIn(text),null);
}
is("refund does not revoke saved certificate",certificateLevels({...input,moneyCents:0}),[0,1,2,3]);
is("unknown money stays absent",pathCertificate({...input,moneyCents:null},3,true)?.money,null);
is("invalid currency stays absent",pathCertificate({...input,currency:'"><script>'},3,true)?.money,null);
is("invalid reading stays absent",pathCertificate({...input,moneyAt:1e20},3,true)?.money,null);
for(const text of [...Object.values(CERTIFICATE_WORDS),CERTIFICATE_PRIVACY])is("all controls and privacy pass Path words",forbiddenIn(text),null);
done();
