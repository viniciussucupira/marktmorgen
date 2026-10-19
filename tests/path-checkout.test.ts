import { pathCheckoutNotice } from "@/lib/path-checkout";
import { dayMissions, NO_FACTS } from "@/lib/path-rules";
import { done, is, part } from "./check";
const ready={plansOpen:true,suspended:false,checkoutReady:true,testMode:false};
part("Checkout context cannot present a closed, paused or test store as live");
is("live configuration",pathCheckoutNotice(ready).state,"live");
is("preview overrides configured checkout",pathCheckoutNotice({...ready,plansOpen:false}).state,"preview");
is("paused overrides configured checkout",pathCheckoutNotice({...ready,suspended:true}).state,"paused");
is("payment setup",pathCheckoutNotice({...ready,checkoutReady:false}).state,"setup");
is("test mode",pathCheckoutNotice({...ready,testMode:true}).state,"test");
for(const plansOpen of [true,false])for(const suspended of [true,false])for(const checkoutReady of [true,false])for(const testMode of [true,false]) {
 const notice=pathCheckoutNotice({plansOpen,suspended,checkoutReady,testMode});
 if(!plansOpen||suspended||!checkoutReady||testMode)is("cannot advertise live "+JSON.stringify({plansOpen,suspended,checkoutReady,testMode}),notice.state==="live",false);
}
is("test mode explicitly rejects a real card",pathCheckoutNotice({...ready,testMode:true}).body.includes("never use a real card"),true);
part("Preparing a product is distinct from a real sale");
const answers={minutes:60 as const,audience:"none" as const,subject:"",skills:""};
const missions=dayMissions({...NO_FACTS,productWithFile:true,listedProducts:1},answers);
is("preparation title",missions[1].title,"Prepare your first digital product");
is("prepared product has its own fact",missions[1].state,"done");
is("preparation is not a real sale",missions[6].state,"open");
is("promotion waits for live checkout",missions[6].steps[0].startsWith("Once your live checkout is available"),true);
is("a note requires marketing consent",missions[6].steps.some(step=>step.includes("If they agreed to marketing")),true);
done();
