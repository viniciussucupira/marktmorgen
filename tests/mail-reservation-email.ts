export * from '../lib/email';
export const hasResend=()=>true;
export const sentThisMonth=async()=>0;
export const sendEmail=async(..._args:unknown[]):Promise<boolean>=>{throw Error('Unexpected email dispatch in reservation-only test');};

export const dispatch={calls:0,outcome:'retry' as 'sent'|'retry'|'refused'};
export async function sendBatch(..._args:unknown[]):Promise<'sent'|'retry'|'refused'>{dispatch.calls++;return dispatch.outcome;}
