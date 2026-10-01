export const LIVE_SOURCE_REGISTRY = {
  corporate: {
    level:"L1",
    type:"google_doc",
    title:"VIIVERSION — Corporate Strategy & Positioning",
    driveId:"1nfRAgnSiEv13XUOcqgRostFYdUlbFo83eOLRLQNLnN4"
  },
  commercialMatrix: {
    level:"L2",
    type:"google_sheet",
    title:"VIIVERSION Commercial Matrix",
    driveId:"14i9E4WGazfwwsGl2mP_0TtZa9URBI-zeKj-qromAl-4"
  },
  globalBrand: {
    level:"L3",
    type:"google_doc",
    title:"VIIVERSION — Global Brand & Market Strategy",
    driveId:"1Mhl1tJqaE8xyviEO9FQGKxA26c-_Mo6UE3J1ZCugKPI"
  },
  salesPlaybook: {
    level:"sales_execution",
    type:"google_doc",
    title:"VIIVERSION Sales Playbook v1",
    driveId:"1itFsDhoPZqyH1NN1emca9u1HFeqYouPu4gcuuzm9BL4"
  },
  websiteStrategy: {
    level:"L4",
    type:"google_doc",
    title:"VIIVERSION — Website Channel Strategy & Projection",
    driveId:"1WsVbntOo8tN9qN2Q-GW60MnY3eBhHFWOn6YO7PsUMlI"
  },
  websiteUX: {
    level:"L5_design",
    type:"google_doc",
    title:"VIIVERSION — Website UX & Design System",
    driveId:"1nWOpqPFpTYG1N8OCPcc0GLwvN5ed3gl5NmeIqECRcNE"
  },
  homepageArchitecture: {
    level:"L4",
    type:"google_doc",
    title:"VIIVERSION — Homepage Architecture",
    driveId:"1xBxcPm41TJ_wMBSxPWx-Wol8SeyXhcFkh6sEa_2rSuo"
  }
};

const TAB_GROUPS = {
  identity:["Entity_Registry"],
  commercial:["Products","Offers","Verticals"],
  proof:["Assets"],
  website:["Website_Decisions","Homepage_Blocks","UX_Rules","Website_Mapping"],
  market:["Channel_Profiles","Projection_Index","Market_Signals"],
  distribution:["Distribution_Matrix","Ecosystems","Launch_Waves","Distribution_Dashboard","Partner_Channels","GTM_Motions","Distribution_Pipeline","Daily_GTM"],
  sales:["Sales_Router","Outreach_Queue","Cross_Sell"],
  revenue:["Sales_Router","Outreach_Queue","Revenue_Intelligence","Experiments"],
  economics:["Commercial_Economics"],
  portfolio:["Portfolio_Intelligence","Revenue_Intelligence","Commercial_Economics","Market_Signals"],
  governance:["Decision_Log","Command_Registry"]
};

