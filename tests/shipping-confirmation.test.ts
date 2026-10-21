import { done,is,part } from "./check";
import { confirmsShipping } from "@/lib/shipping-confirmation";
import { parseShipping } from "@/lib/shipping";
part("Shipping saves require matching saved facts");
const shipping=parseShipping({cents:500,region:"custom",countries:["US","CA"],note:"Ships tomorrow",sku:"Créateur-01"})!;
const product={id:"physical_1",shipping};
const good={ok:true,product};
for(const raw of [null,[],{}, {ok:"true",product},{ok:true},{ok:true,product:{}},{ok:true,product:{...product,id:"other"}},{...good,error:"unknown"},{ok:true,product:{id:product.id,shipping:null}},{ok:true,product:{...product,shipping:{...shipping,cents:"500"}}},{ok:true,product:{...product,shipping:{...shipping,cents:501}}},{ok:true,product:{...product,shipping:{...shipping,sku:"different"}}},Object.create(good)]){
 is("unknown or mismatched save stays uncertain",confirmsShipping(raw,true,product.id,shipping),false);
}
is("HTTP failure is not a saved shipping confirmation",confirmsShipping(good,false,product.id,shipping),false);
is("matching saved shipping is confirmed",confirmsShipping(good,true,product.id,shipping),true);
is("stopping shipping requires explicit null",confirmsShipping({ok:true,product:{id:product.id,shipping:null}},true,product.id,null),true);
is("missing shipping cannot confirm stop",confirmsShipping({ok:true,product:{id:product.id}},true,product.id,null),false);
is("physical shipping cannot confirm stop",confirmsShipping(good,true,product.id,null),false);
done();
