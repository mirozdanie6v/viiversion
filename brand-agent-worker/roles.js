export const BRAND_ROLE = Object.freeze({
  SOURCE_TRUTH: "source-truth",
  BRAND_STRATEGY: "brand-strategy",
  COMMERCIAL_ARCHITECT: "commercial-architect",
  COMMERCIAL_ECONOMICS: "commercial-economics",
  REVENUE_INTELLIGENCE: "revenue-intelligence",
  PORTFOLIO_INTELLIGENCE: "portfolio-intelligence",
  MARKET_GTM: "market-gtm",
  PRESENTATION_SYNTHESIS: "presentation-synthesis",
  CHANNEL_ARCHITECT: "channel-architect",
  PROOF_ANALYST: "proof-analyst",
  BRAND_QA: "brand-qa"
});

export const BRAND_ROLE_DEFINITIONS = Object.freeze({
  [BRAND_ROLE.SOURCE_TRUTH]: Object.freeze({
    title: "Аналитик источника истины",
    responsibility: "Resolve authoritative sources, obtain the minimum required live context, and report freshness, verified facts, uncertainty and missing source requirements.",
    outputs: ["source-context"],
    prohibited: ["brand_strategy", "commercial_recommendation", "market_strategy", "channel_copy", "canonical_mutation"]
  }),
  [BRAND_ROLE.BRAND_STRATEGY]: Object.freeze({
    title: "Стратег бренда",
    responsibility: "Apply VIIVERSION canon, positioning and governance to the task without silently changing canon.",
    outputs: ["brand-decision"],
    prohibited: ["invent_commercial_state", "canonical_mutation", "implementation"]
  }),
  [BRAND_ROLE.COMMERCIAL_ARCHITECT]: Object.freeze({
    title: "Архитектор продуктовой и коммерческой системы",
    responsibility: "Map the task to real VIIVERSION entities, commercial state, packaging and productization boundaries.",
    outputs: ["commercial-decision", "productization-contract"],
    prohibited: ["invent_product", "upgrade_readiness", "invent_price", "engineering_implementation"]
  }),
  [BRAND_ROLE.COMMERCIAL_ECONOMICS]: Object.freeze({
    title: "Архитектор коммерческой экономики",
    responsibility: "Assess recorded price, delivery/support effort and cost, margin signal, customization, repeatability, CAC/LTV assumptions and economics confidence without inventing missing numbers.",
    outputs: ["economics-decision"],
    prohibited: ["invent_cost", "invent_margin", "invent_cac", "invent_ltv", "replace_commercial_state", "canonical_mutation"]
  }),
  [BRAND_ROLE.REVENUE_INTELLIGENCE]: Object.freeze({
    title: "Аналитик выручки и продаж",
    responsibility: "Convert recorded replies, objections, qualification, proposal outcomes, won/lost and price/proof reactions into evidence-bounded revenue learning linked to lead/entity/offer where known.",
    outputs: ["revenue-learning"],
    prohibited: ["invent_reply", "infer_won_lost_from_silence", "promote_single_event_to_validated_learning", "canonical_mutation", "send_outreach"]
  }),
  [BRAND_ROLE.PORTFOLIO_INTELLIGENCE]: Object.freeze({
    title: "Архитектор портфеля и productization",
    responsibility: "Compare the VIIVERSION portfolio using commercial state, proof, revenue learning and economics to recommend sell/productize/module/experiment/merge/deprioritize/governance-candidate actions.",
    outputs: ["portfolio-decision"],
    prohibited: ["silently_create_entity", "silently_retire_entity", "invent_profitability", "invent_demand", "bypass_governance"]
  }),
  [BRAND_ROLE.MARKET_GTM]: Object.freeze({
    title: "Стратег рынка, GTM и дистрибуции",
    responsibility: "Define market interpretation, channel fit, primary GTM motion, distribution path, closed milestone, KPI and feedback destination.",
    outputs: ["market-plan", "gtm-plan", "distribution-plan"],
    prohibited: ["canonical_mutation", "live_pipeline_claim_without_live_context", "implementation", "send_outreach"]
  }),
  [BRAND_ROLE.PRESENTATION_SYNTHESIS]: Object.freeze({
    title: "Директор синтеза presentation",
    responsibility: "For redesign/new-structure tasks, create a materially new presentation concept from audience, buyer jobs, canonical constraints, current commercial truth and proof. Treat legacy approved presentation as observed input, not an automatic creative target.",
    outputs: ["presentation-concept"],
    prohibited: ["canonical_mutation", "invent_commercial_state", "invent_proof", "restore_legacy_copy_only_because_approved", "treat_approval_as_quality_evidence", "implementation"]
  }),
  [BRAND_ROLE.CHANNEL_ARCHITECT]: Object.freeze({
    title: "Архитектор проекции и коммуникации",
    responsibility: "Project accepted decisions into a concrete channel/surface narrative, hierarchy, proof slots, depth and CTA.",
    outputs: ["channel-projection", "narrative-architecture"],
    prohibited: ["redefine_canon", "invent_commercial_state", "invent_proof", "implementation_without_handoff"]
  }),
  [BRAND_ROLE.PROOF_ANALYST]: Object.freeze({
    title: "Аналитик доказательств",
    responsibility: "Match claims to evidence, preserve proof maturity boundaries and identify unsupported claims or proof gaps.",
    outputs: ["proof-plan"],
    prohibited: ["invent_case", "upgrade_maturity", "infer_production_status", "change_commercial_state"]
  }),
  [BRAND_ROLE.BRAND_QA]: Object.freeze({
    title: "Независимый ревьюер бренда и governance",
    responsibility: "Run G1-G18 independently and return PASS/FAIL with precise rework targets and residual uncertainty.",
    outputs: ["qa-report"],
    prohibited: ["silently_rewrite_canon", "approve_own_generated_strategy", "downgrade_live_refresh_requirement", "implementation"]
  })
});

