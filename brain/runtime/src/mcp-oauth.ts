import type { D1 } from "./d1-repository.ts";

const issuer="https://viiversion-brain.viiversion.workers.dev";
const resource=issuer+"/mcp";
const scope="brain:memory";
const tokenTtl=3600;
const refreshTtl=30*24*3600;
const redirectPattern=/^https:\/\/chatgpt\.com\/(?:connector_platform_oauth_redirect|connector\/oauth\/[A-Za-z0-9_-]+)$/;
type Env={ BRAIN_DB:D1 };
type Client={client_id:string;redirect_uri:string;created_at:number};
type Code={code_hash:string;client_id:string;redirect_uri:string;pkce_challenge:string;resource:string;expires_at:number};
type Token={token_hash:string;client_id:string;token_kind:"access"|"refresh";resource:string;scope:string;expires_at:number};
type Pairing={pairing_id:string;request_hash:string;client_id:string;redirect_uri:string;expires_at:number;approved_at:number|null;consumed_at:number|null};

const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"}});
const fail=(error:string,status=400)=>json({error},status);
const now=()=>Math.floor(Date.now()/1000);
const safe=(value:string)=>value.replace(/[<>&"']/g,s=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"}[s]??s));
const random=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,"0")).join("");
async function digest(s:string){
 const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));
 return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function pkce(verifier:string){
 const bytes=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(verifier)));
 let binary="";for(const b of bytes)binary+=String.fromCharCode(b);
 return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}
function atOrigin(req:Request):boolean{
 const u=new URL(req.url);return u.protocol==="https:" && u.origin===issuer;
}
async function params(req:Request):Promise<URLSearchParams>{
 if(!req.headers.get("content-type")?.includes("application/x-www-form-urlencoded"))throw Error("invalid_request");
 const s=await req.text();if(s.length>8192)throw Error("invalid_request");return new URLSearchParams(s);
}
function validChallenge(s:string){return /^[A-Za-z0-9_-]{43}$/.test(s);}
function validClientId(s:string){return /^mark_[0-9a-f]{64}$/.test(s);}
function validProof(p:URLSearchParams){return p.get("response_type")==="code"&&p.get("code_challenge_method")==="S256"&&
 validChallenge(p.get("code_challenge")??"")&&(p.get("resource")??resource)===resource&&
 (p.get("scope")??scope)===scope&&(p.get("state")??"").length<=512;}
