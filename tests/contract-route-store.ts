export * from '../lib/store';
export const savedSubscriptions:unknown[]=[];
export const accountStores=async()=>[];
export const setSubscription=async(_ref:unknown,fields:unknown)=>{savedSubscriptions.push(fields);return null;};
