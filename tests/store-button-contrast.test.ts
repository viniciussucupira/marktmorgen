import { ACCENTS, THEMES, contrast, lookColours, mix, parseLook } from "@/lib/store-look";
import { done, is, part } from "./check";

part("Button words and their edge pass together, including custom colors");
const grid = [0, 85, 170, 255];
const custom = grid.flatMap(r => grid.flatMap(g => grid.map(b =>
  "#" + [r,g,b].map(v => v.toString(16).padStart(2,"0")).join(""))));
let minimumText = 99, minimumEdge = 99, minimumGradient = 99;
for (const theme of THEMES) {
  for (const accent of [...ACCENTS.map(a => a.hex), ...custom]) {
    const paint = lookColours({theme:theme.id,accent});
    minimumText = Math.min(minimumText, contrast(paint.accent,paint.onAccent));
    minimumEdge = Math.min(minimumEdge, contrast(paint.accent,paint.card));
    for (let step=0;step<=25;step++) minimumGradient = Math.min(
      minimumGradient,contrast(mix(paint.accent,paint.accent2,step/25),paint.onAccent));
    is("saved color stays unchanged "+theme.id+"/"+accent,parseLook({theme:theme.id,accent}).accent,accent);
  }
}
is("button text at least7:1 without rounding",minimumText>=7,true);
is("button edge at least3:1 on its card",minimumEdge>=3,true);
is("unadorned accent gradient keeps its foreground",minimumGradient>=7,true);
is("former white-on-violet paint does not pass enhanced text",contrast("#ffffff","#5a36ee")<7,true);
done();
