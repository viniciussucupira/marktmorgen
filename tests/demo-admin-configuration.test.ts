import assert from "node:assert/strict";
import test from "node:test";
import { configuredDemoStudioAdmin } from "@/lib/house-store";
import { isOperator } from "@/lib/search-console";
test("demo administrator comes only from validated server configuration",()=>{
 const before=process.env.DEMO_STUDIO_ADMIN;
 try{
  delete process.env.DEMO_STUDIO_ADMIN;
  assert.equal(configuredDemoStudioAdmin(),"");
  for(const value of [null,undefined,"","   ","operator@example.test"])assert.equal(isOperator(value),false);
  process.env.DEMO_STUDIO_ADMIN="  Operator@Example.Test  ";
  assert.equal(configuredDemoStudioAdmin(),"operator@example.test");
  assert.equal(isOperator(" OPERATOR@example.test "),true);
  assert.equal(isOperator("stranger@example.test"),false);
  for(const bad of ["not-an-address","@example.test","operator@","operator@example.test\nstranger@example.test"]){
   process.env.DEMO_STUDIO_ADMIN=bad;
   assert.equal(configuredDemoStudioAdmin(),"");
   assert.equal(isOperator("operator@example.test"),false);
  }
 }finally{if(before===undefined)delete process.env.DEMO_STUDIO_ADMIN;else process.env.DEMO_STUDIO_ADMIN=before;}
});
