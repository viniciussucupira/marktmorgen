import assert from "node:assert/strict";
import test from "node:test";
import {BLOG_POSTS,postBySlug} from "@/lib/blog";
import {CREATOR_GUIDE_SLUGS} from "@/lib/evergreen-guides";
import {findPage} from "@/lib/site-pages";
test("evergreen cluster preserves unique existing URLs and substantive, distinct guides",()=>{
 assert.equal(CREATOR_GUIDE_SLUGS.length,5);assert.equal(new Set(BLOG_POSTS.map(post=>post.slug)).size,BLOG_POSTS.length);
 const questions=new Set<string>();
 for(const slug of CREATOR_GUIDE_SLUGS){
 const post=postBySlug(slug);assert.ok(post,slug);assert.ok(post.faq&&post.faq.length>=3);
 assert.ok(JSON.stringify(post.body).split(/\s+/).length>=500,slug+" must contain practical detail");
 for(const item of post.faq){assert.ok(item.q.length>20&&item.a.length>60);assert.equal(questions.has(item.q),false);questions.add(item.q);}
 const hrefs=post.body.flatMap(block=>block.type==="links"?block.items.map(item=>item.href):[]);
 assert.ok(hrefs.some(href=>href.startsWith("/platform/")),slug);
 for(const href of hrefs){if(href.startsWith("/platform/"))assert.ok(findPage("platform",href.split("/").at(-1)!));if(href.startsWith("/blog/"))assert.ok(postBySlug(href.split("/").at(-1)!));}
 }
 assert.ok(postBySlug("sell-a-digital-file-from-your-bio")!.body.some(block=>block.type==="h2"&&block.text==="Check the file a buyer will actually receive"));
});
