import type {LoopStage} from "./contracts.ts";
const NEXT:Record<LoopStage,readonly LoopStage[]>={audit:["diagnose"],diagnose:["decide"],decide:["assign"],assign:["check"],check:["learn"],learn:["complete","audit"],complete:[]};
export function canAdvance(from:LoopStage,to:LoopStage){return NEXT[from].includes(to)}
export function advance(from:LoopStage,to:LoopStage){if(!canAdvance(from,to))throw new Error(`illegal CEO loop transition: ${from} -> ${to}`);return to}
