export * from '../lib/stream';
export const PLAYER_SECONDS=14400;
export const isStreamConfigured=()=>true;
export const streamWatched=async()=>null;
export let players=0;
export function reset(){players=0;}
export async function playerFor(){players++;return{state:'ready',src:'https://example.invalid/player',width:1920,height:1080};}
