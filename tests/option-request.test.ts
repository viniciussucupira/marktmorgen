import { done, is, part } from "./check";
import { readOptionDirection } from "@/lib/option-request";
part("Reordering a price requires an explicit direction");
for (const raw of [null, [], {}, {direction:null}, {direction:false}, {direction:0},
  {direction:""}, {direction:"UP"}, {direction:"down "}, {direction:"sideways"},
  Object.create({direction:"up"}), Object.create({direction:"down"})]) {
  is("an invalid move is refused instead of defaulting down",readOptionDirection(raw),null);
}
is("the existing up action stays up",readOptionDirection({direction:"up"}),"up");
is("the existing down action stays down",readOptionDirection({direction:"down"}),"down");
done();
