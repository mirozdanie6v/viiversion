import { InputError, publicUrl } from "./policy";

export interface ActionPlan {
  url: string;
  actions: Array<Record<string, string | number>>;
}

/** Strictly bounded actions require a separate one-time user approval. */
export function normalizeActionPlan(input: Record<string, any>, hosts: string | undefined): ActionPlan {
  const url = publicUrl(input.url, hosts);
  if (!Array.isArray(input.actions) || !input.actions.length || input.actions.length > 5) {
    throw new InputError("One to five actions required");
  }
  const actions = input.actions.map((raw: any) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new InputError("Invalid action");
    if (["click", "fill", "select"].includes(raw.type)) {
      if (typeof raw.selector !== "string" || !raw.selector || raw.selector.length > 160) {
        throw new InputError("Invalid CSS selector");
      }
      if (raw.type === "click") return { type: raw.type, selector: raw.selector };
      if (typeof raw.value !== "string" || raw.value.length > 1500) throw new InputError("Invalid field data");
      return { type: raw.type, selector: raw.selector, value: raw.value };
    }
    if (raw.type === "scroll" && Number.isInteger(raw.pixels) && Math.abs(raw.pixels) <= 2400) {
      return { type: "scroll", pixels: raw.pixels };
    }
    if (raw.type === "wait" && Number.isInteger(raw.milliseconds) &&
        raw.milliseconds >= 0 && raw.milliseconds <= 2000) {
      return { type: "wait", milliseconds: raw.milliseconds };
    }
    throw new InputError("Unsupported action type");
  });
  return { url, actions };
}
export async function digestPlan(plan: ActionPlan): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(plan)));
  return [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2, "0")).join("");
}
export function summaryPlan(plan: ActionPlan) {
  return plan.actions.map((a, i) => ({
    index: i + 1, type: a.type,
    ...("selector" in a ? { selector: a.selector } : {}),
    ...("value" in a ? { value: "[hidden]" } : {}),
    ...("pixels" in a ? { pixels: a.pixels } : {})
  }));
}
