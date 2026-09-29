export const MARKET_SNAPSHOT_DATE = "2026-09-30";

export const MARKET = {
  model: "VIIVERSION Mycelium",
  projectionFormula: "Entity × Market × Audience × Channel × Language × Goal → Projection",
  executionLoop: "Projection → GTM Motion → Action → Proof → CTA → Metric → Feedback",
  feedbackLoop: "Observation → Pattern → Validated Learning → Change Request → Strategic Review",
  motions: [
    {id:"M01",name:"FAST_DIRECT",purpose:"Fast cashflow from qualified end-business leads",primaryChannels:["Local direct","Global direct","referrals"],primaryKpi:"Positive replies → demos → paid entry",status:"Active"},
    {id:"M02",name:"FOLLOW_UP",purpose:"Move existing conversations and sent offers forward",primaryChannels:["WhatsApp","Telegram","email","LinkedIn","Zalo"],primaryKpi:"Stage progression",status:"Active"},
    {id:"M03",name:"PARTNER_B2B2B",purpose:"Create repeat partner-sourced revenue",primaryChannels:["Agencies","studios","CRM/ERP/POS integrators","vendors"],primaryKpi:"Qualified partner conversations",status:"Active"},
    {id:"M04",name:"PLATFORM_DISTRIBUTION",purpose:"Publish repeatable products into ecosystems/app marketplaces",primaryChannels:["ChatGPT apps","WordPress","Odoo","Shopify/POS","Square","Clover","HubSpot","Slack","Atlassian","Zapier"],primaryKpi:"Milestones closed / submissions",status:"Active"},
    {id:"M05",name:"PRODUCT_LAUNCH",purpose:"Generate global product discovery and beta users",primaryChannels:["Product Hunt","owned product pages","maker/dev communities"],primaryKpi:"Launch readiness / activated beta users",status:"Active"},
    {id:"M06",name:"FREELANCE_MARKETPLACE",purpose:"Win fast paid projects and platform proof",primaryChannels:["Upwork","LaborX","selected marketplaces"],primaryKpi:"Qualified replies / wins",status:"Active"},
    {id:"M07",name:"ENTERPRISE_VENDOR",purpose:"Maintain long-cycle high-ticket pipeline",primaryChannels:["LinkedIn","vendors","recruiters","integrators","network"],primaryKpi:"Qualified enterprise conversations",status:"Active"},
    {id:"M08",name:"PRODUCTIZATION",purpose:"Remove the blocker preventing a product from being sold repeatedly",primaryChannels:["repo","demo","docs","product page","legal/support","API adapter"],primaryKpi:"Distribution blocker removed",status:"Active"},
    {id:"M09",name:"LOCAL_REFERRAL",purpose:"Use local network for warm introductions and quick service sales",primaryChannels:["Nha Trang network","referrals","events","communities"],primaryKpi:"Warm conversations",status:"Active"}
  ],
  channels: [
    {id:"CH-WEB",name:"Website",type:"Owned surface",audiences:["SME owner","Operations lead","CTO/COO","Partners"],goals:["awareness","credibility","lead generation","solution discovery"],logic:"Parent brand → proof → solution discovery → depth → conversion",proof:"High; claims trace to Assets",cta:"Discuss task / product-specific CTA",depth:"progressive"},
    {id:"CH-LINKEDIN",name:"LinkedIn",type:"Professional network",audiences:["Founders","B2B buyers","CTO/COO","Partners"],goals:["awareness","credibility","partnership","lead generation"],logic:"Corporate authority + engineering proof + founder expertise",proof:"Medium-high; case/proof based",cta:"Conversation / profile / product route",depth:"medium-high"},
    {id:"CH-PH",name:"Product Hunt",type:"Launch/discovery",audiences:["Software users","makers","product buyers"],goals:["launch","awareness","adoption"],logic:"One owned software product per launch",proof:"Working product/demo required",cta:"Try / visit / join",depth:"product-specific"},
    {id:"CH-MKT",name:"Software / Plugin Marketplaces",type:"Marketplace",audiences:["Software users","platform users"],goals:["distribution","adoption","recurring revenue"],logic:"Installable/usable product-first presentation",proof:"Platform-compliant proof",cta:"Install / Try / Buy",depth:"product-specific"},
    {id:"CH-PARTNER",name:"Partners / Integrators",type:"B2B2B",audiences:["Agencies","software studios","CRM/ERP/POS integrators","vendors"],goals:["partnership","co-delivery","repeat sales"],logic:"Delivery capacity + specialist capability + reusable modules",proof:"Relevant engineering proof",cta:"Discuss partnership / pilot",depth:"high"},
    {id:"CH-OUT",name:"Outbound",type:"Direct acquisition",audiences:["Decision maker matched to buyer job"],goals:["qualified conversation","demo","paid entry"],logic:"One signal → one entity/offer → one proof → one CTA",proof:"Required when available",cta:"One low-friction next step",depth:"low-to-medium first touch"},
    {id:"CH-FREELANCE",name:"Freelance Marketplaces",type:"Project marketplace",audiences:["Project buyers"],goals:["paid entry","platform proof","reviews"],logic:"Role/project fit + proof + delivery scope",proof:"Platform portfolio proof",cta:"Apply / discuss scope",depth:"medium-high"},
    {id:"CH-ENT",name:"Enterprise / Vendor",type:"Direct / partner enterprise",audiences:["CTO","IT","operations","telecom/data buyers"],goals:["technical discovery","paid diagnostic","project","retainer"],logic:"Buyer problem → architecture → risk → proof → engagement model",proof:"High technical proof",cta:"Technical discovery / diagnostic",depth:"high"}
  ],
  launchWaves: [
    {id:"W1",label:"W1 · 0–30d",goal:"Publish / sell now",rule:"Own product pages + demos; app/plugin/Product Hunt or partner preparation where product form fits."},
    {id:"W2",label:"W2 · 30–90d",goal:"Marketplace adapters",rule:"Build adapters only after core API/contracts are stable."},
    {id:"W3",label:"W3 · 90–180d",goal:"Platform expansion",rule:"Expand only from actual installs, sales and repeat use."},
    {id:"ENTERPRISE",label:"ONGOING · Enterprise",goal:"Expert / partner sales",rule:"Paid diagnostic, PoC, expert sprint or retainer."},
    {id:"BETA",label:"BETA · Validate",goal:"Validate before platform build",rule:"Prove repeatable onboarding/output before broad distribution."}
  ],
  partnerChannels: [
    {id:"PC01",type:"Web / digital agencies",gap:"Backend, custom systems, Mini Apps, booking, integrations",cta:"15–20 min partner call",priority:"A"},
    {id:"PC02",type:"Software studios",gap:"Extra capacity, specialized stack, fast white-label delivery",cta:"Partner capability call",priority:"A"},
    {id:"PC03",type:"Odoo / ERP integrators",gap:"Custom modules, booking, POS, API, external customer UX",cta:"Technical partner call",priority:"A"},
    {id:"PC04",type:"HubSpot / CRM agencies",gap:"Custom API, AI, workflows, dashboards, data sync",cta:"Integration partner call",priority:"A"},
    {id:"PC05",type:"Shopify / e-commerce agencies",gap:"Custom apps, POS, checkout, AI, external integrations",cta:"Commerce partner call",priority:"A"},
    {id:"PC06",type:"POS / payment integrators",gap:"Custom checkout, middleware, booking, analytics, CRM sync",cta:"Technical discovery call",priority:"A"},
    {id:"PC07",type:"AI automation agencies",gap:"Deep engineering, agents, custom apps, integrations",cta:"Partner capability call",priority:"B"},
    {id:"PC08",type:"Enterprise / telecom integrators & vendors",gap:"Oracle, PL/SQL, ETL, RA/FM, L2/L3, complex integration",cta:"Technical capability call",priority:"A"}
  ],
  distribution: {
    P07:{name:"Booking Engine",status:"Sell now",wave:"W1",routes:{vietnamDirect:"PRIMARY",globalDirect:"PRIMARY",agencies:"PRIMARY",productHunt:"SECONDARY",odoo:"SECONDARY",shopifyPos:"SECONDARY",square:"SECONDARY",clover:"SECONDARY"},nextAction:"Extract generic booking demo/API from vertical patterns before scalable marketplace distribution."},
    P20:{name:"POS / payment middleware",status:"Sell via partners",wave:"W1",routes:{globalDirect:"PRIMARY",agencies:"PRIMARY",productHunt:"SECONDARY",odoo:"SECONDARY",shopifyPos:"SECONDARY",square:"SECONDARY",clover:"SECONDARY"},nextAction:"Build reproducible sandbox demo + API contract; target one POS partner first."},
    P21:{name:"VIIVERSION Connect / API-webhooks integration layer",status:"Sell now",wave:"W1",routes:{globalDirect:"PRIMARY",agencies:"PRIMARY",odoo:"SECONDARY",shopifyPos:"SECONDARY",square:"SECONDARY",clover:"SECONDARY",hubspot:"SECONDARY",slack:"SECONDARY",zapier:"SECONDARY"},nextAction:"Create connector SDK, logs/retry contract and reference integrations before adapter marketplace work."},
    P27:{name:"Mini App Factory",status:"Package before scale",wave:"W2",routes:{globalDirect:"PRIMARY",agencies:"PRIMARY",productHunt:"SECONDARY"},nextAction:"Finish production gate, agency onboarding and partner pricing."},
    P28:{name:"VIIVERSION Proposal Studio",status:"Sell service now",wave:"W1",routes:{globalDirect:"PRIMARY",agencies:"PRIMARY",chatgptAppDirectory:"PRIMARY",productHunt:"PRIMARY",slack:"SECONDARY"},nextAction:"Close app-directory readiness and Product Hunt launch assets with external beta proof."},
    P29:{name:"AI Website / WordPress Audit Agent",status:"Sell now",wave:"W1",routes:{globalDirect:"PRIMARY",agencies:"PRIMARY",chatgptAppDirectory:"PRIMARY",productHunt:"SECONDARY",wordpressOrg:"PRIMARY"},nextAction:"Package read-only WordPress plugin + hosted audit handoff + agency report mode."},
    P34:{name:"AI workflow automation",status:"Sell now",wave:"W1",routes:{vietnamDirect:"PRIMARY",globalDirect:"PRIMARY",agencies:"PRIMARY",chatgptAppDirectory:"SECONDARY",odoo:"SECONDARY",shopifyPos:"SECONDARY",hubspot:"SECONDARY",slack:"SECONDARY",zapier:"SECONDARY"},nextAction:"Build one-flow automation demo + reusable connector recipes."}
  },
  pipeline: [
    {id:"D001",entityId:"P28",channel:"ChatGPT app directory / Apps SDK",motion:"M04",stage:"Submission readiness",blocker:"Need current final submission-readiness audit",status:"Active"},
    {id:"D002",entityId:"P28",channel:"Product Hunt",motion:"M05",stage:"Launch preparation",blocker:"Need external beta/user proof and launch pack",status:"Active"},
    {id:"D003",entityId:"P29",channel:"WordPress.org",motion:"M04",stage:"Packaging",blocker:"Plugin package / hosted service boundary",status:"Active"},
    {id:"D004",entityId:"P20",channel:"Clover App Market",motion:"M04",stage:"Feasibility + sandbox",blocker:"Developer account approval + Clover-specific payment requirements",status:"Active"},
    {id:"D005",entityId:"P20",channel:"Square",motion:"M04",stage:"Integration validation",blocker:"Marketplace partnership acceptance may be constrained",status:"Active"},
    {id:"D006",entityId:"P07",channel:"Own product + Product Hunt later",motion:"M08",stage:"Generic product extraction",blocker:"Current demos are vertical-specific proofs, not a generic product yet",status:"Active"},
    {id:"D007",entityId:"P21",channel:"Odoo / POS ecosystems",motion:"M08",stage:"API contract",blocker:"Stable public/internal API contract",status:"Active"},
    {id:"D008",entityId:"P27",channel:"Agencies / white-label",motion:"M03",stage:"Partner packaging",blocker:"Production gate / partner kit",status:"Active"}
  ]
};

