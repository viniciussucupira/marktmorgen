import { done, is, part } from "./check";
import { confirmsOptionWrite } from "@/lib/option-confirmation";
part("Price changes need an explicit successful acknowledgment");
for (const raw of [null, [], {}, {ok:"true"}, {ok:1}, {ok:false},
  {ok:true,error:"server_error"}, {ok:true,error:null}, Object.create({ok:true})]) {
  is("an uncertain response cannot confirm a price write", confirmsOptionWrite(raw,true),false);
}
is("HTTP errors cannot confirm even with a success body",confirmsOptionWrite({ok:true},false),false);
is("the route's exact acknowledgment confirms",confirmsOptionWrite({ok:true},true),true);
done();