function clean(value, max=5000) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0,max);
}

export function inferTaskMode(task, explicit) {
  const forced=String(explicit ?? "").trim().toUpperCase();
  if (["AUDIT","REDESIGN","SYNTHESIS","FINAL_COPY","IMPLEMENTATION","GOVERNANCE"].includes(forced)) return forced;
  const q=String(task ?? "").toLowerCase();
  const redesign =
    /redesign|rebuild|rework.*(?:page|homepage|hero)|редизайн|пересоб|заново|с нуля|передел.*(?:главн|сайт|hero|хиро)|не устраива|не нравится.*(?:структур|текст|смысл)|отверга.*(?:текст|hero|хиро|структур)|сохран.*только.*(?:цвет|градиент|стил)|preserve only.*(?:visual|color|gradient|style)|reject.*(?:current|approved|old)|not an audit|не аудит/.test(q);
  if (redesign) return "REDESIGN";
  if (/implement|deploy|реализ|внеси.*(?:код|сайт)|задепло/.test(q)) return "IMPLEMENTATION";
  if (/governance|канон|change request|decision log|измен.*канон/.test(q)) return "GOVERNANCE";
  if (/final copy|финальн.*текст|готов.*публикац/.test(q)) return "FINAL_COPY";
  if (/audit|аудит|compare|сравн|review|проверь|проверить|проаудит/.test(q)) return "AUDIT";
  return "SYNTHESIS";
}

