const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const MAX = { name:120, contact:240, company:300, interest:180, task:5000, context:4000, page:1000, source:200 };

function clean(value, max) { return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max); }
function json(data, status = 200, extra = {}) { return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extra } }); }

async function hashText(value) {
  const bytes = new TextEncoder().encode(value || "unknown");
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function allowedOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === "viiversion.com" || host === "www.viiversion.com" || host === "landing.viiversion.workers.dev" || host.endsWith(".viiversion.com");
  } catch { return false; }
}

export class LeadStore {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/store") {
      const payload = await request.json();
      const hour = new Date().toISOString().slice(0, 13);
      const rateKey = "rate:" + payload.visitorHash + ":" + hour;
      const count = Number((await this.ctx.storage.get(rateKey)) || 0) + 1;
      await this.ctx.storage.put(rateKey, count, { expirationTtl: 7200 });
      if (count > 8) return json({ ok:false, error:"rate_limited" }, 429);
      const id = payload.id || crypto.randomUUID();
      const key = "lead:" + payload.createdAt + ":" + id;
      await this.ctx.storage.put(key, payload);
      const recent = (await this.ctx.storage.get("recent")) || [];
      recent.unshift({ key, id, createdAt:payload.createdAt, interest:payload.interest, contact:payload.contact });
      if (recent.length > 250) recent.length = 250;
      await this.ctx.storage.put("recent", recent);
      return json({ ok:true, id });
    }
    if (request.method === "GET" && url.pathname === "/list") {
      const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 200);
      const recent = ((await this.ctx.storage.get("recent")) || []).slice(0, limit);
      const leads = [];
      for (const item of recent) { const lead = await this.ctx.storage.get(item.key); if (lead) leads.push(lead); }
      return json({ ok:true, leads });
    }
    return json({ ok:false, error:"not_found" }, 404);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/leads/health") return json({ ok:true, storage:"durable-object", service:"viiversion-leads" });

    if (url.pathname === "/api/leads" && request.method === "POST") {
      if (!allowedOrigin(request)) return json({ ok:false, error:"origin_not_allowed" }, 403);
      let raw;
      try { raw = await request.json(); } catch { return json({ ok:false, error:"invalid_json" }, 400); }
      if (clean(raw.website, 200)) return json({ ok:true, id:"accepted" }, 202);
      const contact = clean(raw.contact, MAX.contact);
      const task = clean(raw.task, MAX.task);
      if (!contact || !task) return json({ ok:false, error:"contact_and_task_required" }, 400);
      const ip = request.headers.get("CF-Connecting-IP") || "";
      const visitorHash = await hashText(ip + "|" + (request.headers.get("User-Agent") || ""));
      const lead = {
        id:crypto.randomUUID(), createdAt:new Date().toISOString(),
        name:clean(raw.name,MAX.name), contact, company:clean(raw.company,MAX.company),
        interest:clean(raw.interest,MAX.interest), task, page:clean(raw.page,MAX.page),
        pageContext:clean(raw.pageContext,MAX.context), source:clean(raw.source,MAX.source),
        medium:clean(raw.medium,MAX.source), campaign:clean(raw.campaign,MAX.source),
        referrer:clean(raw.referrer,MAX.page), locale:clean(raw.locale,16),
        country:clean(request.cf?.country,8), colo:clean(request.cf?.colo,16), visitorHash
      };
      const id = env.LEADS.idFromName("viiversion-leads");
      const stub = env.LEADS.get(id);
      const stored = await stub.fetch("https://lead-store.internal/store", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(lead) });
      const result = await stored.json();
      if (!stored.ok) return json(result, stored.status);
      if (env.LEADS_WEBHOOK_URL) {
        ctx.waitUntil(fetch(env.LEADS_WEBHOOK_URL, { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ type:"viiversion_lead", lead:{ id:lead.id, createdAt:lead.createdAt, name:lead.name, contact:lead.contact, company:lead.company, interest:lead.interest, task:lead.task, page:lead.page, source:lead.source, campaign:lead.campaign } }) }).catch(() => {}));
      }
      return json({ ok:true, id:result.id }, 201);
    }

    if (url.pathname === "/api/leads" && request.method === "GET") {
      const expected = env.LEADS_ADMIN_TOKEN;
      const auth = request.headers.get("Authorization") || "";
      if (!expected) return json({ ok:false, error:"admin_access_not_configured" }, 503);
      if (auth !== "Bearer " + expected) return json({ ok:false, error:"unauthorized" }, 401);
      const id = env.LEADS.idFromName("viiversion-leads");
      const stub = env.LEADS.get(id);
      return stub.fetch("https://lead-store.internal/list?limit=" + encodeURIComponent(url.searchParams.get("limit") || "50"));
    }

    return env.ASSETS.fetch(request);
  }
};