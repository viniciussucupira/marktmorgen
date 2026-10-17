import {join} from 'node:path';
/** One wiring source for the repository runner and local parallel verification. */
export function testAliases(file,root,here){
 const aliases={'@':root,'@/lib/redis':['range-traffic-coverage.test.ts','stats-traffic-coverage.test.ts'].includes(file)?join(root,'lib/redis.ts'):join(here,'redis-stub.ts')};
 if(['ai-spend.test.ts','ai-spend-provider.test.ts'].includes(file))aliases['@/lib/redis']=join(here,'ai-spend-redis.ts');
 else aliases['@/lib/ai-spend']=join(here,'ai-spend-regression-stub.ts');
 if(file==='upload-budget-routes.test.ts'){
  aliases['@/lib/redis']=join(here,'upload-budget-redis.ts');
  aliases['@/lib/upload-budget-policy']=join(here,'upload-budget-approved-policy.ts');
  for(const name of ['store','catalog','course','delivery','storage-quota','stream','vault','vault-storage','request-guard','store-request','studio-route','blob'])aliases['@/lib/'+name]=join(here,'upload-route-world.ts');
  aliases['@vercel/blob/client']=join(here,'upload-route-world.ts');
 }
 if(file==='mail-reservation.test.ts'){aliases['@/lib/email']=join(here,'mail-reservation-email.ts');aliases['@/lib/ses']=join(here,'mail-reservation-ses.ts');}
 if(file==='traffic-admission.test.ts')for(const name of ['redis','store','delivery','secret-box'])aliases['@/lib/'+name]=join(here,'traffic-admission-world.ts');
 if(file==='upload-budget.test.ts')aliases['@/lib/redis']=join(here,'upload-budget-redis.ts');
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
 return aliases;
}
export function testEnvironment(env){return{...env,NIMBUS_DATA_KEY:env.NIMBUS_DATA_KEY??'tests-only-not-a-real-deployment-secret'};}
