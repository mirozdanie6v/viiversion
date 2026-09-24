import type { WorkflowId } from "./workflows";

export type CommandId = "CMD-SITE" | "CMD-SALES" | "CMD-PROPOSAL" | "CMD-BRAND";

interface CommandDefinition {
  command_id: CommandId;
  workflow_id: WorkflowId;
  aliases: readonly string[];
}

const COMMANDS: readonly CommandDefinition[] = [
  { command_id: "CMD-SITE", workflow_id: "website", aliases: ["САЙТ", "SITE", "/SITE"] },
  { command_id: "CMD-SALES", workflow_id: "sales", aliases: ["ПРОДАЖИ", "SALES", "/SALES"] },
  { command_id: "CMD-PROPOSAL", workflow_id: "proposal", aliases: ["КП", "PROPOSAL", "/PROPOSAL", "/KP"] },
  { command_id: "CMD-BRAND", workflow_id: "brand_governance", aliases: ["БРЕНД", "BRAND", "/BRAND"] },
] as const;

export interface ResolvedCommand {
  command_id: CommandId;
  workflow_id: WorkflowId;
  matched_trigger: string;
  payload: string;
}

export function resolveCommand(input: string): ResolvedCommand | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const [first, ...rest] = trimmed.split(/\s+/u);
  const token = first.toUpperCase();

  for (const command of COMMANDS) {
    if (command.aliases.some(alias => alias.toUpperCase() === token)) {
      return {
        command_id: command.command_id,
        workflow_id: command.workflow_id,
        matched_trigger: first,
        payload: rest.join(" ").trim(),
      };
    }
  }

  return null;
}
