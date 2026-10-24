# Product opener: pointer delivery across document scrolling

On 24 October 2026, Product action AAA WebKit failed on head885a95a2edf7e6d758e236e8abe46395819d29d4, job121013652826, at1280px with text spacing. The normal first click did not create the title field. Thirty cases ran, one failed.

The bounded native event trace captured trusted pointerdown/mousedown on the enabled Add something to sell button at x227/y874 and scrollY19973. Pointerup/mouseup/click targeted a DIV at the same pointer coordinates after scrollY changed to20009. No page error was recorded. This establishes lost pointer delivery across a scroll change, rather than establishing a missing React handler. It does not alone identify every cause of the scroll.

Global CSS enables smooth document scrolling. Product editing now opts into immediate document scrolling through an SSR data attribute and a narrowly scoped CSS rule. The existing first-click browser regression and native diagnostics remain unchanged; no second click, forced event, pointerdown activation, timeout increase or assertion relaxation is introduced. Full remote verification on the new exact head is required; passing an isolated rerun is insufficient and the original failures remain historical evidence.

This changes motion behavior while the product editor is present, preserving keyboard focus outlines, reduced-motion handling and ordinary action handlers. Added HTML/CSS bytes and style processing are unmeasured, not zero or claimed savings. No provider/Redis operation, send or paid service is added. Sales and financial gates stay closed. This is not whole-product AAA or real-device certification.
