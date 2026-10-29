import type { D1 } from "./d1-repository.ts";

// M0B is a secure *receipt and recovery* slice, not autonomous context extraction.
// The caller may provide an excerpt or summary; source-chat identity and
// completeness are NEVER inferred from caller-provided strings.
export type CaptureKind = "verbatim" | "structured_excerpt" | "model_summary" | "unknown";
export type CoverageStatus = "unknown" | "partial" | "verified_complete_for_declared_scope";

export interface InvocationHandoff {
  invocationId: string;
  projectKey: string;
  contextText: string;
  captureKind: CaptureKind;
  sourceChatRef?: string;
  declaredWindow?: string;
}

export interface InvocationReceipt {
  invocationId: string;
  projectKey: string;
  sourceChatRef: string | null;
  captureKind: CaptureKind;
  coverage: CoverageStatus;
  contextText: string;
  declaredWindow: string | null;
  payloadSha256: string;
  receivedAt: string;
}

type ReceiptRow = {
  invocation_id: string;
  project_key: string;
  source_chat_ref: string | null;
  capture_kind: CaptureKind;
  coverage_status: CoverageStatus;
  context_text: string;
  declared_window: string | null;
  payload_sha256: string;
  received_at: string;
};

const refPattern = /^[a-zA-Z0-9:_-]{3,128}$/;
const projectPattern = /^[a-zA-Z0-9:._-]{2,128}$/;
const captureKinds = new Set<CaptureKind>(["verbatim", "structured_excerpt", "model_summary", "unknown"]);
const utf8 = (value: string) => new TextEncoder().encode(value).length;

export function validateHandoff(value: unknown): InvocationHandoff {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("INVALID_CONTEXT_PAYLOAD");
  const raw = value as Record<string, unknown>;
  if (typeof raw.invocationId !== "string" || !refPattern.test(raw.invocationId)) throw Error("INVALID_INVOCATION_ID");
  if (typeof raw.projectKey !== "string" || !projectPattern.test(raw.projectKey)) throw Error("INVALID_PROJECT_KEY");
  if (typeof raw.contextText !== "string" || raw.contextText.trim().length === 0 ||
      utf8(raw.contextText) > 24_000) throw Error("INVALID_CONTEXT_TEXT");
  if (typeof raw.captureKind !== "string" || !captureKinds.has(raw.captureKind as CaptureKind))
    throw Error("INVALID_CAPTURE_KIND");
  if (raw.sourceChatRef !== undefined &&
      (typeof raw.sourceChatRef !== "string" || !refPattern.test(raw.sourceChatRef))) throw Error("INVALID_SOURCE_CHAT_REF");
  if (raw.declaredWindow !== undefined &&
      (typeof raw.declaredWindow !== "string" || raw.declaredWindow.length > 256)) throw Error("INVALID_DECLARED_WINDOW");
  const expected = new Set(["invocationId", "projectKey", "contextText", "captureKind", "sourceChatRef", "declaredWindow"]);
  if (Object.keys(raw).some(key => !expected.has(key))) throw Error("INVALID_CONTEXT_FIELDS");
  return {
    invocationId: raw.invocationId,
    projectKey: raw.projectKey,
    contextText: raw.contextText,
    captureKind: raw.captureKind as CaptureKind,
    ...(raw.sourceChatRef === undefined ? {} : { sourceChatRef: raw.sourceChatRef as string }),
    ...(raw.declaredWindow === undefined ? {} : { declaredWindow: raw.declaredWindow as string }),
  };
}

