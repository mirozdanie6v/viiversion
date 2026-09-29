const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
};

const SNAPSHOT_DATE = "2026-09-28";

const BRAND = {
  company: {
    brand: "VIIVERSION",
    canonical_ru: "VIIVERSION — инженерная продуктовая компания, которая строит цифровые системы для бизнеса и одновременно выпускает собственные программные продукты.",
    canonical_en: "VIIVERSION is an engineering product company that builds digital systems for businesses and develops its own software products.",
    geography: { identity: "global", vietnam: "market/presence/testing context, not company identity" },
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
      "A small entry product must be a complete useful result, not a teaser.",
      "Preserve working client systems when integration is sufficient.",
      "AI must be tied to a real business process and approved data.",
      "Prototype/demo maturity must be stated honestly."
    ]
  },
  priorityEntities: [
    { id:"P07", name:"Booking engine", category:"ENG-B", statusSnapshot:"Sell now" },
    { id:"P09", name:"Catalog + pricing configurator", category:"ENG-A", statusSnapshot:"Sell now" },
    { id:"P11", name:"Admin / back-office portal", category:"ENG-C", statusSnapshot:"Sell now" },
    { id:"P16", name:"AI consultant / sales assistant", category:"ENG-D", statusSnapshot:"Sell now" },
    { id:"P18", name:"Analytics / KPI dashboard", category:"ENG-C", statusSnapshot:"Sell now" },
    { id:"P19", name:"Payment integration", category:"ENG-E", statusSnapshot:"Sell with integration" },
    { id:"P21", name:"API / webhooks integration layer", category:"ENG-F", statusSnapshot:"Sell now" },
    { id:"P34", name:"AI workflow automation", category:"ENG-D", statusSnapshot:"Sell now" }
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
    { id:"A09", name:"VIIVERSION Proposal Studio", maturity:"Release-ready agent/plugin", strength:"Strong", proves:["research","diagnosis","solution architecture","commercial model","review","PDF"], publicUrl:"https://viiversion.com/proposal-studio/" },
    { id:"A11", name:"ZL Web Agent", maturity:"Working AI agent + MCP", strength:"Strong technical", proves:["MCP","real external data","evidence-based agent work"], boundary:"read-only production bridge" }
  ],
  sourceRefs: {
    corporateStrategyDriveId: "1nfRAgnSiEv13XUOcqgRostFYdUlbFo83eOLRLQNLnN4",
    commercialMatrixDriveId: "14i9E4WGazfwwsGl2mP_0TtZa9URBI-zeKj-qromAl-4",
    globalBrandDriveId: "1Mhl1tJqaE8xyviEO9FQGKxA26c-_Mo6UE3J1ZCugKPI",
    websiteStrategyDriveId: "1WsVbntOo8tN9qN2Q-GW60MnY3eBhHFWOn6YO7PsUMlI"
  }
};

const TOOLS = [
  {
    name: "get_brand_context",
    title: "Get VIIVERSION brand context",
    description: "Return compact VIIVERSION identity, directions, categories, guardrails and Source of Truth references.",
    inputSchema: { type:"object", properties:{
      surface:{type:"string"}, audience:{type:"string"}, goal:{type:"string"}
    }, additionalProperties:false },
    annotations:{ readOnlyHint:true, destructiveHint:false, openWorldHint:false }
  },
  {
    name: "get_priority_entities",
    title: "Get VIIVERSION priority entities",
    description: "Return the compact snapshot of priority Engineering Solutions and owned Software. Refresh live Commercial Matrix before final public claims about status, readiness or price.",
    inputSchema:{ type:"object", properties:{ direction:{type:"string",enum:["DIR-ENG","DIR-SW"]} }, additionalProperties:false },
    annotations:{ readOnlyHint:true, destructiveHint:false, openWorldHint:false }
  },
  {
    name: "get_proof",
    title: "Get VIIVERSION proof",
    description: "Return proof records with maturity and claim boundaries.",
    inputSchema:{ type:"object", properties:{
      capability:{type:"string"}, ids:{type:"array",items:{type:"string"}}
    }, additionalProperties:false },
    annotations:{ readOnlyHint:true, destructiveHint:false, openWorldHint:false }
  },
  {
    name: "plan_brand_task",
    title: "Plan VIIVERSION brand task",
    description: "Classify a VIIVERSION task and return the reasoning path, narrative pattern and live-source refresh requirements.",
    inputSchema:{ type:"object", required:["task"], properties:{
      task:{type:"string",minLength:1,maxLength:5000},
      surface:{type:"string"}, audience:{type:"string"}, goal:{type:"string"},
      finalPublic:{type:"boolean"}, implementation:{type:"boolean"}
    }, additionalProperties:false },
    annotations:{ readOnlyHint:true, destructiveHint:false, openWorldHint:false }
  },
  {
    name: "validate_brand_output",
    title: "Validate VIIVERSION brand output",
    description: "Check draft VIIVERSION copy or structure for identity drift, CRM drift, geography drift and known proof maturity violations.",
    inputSchema:{ type:"object", required:["text"], properties:{
      text:{type:"string",minLength:1,maxLength:20000}, finalPublic:{type:"boolean"}
    }, additionalProperties:false },
    annotations:{ readOnlyHint:true, destructiveHint:false, openWorldHint:false }
  }
];

