export type PathBoardReply={state:"saved"|"refused"|"uncertain";message:string};
const ERRORS:Record<string,string>={
 stale:"Open your Path to refresh its facts before joining.",
 full:"Your data room has no space for this entry. Reload and review your participation.",
 conflict:"Your Path changed while saving. Reload and review your participation.",
 allowance:"Your studio allowance has no room to join right now.",
 consent:"Choose whether to share your mission count before joining.",
 role:"Only the store owner can change board participation.",
};
const uncertain=():PathBoardReply=>({state:"uncertain",message:"Your participation change could not be confirmed. It may have gone through. Refresh this page to review your participation before trying again."});
/** A transport failure may follow a write: never claim privacy withdrawal without acknowledgement. */
export function readPathBoardReply(status:number,body:unknown):PathBoardReply{
 if(!Number.isInteger(status)||!body||typeof body!=="object"||Array.isArray(body))return uncertain();
 const value=body as Record<string,unknown>;
 if(!Object.hasOwn(value,"ok"))return uncertain();
 if(status>=200&&status<300&&value.ok===true)return {state:"saved",message:""};
 if(status>=400&&status<500&&value.ok===false&&Object.hasOwn(value,"error")&&typeof value.error==="string"&&Object.hasOwn(ERRORS,value.error))return {state:"refused",message:ERRORS[value.error]};
 return uncertain();
}
