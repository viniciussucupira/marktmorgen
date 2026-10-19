import { LEVELS, LEVEL_NAMES } from "@/lib/path-rules";
import { formatMoney, isCurrency } from "@/lib/money";
export type PathShareInput={level:number;days:number;moneyCents:number|null;currency:string;moneyAt:number|null};
export function pathShare(input:PathShareInput,includeMoney=false):{level:string;days:string;money:string|null;reading:string|null}|null{
 const level=Number.isInteger(input.level)?LEVELS[input.level]:undefined;
 if(!level||!Number.isSafeInteger(input.days)||input.days<1)return null;
 const money=includeMoney===true&&isCurrency(input.currency)&&Number.isSafeInteger(input.moneyCents)&&Number(input.moneyCents)>=0&&input.moneyAt!==null&&Number.isFinite(input.moneyAt)&&input.moneyAt>0&&input.moneyAt<=8.64e15?formatMoney(Number(input.moneyCents),input.currency):null;
 return {level:LEVEL_NAMES[level],days:input.days===1?"1 day on the Path":input.days.toLocaleString("en-US")+" days on the Path",money,reading:money&&input.moneyAt?"Reading: "+new Date(input.moneyAt).toISOString():null};
}
const escapes:Record<string,string>={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"};
const xml=(text:string)=>text.replace(/[&<>"']/g,char=>escapes[char]);
export function pathShareSvg(input:PathShareInput,includeMoney=false):string|null{
 const content=pathShare(input,includeMoney);if(!content)return null;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title"><title id="title">Marktmorgen Path: ${xml(content.level)}, ${xml(content.days)}</title><rect width="1200" height="630" rx="32" fill="#f8f6fc"/><circle cx="1010" cy="180" r="80" fill="none" stroke="#6d28d9" stroke-width="8"/><path d="M960 195a50 50 0 0 1 100 0" fill="#f5b942"/><path d="M945 197h130" stroke="#5b3c09" stroke-width="5"/><g font-family="Arial,sans-serif" fill="#241a36"><text x="70" y="100" font-size="30">Marktmorgen Path</text><text x="70" y="235" font-size="72" font-weight="700">${xml(content.level)}</text><text x="70" y="315" font-size="36">${xml(content.days)}</text>${content.money?`<text x="70" y="405" font-size="30">Sales kept after refunds: ${xml(content.money)}</text><text x="70" y="450" font-size="19">${xml(content.reading || "")}</text>`:""}<text x="70" y="550" font-size="25">Every step is real. Every sale is yours.</text></g></svg>`;
}
