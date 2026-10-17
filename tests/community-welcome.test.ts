/**
 * Welcoming a new member: the creator's questions and the welcome message.
 *
 * Measured before it was built (30 September 2026): Skool asks up to three
 * membership questions on every plan and sends an automatic welcome DM on
 * its $99 plan; Whop sends automatic welcome messages; Circle and Mighty
 * Networks welcome through workflows and AI agents. Here both are on the $29
 * plan. What is checked:
 *
 *   - answers count only when every question asked has one;
 *   - a question reworded later never sits over an old answer: each answer
 *     keeps the question it answered;
 *   - the welcome is sent once, from the creator, and never while private
 *     messages are off.
 */
import { claimHandle, setCommunity } from "@/lib/store";
import { type CommunityConfig, answersFor, freshConfig, memberKey, readMember, touchMember } from "@/lib/community";
import { welcome } from "@/lib/community-access";
import { inbox, thread } from "@/lib/community-dm";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { ROOM } from "./data-room";

async function main(): Promise<void> {
  redis.clear();
  const made = await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  if (!made.ok) throw new Error("no store");
  const id = (await setCommunity("owner@example.com", true))?.community?.id;
  if (!id) throw new Error("no community");
  const ana = memberKey("ana@example.com");
  await touchMember(id, "ana@example.com", null, { sid: "welcome-test" });
  const questions = ["What brought you here?", "What do you want to cook in 90 days?"];

  part("Answers");
  const member = (await readMember(id, ana))!;
  is("a new member has answered nothing", member.qa, 0);
  is("one question left empty is not answered", answersFor(["Sourdough", "  "], questions, 0, 1000).qa, 0);
  const done1 = answersFor(["Sourdough", "A whole Sunday lunch"], questions, 0, 1000);
  is("every question answered is answered, from that moment", done1.qa, 1000);
  is("each answer keeps the question it answered", done1.qq, questions);
  is("and the answers are kept", done1.q, ["Sourdough", "A whole Sunday lunch"]);
  is("changing an answer later keeps when they first answered", answersFor(["Bread", "Lunch"], questions, 1000, 5000).qa, 1000);
  is("an answer past the questions asked is not kept", answersFor(["a", "b", "c"], questions, 0, 1000).q.length, 2);
  is("no questions asked: nothing counts as answered", answersFor([], [], 0, 1000).qa, 0);

  part("The welcome");
  const config: CommunityConfig = { ...freshConfig("Harbor Kitchen"), welcome: "Welcome in! Start with the pinned post.", dm: { on: true, between: false, ask: true } };
  is("sent to a member who has just come in", await welcome(id, config, ana, ROOM), true);
  is("never twice", await welcome(id, config, ana, ROOM), false);
  const conversations = await inbox(id, ana);
  is("it is in their messages", conversations.length, 1);
  const said = await thread(id, ana, conversations[0].pair);
  is("from the creator, with the creator's words", said?.messages.map((m) => [m.a, m.text]), [["creator", "Welcome in! Start with the pinned post."]]);
  is("it waits on nobody: a message from the creator is never a request", said?.pending, false);
  const ben = memberKey("ben@example.com");
  is("nothing while private messages are off", await welcome(id, { ...config, dm: { on: false, between: false, ask: true } }, ben, ROOM), false);
  is("nothing when there is no message", await welcome(id, { ...config, welcome: "  " }, ben, ROOM), false);

  done();
}

void main();
