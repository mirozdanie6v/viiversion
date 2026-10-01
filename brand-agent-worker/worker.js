import { MARKET_TOOLS, executeMarketTool } from "./market.js";
import { LIVE_SOURCE_TOOLS, buildLiveSourcePlan, validateLiveContext } from "./live-source.js";
import { ROLE_TOOL, buildRolePlan } from "./roles.js";
import { AGENT_RUNTIME_TOOLS, executeAgentRuntimeTool } from "./brand-run.js";
export { BrandRunCoordinator } from "./brand-run.js";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
};

const SNAPSHOT_DATE = "2026-09-30";

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

const PRIVACY_PAGE = legalPage("Privacy Policy", `
<p>VIIVERSION Brand Architect is operated by VIIVERSION. This policy explains the data processed when you use the Brand Architect service and its MCP tools.</p>
<h2>Data we process</h2>
<p>We process the task text and tool arguments you submit, source evidence you explicitly provide to a tool, derived specialist artifacts and final outputs, and limited technical run metadata needed to execute and troubleshoot a run.</p>
<h2>Connected services</h2>
<p>The production Brand Architect MCP does not receive or store your Google OAuth credentials. If ChatGPT or another host uses a separate connected service to obtain source material, only the selected evidence passed into a Brand Architect tool is processed by this service.</p>
<h2>Infrastructure</h2>
<p>Brand Architect runs on Cloudflare Workers, Durable Objects, and Workers AI. Data may be processed by infrastructure providers as necessary to deliver the service.</p>
<h2>Retention</h2>
<p>Persistent Brand Architect run state is automatically scheduled for deletion after 30 days from the latest run update. Operational logs may be retained for a limited period by infrastructure providers according to their platform policies.</p>
<h2>Use of data</h2>
<p>We use submitted data only to provide, secure, debug, and improve the requested Brand Architect workflow. We do not sell personal data and do not use plugin data for advertising.</p>
<h2>Your choices</h2>
<p>Do not submit secrets, passwords, access tokens, or unnecessary personal data. To request access, correction, or deletion relating to VIIVERSION-held data, contact <a href="mailto:olga.nogtich@viiversion.com">olga.nogtich@viiversion.com</a>.</p>
`);

const TERMS_PAGE = legalPage("Terms of Use", `
<p>These terms govern use of VIIVERSION Brand Architect.</p>
<h2>Purpose</h2>
<p>Brand Architect provides brand, product, market, GTM, proof, website-architecture, and governance assistance. Outputs are generated from the information supplied to the service and should be reviewed before publication or implementation.</p>
<h2>Your responsibilities</h2>
<p>You must have the right to submit any content or source evidence you provide. Do not submit credentials, unlawful content, or information you are not authorized to process.</p>
<h2>No professional advice</h2>
<p>The service is not legal, tax, financial, medical, or other regulated professional advice.</p>
<h2>Intellectual property</h2>
<p>You retain rights in content you submit. VIIVERSION retains rights in the Brand Architect software, workflow design, documentation, and service infrastructure.</p>
<h2>Availability</h2>
<p>The service may change, be suspended, or be unavailable during maintenance or third-party platform outages. We do not guarantee uninterrupted operation or error-free outputs.</p>
<h2>Limitation</h2>
<p>To the extent permitted by applicable law, VIIVERSION is not liable for indirect or consequential losses arising from reliance on generated outputs without appropriate review.</p>
<h2>Contact</h2>
<p>Questions about these terms: <a href="mailto:olga.nogtich@viiversion.com">olga.nogtich@viiversion.com</a>.</p>
`);

const SUPPORT_PAGE = legalPage("Support", `
<p>For VIIVERSION Brand Architect support, contact <a href="mailto:olga.nogtich@viiversion.com">olga.nogtich@viiversion.com</a>.</p>
<h2>When contacting support</h2>
<p>Include a short description of the task, the approximate time of the issue, and the user-visible error message. Do not send passwords, OAuth tokens, API keys, or other secrets.</p>
<h2>Service endpoint</h2>
<p>Production MCP: <code>https://agent.viiversion.com/mcp</code>.</p>
`);

