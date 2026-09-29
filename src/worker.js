const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const MAX = { name:120, contact:240, company:300, interest:180, task:5000, context:4000, page:1000, source:200 };\n
const BRAND_MCP = {
  serverInfo: { name: "viiversion-brand-agent", version: "0.1.0" },
  protocolModern: "2026-07-28",
  protocolLegacy: "2025-11-25",
  company: {
    brand: "VIIVERSION",
    canonical: "VIIVERSION is an engineering product company that builds digital systems for businesses and develops its own software products.",
    directions: [
      { id: "DIR-ENG", name: "Engineering Solutions" },
      { id: "DIR-SW", name: "Software" }
    ],
    categories: [
      { id: "ENG-A", name: "Online Sales" },
      { id: "ENG-B", name: "Booking" },
      { id: "ENG-C", name: "Operations" },
      { id: "ENG-D", name: "AI" },
      { id: "ENG-E", name: "Payments" },
      { id: "ENG-F", name: "Integrations" }
    ],
    guardrails: [
      "Do not position VIIVERSION as a web studio, generic digital agency, bot studio, design agency, Vietnam-only developer, generic AI agency, or proprietary CRM vendor.",
      "Use buyer language before internal taxonomy or technology.",
      "Proof before abstraction.",
      "A small entry product must be a complete useful result, not a teaser for a large transformation.",
      "Preserve working client systems when integration is sufficient.",
      "AI must be tied to a real business process and approved data.",
      "Prototype/demo maturity must be stated honestly."
    ]
  },
  priorityEntities: [
    { id:"P07", name:"Booking engine", category:"ENG-B", statusSnapshot:"Sell now", role:"booking/system anchor" },
    { id:"P09", name:"Catalog + pricing configurator", category:"ENG-A", statusSnapshot:"Sell now", role:"commerce/customer-flow anchor" },
    { id:"P11", name:"Admin / back-office portal", category:"ENG-C", statusSnapshot:"Sell now", role:"operations anchor" },
    { id:"P16", name:"AI consultant / sales assistant", category:"ENG-D", statusSnapshot:"Sell now", role:"AI tied to approved business data" },
    { id:"P18", name:"Analytics / KPI dashboard", category:"ENG-C", statusSnapshot:"Sell now", role:"operational analytics" },
    { id:"P19", name:"Payment integration", category:"ENG-E", statusSnapshot:"Sell with integration", role:"payment inside real order/booking flow" },
    { id:"P21", name:"API / webhooks integration layer", category:"ENG-F", statusSnapshot:"Sell now", role:"integration backbone" },
    { id:"P34", name:"AI workflow automation", category:"ENG-D", statusSnapshot:"Sell now", role:"scoped automation outcome" }
  ],
  software: [
    { id:"P28", name:"VIIVERSION Proposal Studio", statusSnapshot:"Sell service now", proof:"A09" },
    { id:"P29", name:"AI website / WordPress audit agent", statusSnapshot:"Sell now", proof:"A11" },
    { id:"P27", name:"Mini App Factory", statusSnapshot:"Package before scale", proof:"A10" },
    { id:"P36", name:"Event Video Human Editor", statusSnapshot:"Beta sell", proof:"A12" }
  ],
  proof: [
    { id:"A01", name:"MAX TOUR", maturity:"Full-stack demo", strength:"Strong", proves:["booking","back-office","roles","owner analytics"], boundary:"live payments/Tilda/RBAC pending", publicUrl:"https://max-tour.viiversion.com/" },
    { id:"A03", name:"UNIQ SMART RENT", maturity:"Production-oriented demo", strength:"Strong", proves:["catalog","pricing","structured request","rental flow"], boundary:"live calendar pending", publicUrl:"https://uniq-smart-rent.mirozdanie6v.workers.dev" },
    { id:"A09", name:"VIIVERSION Proposal Studio", maturity:"Release-ready agent/plugin", strength:"Strong", proves:["research","diagnosis","solution","commercial model","review","PDF"], publicUrl:"https://viiversion.com/proposal-studio/" },
    { id:"A11", name:"ZL Web Agent", maturity:"Working AI agent + MCP", strength:"Strong technical", proves:["MCP","real WordPress data","evidence-based agent work"], boundary:"read-only; production site intentionally protected" }
  ],
  sourceRefs: {
    corporateStrategyDriveId: "1nfRAgnSiEv13XUOcqgRostFYdUlbFo83eOLRLQNLnN4",
    commercialMatrixDriveId: "14i9E4WGazfwwsGl2mP_0TtZa9URBI-zeKj-qromAl-4",
    globalBrandDriveId: "1Mhl1tJqaE8xyviEO9FQGKxA26c-_Mo6UE3J1ZCugKPI",
    websiteStrategyDriveId: "1WsVbntOo8tN9qN2Q-GW60MnY3eBhHFWOn6YO7PsUMlI"
  },
  snapshotDate: "2026-09-28"
};

