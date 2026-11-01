import assert from 'node:assert/strict';
import {test} from 'node:test';
import {auditCourseMail,proveAvailableCourseMail} from './course-link-mail-world';
const proof=auditCourseMail();
test('known-unavailable course-link attempt preserves the buyer access allowance',async()=>{const r=await proof;assert.equal(r.requirements.noAllowanceSpentOnKnownUnavailable,true);});
test('known-unavailable course-link attempt mints no unreachable token',async()=>{const r=await proof;assert.equal(r.requirements.noUndeliverableToken,true);});
test('known-unavailable course-link requests avoid entitlement lookup',async()=>{const r=await proof;assert.equal(r.requirements.noEntitlementLookupWhenKnownUnavailable,true);});
test('known-unavailable public course-link replies cannot reveal entitlement',async()=>{const r=await proof;assert.equal(r.requirements.uniformPublicResponseWhenKnownUnavailable,true);});

test('configured SES preserves original links, imported rights, validation and rate guards',async()=>{await proof;await proveAvailableCourseMail();});

test('known global refusal adds no token, allowance or rate command',async()=>{const r=await proof;assert.ok(r.direct.every(x=>x.commands===0));assert.equal(r.request.entitled.commands,0);assert.equal(r.request.unentitled.commands,0);});
