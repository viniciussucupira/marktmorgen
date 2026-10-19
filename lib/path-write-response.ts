export type PathWriteReply={state:"saved"|"refused"|"uncertain";message:string};
const ERRORS:Record<string,string>={
 invalid:"Review your answers and try again. Your entries are still here.",
 full:"Your store has no room to keep this right now. Your entries are still here.",
 conflict:"Your Path changed while saving. Reload and review it before trying again. Your entries are still here.",
 role:"Only the store owner can change this Path.",
};
const uncertain=():PathWriteReply=>({state:"uncertain",message:"The request could not be confirmed. Your entries are still here. Copy any entries you want to keep, then refresh this page before trying again."});
/** A failure can follow a write; only an explicit successful acknowledgement reloads. */
export function readPathWriteReply(status:number,body:unknown):PathWriteReply{
 const success=status>=200&&status<300;
 if(!Number.isInteger(status)||!body||typeof body!=="object"||Array.isArray(body))return uncertain();
 const value=body as Record<string,unknown>;
 if(!Object.hasOwn(value,"ok"))return uncertain();
 if(success&&value.ok===true)return {state:"saved",message:""};
 if(status>=400&&status<500&&value.ok===false&&Object.hasOwn(value,"error")&&typeof value.error==="string"&&Object.hasOwn(ERRORS,value.error))return {state:"refused",message:ERRORS[value.error]};
 return uncertain();
}