const BRAND_MCP_TOOLS = [
  {
    name: "get_brand_context",
    title: "Get VIIVERSION brand context",
    description: "Return the compact VIIVERSION corporate identity, directions, categories, guardrails, audiences and source references. Use this before creating or auditing VIIVERSION-facing structures or messaging.",
    inputSchema: {
      type: "object",
      properties: {
        surface: { type: "string", description: "Optional target surface such as website, product_page, partner, enterprise, profile, launch, presentation." },
        audience: { type: "string", description: "Optional audience such as SME owner, operations, CTO/COO, partner, software user." },
        goal: { type: "string", description: "Optional goal such as clarity, credibility, discovery, conversion, partnership, adoption." }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  },
  {
    name: "get_priority_entities",
    title: "Get current VIIVERSION entity snapshot",
    description: "Return the compact snapshot of priority Engineering Solutions and owned Software. This snapshot is for reasoning only; final public pricing/readiness/status must be refreshed from the live Commercial Matrix.",
    inputSchema: {
      type: "object",
      properties: {
        direction: { type: "string", enum: ["DIR-ENG","DIR-SW"], description: "Optional principal direction filter." }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  },
  {
    name: "get_proof",
    title: "Get VIIVERSION proof snapshot",
    description: "Return relevant VIIVERSION proof records with maturity and claim boundaries. Never upgrade a prototype/demo into a production claim.",
    inputSchema: {
      type: "object",
      properties: {
        capability: { type: "string", description: "Optional capability keyword such as booking, operations, AI, integration, catalog." },
        ids: { type: "array", items: { type: "string" }, description: "Optional proof IDs such as A01, A03, A09, A11." }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  },
  {
    name: "plan_brand_task",
    title: "Plan a VIIVERSION brand task",
    description: "Classify a VIIVERSION task and return the reasoning sequence, suggested narrative pattern, required live-source refreshes, and Brand QA checks. This does not create or modify canonical brand truth.",
    inputSchema: {
      type: "object",
      required: ["task"],
      properties: {
        task: { type: "string", minLength: 1, maxLength: 5000 },
        surface: { type: "string" },
        audience: { type: "string" },
        goal: { type: "string" },
        finalPublic: { type: "boolean", default: false },
        implementation: { type: "boolean", default: false }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  },
  {
    name: "validate_brand_output",
    title: "Validate VIIVERSION brand output",
    description: "Run deterministic guardrail checks on draft VIIVERSION copy or structure and return likely brand drift, unsupported framing, and refresh requirements.",
    inputSchema: {
      type: "object",
      required: ["text"],
      properties: {
        text: { type: "string", minLength: 1, maxLength: 20000 },
        finalPublic: { type: "boolean", default: false }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false }
  }
];

function mcpResult(id, result) {
  return json({ jsonrpc:"2.0", id, result }, 200, {
    "access-control-allow-origin":"*",
    "access-control-expose-headers":"MCP-Protocol-Version"
  });
}

function mcpError(id, code, message, status = 200) {
  return json({ jsonrpc:"2.0", id:id ?? null, error:{ code, message } }, status, {
    "access-control-allow-origin":"*"
  });
}

function toolPayload(data) {
  return {
    content: [{ type:"text", text: JSON.stringify(data) }],
    structuredContent: data
  };
}

function taskPlan(args = {}) {
  const task = clean(args.task, 5000);
  const lower = task.toLowerCase();
  const surface = clean(args.surface, 80) || (
    /партнер|partner|agency|агентств/.test(lower) ? "partner" :
    /enterprise|cto|coo|техничес/.test(lower) ? "enterprise" :
    /linkedin|профил/.test(lower) ? "profile" :
    /proposal|коммерческ|кп\b/.test(lower) ? "proposal" :
    /product|продукт|booking|бронир/.test(lower) ? "product_page" :
    /site|сайт|главн|homepage|лендинг/.test(lower) ? "website" :
    "brand_surface"
  );
  const patterns = {
    website: ["clarity","proof","relevance","scale","solutions","trust","engineering depth","software","conversion"],
    product_page: ["buyer result","trigger","before → after","workflow","scope","existing systems","proof","maturity","CTA","technical depth"],
    partner: ["partner gap","VIIVERSION supply","delivery model","relevant modules/software","proof","commercial path","CTA"],
    enterprise: ["engineering problem","constraints","architecture","data/integration/security","proof","risk","delivery model","technical discovery CTA"],
    profile: ["identity","engineering focus","outcomes","proof","owned software","platform-specific CTA"],
    proposal: ["route to Proposal Studio when available","seller grounding","target evidence","diagnosis","solution","commercial model","review"],
    brand_surface: ["goal","audience","buyer job","relevant entities","commercial state","proof","narrative","CTA"]
  };
  const liveRefresh = [];
  if (args.finalPublic) liveRefresh.push("Global Brand & Market Strategy","relevant Commercial Matrix Products/Assets","channel-specific strategy");
  if (args.implementation) liveRefresh.push("current approved decisions","current downstream implementation");
  if (/price|цена|стоим|readiness|готов|status|статус|demo|демо|proof|доказ/.test(lower)) liveRefresh.push("live Commercial Matrix");
  if (/сайт|site|homepage|hero|главн/.test(lower)) liveRefresh.push("Website Channel Strategy & Projection","Website_Decisions / Homepage_Blocks when applicable");
  return {
    surface,
    audience: clean(args.audience,120) || "infer from task",
    goal: clean(args.goal,120) || "infer from task",
    reasoning: ["goal","audience","buyer job","canonical entities","commercial state","proof","narrative","CTA","Brand QA"],
    narrativePattern: patterns[surface] || patterns.brand_surface,
    liveRefreshRequired: [...new Set(liveRefresh)],
    sourceSnapshotDate: BRAND_MCP.snapshotDate,
    canonicalMutationAllowed: false,
    qa: ["identity","entity integrity","buyer relevance","commercial truth","proof integrity","channel fit","system balance","AI discipline","existing-system trust","decision freshness","clarity"]
  };
}

function validateBrand(text, finalPublic) {
  const lower = String(text || "").toLowerCase();
  const findings = [];
  const push = (severity, code, message) => findings.push({ severity, code, message });
  if (/веб[- ]?студи|web studio/.test(lower)) push("critical","IDENTITY_WEB_STUDIO","Do not redefine VIIVERSION as a web studio.");
  if (/digital[- ]?агент|digital agency/.test(lower)) push("critical","IDENTITY_DIGITAL_AGENCY","Do not redefine VIIVERSION as a generic digital agency.");
  if (/ai[- ]?компан|ai company|ai agency|ai[- ]?агентств/.test(lower)) push("critical","IDENTITY_GENERIC_AI","AI must be presented inside concrete engineering workflows, not as the parent-company identity.");
  if (/собственн.{0,15}crm|our own crm|viiversion crm/.test(lower)) push("critical","CRM_GUARDRAIL","VIIVERSION integrates/configures the client's CRM; it does not currently claim a proprietary CRM.");
  if (/вьетнамск.{0,20}(студи|разработ)|vietnamese (studio|developer)/.test(lower)) push("critical","GEOGRAPHY_DRIFT","VIIVERSION is a global company; Vietnam is a market/presence context.");
  if (/ave dental/.test(lower) && /(production|внедрен|реальн.{0,10}баз|работает в клиник)/.test(lower)) push("critical","A04_MATURITY","AVE Dental is a validated frontend prototype; real DB/auth/external integrations are pending.");
  if (/prototype|прототип/.test(lower) === false && /(полностью работает|production-ready|production deployment)/.test(lower)) push("warning","PROOF_MATURITY_REVIEW","Verify the exact Asset maturity before publishing a production-level claim.");
  if (finalPublic) push("info","LIVE_REFRESH_REQUIRED","Final public copy must refresh current commercial state, proof maturity and channel decisions from live Source of Truth.");
  return {
    pass: !findings.some(f => f.severity === "critical"),
    findings,
    sourceSnapshotDate: BRAND_MCP.snapshotDate
  };
}

async function handleBrandMcp(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status:204, headers:{
      "access-control-allow-origin":"*",
      "access-control-allow-methods":"GET,POST,OPTIONS",
      "access-control-allow-headers":"content-type,accept,mcp-protocol-version,mcp-method,mcp-name"
    }});
  }
  if (request.method === "GET") {
    return json({ ok:true, service:"viiversion-brand-agent-mcp", version:BRAND_MCP.serverInfo.version, endpoint:"/mcp" }, 200, {
      "access-control-allow-origin":"*"
    });
  }
  if (request.method !== "POST") return mcpError(null, -32600, "Method not allowed", 405);

  let body;
  try { body = await request.json(); } catch { return mcpError(null, -32700, "Parse error", 400); }
  const id = body?.id;
  const method = body?.method;
  const params = body?.params || {};

  if (method === "notifications/initialized") return new Response(null, { status:202, headers:{ "access-control-allow-origin":"*" } });

  if (method === "initialize") {
    const requested = params.protocolVersion;
    const protocolVersion = ["2025-03-26","2025-06-18","2025-11-25"].includes(requested) ? requested : BRAND_MCP.protocolLegacy;
    return mcpResult(id, {
      protocolVersion,
      capabilities: { tools: {} },
      serverInfo: BRAND_MCP.serverInfo,
      instructions: "Read-only VIIVERSION brand context server. Use tools for brand grounding, structure planning, proof boundaries and deterministic brand QA. Refresh live commercial/decision data from the connected VIIVERSION Source of Truth before final public or implementation claims."
    });
  }

  if (method === "server/discover") {
    return mcpResult(id, {
      protocolVersion: BRAND_MCP.protocolModern,
      serverInfo: BRAND_MCP.serverInfo,
      capabilities: { tools: {} },
      instructions: "Read-only VIIVERSION brand context server."
    });
  }

  if (method === "tools/list") return mcpResult(id, { tools: BRAND_MCP_TOOLS });

  if (method === "tools/call") {
    const name = params.name;
    const args = params.arguments || {};
    if (name === "get_brand_context") {
      return mcpResult(id, toolPayload({
        company: BRAND_MCP.company,
        sourceRefs: BRAND_MCP.sourceRefs,
        sourceSnapshotDate: BRAND_MCP.snapshotDate,
        surface: clean(args.surface,80) || null,
        audience: clean(args.audience,120) || null,
        goal: clean(args.goal,120) || null,
        liveRefreshRule: "For final public copy, current readiness/status/pricing/proof or implementation decisions, refresh the live Google Drive Source of Truth."
      }));
    }
    if (name === "get_priority_entities") {
      const direction = clean(args.direction,20);
      const data = direction === "DIR-SW" ? BRAND_MCP.software : direction === "DIR-ENG" ? BRAND_MCP.priorityEntities : { engineering:BRAND_MCP.priorityEntities, software:BRAND_MCP.software };
      return mcpResult(id, toolPayload({ direction: direction || "all", entities:data, sourceSnapshotDate:BRAND_MCP.snapshotDate, liveRefreshRequiredForFinalState:true }));
    }
    if (name === "get_proof") {
      const ids = Array.isArray(args.ids) ? new Set(args.ids.map(String)) : null;
      const capability = clean(args.capability,100).toLowerCase();
      const proof = BRAND_MCP.proof.filter(p => (!ids || ids.has(p.id)) && (!capability || p.proves.some(v => v.toLowerCase().includes(capability))));
      return mcpResult(id, toolPayload({ proof, sourceSnapshotDate:BRAND_MCP.snapshotDate, maturityRule:"Never upgrade demo/prototype maturity in public claims." }));
    }
    if (name === "plan_brand_task") return mcpResult(id, toolPayload(taskPlan(args)));
    if (name === "validate_brand_output") return mcpResult(id, toolPayload(validateBrand(args.text, Boolean(args.finalPublic))));
    return mcpError(id, -32602, "Unknown tool: " + clean(name,100));
  }

  return mcpError(id, -32601, "Method not found: " + clean(method,120));
}


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
      await this.ctx.storage.put(rateKey, count);
      if (count > 8) return json({ ok:false, error:"rate_limited" }, 429);
      const id = payload.id || crypto.randomUUID();
      const key = "lead:" + payload.createdAt + ":" + id;
      await this.ctx.storage.put(key, payload);
      if (payload.isTest) {
        const stored = await this.ctx.storage.get(key);
        await this.ctx.storage.delete(key);
        const recent = (await this.ctx.storage.get("recent")) || [];
        const cleaned = [];
        for (const item of recent) {
          const oldLead = await this.ctx.storage.get(item.key);
          if (oldLead?.isTest) await this.ctx.storage.delete(item.key);
          else if (oldLead) cleaned.push(item);
        }
        await this.ctx.storage.put("recent", cleaned);
        return json({ ok:Boolean(stored), id, probe:true });
      }
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
    if (url.pathname === "/api/leads/health") return json({ ok:true, storage:"durable-object", service:"viiversion-leads", version:"canonical-v3" });

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
        country:clean(request.cf?.country,8), colo:clean(request.cf?.colo,16), visitorHash, isTest:Boolean(raw.qa)
      };
      const id = env.LEADS.idFromName("viiversion-leads");
      const stub = env.LEADS.get(id);
      const stored = await stub.fetch("https://lead-store.internal/store", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(lead) });
      const result = await stored.json();
      if (!stored.ok) return json(result, stored.status);
      if (env.LEADS_WEBHOOK_URL) {
        ctx.waitUntil(fetch(env.LEADS_WEBHOOK_URL, { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ type:"viiversion_lead", lead:{ id:lead.id, createdAt:lead.createdAt, name:lead.name, contact:lead.contact, company:lead.company, interest:lead.interest, task:lead.task, page:lead.page, source:lead.source, campaign:lead.campaign } }) }).catch(() => {}));
      }
      return json({ ok:true, id:result.id, probe:Boolean(result.probe) }, 201);
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