export const LIVE_SOURCE_TOOLS = [
  {
    name:"get_live_source_plan",
    title:"Plan live VIIVERSION Source of Truth reads",
    description:"Return the minimal Google Drive documents and Commercial Matrix tabs that must be read live for a VIIVERSION task. This tool does not fetch Drive itself; the ChatGPT Google Drive app should perform the returned reads under the user's authorization.",
    inputSchema:{type:"object",required:["task"],properties:{
      task:{type:"string",minLength:1,maxLength:5000},
      surface:{type:"string"},
      final_public:{type:"boolean"},
      implementation:{type:"boolean"},
      current_state:{type:"boolean"}
    },additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },
  {
    name:"validate_live_context",
    title:"Validate live VIIVERSION context bundle",
    description:"Validate that a context bundle includes the live source classes required for the requested VIIVERSION task before final claims or implementation.",
    inputSchema:{type:"object",required:["task","source_classes"],properties:{
      task:{type:"string",minLength:1,maxLength:5000},
      surface:{type:"string"},
      final_public:{type:"boolean"},
      implementation:{type:"boolean"},
      current_state:{type:"boolean"},
      observed_at:{type:"string"},
      source_classes:{type:"array",items:{type:"string"}},
      tabs_read:{type:"array",items:{type:"string"}}
    },additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  }
];

function classify(task,surface){
  const s=(task+" "+(surface||"")).toLowerCase();
  return {
    website:/website|site|сайт|homepage|главн|hero|ux|ui/.test(s),
    redesign:/redesign|rebuild|редизайн|пересоб|заново|с нуля|не устраива|отверга.*(?:текст|hero|хиро|структур)|сохран.*только.*(?:цвет|градиент|стил)|preserve only.*(?:visual|color|gradient|style)|not an audit|не аудит/.test(s),
    outreach:/outreach|рассыл|follow.?up|фоллоу|whatsapp|telegram|email|lead|лид/.test(s),
    market:/market|рынок|positioning|позиционир|audience|аудитор|channel|канал/.test(s),
    gtm:/\bgtm\b|go.?to.?market|выход.*рынок|вывод.*рынок/.test(s),
    distribution:/distribution|дистриб|marketplace|маркетплейс|product hunt|plugin|плагин|app directory|wordpress|odoo|shopify|clover|square|partner|партнер|integrator|интегратор/.test(s),
    product:/product|продукт|software|booking|бронир|price|цена|readiness|готов|status|статус/.test(s),
    productization:/productiz|продуктиз|превращ.*(?:в|во).*продукт|повторя.*(?:решен|интеграц)/.test(s),
    economics:/profit|margin|марж|экономик|рентабель|cac\b|ltv\b|delivery cost|support cost|себестоим|выгодн|repeatab|кастомизац/.test(s),
    revenueLearning:/revenue learning|sales learning|sales event|what.*sales.*teach|client requested|prospect requested|customer requested|requested integration|чему.*продаж|ответ.*клиент|клиент.*(?:попрос|запрос)|reply|objection|возражен|qualification|proposal outcome|won.?lost|price reaction|proof reaction|повторя.*запрос/.test(s),
    portfolio:/portfolio|портфел|приоритет.*продукт|что.*(?:усили|отлож|productize)|какие.*продукт.*(?:усили|отлож)|merge review|depriorit/.test(s),
    proof:/proof|доказ|case|кейс|demo|демо|maturity|внедрен|production|prototype|прототип/.test(s),
    governance:/canon|канон|canonical|корпоративн.*стратег|brand.*strategy|стратег.*бренд|principal.*direction|business.*direction|основн.*направлен|направлен.*бренд|canonical.*category|канонич.*категор|governance|decision log|change request/.test(s)
  };
}

export function buildLiveSourcePlan(args={}){
  const flags=classify(String(args.task||""),args.surface);
  const docs=new Set();
  const tabs=new Set();

  docs.add("corporate");
  if(flags.market||flags.gtm||flags.distribution||flags.outreach||flags.redesign||flags.productization||flags.portfolio||args.final_public) docs.add("globalBrand");
  if(flags.outreach||flags.revenueLearning) docs.add("salesPlaybook");
  if(flags.website) {
    docs.add("websiteStrategy");
    docs.add("websiteUX");
    docs.add("homepageArchitecture");
  }

  if(flags.product||flags.productization||flags.economics||flags.revenueLearning||flags.portfolio||flags.proof||flags.market||flags.gtm||flags.distribution||flags.outreach||flags.website||args.final_public||args.current_state||args.implementation){
    tabs.add("Entity_Registry");
  }
  if(flags.product||flags.productization||flags.economics||flags.revenueLearning||flags.portfolio||flags.market||flags.gtm||flags.distribution||flags.outreach||flags.website||args.final_public||args.current_state||args.implementation){
    for(const x of TAB_GROUPS.commercial) tabs.add(x);
  }
  if(flags.proof||flags.productization||flags.portfolio||flags.market||flags.gtm||flags.distribution||flags.outreach||flags.website||args.final_public){
    tabs.add("Assets");
  }
  if(flags.website){
    for(const x of TAB_GROUPS.website) tabs.add(x);
  }
  if(flags.market||flags.gtm){
    for(const x of TAB_GROUPS.market) tabs.add(x);
  }
  if(flags.gtm){
    for(const x of ["Distribution_Matrix","Launch_Waves","GTM_Motions","Distribution_Pipeline","Daily_GTM"]) tabs.add(x);
  }
  if(flags.distribution){
    for(const x of TAB_GROUPS.distribution) tabs.add(x);
    for(const x of TAB_GROUPS.market) tabs.add(x);
  }
  if(flags.outreach){
    for(const x of TAB_GROUPS.sales) tabs.add(x);
    tabs.add("GTM_Motions");
    tabs.add("Channel_Profiles");
    tabs.add("Market_Signals");
  }
  if(flags.revenueLearning||flags.productization||flags.portfolio){
    for(const x of TAB_GROUPS.revenue) tabs.add(x);
  }
  if(flags.economics||flags.productization||flags.portfolio){
    for(const x of TAB_GROUPS.economics) tabs.add(x);
  }
  if(flags.portfolio||flags.productization){
    for(const x of TAB_GROUPS.portfolio) tabs.add(x);
  }
  if(flags.governance){
    for(const x of TAB_GROUPS.governance) tabs.add(x);
    tabs.add("Entity_Registry");
  }
  if(args.implementation){
    tabs.add("Decision_Log");
    if(flags.website) tabs.add("Website_Decisions");
  }

  const requiredClasses=["L1_identity"];
  if(docs.has("globalBrand")) requiredClasses.push("L3_market_brand");
  if(docs.has("salesPlaybook")) requiredClasses.push("sales_execution");
  if(tabs.size) requiredClasses.push("L2_commercial_matrix");
  if(tabs.has("Assets")) requiredClasses.push("proof_registry");
  if(flags.website) requiredClasses.push("website_projection");
  if(flags.distribution||flags.gtm) requiredClasses.push("distribution_state");
  if(flags.outreach) requiredClasses.push("sales_pipeline_state");
  if(flags.revenueLearning||flags.productization||flags.portfolio) requiredClasses.push("revenue_learning_state");
  if(flags.economics||flags.productization||flags.portfolio) requiredClasses.push("commercial_economics_state");
  if(flags.portfolio||flags.productization) requiredClasses.push("portfolio_intelligence_state");

  return {
    task:String(args.task||"").trim(),
    liveRequired:Boolean(args.final_public||args.current_state||args.implementation||flags.redesign||flags.product||flags.productization||flags.economics||flags.revenueLearning||flags.portfolio||flags.proof||flags.market||flags.distribution||flags.outreach),
    documents:[...docs].map(key=>({key,...LIVE_SOURCE_REGISTRY[key]})),
    commercialMatrix:{
      driveId:LIVE_SOURCE_REGISTRY.commercialMatrix.driveId,
      title:LIVE_SOURCE_REGISTRY.commercialMatrix.title,
      tabs:[...tabs]
    },
    requiredSourceClasses:[...new Set(requiredClasses)],
    execution:[
      "Read only the returned Google Drive sources using the connected Google Drive app.",
      "Preserve source precedence: L1 → L2 → Proof → L3 → channel projection → implementation; specialized Revenue/Economics/Portfolio registries own only their analytical facts.",
      "Use snapshot only for fast reasoning; live observations override snapshot for current facts.",
      "Pass observed source classes/tabs to validate_live_context before final public claims or implementation."
    ]
  };
}

export function validateLiveContext(args={}){
  const plan=buildLiveSourcePlan(args);
  const observed=new Set(Array.isArray(args.source_classes)?args.source_classes:[]);
  const tabs=new Set(Array.isArray(args.tabs_read)?args.tabs_read:[]);
  const missingClasses=plan.requiredSourceClasses.filter(x=>!observed.has(x));
  const requiredTabs=plan.commercialMatrix.tabs;
  const missingTabs=requiredTabs.filter(x=>!tabs.has(x));

  const flags=classify(String(args.task||""),args.surface);
  const mustBeStrict=Boolean(args.final_public||args.current_state||args.implementation||flags.productization||flags.economics||flags.revenueLearning||flags.portfolio);
  const pass=mustBeStrict ? (missingClasses.length===0 && missingTabs.length===0) : missingClasses.length===0;

  return {
    pass,
    strict:mustBeStrict,
    observedAt:args.observed_at||null,
    missingSourceClasses:missingClasses,
    missingTabs:mustBeStrict?missingTabs:[],
    requiredPlan:plan,
    rule:pass
      ?"Live-context gate satisfied. Current live observations may be used within their source authority."
      :"Do not make unsupported current/final claims. Read the missing live sources or explicitly downgrade the answer to snapshot/uncertain."
  };
}