function inferSurface(task, explicit) {
  if (explicit) return clean(explicit,80).toLowerCase();
  const q=task.toLowerCase();
  if (/profit|margin|марж|экономик|рентабель|cac\b|ltv\b|delivery cost|support cost|себестоим|выгодн/.test(q)) return "commercial-economics";
  if (/portfolio|портфел|что.*(?:усили|отлож|продав|стро|productize)|какие.*продукт.*(?:усили|отлож|продав)|merge review|depriorit/.test(q)) return "portfolio-review";
  if (/revenue learning|sales learning|чему.*продаж|ответ.*клиент|objection|возражен|won.?lost|сделк.*(?:выигр|проигр)|повторя.*запрос/.test(q)) return "revenue-learning";
  if (/homepage|hero|website|сайт|главн|лендинг|страниц/.test(q)) return "website";
  if (/gtm|distribution|дистриб|рынок|market|product hunt|marketplace|маркетплейс|launch|запуск/.test(q)) return "market";
  if (/outreach|рассыл|follow.?up|партнер|partner|campaign|кампан/.test(q)) return "campaign";
  if (/productiz|продуктиз|plugin|плагин|app\b|software|продукт/.test(q)) return "product";
  if (/proof|доказ|case|кейс|demo|демо/.test(q)) return "proof";
  if (/позиционир|brand|бренд|канон|identity/.test(q)) return "brand";
  if (/audit|аудит|проверь|review|критик/.test(q)) return "audit";
  return "brand";
}

function add(route,role,reasons,reason){
  if(!route.includes(role)) route.push(role);
  if(reason) reasons[role]=(reasons[role]||[]).concat(reason);
}