function clean(value, max=5000) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}
function json(data, status=200, headers={}) {
  return new Response(JSON.stringify(data), { status, headers:{...JSON_HEADERS,...headers} });
}
function rpc(id, result) {
  return json({ jsonrpc:"2.0", id, result }, 200, { "access-control-expose-headers":"MCP-Protocol-Version" });
}
function rpcError(id, code, message, status=200) {
  return json({ jsonrpc:"2.0", id:id ?? null, error:{code,message} }, status);
}
function toolPayload(data) {
  return { content:[{type:"text",text:JSON.stringify(data)}], structuredContent:data };
}

function classifySurface(task, explicit) {
  if (explicit) return clean(explicit,80);
  const lower = task.toLowerCase();
  if (/партнер|partner|agency|агентств/.test(lower)) return "partner";
  if (/enterprise|cto|coo|техничес/.test(lower)) return "enterprise";
  if (/linkedin|профил/.test(lower)) return "profile";
  if (/proposal|коммерческ|\bкп\b/.test(lower)) return "proposal";
  if (/product|продукт|booking|бронир/.test(lower)) return "product_page";
  if (/site|сайт|главн|homepage|лендинг/.test(lower)) return "website";
  return "brand_surface";
}
function taskPlan(args={}) {
  const task = clean(args.task);
  const surface = classifySurface(task,args.surface);
  const patterns = {
    website:["clarity","proof","relevance","scale","solutions","trust","engineering depth","software","conversion"],
    product_page:["buyer result","trigger","before → after","workflow","scope","existing systems","proof","maturity","CTA","technical depth"],
    partner:["partner gap","VIIVERSION supply","delivery model","relevant modules/software","proof","commercial path","CTA"],
    enterprise:["engineering problem","constraints","architecture","data/integration/security","proof","risk","delivery model","technical discovery CTA"],
    profile:["identity","engineering focus","outcomes","proof","owned software","platform CTA"],
    proposal:["route to Proposal Studio when available","seller grounding","target evidence","diagnosis","solution","commercial model","review"],
    brand_surface:["goal","audience","buyer job","canonical entities","commercial state","proof","narrative","CTA"]
  };
  const lower = task.toLowerCase();
  const liveRefresh = [];
  if (args.finalPublic) liveRefresh.push("Global Brand & Market Strategy","Commercial Matrix Products/Assets","channel-specific strategy");
  if (args.implementation) liveRefresh.push("current approved decisions","current downstream implementation");
  if (/price|цена|стоим|readiness|готов|status|статус|demo|демо|proof|доказ/.test(lower)) liveRefresh.push("live Commercial Matrix");
  if (/сайт|site|homepage|hero|главн/.test(lower)) liveRefresh.push("Website Channel Strategy & Projection","Website_Decisions / Homepage_Blocks");
  return {
    surface,
    audience: clean(args.audience,120) || "infer from task",
    goal: clean(args.goal,120) || "infer from task",
    reasoning:["goal","audience","buyer job","canonical entities","commercial state","proof","narrative","CTA","Brand QA"],
    narrativePattern:patterns[surface] || patterns.brand_surface,
    liveRefreshRequired:[...new Set(liveRefresh)],
    sourceSnapshotDate:SNAPSHOT_DATE,
    canonicalMutationAllowed:false
  };
}
function validateBrand(text, finalPublic) {
  const lower = String(text || "").toLowerCase();
  const findings = [];
  const add=(severity,code,message)=>findings.push({severity,code,message});
  if (/веб[- ]?студи|web studio/.test(lower)) add("critical","IDENTITY_WEB_STUDIO","Do not redefine VIIVERSION as a web studio.");
  if (/digital[- ]?агент|digital agency/.test(lower)) add("critical","IDENTITY_DIGITAL_AGENCY","Do not redefine VIIVERSION as a generic digital agency.");
  if (/ai[- ]?компан|ai company|ai agency|ai[- ]?агентств/.test(lower)) add("critical","IDENTITY_GENERIC_AI","AI must be presented inside concrete engineering workflows, not as the parent-company identity.");
  if (/собственн.{0,15}crm|our own crm|viiversion crm/.test(lower)) add("critical","CRM_GUARDRAIL","VIIVERSION integrates/configures the client's CRM; it does not currently claim a proprietary CRM.");
  if (/вьетнамск.{0,20}(студи|разработ)|vietnamese (studio|developer)/.test(lower)) add("critical","GEOGRAPHY_DRIFT","VIIVERSION is a global company; Vietnam is a market/presence context.");
  if (/ave dental/.test(lower) && /(production|внедрен|реальн.{0,10}баз|работает в клиник)/.test(lower)) add("critical","A04_MATURITY","AVE Dental is a validated frontend prototype; real DB/auth/external integrations are pending.");
  if (finalPublic) add("info","LIVE_REFRESH_REQUIRED","Refresh current commercial state, proof maturity and channel decisions from live Source of Truth.");
  return { pass:!findings.some(f=>f.severity==="critical"), findings, sourceSnapshotDate:SNAPSHOT_DATE };
}