async function getClient(db:D1,id:string):Promise<Client|null>{
 if(!validClientId(id))return null;
 return db.prepare("SELECT client_id,redirect_uri,created_at FROM mark_oauth_clients WHERE client_id=?").bind(id).first<Client>();
}
async function validRequest(db:D1,p:URLSearchParams):Promise<Client|null>{
 if(!validProof(p))return null;
 const c=await getClient(db,p.get("client_id")??"");
 return c&&c.redirect_uri===p.get("redirect_uri")?c:null;
}
// The owner's *existing authenticated Cloudflare connection* approves the exact
// short-lived pairing record. There is no user-entered password or API token.
async function pairingFor(db:D1,c:Client,p:URLSearchParams):Promise<Pairing>{
 const fingerprint=await digest([c.client_id,c.redirect_uri,p.get("code_challenge")??"",p.get("state")??"",resource].join("|"));
 await db.prepare("INSERT OR IGNORE INTO mark_oauth_pairing(pairing_id,request_hash,client_id,redirect_uri,expires_at,approved_at,consumed_at) VALUES(?,?,?,?,?,NULL,NULL)")
   .bind("pair_"+random(),fingerprint,c.client_id,c.redirect_uri,now()+600).run();
 const record=await db.prepare("SELECT pairing_id,request_hash,client_id,redirect_uri,expires_at,approved_at,consumed_at FROM mark_oauth_pairing WHERE request_hash=?")
   .bind(fingerprint).first<Pairing>();
 if(!record)throw Error("PAIRING_CREATE_FAILED");
 return record;
}
function html(c:Client,p:URLSearchParams,pairing:Pairing){
 const item=(key:string)=>'<input type="hidden" name="'+key+'" value="'+safe(p.get(key)??"")+'">';
 const body=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta http-equiv="refresh" content="3"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VIIVERSION Mark — подключение</title>
<style>body{font-family:system-ui;color:#eef;background:#0b1420;margin:auto;padding:24px;max-width:560px}main{border:1px solid #4b5670;border-radius:14px;padding:25px;background:#182537}button{padding:12px 22px;font-weight:bold;border:0;border-radius:8px}code{overflow-wrap:anywhere}</style></head><body><main><h1>Подключение Марка к ChatGPT</h1>
<p>Вводить пароли, API-токены или другие технические секреты <strong>не требуется</strong>.</p>
<p>Для защиты корпоративной памяти подтвердите именно это подключение через уже подключённый Cloudflare в рабочем чате. Запрос действует 10 минут.</p>
<p>Номер запроса: <code>${safe(pairing.pairing_id)}</code></p>
<form method="POST" action="/oauth/authorize">${["client_id","redirect_uri","response_type","scope","state","code_challenge","code_challenge_method","resource"].map(item).join("")}
<button type="submit">Продолжить подключение</button></form>
<p>Страница автоматически завершит подключение после подтверждения. Оставь её открытой — обновление происходит каждые 3 секунды.</p></main></body></html>`;
 return new Response(body,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","referrer-policy":"no-referrer","x-frame-options":"DENY","x-content-type-options":"nosniff","content-security-policy":"default-src 'none'; form-action 'self'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"}});
}
async function insertToken(db:D1,clientId:string,kind:"access"|"refresh",value:string,ttl:number){
 await db.prepare("INSERT INTO mark_oauth_tokens(token_hash,client_id,token_kind,resource,scope,expires_at) VALUES(?,?,?,?,?,?)")
 .bind(await digest(value),clientId,kind,resource,scope,now()+ttl).run();
}
async function issueTokens(db:D1,clientId:string){
 const access=random(),refresh=random();
 await insertToken(db,clientId,"access",access,tokenTtl);
 await insertToken(db,clientId,"refresh",refresh,refreshTtl);
 return json({access_token:access,refresh_token:refresh,token_type:"Bearer",scope,expires_in:tokenTtl});
}
export async function verifyBrainOAuth(req:Request,db:D1):Promise<boolean>{
 const h=req.headers.get("authorization")??"";
 if(!h.startsWith("Bearer "))return false;
 const token=h.slice(7);if(!/^[0-9a-f]{64}$/.test(token))return false;
 const row=await db.prepare("SELECT client_id,token_kind,resource,scope,expires_at FROM mark_oauth_tokens WHERE token_hash=?")
 .bind(await digest(token)).first<Token>();
 return !!(row&&row.token_kind==="access"&&row.resource===resource&&row.scope===scope&&row.expires_at>now());
}
export function oauthChallenge(){
 return new Response(JSON.stringify({error:"authorization_required"}),{status:401,headers:{"content-type":"application/json","cache-control":"no-store","www-authenticate":'Bearer resource_metadata="'+issuer+'/.well-known/oauth-protected-resource", scope="'+scope+'"'}});
}
export async function brainOAuthRoutes(req:Request, env:Env):Promise<Response|null>{
 const u=new URL(req.url),path=u.pathname,db=env.BRAIN_DB;
 if(!path.startsWith("/oauth/")&&!path.startsWith("/.well-known/oauth-"))return null;
 if(!atOrigin(req))return fail("invalid_origin",400);
 if(path==="/.well-known/oauth-protected-resource"&&req.method==="GET")return json({resource,authorization_servers:[issuer],scopes_supported:[scope],bearer_methods_supported:["header"]});
 if(path==="/.well-known/oauth-authorization-server"&&req.method==="GET")return json({
  issuer,authorization_endpoint:issuer+"/oauth/authorize",token_endpoint:issuer+"/oauth/token",
  revocation_endpoint:issuer+"/oauth/revoke",registration_endpoint:issuer+"/oauth/register",
  response_types_supported:["code"],grant_types_supported:["authorization_code","refresh_token"],
  code_challenge_methods_supported:["S256"],token_endpoint_auth_methods_supported:["none"],scopes_supported:[scope],
  authorization_response_iss_parameter_supported:true,
 });
 if(path==="/oauth/register"&&req.method==="POST"){
  let data:Record<string,unknown>;
  try{if((req.headers.get("content-type")??"").indexOf("application/json")<0)return fail("invalid_client_metadata");
    const text=await req.text();if(text.length>2048)return fail("invalid_client_metadata");
    data=JSON.parse(text);
  }catch{return fail("invalid_client_metadata")}
  const uris=data.redirect_uris;
  if(!Array.isArray(uris)||uris.length!==1||typeof uris[0]!=="string"||!redirectPattern.test(uris[0]))return fail("invalid_redirect_uri");
  if(data.token_endpoint_auth_method!==undefined&&data.token_endpoint_auth_method!=="none")return fail("invalid_client_metadata");
  const existing=await db.prepare("SELECT client_id,redirect_uri,created_at FROM mark_oauth_clients WHERE redirect_uri=? LIMIT 1").bind(uris[0]).first<Client>();
  const count=await db.prepare("SELECT COUNT(*) AS n FROM mark_oauth_clients").first<{n:number}>();
  if(!existing&&(count?.n??0)>=10)return fail("too_many_clients",429);
  const c=existing??{client_id:"mark_"+random(),redirect_uri:uris[0],created_at:now()};
  if(!existing)await db.prepare("INSERT INTO mark_oauth_clients(client_id,redirect_uri,created_at) VALUES(?,?,?)").bind(c.client_id,c.redirect_uri,c.created_at).run();
  return json({client_id:c.client_id,client_name:"VIIVERSION Mark ChatGPT",redirect_uris:[c.redirect_uri],
    response_types:["code"],grant_types:["authorization_code","refresh_token"],token_endpoint_auth_method:"none"},201);
 }
 if(path==="/oauth/authorize"&&(req.method==="GET"||req.method==="POST")){
  let p:URLSearchParams;
  try{p=req.method==="GET"?u.searchParams:await params(req)}catch{return fail("invalid_request")}
  const c=await validRequest(db,p);if(!c)return fail("invalid_request");
  const pair=await pairingFor(db,c,p);
  if(pair.expires_at<=now())return fail("pairing_expired_restart_connection",410);
  if(req.method==="GET"&&!pair.approved_at)return html(c,p,pair);
  // After out-of-band approval, the original OAuth page finalizes automatically
  // on its next GET refresh. The request is bound to PKCE/state/client/redirect,
  // and the pairing is consumed atomically only once.

  // Important: accepting a submitted form is not enough for granting access.
  // Only a separate owner-authorized Cloudflare action can approve the exact
  // pairing_id in D1. A forged public request has no authority.
  if(p.has("owner_token"))return fail("technical_secret_login_disabled",400);
  if(pair.expires_at<=now())return fail("pairing_expired_restart_connection",403);
  const claim=await db.prepare(
   "UPDATE mark_oauth_pairing SET consumed_at=? WHERE pairing_id=? AND request_hash=? AND client_id=? AND approved_at IS NOT NULL AND consumed_at IS NULL AND expires_at>?"
  ).bind(now(),pair.pairing_id,pair.request_hash,c.client_id,now()).run();
  if(claim.meta?.changes!==1)return fail("owner_pairing_approval_required",403);
  const code=random();
  await db.prepare("INSERT INTO mark_oauth_codes(code_hash,client_id,redirect_uri,pkce_challenge,resource,expires_at) VALUES(?,?,?,?,?,?)")
   .bind(await digest(code),c.client_id,c.redirect_uri,p.get("code_challenge"),resource,now()+300).run();
  const redir=new URL(c.redirect_uri);
  redir.searchParams.set("code",code);
  if(p.has("state"))redir.searchParams.set("state",p.get("state")??"");
  redir.searchParams.set("iss",issuer);
  return new Response(null,{status:302,headers:{"location":redir.href,"cache-control":"no-store","referrer-policy":"no-referrer"}});
 }
 if(path==="/oauth/token"&&req.method==="POST"){
  let p:URLSearchParams;try{p=await params(req)}catch{return fail("invalid_request")}
  const clientId=p.get("client_id")??"";
  if(!await getClient(db,clientId))return fail("invalid_client",401);
  const grant=p.get("grant_type");
  if(grant==="authorization_code"){
   const code=p.get("code")??"",verifier=p.get("code_verifier")??"";
   if(!/^[0-9a-f]{64}$/.test(code)||!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier))return fail("invalid_grant");
   const hash=await digest(code),challenge=await pkce(verifier);
   const record=await db.prepare("SELECT code_hash,client_id,redirect_uri,pkce_challenge,resource,expires_at FROM mark_oauth_codes WHERE code_hash=?").bind(hash).first<Code>();
   if(!record||record.client_id!==clientId||record.redirect_uri!==p.get("redirect_uri")||
      record.pkce_challenge!==challenge||record.resource!==resource||record.expires_at<=now())return fail("invalid_grant");
   const del=await db.prepare("DELETE FROM mark_oauth_codes WHERE code_hash=? AND expires_at>?").bind(hash,now()).run();
   if(del.meta?.changes!==1)return fail("invalid_grant");
   return issueTokens(db,clientId);
  }
  if(grant==="refresh_token"){
   const token=p.get("refresh_token")??"";
   if(!/^[0-9a-f]{64}$/.test(token))return fail("invalid_grant");
   const hash=await digest(token);
   const record=await db.prepare("SELECT token_hash,client_id,token_kind,resource,scope,expires_at FROM mark_oauth_tokens WHERE token_hash=?").bind(hash).first<Token>();
   if(!record||record.client_id!==clientId||record.token_kind!=="refresh"||record.resource!==resource||record.scope!==scope||record.expires_at<=now())return fail("invalid_grant");
   const del=await db.prepare("DELETE FROM mark_oauth_tokens WHERE token_hash=? AND expires_at>?").bind(hash,now()).run();
   if(del.meta?.changes!==1)return fail("invalid_grant");
   return issueTokens(db,clientId);
  }
  return fail("unsupported_grant_type");
 }
 if(path==="/oauth/revoke"&&req.method==="POST"){
  let p:URLSearchParams;try{p=await params(req)}catch{return fail("invalid_request")}
  const token=p.get("token")??"",clientId=p.get("client_id")??"";
  if(/^[0-9a-f]{64}$/.test(token)&&await getClient(db,clientId)){
   await db.prepare("DELETE FROM mark_oauth_tokens WHERE token_hash=? AND client_id=?").bind(await digest(token),clientId).run();
  }
  return new Response(null,{status:200,headers:{"cache-control":"no-store"}});
 }
 return fail("not_found",404);
}
