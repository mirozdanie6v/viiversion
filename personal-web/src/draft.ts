import { InputError, publicUrl } from "./policy";

export type DraftField = { selector: string; value: string };

export function checkDraftFields(input: unknown): DraftField[] {
  if (!Array.isArray(input) || !input.length || input.length > 5) {
    throw new InputError("Draft must contain between 1 and 5 fields");
  }
  let total = 0;
  return input.map((field: any) => {
    if (!field || typeof field !== "object" || Array.isArray(field) ||
        typeof field.selector !== "string" || !field.selector.trim() ||
        field.selector.length > 160 || typeof field.value !== "string" ||
        field.value.length > 3000) {
      throw new InputError("Invalid draft field selector or value");
    }
    total += field.value.length;
    if (total > 8000) throw new InputError("Draft text exceeds 8000 characters");
    return { selector: field.selector, value: field.value };
  });
}

export function draftTarget(input: unknown, allowHosts?: string): string {
  const url = publicUrl(input, allowHosts);
  // The owner-only draft operation has a strict site allowlist and does not
  // expand privileges using ENABLE_PUBLIC_SITE_READS.
  if (!allowHosts?.trim()) throw new InputError("Draft operation requires ALLOWED_HOSTS", 503);
  return url;
}

export async function fillWithoutSubmit(page: any, input: unknown, origin: string): Promise<{ filled: number; selectors: string[] }> {
  const fields = checkDraftFields(input);
  // Refuse duplicates to keep a predictable one-shot fill.
  if (new Set(fields.map(f => f.selector)).size !== fields.length) throw new InputError("Duplicate draft selector");
  const selectors: string[] = [];
  for (const field of fields) {
    if (new URL(page.url()).origin !== origin) throw new InputError("Page navigated away from draft site", 409);
    const target = page.locator(field.selector);
    const count = await target.count();
    if (count !== 1) throw new InputError("A draft selector must match exactly one field", 409);
    const meta = await target.evaluate((element: Element) => {
      const e = element as HTMLInputElement;
      const tag = element.tagName.toLowerCase();
      return {tag, type: String(e.type ?? "").toLowerCase(),
        auto: String(element.getAttribute("autocomplete") ?? "").toLowerCase(),
        editable: element.getAttribute("contenteditable"),
        disabled: Boolean(e.disabled), readOnly: Boolean(e.readOnly),
        formAction: element.closest("form")?.getAttribute("action") ?? ""};
    });
    if (meta.disabled || meta.readOnly) throw new InputError("Field cannot be edited");
    if (meta.tag !== "textarea" && meta.tag !== "input" &&
        meta.editable !== "true") throw new InputError("Draft supports text fields only");
    if (meta.tag === "input" && !["", "text", "search", "email", "url", "tel"].includes(meta.type)) {
      throw new InputError("Sensitive or non-text input type is prohibited");
    }
    if (/(password|one-time|cc-|new-password|current-password|otp)/.test(meta.auto) ||
        /(password|passcode|token|otp|secret|verification|credit.card|card.number)/i.test(field.selector)) {
      throw new InputError("Sensitive inputs must be filled manually");
    }
    await target.fill(field.value, { timeout: 7000 });
    if (new URL(page.url()).origin !== origin) throw new InputError("Page navigated away from draft site", 409);
    selectors.push(field.selector);
  }
  // Deliberately never click Submit/Save or invoke page.evaluate to set data.
  // Some websites autosave on input/change; we cannot guarantee server immutability.
  return { filled: selectors.length, selectors };
}
