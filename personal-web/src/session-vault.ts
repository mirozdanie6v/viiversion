/**
 * The only Durable Object in the personal browser service. It stores
 * encrypted browser storageState and short-lived remote-login session pointers.
 * Secrets and keys are not present in DO records.
 */
type Stored = {
  origin: string;
  ciphertext: string;
  iv: string;
  createdAt: number;
  expiresAt: number;
  cookieCount: number;
};
type Pending = { id: string; origin: string; browserSessionId: string; createdAt: number; expiresAt: number };

export class PersonalWebVault {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") return Response.json({ error: "POST required" }, { status: 405 });
    const data = await request.json() as Record<string, any>;
    const action = new URL(request.url).pathname;
    const now = Date.now();
    const storage = this.state.storage;
    if (action === "/pending/create") {
      const pending = data.value as Pending;
      if (pending.expiresAt > now + 10 * 60 * 1000 || pending.expiresAt <= now) {
        return Response.json({ error: "Invalid pending expiry" }, { status: 400 });
      }
      await storage.put("pending:" + pending.id, pending);
      return Response.json({ ok: true });
    }
    if (action === "/pending/get" || action === "/pending/consume") {
      const pending = await storage.get<Pending>("pending:" + String(data.id ?? ""));
      if (!pending || pending.expiresAt < now) {
        return Response.json({ error: "Session setup expired" }, { status: 404 });
      }
      if (action === "/pending/consume") await storage.delete("pending:" + pending.id);
      return Response.json({ ok: true, pending });
    }
    if (action === "/pending/delete") {
      await storage.delete("pending:" + String(data.id ?? ""));
      return Response.json({ ok: true });
    }
    if (action === "/state/put") {
      const item = data.value as Stored;
      if (!item || item.expiresAt <= now || item.expiresAt > now + 8 * 24 * 3600 * 1000 ||
        typeof item.iv !== "string" || typeof item.ciphertext !== "string" ||
        typeof item.origin !== "string") {
        return Response.json({ error: "Invalid stored session" }, { status: 400 });
      }
      const existing = await storage.list<Stored>({ prefix: "state:" });
      if (existing.size >= 8 && !existing.has("state:" + item.origin)) {
        return Response.json({ error: "Maximum eight saved sites" }, { status: 409 });
      }
      await storage.put("state:" + item.origin, item);
      return Response.json({ ok: true });
    }
    if (action === "/state/get") {
      const origin = String(data.origin ?? "");
      const item = await storage.get<Stored>("state:" + origin);
      if (!item || item.expiresAt <= now) {
        if (item) await storage.delete("state:" + origin);
        return Response.json({ error: "No saved session" }, { status: 404 });
      }
      return Response.json({ ok: true, session: item });
    }
    if (action === "/state/list") {
      const records = await storage.list<Stored>({ prefix: "state:" });
      const out: Array<Pick<Stored, "origin" | "createdAt" | "expiresAt" | "cookieCount">> = [];
      for (const [key, item] of records) {
        if (item.expiresAt <= now) { await storage.delete(key); continue; }
        out.push({
          origin: item.origin, createdAt: item.createdAt,
          expiresAt: item.expiresAt, cookieCount: item.cookieCount
        });
      }
      return Response.json({ ok: true, sessions: out });
    }
    if (action === "/state/delete") {
      await storage.delete("state:" + String(data.origin ?? ""));
      return Response.json({ ok: true });
    }
    return Response.json({ error: "Unknown vault operation" }, { status: 404 });
  }
}
