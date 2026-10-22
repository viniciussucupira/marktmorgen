import {done,is,part} from "./check";
import {readShippingWrite} from "@/lib/shipping-request";
part("Only explicit shipping settings can replace the saved charge");
for(const raw of [undefined,[],{}, {region:"us"}, {price:null,region:"us"}, {price:0,region:"us"}, {price:true,region:"us"}, {price:"1234567890123",region:"us"},Object.create({price:"0",region:"us"})]){
 is("missing or malformed price is refused",readShippingWrite(raw,"usd"),{ok:false,reason:"ship_price"});
}
for(const raw of [{price:"5"}, {price:"5",region:"unknown",countries:["US"]}, {price:"5",region:"custom"}, {price:"5",region:"custom",countries:[]}]){
 is("missing or invalid destination is refused",readShippingWrite(raw,"usd"),{ok:false,reason:"ship_countries"});
}
is("explicit null still stops shipping",readShippingWrite(null,"usd"),{ok:true,shipping:null});
for(const price of ["","0"," 0 "]){
 const result=readShippingWrite({price,region:"us"},"usd");
 is("explicit free shipping remains valid",result.ok && result.shipping?.cents===0,true);
}
const paid=readShippingWrite({price:"7.50",region:"custom",countries:["us","CA"],note:"Ships tomorrow",sku:"Créateur-01"},"usd");
is("paid shipping keeps normalized destination and creator SKU",paid,{ok:true,shipping:{cents:750,region:"custom",countries:["US","CA"],note:"Ships tomorrow",sku:"Créateur-01"}});
const old=readShippingWrite({price:"5",region:"us"},"usd");
is("older client omission preserves SKU merge behavior",old.ok && old.shipping!==null && !Object.hasOwn(old.shipping,"sku"),true);
const clear=readShippingWrite({price:"5",region:"us",sku:""},"usd");
is("explicit empty SKU remains explicit",clear.ok && clear.shipping?.sku==="",true);
is("invalid SKU refuses whole write",readShippingWrite({price:"5",region:"us",sku:"bad\ncode"},"usd"),{ok:false,reason:"ship_sku"});
done();
