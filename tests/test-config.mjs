import {join} from 'node:path';
/** One wiring source for the repository runner and local parallel verification. */
export function testAliases(file,root,here){
 const aliases={'@':root,'@/lib/redis':['range-traffic-coverage.test.ts','stats-traffic-coverage.test.ts'].includes(file)?join(root,'lib/redis.ts'):join(here,'redis-stub.ts')};
 if(['ai-spend.test.ts','ai-spend-provider.test.ts','automatic-ai-spend.test.ts'].includes(file))aliases['@/lib/redis']=join(here,'ai-spend-redis.ts');
 else aliases['@/lib/ai-spend']=join(here,'ai-spend-regression-stub.ts');
 if(file==='upload-budget-routes.test.ts'){
  aliases['@/lib/redis']=join(here,'upload-budget-redis.ts');
  aliases['@/lib/upload-budget-policy']=join(here,'upload-budget-approved-policy.ts');
  for(const name of ['store','catalog','course','delivery','storage-quota','stream','vault','vault-storage','request-guard','store-request','studio-route','blob','metered-limits'])aliases['@/lib/'+name]=join(here,'upload-route-world.ts');
  aliases['@vercel/blob/client']=join(here,'upload-route-world.ts');
 }
 if(file==='mail-reservation.test.ts'){aliases['@/lib/email']=join(here,'mail-reservation-email.ts');aliases['@/lib/ses']=join(here,'mail-reservation-ses.ts');}
 if(file==='traffic-admission.test.ts')for(const name of ['redis','store','delivery','secret-box'])aliases['@/lib/'+name]=join(here,'traffic-admission-world.ts');
 if(['upload-budget.test.ts','automatic-upload-budget.test.ts'].includes(file))aliases['@/lib/redis']=join(here,'upload-budget-redis.ts');
 if(['commercial-terms-snapshot.test.ts','net-margin.test.ts','customer-base.test.ts','plan-revenue-ceilings.test.ts','commercial-ai-coverage.test.ts'].includes(file))aliases['@/lib/upload-budget-policy']=join(here,'upload-budget-approved-policy.ts');
 if(['commercial-terms-snapshot.test.ts','net-margin.test.ts','customer-base.test.ts','plan-revenue-ceilings.test.ts','commercial-ai-coverage.test.ts'].includes(file))aliases['@/lib/ai-spend-policy']=join(here,'commercial-ai-approved-policy.ts');
 if(file==='ai-spend-provider.test.ts')aliases['@/lib/ai-spend-policy']=join(here,'ai-spend-approved-policy.ts');
 if(['video-admission.test.ts','video-tier.test.ts'].includes(file)){aliases['@/lib/redis']=join(here,'video-admission-redis.ts');aliases['@/lib/stream']=join(here,'video-admission-stream.ts');}
 if(file==='storage-measurement.test.ts')for(const name of ['blob','vault','stream'])aliases['@/lib/'+name]=join(here,'storage-provider-stub.ts');
 if(['exposure-budget.test.ts','exposure-provider.test.ts'].includes(file))aliases['@/lib/redis']=join(here,'exposure-budget-redis.ts');
 if(file==='exposure-provider.test.ts'){
  aliases['@/lib/ai-spend']=join(here,'exposure-ai-spend-stub.ts');
  aliases['@/lib/exposure-budget-policy']=join(here,'exposure-budget-approved-policy.ts');
  aliases['@/lib/commercial-margin']=join(here,'exposure-commercial-context.ts');
 }
 if(file==='exposure-release.test.ts'){
  aliases['@/lib/plan']=join(here,'exposure-release-plan.ts');
  aliases['@/lib/platform-share']=join(here,'exposure-release-share.ts');
  aliases['@/lib/ai-spend-policy']=join(here,'commercial-ai-approved-policy.ts');
  aliases['@/lib/upload-budget-policy']=join(here,'upload-budget-approved-policy.ts');
 }
 if(['contract-funding.test.ts','contract-routes.test.ts'].includes(file)){
  aliases['@/lib/redis']=join(here,'contract-funding-redis.ts');
  aliases['@/lib/ai-spend-policy']=join(here,'commercial-ai-approved-policy.ts');
  aliases['@/lib/upload-budget-policy']=join(here,'upload-budget-approved-policy.ts');
 }
 if(file==='contract-routes.test.ts'){
  aliases['@/lib/contract-funding-rules']=join(here,'contract-funding-approved-policy.ts');
  aliases['@/lib/commercial-margin']=join(here,'contract-commercial-context.ts');
  aliases['@/lib/opening']=join(here,'contract-opening-on.ts');
  aliases['@/lib/studio-route']=join(here,'contract-route-studio.ts');
  aliases['@/lib/billing']=join(here,'contract-route-billing.ts');
  aliases['@/lib/store']=join(here,'contract-route-store.ts');
 }
 if(file==='contract-billing-metadata.test.ts')aliases['@/lib/plan']=join(here,'contract-billing-plan.ts');
 return aliases;
}
export function testEnvironment(env){return{...env,NIMBUS_DATA_KEY:env.NIMBUS_DATA_KEY??'tests-only-not-a-real-deployment-secret'};}
