import assert from "node:assert/strict";
import { test } from "node:test";
import { agreementEditorVersion } from "../lib/agreement-editor-version";

const version = () => ({ n: 2, title: "  Creator title  ", body: "Creator\n\ntext", lines: [{text:"Exact creator words",quantity:"2",amount:"120.50"}], text:"Exact version text",sha256:"a".repeat(64) });
test("complete read preserves creator text and returns isolated line objects", () => {
  const input=version(), parsed=agreementEditorVersion(input,"usd",2);
  assert.deepEqual(parsed,input); assert.notEqual(parsed?.lines,input.lines);
  assert.notEqual(parsed?.lines[0],input.lines[0]);
});
test("incomplete or stale version never enters the editor", () => {
  for(const input of [null,[],true,"version",{},Object.create(version()),{...version(),n:1},{...version(),n:"2"},{...version(),lines:null},{...version(),lines:new Array(1)}]) assert.equal(agreementEditorVersion(input,"usd",2),null);
  for(const field of ["n","title","body","lines","text","sha256"]) {
    const input: Record<string,unknown>=version(); delete input[field];
    assert.equal(agreementEditorVersion(input,"usd",2),null,field);
  }
  for(const field of ["title","body","text","sha256"]) assert.equal(agreementEditorVersion({...version(),[field]:""},"usd",2),null,field);
  assert.equal(agreementEditorVersion({...version(),title:"a".repeat(121)},"usd",2),null);
  assert.equal(agreementEditorVersion({...version(),body:"a".repeat(12001)},"usd",2),null);
  assert.equal(agreementEditorVersion({...version(),lines:Array(21).fill(version().lines[0])},"usd",2),null);
});
test("one malformed line rejects the whole read without losing preceding lines", () => {
  for(const line of [null,[],{},Object.create(version().lines[0]),{text:"x",quantity:2,amount:"1.00"},{text:"x",quantity:"0",amount:"1.00"},{text:"x",quantity:"101",amount:"1.00"},{text:"x",quantity:"1.5",amount:"1.00"},{text:"x",quantity:"1",amount:"bad"},{text:"x",quantity:"1",amount:"-1.00"},{text:"x".repeat(121),quantity:"1",amount:"1.00"}]) {
    assert.equal(agreementEditorVersion({...version(),lines:[version().lines[0],line]},"usd",2),null);
  }
  assert.ok(agreementEditorVersion({...version(),lines:[]},"usd",2));
  assert.ok(agreementEditorVersion({...version(),lines:[{text:"Free line",quantity:"1",amount:"0.00"}]},"usd",2));
});