async function payloadHash(value: InvocationHandoff): Promise<string> {
  const canonical = JSON.stringify({
    projectKey: value.projectKey,
    sourceChatRef: value.sourceChatRef ?? null,
    captureKind: value.captureKind,
    contextText: value.contextText,
    declaredWindow: value.declaredWindow ?? null,
  });
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function toReceipt(row: ReceiptRow): InvocationReceipt {
  return {
    invocationId: row.invocation_id,
    projectKey: row.project_key,
    sourceChatRef: row.source_chat_ref,
    captureKind: row.capture_kind,
    coverage: row.coverage_status,
    contextText: row.context_text,
    declaredWindow: row.declared_window,
    payloadSha256: row.payload_sha256,
    receivedAt: row.received_at,
  };
}

export class InvocationContextStore {
  private readonly db: D1;
  constructor(db: D1) { this.db = db; }

  async ingest(input: unknown): Promise<{ replayed: boolean; receipt: InvocationReceipt }> {
    const value = validateHandoff(input);
    const digest = await payloadHash(value);
    // D1's PK is the concurrency linearization point. Never silently replace an
    // earlier invocation or trust the client to declare a complete chat history.
    const inserted = await this.db.prepare(
      "INSERT OR IGNORE INTO invocation_context_receipts(invocation_id,project_key,source_chat_ref,capture_kind,coverage_status,context_text,declared_window,payload_sha256,received_at) VALUES(?,?,?,?,?,?,?,?,?)"
    ).bind(value.invocationId, value.projectKey, value.sourceChatRef ?? null,
      value.captureKind, "unknown", value.contextText, value.declaredWindow ?? null,
      digest, new Date().toISOString()).run();
    const receipt = await this.get(value.invocationId);
    if (!receipt) throw Error("CONTEXT_RECEIPT_NOT_PERSISTED");
    if (receipt.payloadSha256 !== digest) throw Error("INVOCATION_ID_CONFLICT");
    return { replayed: inserted.meta?.changes !== 1, receipt };
  }

  async get(invocationId: string): Promise<InvocationReceipt | null> {
    if (!refPattern.test(invocationId)) throw Error("INVALID_INVOCATION_ID");
    const row = await this.db.prepare(
      "SELECT invocation_id,project_key,source_chat_ref,capture_kind,coverage_status,context_text,declared_window,payload_sha256,received_at FROM invocation_context_receipts WHERE invocation_id=?"
    ).bind(invocationId).first<ReceiptRow>();
    return row ? toReceipt(row) : null;
  }

  async recent(projectKey?: string, count = 10): Promise<InvocationReceipt[]> {
    if (projectKey !== undefined && !projectPattern.test(projectKey)) throw Error("INVALID_PROJECT_KEY");
    if (!Number.isInteger(count) || count < 1 || count > 25) throw Error("INVALID_LIMIT");
    const statement = projectKey === undefined
      ? this.db.prepare("SELECT invocation_id,project_key,source_chat_ref,capture_kind,coverage_status,context_text,declared_window,payload_sha256,received_at FROM invocation_context_receipts ORDER BY received_at DESC,invocation_id DESC LIMIT ?").bind(count)
      : this.db.prepare("SELECT invocation_id,project_key,source_chat_ref,capture_kind,coverage_status,context_text,declared_window,payload_sha256,received_at FROM invocation_context_receipts WHERE project_key=? ORDER BY received_at DESC,invocation_id DESC LIMIT ?").bind(projectKey, count);
    return (await statement.all<ReceiptRow>()).results.map(toReceipt);
  }
}

// Fetch Request bodies are streams; bound memory usage even when Content-Length is absent.
export async function readBoundedJson(req: Request, maxBytes = 32_768): Promise<unknown> {
  const declared = req.headers.get("content-length");
  if (declared !== null && Number(declared) > maxBytes) throw Error("CONTEXT_PAYLOAD_TOO_LARGE");
  const reader = req.body?.getReader();
  if (!reader) throw Error("INVALID_JSON");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw Error("CONTEXT_PAYLOAD_TOO_LARGE");
      }
      chunks.push(value);
    }
    const all = new Uint8Array(total);
    let i = 0;
    for (const chunk of chunks) { all.set(chunk, i); i += chunk.byteLength; }
    return JSON.parse(new TextDecoder("utf-8", {fatal: true}).decode(all));
  } catch (err) {
    if (err instanceof Error && err.message === "CONTEXT_PAYLOAD_TOO_LARGE") throw err;
    throw Error("INVALID_JSON");
  } finally {
    reader.releaseLock();
  }
}