export const MARKET_TOOLS = [
  {
    name:"get_market_context",
    title:"Get VIIVERSION market/GTM context",
    description:"Return current compact GTM motions, channel profiles, launch waves, partner channels and distribution snapshot. Refresh live Commercial Matrix before operational/final decisions.",
    inputSchema:{type:"object",properties:{motion_id:{type:"string"},channel_id:{type:"string"},entity_id:{type:"string"}},additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },
  {
    name:"get_distribution_routes",
    title:"Get VIIVERSION distribution routes",
    description:"Return compact entity × channel fit plus active distribution-pipeline records for a VIIVERSION entity.",
    inputSchema:{type:"object",required:["entity_id"],properties:{entity_id:{type:"string"}},additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },
  {
    name:"plan_market_projection",
    title:"Plan VIIVERSION market projection",
    description:"Create a projection contract using Entity × Market × Audience × Channel × Language × Goal without changing canonical identity.",
    inputSchema:{type:"object",required:["entity_id","market","audience","channel","language","goal"],properties:{
      entity_id:{type:"string"},market:{type:"string"},audience:{type:"string"},channel:{type:"string"},language:{type:"string"},goal:{type:"string"}
    },additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },
  {
    name:"plan_gtm_motion",
    title:"Choose VIIVERSION GTM motion",
    description:"Choose the primary GTM motion for a task and return the next-action contract, proof/CTA/KPI requirements and live refresh sources.",
    inputSchema:{type:"object",required:["task"],properties:{
      task:{type:"string",minLength:1,maxLength:5000},entity_id:{type:"string"},market:{type:"string"},audience:{type:"string"},goal:{type:"string"}
    },additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },
  {
    name:"plan_productization",
    title:"Plan VIIVERSION software/plugin productization",
    description:"Turn an existing entity or new product/plugin concept into a productization and engineering-handoff contract without claiming implementation is complete.",
    inputSchema:{type:"object",required:["concept"],properties:{
      concept:{type:"string",minLength:1,maxLength:5000},entity_id:{type:"string"},target_platforms:{type:"array",items:{type:"string"}},current_stage:{type:"string"}
    },additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },
  {
    name:"evaluate_market_signal",
    title:"Evaluate VIIVERSION market signal",
    description:"Classify market evidence as Observation, Pattern or candidate Validated Learning and prevent automatic canonical changes.",
    inputSchema:{type:"object",required:["observation"],properties:{
      observation:{type:"string",minLength:1,maxLength:5000},
      repeated_evidence_count:{type:"integer",minimum:1,maximum:100000},
      cross_channel:{type:"boolean"},
      commercial_outcome:{type:"boolean"},
      propose_change:{type:"boolean"}
    },additionalProperties:false},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  }
];

function pickMotion(task) {
  const s=String(task||"").toLowerCase();
  if(/follow.?up|фоллоу|ответ|reply|дожать|повторн/.test(s)) return "M02";
  if(/partner|партн|integrator|интегратор|agency|агентств|white.?label|b2b2b/.test(s)) return "M03";
  if(/marketplace|маркетплейс|app directory|plugin|плагин|wordpress|odoo|shopify|clover|square|hubspot|slack|atlassian|zapier/.test(s)) return "M04";
  if(/product hunt|launch|запуск|релиз|beta user|бета/.test(s)) return "M05";
  if(/upwork|laborx|freelance|фриланс/.test(s)) return "M06";
  if(/enterprise|vendor|телеком|telecom|oracle|pl\/sql|etl|ra\/fm|revenue assurance/.test(s)) return "M07";
  if(/productiz|продуктиз|упаков|generic product|повторяем|созда.*продукт|созда.*плагин|созда.*app/.test(s)) return "M08";
  if(/referral|реферал|warm intro|знакомств|локальн.*сеть/.test(s)) return "M09";
  return "M01";
}

export function executeMarketTool(name,args={}) {
  if(name==="get_market_context"){
    const motionId=String(args.motion_id||"").trim();
    const channelId=String(args.channel_id||"").trim();
    const entityId=String(args.entity_id||"").trim();
    return {
      model:MARKET.model,
      projectionFormula:MARKET.projectionFormula,
      executionLoop:MARKET.executionLoop,
      feedbackLoop:MARKET.feedbackLoop,
      motions:motionId?MARKET.motions.filter(x=>x.id===motionId):MARKET.motions,
      channels:channelId?MARKET.channels.filter(x=>x.id===channelId):MARKET.channels,
      launchWaves:MARKET.launchWaves,
      partnerChannels:MARKET.partnerChannels,
      distribution:entityId?MARKET.distribution[entityId]||null:MARKET.distribution,
      pipeline:entityId?MARKET.pipeline.filter(x=>x.entityId===entityId):MARKET.pipeline,
      sourceSnapshotDate:MARKET_SNAPSHOT_DATE,
      liveRefreshRequiredForOperationalDecision:true
    };
  }
  if(name==="get_distribution_routes"){
    const entityId=String(args.entity_id||"").trim();
    return {
      entityId,
      distribution:MARKET.distribution[entityId]||null,
      pipeline:MARKET.pipeline.filter(x=>x.entityId===entityId),
      liveSources:["Distribution_Matrix","Channel_Profiles","Launch_Waves","Distribution_Pipeline"],
      sourceSnapshotDate:MARKET_SNAPSHOT_DATE,
      rule:"A marketplace/platform is valid only when product form, maturity, proof and install/use path fit the channel."
    };
  }
  if(name==="plan_market_projection"){
    const channelKey=String(args.channel||"").trim();
    const channel=MARKET.channels.find(x=>x.id===channelKey||x.name.toLowerCase()===channelKey.toLowerCase())||null;
    return {
      formula:MARKET.projectionFormula,
      sourceEntityId:String(args.entity_id||"").trim(),
      market:String(args.market||"").trim(),
      audience:String(args.audience||"").trim(),
      channel:channel||{requested:channelKey},
      language:String(args.language||"").trim(),
      goal:String(args.goal||"").trim(),
      requiredProjectionFields:["display_name","headline","short_description","value_proposition","proof_selection","technical_depth","CTA"],
      precedence:["Canonical Truth","Verified Commercial State","Proof/Claim Limits","Market Constraints","Audience Needs","Channel Rules","Language","Goal","Creative Execution"],
      liveRefresh:["Products/Entity_Registry","Assets","Global Brand & Market Strategy","Channel_Profiles"],
      canonicalMutationAllowed:false
    };
  }
  if(name==="plan_gtm_motion"){
    const motionId=pickMotion(args.task);
    const motion=MARKET.motions.find(x=>x.id===motionId);
    const entityId=String(args.entity_id||"").trim();
    const pipeline=entityId?MARKET.pipeline.filter(x=>x.entityId===entityId):[];
    return {
      primaryMotion:motion,
      entityId:entityId||null,
      market:String(args.market||"").trim()||"infer",
      audience:String(args.audience||"").trim()||"infer",
      goal:String(args.goal||"").trim()||"infer",
      activePipelineSnapshot:pipeline,
      nextActionContract:["one closed milestone","relevant proof","one CTA","owner","KPI/outcome metric","feedback capture"],
      liveRefresh:["GTM_Motions","Distribution_Matrix","Distribution_Pipeline","Daily_GTM","Channel_Profiles"],
      additionalLiveRefresh:motionId==="M02"?["Sales_Router","Outreach_Queue","Sales Playbook"]:motionId==="M03"?["Partner_Channels"]:[],
      rule:"Choose one primary motion for the next action; parallel motions may exist but should not blur the immediate execution block."
    };
  }
  if(name==="plan_productization"){
    const entityId=String(args.entity_id||"").trim();
    const existing=Boolean(entityId && MARKET.distribution[entityId]);
    return {
      entityState:existing?"existing_entity":"candidate_or_unmapped_concept",
      entityId:entityId||null,
      concept:String(args.concept||"").trim(),
      currentStage:String(args.current_stage||"").trim()||null,
      targetPlatforms:Array.isArray(args.target_platforms)?args.target_platforms:[],
      gates:[
        "canonical/candidate mapping",
        "target user + buyer job",
        "repeatable workflow",
        "generic functional contract",
        "inputs/outputs + integration boundaries",
        "authentication/data/privacy requirements",
        "install/use path",
        "support/terms requirements",
        "proof plan + maturity gate",
        "distribution ecosystem fit",
        "release/readiness criteria",
        "engineering implementation handoff"
      ],
      engineeringHandoff:["functional requirements","API/integration boundaries","data model/auth constraints","platform compliance","test/eval contract","deployment target","release gate"],
      postBuildLoop:"implementation → proof → launch/distribution → metrics → feedback",
      canonicalMutationAllowed:false,
      implementationClaimAllowed:false
    };
  }
  if(name==="evaluate_market_signal"){
    const count=Math.max(1,Number(args.repeated_evidence_count||1));
    const cross=Boolean(args.cross_channel);
    const commercial=Boolean(args.commercial_outcome);
    let stage="Observation";
    if(count>=2) stage="Pattern";
    if(count>=3 && (cross||commercial)) stage="Candidate Validated Learning";
    return {
      observation:String(args.observation||"").trim(),
      evidenceCount:count,
      crossChannel:cross,
      commercialOutcome:commercial,
      stage,
      proposeChange:Boolean(args.propose_change),
      nextStep:stage==="Observation"?"record in Market_Signals and collect repeated evidence":stage==="Pattern"?"test against more buyers/channels and connect to measurable outcomes":"prepare a Change Request for strategic review if the implication is material",
      canonicalMutationAllowed:false,
      feedbackLoop:MARKET.feedbackLoop
    };
  }
  return null;
}
