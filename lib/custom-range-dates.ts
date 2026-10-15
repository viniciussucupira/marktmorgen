export type CustomDatePeriod={from:string;to:string};
const DAY=86400000;
const day=(value:string):number|null=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const at=Date.parse(value+"T00:00:00Z");
 return Number.isFinite(at)&&new Date(at).toISOString().slice(0,10)===value?at:null;
};
/** Shift an inclusive UTC period without clipping its duration or crossing retained dates. */
export function adjacentCustomRange(period:CustomDatePeriod,direction:-1|1,today:string):CustomDatePeriod|null {
 const start=day(period.from),end=day(period.to),current=day(today);
 if(start===null||end===null||current===null||start>end||(direction!==-1&&direction!==1))return null;
 const earliest=current-399*DAY;
 if(start<earliest||end>current)return null;
 const shift=(end-start+DAY)*direction;
 const from=start+shift,to=end+shift;
 if(from<earliest||to>current)return null;
 return {from:new Date(from).toISOString().slice(0,10),to:new Date(to).toISOString().slice(0,10)};
}