async function handleMcp(request) {
  if (request.method === "OPTIONS") {
    return new Response(null,{status:204,headers:{
      "access-control-allow-origin":"*",
      "access-control-allow-methods":"GET,POST,OPTIONS",
      "access-control-allow-headers":"content-type,accept,mcp-protocol-version,mcp-session-id"
    }});
  }
  if (request.method === "GET") {
    return json({ok:true,service:"viiversion-brand-agent",version:"0.1.0",mcp:"/mcp"});
  }
  if (request.method !== "POST") return rpcError(null,-32600,"Method not allowed",405);

  let body;
  try { body = await request.json(); } catch { return rpcError(null,-32700,"Parse error",400); }
  const id = body?.id;
  const method = body?.method;
  const params = body?.params || {};

  if (method === "notifications/initialized") return new Response(null,{status:202,headers:JSON_HEADERS});
  if (method === "initialize") {
    return rpc(id,{
      protocolVersion:"2025-11-25",
      capabilities:{tools:{}},
      serverInfo:{name:"viiversion-brand-agent",version:"0.1.0"},
      instructions:"Read-only VIIVERSION brand context server. Use this for brand grounding, structure planning, proof boundaries and deterministic Brand QA. Live Google Drive Source of Truth remains authoritative for final commercial/decision claims."
    });
  }
  if (method === "tools/list") return rpc(id,{tools:TOOLS});
  if (method === "tools/call") {
    const name = params.name;
    const args = params.arguments || {};
    if (name === "get_brand_context") {
      return rpc(id,toolPayload({
        company:BRAND.company,
        sourceRefs:BRAND.sourceRefs,
        surface:clean(args.surface,80)||null,
        audience:clean(args.audience,120)||null,
        goal:clean(args.goal,120)||null,
        sourceSnapshotDate:SNAPSHOT_DATE,
        liveRefreshRule:"Refresh Drive Source of Truth for final public status, readiness, price, proof maturity and approved decisions."
      }));
    }
    if (name === "get_priority_entities") {
      const direction=clean(args.direction,20);
      const entities=direction==="DIR-ENG"?BRAND.priorityEntities:direction==="DIR-SW"?BRAND.software:{engineering:BRAND.priorityEntities,software:BRAND.software};
      return rpc(id,toolPayload({direction:direction||"all",entities,sourceSnapshotDate:SNAPSHOT_DATE,liveRefreshRequiredForFinalState:true}));
    }
    if (name === "get_proof") {
      const ids=Array.isArray(args.ids)?new Set(args.ids.map(String)):null;
      const capability=clean(args.capability,100).toLowerCase();
      const proof=BRAND.proof.filter(p=>(!ids||ids.has(p.id))&&(!capability||p.proves.some(v=>v.toLowerCase().includes(capability))));
      return rpc(id,toolPayload({proof,sourceSnapshotDate:SNAPSHOT_DATE,maturityRule:"Never upgrade demo/prototype maturity in public claims."}));
    }
    if (name === "plan_brand_task") return rpc(id,toolPayload(taskPlan(args)));
    if (name === "validate_brand_output") return rpc(id,toolPayload(validateBrand(args.text,Boolean(args.finalPublic))));
    return rpcError(id,-32602,"Unknown tool");
  }
  return rpcError(id,-32601,"Method not found");
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return json({ok:true,service:"viiversion-brand-agent",version:"0.1.0",mcp:"https://agent.viiversion.com/mcp"});
    }
    if (url.pathname === "/mcp" || url.pathname === "/mcp/") return handleMcp(request);
    return json({ok:false,error:"not_found"},404);
  }
};
