// Adapted from Guidepup examples at 274efb894cf26b2962990786723b76cc71fa785d.
// MIT copyright and permission notice: ./GUIDEPUP-LICENSE.txt.
// Navigation setup only; assertions run after the temporary marker is removed.
import {voiceOverKeyCodeCommands,MacOSKeyCodes,macOSActivateId,NVDAKeyCodeCommands,WindowsKeyCodes,WindowsModifiers} from "@guidepup/guidepup";
const pause=()=>new Promise(resolve=>setTimeout(resolve,100));
export async function navigateToContent(reader,page,kind){
 await page.bringToFront();
 if(kind==="nvda"){
  await reader.perform(NVDAKeyCodeCommands.exitFocusMode,{capture:false});
  // The active Playwright tab does not prove NVDA's foreground application.
  const pageTitle=(await page.title()).replace(/\s+/g," ").trim().toLowerCase();
  if(!pageTitle)throw Error("NVDA browser focus requires a nonempty page title");
  let browserFocused=false;
  for(let attempt=0;attempt<=10;attempt++){
   await reader.perform(NVDAKeyCodeCommands.reportTitle);
   const windowTitle=(await reader.lastSpokenPhrase()).replace(/\s+/g," ").trim().toLowerCase();
   console.log("AX2_NVDA_WINDOW_FOCUS:"+JSON.stringify({attempt,pageTitle,windowTitle}));
   if(windowTitle.startsWith(pageTitle)){browserFocused=true;break;}
   if(attempt===10)break;
   await reader.perform({keyCode:[WindowsKeyCodes.Escape],modifiers:[WindowsModifiers.Alt]},{capture:false});
   await new Promise(resolve=>setTimeout(resolve,500));
  }
  if(!browserFocused)throw Error("NVDA foreground window did not match the synthetic page title");
  await page.locator("body").focus();
  await page.locator("body").click({position:{x:1,y:1}});
  await page.locator("body").blur();
  await reader.perform(NVDAKeyCodeCommands.readNextFocusableItem,{capture:false});
  await pause();
  await reader.perform(NVDAKeyCodeCommands.toggleBetweenBrowseAndFocusMode,{capture:false});
  await pause();
  await reader.perform(NVDAKeyCodeCommands.toggleBetweenBrowseAndFocusMode,{capture:false});
  await reader.perform(NVDAKeyCodeCommands.exitFocusMode,{capture:false});
  await reader.perform({keyCode:[WindowsKeyCodes.Home],modifiers:[WindowsModifiers.Control]});
  return;
 }
 await macOSActivateId("org.webkit.Playwright");
 await page.bringToFront();
 const cancel=()=>reader.perform({keyCode:MacOSKeyCodes.Control},{capture:false});
 try{
  await page.evaluate(()=>{
   const marker=document.createElement("input");
   marker.id="__guidepup_marker__";marker.type="text";marker.value="Guidepup Marker";
   marker.readOnly=true;marker.tabIndex=-1;marker.autocomplete="off";
   marker.setAttribute("aria-label","Guidepup Marker");
   marker.style.cssText="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";
   document.body.prepend(marker);
  });
  let opened=false;
  for(let attempt=0;attempt<3;attempt++){
   await cancel();await pause();
   await reader.perform({keyCode:MacOSKeyCodes.Escape},{capture:false});await pause();
   await reader.perform(voiceOverKeyCodeCommands.openItemChooser,{capture:true});
   if((await reader.lastSpokenPhrase()).toLowerCase().includes("item chooser")){opened=true;break;}
  }
  if(!opened)throw Error("VoiceOver item chooser was not announced");
  let selected=false;
  for(let attempt=0;attempt<3&&!selected;attempt++){
   for(const character of "web content"){
    await cancel();await pause();await reader.type(character,{capture:"initial"});
    if((await reader.lastSpokenPhrase()).toLowerCase().includes("web content")){selected=true;break;}
   }
   if(!selected)await reader.perform({keyCode:MacOSKeyCodes.Backspace},{capture:false});
  }
  if(!selected)throw Error("VoiceOver web content item was not announced");
  await reader.perform({keyCode:MacOSKeyCodes.Enter},{capture:false});
  await reader.interact({capture:false});await pause();
  await reader.next();
 }finally{
  await page.evaluate(()=>document.getElementById("__guidepup_marker__")?.remove());
 }
}