export function buildRolePlan(args={}) {
  const task=clean(args.task);
  if(!task) throw new TypeError("task is required");
  const surface=inferSurface(task,args.surface);
  const q=task.toLowerCase();
  const taskMode=inferTaskMode(task,args.task_mode);
  const current=Boolean(args.current_state) || /сейчас|текущ|today|current|price|цена|readiness|готов|status|статус|sellab|прода/.test(q);
  const finalPublic=Boolean(args.final_public) || /финальн|public|публич|опубли/.test(q);
  const implementation=Boolean(args.implementation) || /внеси|измени|implement|deploy|реализ|код|репозитор/.test(q);
  const productization=/productiz|продуктиз|превращ.*(?:в|во).*продукт|повторя.*(?:решен|интеграц)/.test(q);
  const economics=surface==="commercial-economics" || productization || /profit|margin|марж|экономик|рентабель|cac\b|ltv\b|delivery cost|support cost|себестоим|выгодн|repeatab|кастомизац/.test(q);
  const revenue=surface==="revenue-learning" || productization || /reply|ответ.*клиент|objection|возражен|qualification|proposal outcome|won.?lost|сделк|price reaction|proof reaction|повторя.*запрос/.test(q);
  const portfolio=surface==="portfolio-review" || productization || /portfolio|портфел|приоритет.*продукт|что.*(?:усили|отлож|productize)|какие.*продукт.*(?:усили|отлож)|merge review|depriorit/.test(q);

  const route=[];
  const reasons={};
  const sourceRequired=current||finalPublic||implementation||economics||revenue||portfolio||["website","market","campaign","product","proof"].includes(surface);
  if(sourceRequired) add(route,BRAND_ROLE.SOURCE_TRUTH,reasons,"task depends on current/final/implementation, economics, revenue, portfolio or entity/proof state");

  if(["brand","website","market","campaign","product","audit","portfolio-review"].includes(surface) || productization) {
    add(route,BRAND_ROLE.BRAND_STRATEGY,reasons,"task requires canonical brand interpretation");
  }

  if(["website","market","campaign","product","proof","commercial-economics","portfolio-review"].includes(surface) || /booking|offer|product|продукт|цена|sell|readiness|proof|кейс|demo|демо/.test(q) || economics || portfolio) {
    add(route,BRAND_ROLE.COMMERCIAL_ARCHITECT,reasons,"task depends on canonical entities, packaging or commercial state");
  }

  if(economics) add(route,BRAND_ROLE.COMMERCIAL_ECONOMICS,reasons,"task requires economics, repeatability or scalability evidence");
  if(revenue) add(route,BRAND_ROLE.REVENUE_INTELLIGENCE,reasons,"task requires evidence-bounded learning from recorded sales outcomes");
  if(portfolio) add(route,BRAND_ROLE.PORTFOLIO_INTELLIGENCE,reasons,"task requires cross-portfolio productization or priority reasoning");

  if(["market","campaign"].includes(surface) || productization || /gtm|distribution|дистриб|launch|запуск|marketplace|маркетплейс|product hunt|партнер|partner|outreach|рассыл/.test(q)) {
    add(route,BRAND_ROLE.MARKET_GTM,reasons,"task requires market/GTM/distribution decision");
  }

  if ((taskMode === "REDESIGN" || taskMode === "SYNTHESIS") && (surface === "website" || /presentation|презентац|hero|хиро|главн|структур|copy|текст/.test(q))) {
    add(route,BRAND_ROLE.PRESENTATION_SYNTHESIS,reasons,"redesign/new presentation requires fresh synthesis before channel projection");
  }

  if(surface==="website" || /linkedin|presentation|презентац|headline|hero|copy|текст|сообщен|message|страниц|сайт/.test(q)) {
    add(route,BRAND_ROLE.CHANNEL_ARCHITECT,reasons,"task requires a concrete channel/surface projection");
  }

  if(["website","market","campaign","product","proof","audit","portfolio-review"].includes(surface) || productization || /proof|доказ|case|кейс|demo|демо|claim|production|prototype|прототип/.test(q)) {
    add(route,BRAND_ROLE.PROOF_ANALYST,reasons,"claims or decisions require evidence and maturity control");
  }

  add(route,BRAND_ROLE.BRAND_QA,reasons,"all final Brand Architect outputs require independent G1-G18 review");

  const artifacts=route.map(role=>({
    role,
    title:BRAND_ROLE_DEFINITIONS[role].title,
    responsibility:BRAND_ROLE_DEFINITIONS[role].responsibility,
    outputs:BRAND_ROLE_DEFINITIONS[role].outputs
  }));

  return {
    task,
    surface,
    taskMode,
    flags:{current_state:current,final_public:finalPublic,implementation},
    route,
    reasons,
    artifacts,
    invariants:[
      "Orchestrator owns routing, run state, artifact acceptance/rejection and final assembly.",
      "Use the minimum sufficient role set; do not invoke every role mechanically.",
      "Only accepted specialist artifacts may be consumed downstream.",
      "Current/final commercial, revenue, economics, portfolio or distribution claims require validated live source context.",
      "Missing economics remain unknown; never invent margin, CAC or LTV.",
      "One sales event is an observation, not validated learning.",
      "Portfolio priority requires explicit evidence and cannot silently mutate canon.",
      "Specialists cannot mutate another role's artifact or silently change canon.",
      "BRAND_QA routes rework; it cannot manufacture evidence to turn FAIL into PASS.",
      "REDESIGN is not AUDIT: legacy approved presentation is observed material, not the mandatory creative target.",
      "A REDESIGN route must synthesize a materially new candidate before channel projection and QA."
    ]
  };
}

export const ROLE_TOOL = Object.freeze({
  name:"plan_agent_roles",
  title:"Plan VIIVERSION Core specialist roles",
  description:"Select the minimum specialist-role route for a VIIVERSION Core / Brand Architect task. Returns deterministic role ownership, reasons, output artifacts and invariants.",
  inputSchema:{
    type:"object",
    required:["task"],
    properties:{
      task:{type:"string",minLength:1,maxLength:5000},
      surface:{type:"string"},
      current_state:{type:"boolean"},
      final_public:{type:"boolean"},
      implementation:{type:"boolean"},
      task_mode:{type:"string",enum:["AUDIT","REDESIGN","SYNTHESIS","FINAL_COPY","IMPLEMENTATION","GOVERNANCE"]}
    },
    additionalProperties:false
  },
  annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
});
