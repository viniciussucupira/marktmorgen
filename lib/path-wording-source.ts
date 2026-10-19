import type {Store} from "@/lib/store";
import type {PathRecord} from "@/lib/path";
import {returnMissionFor} from "@/lib/path";
import {factsFrom} from "@/lib/path-facts";
import {pathProgress} from "@/lib/path-rules";
import {wordingSource,type WordingSource} from "@/lib/path-wording-rules";
/** Derive the instruction again from the selected own store. Browser facts are never inputs. */
export function currentWordingSource(store:Store,record:PathRecord,now=Date.now()):WordingSource|null{
 const returning=returnMissionFor(store,record,now);
 if(returning?.state==="open")return wordingSource(returning);
 const answers={...record.answers,subject:"",skills:""};
 return wordingSource(pathProgress(factsFrom(store,record.counts,record.money),answers,record.startedAt,now).today);
}