const BASE_TOOLS = [
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

const TOOLS = [...BASE_TOOLS, ...MARKET_TOOLS, ...LIVE_SOURCE_TOOLS, ROLE_TOOL, ...AGENT_RUNTIME_TOOLS];

const OPENAI_PUBLIC_TOOLS = Object.freeze([
  {
    name:"get_brand_context",
    title:"Get VIIVERSION brand context",
    description:"Get the stable VIIVERSION identity, directions, categories and brand guardrails for brand or product work.",
    inputSchema:{type:"object",properties:{surface:{type:"string"},audience:{type:"string"},goal:{type:"string"}},additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },
  {
    name:"get_priority_entities",
    title:"Get VIIVERSION priority entities",
    description:"Get the dated VIIVERSION snapshot of priority Engineering Solutions and owned Software. Treat status fields as a snapshot, not guaranteed current state.",
    inputSchema:{type:"object",properties:{direction:{type:"string",enum:["DIR-ENG","DIR-SW"]}},additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },
  {
    name:"get_proof",
    title:"Get VIIVERSION proof records",
    description:"Get dated VIIVERSION proof records with maturity and claim boundaries. Use them to avoid overstating demos, prototypes or integrations.",
    inputSchema:{type:"object",properties:{capability:{type:"string"},ids:{type:"array",items:{type:"string"}}},additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },
  {
    name:"validate_brand_output",
    title:"Validate VIIVERSION brand output",
    description:"Check draft VIIVERSION copy or structure for identity drift, geography drift, CRM drift and known proof-maturity violations.",
    inputSchema:{type:"object",required:["text"],properties:{text:{type:"string",minLength:1,maxLength:20000},final_public:{type:"boolean"}},additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },
  {
    name:"plan_productization",
    title:"Plan VIIVERSION productization",
    description:"Turn a software, plugin or agent concept into a productization and engineering-handoff contract without claiming implementation is complete.",
    inputSchema:{type:"object",required:["concept"],properties:{concept:{type:"string",minLength:1,maxLength:5000},entity_id:{type:"string"},target_platforms:{type:"array",items:{type:"string"}},current_stage:{type:"string"}},additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },
  {
    name:"get_required_evidence",
    title:"Get required evidence for a Brand Architect task",
    description:"Return the evidence classes and structured data areas needed before making current, final or implementation claims. This tool does not access third-party accounts.",
    inputSchema:{type:"object",required:["task"],properties:{task:{type:"string",minLength:1,maxLength:5000},surface:{type:"string"},current_state:{type:"boolean"},final_public:{type:"boolean"},implementation:{type:"boolean"}},additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },
  {
    name:"run_brand_task",
    title:"Run VIIVERSION Brand Architect",
    description:"Run the VIIVERSION Brand Architect workflow with specialist analysis and QA. For tasks requiring current or final facts, provide the required source evidence directly in this call; otherwise the tool returns the missing evidence requirements instead of inventing facts.",
    inputSchema:{
      type:"object",
      required:["task"],
      properties:{
        task:{type:"string",minLength:1,maxLength:5000},
        surface:{type:"string"},
        current_state:{type:"boolean"},
        final_public:{type:"boolean"},
        implementation:{type:"boolean"},
        max_rework_cycles:{type:"integer",minimum:0,maximum:3},
        evidence:{
          type:"array",
          items:{
            type:"object",
            required:["evidenceId","source","source_class","content"],
            properties:{
              evidenceId:{type:"string",minLength:1,maxLength:120},
              source:{type:"string",minLength:1,maxLength:300},
              source_class:{type:"string",minLength:1,maxLength:80},
              tabs:{type:"array",items:{type:"string"}},
              content:{}
            },
            additionalProperties:false
          }
        }
      },
      additionalProperties:false
    },
    annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false}
  }
]);

function clean(value, max=5000) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}
function json(data, status=200, headers={}) {
  return new Response(JSON.stringify(data), { status, headers:{...JSON_HEADERS,...headers} });
}
function html(body, status=200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin"
    }
  });
}
function legalPage(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — VIIVERSION Brand Architect</title><style>body{font-family:Inter,system-ui,sans-serif;max-width:820px;margin:48px auto;padding:0 20px;line-height:1.6;color:#111827}h1,h2{line-height:1.2}a{color:#1d4ed8}small{color:#6b7280}</style></head><body><h1>${title}</h1>${body}<hr><small>VIIVERSION Brand Architect · Updated 30 September 2026 · <a href="https://viiversion.com">viiversion.com</a></small></body></html>`;
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
  if (/feedback|market signal|рыночн.*сигнал|обратн.*связ/.test(lower)) return "feedback";
  if (/productiz|продуктиз|упаков.*продукт|созда.*плагин|созда.*plugin|созда.*app/.test(lower)) return "productization";
  if (/product hunt|marketplace|маркетплейс|app directory|wordpress\.org|odoo|shopify|clover|square/.test(lower)) return "platform";
  if (/distribution|дистриб|канал.*продаж/.test(lower)) return "distribution";
  if (/рассыл|outreach|campaign|кампан/.test(lower)) return "campaign";
  if (/позиционир.*рын|market positioning|рынок|market/.test(lower)) return "market";
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
    market:["entity","market","audience","channel","language","goal","proof","projection","metric"],
    distribution:["entity","product form","channel fit","launch wave","pipeline stage","blocker","motion","milestone","KPI"],
    campaign:["market","segment","signal","primary entity/offer","proof","channel","sequence","CTA","KPI","feedback"],
    platform:["one product","user/problem","install/use path","proof","platform fit","compliance","launch/distribution milestone","KPI"],
    productization:["entity/candidate","target user","repeatable workflow","generic contract","install/use path","proof","distribution","engineering handoff","release gate"],
    feedback:["observation","repetition","pattern","measurable outcome","validated learning","change request"],
    proposal:["route to Proposal Studio when available","seller grounding","target evidence","diagnosis","solution","commercial model","review"],
    brand_surface:["goal","audience","buyer job","canonical entities","commercial state","proof","narrative","CTA"]
  };
  const lower = task.toLowerCase();
  const liveRefresh = [];
  if (args.finalPublic) liveRefresh.push("Global Brand & Market Strategy","Commercial Matrix Products/Assets","channel-specific strategy");
  if (args.implementation) liveRefresh.push("current approved decisions","current downstream implementation");
  if (/price|цена|стоим|readiness|готов|status|статус|demo|демо|proof|доказ/.test(lower)) liveRefresh.push("live Commercial Matrix");
  if (/сайт|site|homepage|hero|главн/.test(lower)) liveRefresh.push("Website Channel Strategy & Projection","Website_Decisions / Homepage_Blocks");
  if (["market","distribution","campaign","platform","productization","feedback"].includes(surface)) liveRefresh.push("Global Brand & Market Strategy","Channel_Profiles");
  if (["distribution","platform","productization"].includes(surface)) liveRefresh.push("Distribution_Matrix","Launch_Waves","Distribution_Pipeline");
  if (surface==="campaign") liveRefresh.push("GTM_Motions","Sales Playbook","Sales_Router","Outreach_Queue");
  if (surface==="feedback") liveRefresh.push("Market_Signals");
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


function publicEvidenceRequirements(args={}) {
  const plan=buildLiveSourcePlan(args);
  return {
    live_required:plan.liveRequired,
    required_source_classes:plan.requiredSourceClasses,
    required_tabs:plan.commercialMatrix?.tabs ?? [],
    guidance:"Provide only the relevant source content needed for this task. Do not include passwords, OAuth tokens, API keys, cookies or unrelated personal data."
  };
}

function collectPublicEvidence(args={}) {
  const evidence=Array.isArray(args.evidence)?args.evidence:[];
  const sourceClasses=[...new Set(evidence.map(item=>clean(item?.source_class,80)).filter(Boolean))];
  const tabsRead=[...new Set(evidence.flatMap(item=>Array.isArray(item?.tabs)?item.tabs.map(tab=>clean(tab,120)).filter(Boolean):[]))];
  const sourceEvidence=evidence.map(item=>({
    evidenceId:clean(item?.evidenceId,120),
    source:clean(item?.source,300),
    content:item?.content
  }));
  return {sourceClasses,tabsRead,sourceEvidence};
}

async function handleOpenAiMcp(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null,{status:204,headers:{
      "access-control-allow-origin":"*",
      "access-control-allow-methods":"GET,POST,OPTIONS",
      "access-control-allow-headers":"content-type,accept,mcp-protocol-version,mcp-session-id"
    }});
  }
  if (request.method === "GET") {
    return json({ok:true,service:"viiversion-brand-architect",version:"0.8.4",mcp:"/openai/mcp"});
  }
  if (request.method !== "POST") return rpcError(null,-32600,"Method not allowed",405);

  let body;
  try { body=await request.json(); } catch { return rpcError(null,-32700,"Parse error",400); }
  const id=body?.id;
  const method=body?.method;
  const params=body?.params||{};

  if (method === "notifications/initialized") return new Response(null,{status:202,headers:JSON_HEADERS});
  if (method === "initialize") {
    return rpc(id,{
      protocolVersion:"2025-11-25",
      capabilities:{tools:{}},
      serverInfo:{name:"viiversion-brand-architect",version:"0.8.4"},
      instructions:"VIIVERSION Brand Architect provides evidence-bounded brand, product, website, proof, GTM and productization assistance. It does not access third-party accounts or credentials. When current/final facts require evidence that was not supplied, return the required evidence instead of inventing facts."
    });
  }
  if (method === "tools/list") return rpc(id,{tools:OPENAI_PUBLIC_TOOLS});
  if (method !== "tools/call") return rpcError(id,-32601,"Method not found");

  const name=params.name;
  const args=params.arguments||{};

  if (name === "get_brand_context") {
    return rpc(id,toolPayload({
      company:BRAND.company,
      surface:clean(args.surface,80)||null,
      audience:clean(args.audience,120)||null,
      goal:clean(args.goal,120)||null,
      snapshot_date:SNAPSHOT_DATE
    }));
  }
  if (name === "get_priority_entities") {
    const direction=clean(args.direction,20);
    const entities=direction==="DIR-ENG"?BRAND.priorityEntities:direction==="DIR-SW"?BRAND.software:{engineering:BRAND.priorityEntities,software:BRAND.software};
    return rpc(id,toolPayload({direction:direction||"all",entities,snapshot_date:SNAPSHOT_DATE,status_is_snapshot:true}));
  }
  if (name === "get_proof") {
    const ids=Array.isArray(args.ids)?new Set(args.ids.map(String)):null;
    const capability=clean(args.capability,100).toLowerCase();
    const proof=BRAND.proof.filter(p=>(!ids||ids.has(p.id))&&(!capability||p.proves.some(v=>v.toLowerCase().includes(capability))));
    return rpc(id,toolPayload({proof,snapshot_date:SNAPSHOT_DATE,maturity_rule:"Never upgrade demo or prototype maturity in public claims."}));
  }
  if (name === "validate_brand_output") {
    return rpc(id,toolPayload(validateBrand(args.text,Boolean(args.final_public))));
  }
  if (name === "plan_productization") {
    return rpc(id,toolPayload(executeMarketTool("plan_productization",args)));
  }
  if (name === "get_required_evidence") {
    return rpc(id,toolPayload(publicEvidenceRequirements(args)));
  }
  if (name === "run_brand_task") {
    const requirements=publicEvidenceRequirements(args);
    const supplied=collectPublicEvidence(args);
    const missingClasses=requirements.required_source_classes.filter(v=>!supplied.sourceClasses.includes(v));
    const missingTabs=requirements.required_tabs.filter(v=>!supplied.tabsRead.includes(v));
    const route=buildRolePlan(args).route;
    const sourceRoleNeeded=route.includes("source-truth");
    const evidenceMissing=sourceRoleNeeded && supplied.sourceEvidence.length===0;
    const strict=Boolean(args.current_state||args.final_public||args.implementation);
    if (evidenceMissing || (strict && (missingClasses.length||missingTabs.length))) {
      return rpc(id,toolPayload({
        status:"needs_evidence",
        missing_source_classes:missingClasses,
        missing_tabs:strict?missingTabs:[],
        required:requirements
      }));
    }
    try {
      const result=await executeAgentRuntimeTool(env,"run_brand_task",{
        task:args.task,
        run_id:`openai-${crypto.randomUUID()}`,
        surface:args.surface,
        current_state:Boolean(args.current_state),
        final_public:Boolean(args.final_public),
        implementation:Boolean(args.implementation),
        max_rework_cycles:args.max_rework_cycles??2,
        observed_at:new Date().toISOString(),
        source_classes:supplied.sourceClasses,
        tabs_read:supplied.tabsRead,
        source_evidence:supplied.sourceEvidence
      });
      return rpc(id,toolPayload({
        status:result.status,
        answer:result.finalResult?.answer??null,
        key_decisions:result.finalResult?.key_decisions??[],
        uncertainties:result.finalResult?.uncertainties??[],
        audit_items:result.finalResult?.audit_items??[]
      }));
    } catch(error) {
      return rpcError(id,-32000,`${error?.code??"BRAND_TASK_ERROR"}: ${error?.message??error}`);
    }
  }
  return rpcError(id,-32602,"Unknown tool");
}

async function handleMcp(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null,{status:204,headers:{
      "access-control-allow-origin":"*",
      "access-control-allow-methods":"GET,POST,OPTIONS",
      "access-control-allow-headers":"content-type,accept,mcp-protocol-version,mcp-session-id"
    }});
  }
  if (request.method === "GET") {
    return json({ok:true,service:"viiversion-brand-agent",version:"0.8.4",mcp:"/mcp"});
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
      serverInfo:{name:"viiversion-brand-agent",version:"0.8.4"},
      instructions:"VIIVERSION Brand Architect backend with persistent Durable Object runs, isolated Workers AI specialist execution, automatic role progression, bounded QA rework, final result assembly, and manual artifact controls. For current/final tasks, the caller must broker live Google Drive Source of Truth evidence through the user-authorized Drive connector and pass it to run_brand_task; Google credentials never move into Cloudflare."
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
    if (name === "get_live_source_plan") return rpc(id,toolPayload(buildLiveSourcePlan(args)));
    if (name === "validate_live_context") return rpc(id,toolPayload(validateLiveContext(args)));
    if (name === "plan_agent_roles") return rpc(id,toolPayload(buildRolePlan(args)));
    if (AGENT_RUNTIME_TOOLS.some((tool) => tool.name === name)) {
      try {
        const runtimeData = await executeAgentRuntimeTool(env, name, args);
        return rpc(id, toolPayload(runtimeData));
      } catch (error) {
        return rpcError(id, -32000, `${error?.code ?? "AGENT_RUNTIME_ERROR"}: ${error?.message ?? error}`);
      }
    }
    const marketData = executeMarketTool(name,args);
    if (marketData !== null) return rpc(id,toolPayload(marketData));
    return rpcError(id,-32602,"Unknown tool");
  }
  return rpcError(id,-32601,"Method not found");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return json({ok:true,service:"viiversion-brand-agent",version:"0.8.4",mcp:"https://agent.viiversion.com/mcp"});
    }
    if (request.method === "GET" && url.pathname === "/privacy") return html(PRIVACY_PAGE);
    if (request.method === "GET" && url.pathname === "/terms") return html(TERMS_PAGE);
    if (request.method === "GET" && url.pathname === "/support") return html(SUPPORT_PAGE);
    if (request.method === "GET" && url.pathname === "/.well-known/openai-apps-challenge") {
      const token = String(env.OPENAI_APPS_CHALLENGE ?? "").trim();
      return token ? new Response(token, { status: 200, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } }) : new Response("not configured", { status: 404, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
    }
    if (url.pathname === "/openai/mcp" || url.pathname === "/openai/mcp/") return handleOpenAiMcp(request, env);
    if (url.pathname === "/mcp" || url.pathname === "/mcp/") return handleMcp(request, env);
    return json({ok:false,error:"not_found"},404);
  }
};
