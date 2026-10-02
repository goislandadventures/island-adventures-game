export interface Env { DB: D1Database; ASSETS: Fetcher; BUILD_ID?: string; }

const enc = new TextEncoder();
const SESSION_DAYS = 30;

function json(data: unknown, status = 200, headers: Record<string,string> = {}) {
  return Response.json(data, { status, headers });
}
function b64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }
function unb64(s: string) { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }
async function sha256(value: string) { const d=await crypto.subtle.digest('SHA-256',enc.encode(value)); return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join(''); }
function validB64(value:string,bytes?:number){
  try{
    const raw=atob(value);
    return /^[A-Za-z0-9+/]+={0,2}$/.test(value) && (!bytes||raw.length===bytes);
  }catch{return false;}
}
const FAKE_SALT='AAAAAAAAAAAAAAAAAAAAAA==';

function cookieToken(request: Request) {
  const cookie=request.headers.get('cookie')||'';
  return cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('ia_session='))?.split('=')[1] || null;
}
async function currentPlayer(request: Request, env: Env) {
  const token=cookieToken(request); if (!token) return null;
  const tokenHash=await sha256(token); const now=Date.now();
  return env.DB.prepare(`SELECT p.id,p.email,p.display_name,p.marketing_opt_in,p.tutorial_completed,p.force_password_change FROM sessions s JOIN players p ON p.id=s.player_id WHERE s.token_hash=? AND s.expires_at>?`).bind(tokenHash,now).first();
}
async function createSession(playerId:string, env:Env) {
  const raw=b64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  const tokenHash=await sha256(raw), now=Date.now(), expires=now+SESSION_DAYS*86400000;
  await env.DB.prepare('INSERT INTO sessions(token_hash,player_id,expires_at,created_at) VALUES(?,?,?,?)').bind(tokenHash,playerId,expires,now).run();
  return `ia_session=${raw}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS*86400}`;
}
function metricSql(metric:string) {
  if (metric==='reviews') return `SELECT company_name,company_value,rating,review_count,lifetime_revenue,lifetime_profit FROM companies ORDER BY review_count DESC, rating DESC LIMIT 50`;
  if (metric==='rating') return `SELECT company_name,company_value,rating,review_count,lifetime_revenue,lifetime_profit FROM companies WHERE review_count>=10 ORDER BY rating DESC, review_count DESC LIMIT 50`;
  if (metric==='revenue') return `SELECT company_name,company_value,rating,review_count,lifetime_revenue,lifetime_profit FROM companies ORDER BY lifetime_revenue DESC LIMIT 50`;
  if (metric==='profit') return `SELECT company_name,company_value,rating,review_count,lifetime_revenue,lifetime_profit FROM companies ORDER BY lifetime_profit DESC LIMIT 50`;
  return `SELECT company_name,company_value,rating,review_count,lifetime_revenue,lifetime_profit FROM companies ORDER BY company_value DESC LIMIT 50`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/health') return json({ ok:true, service:'island-adventures', version:'1.0.0', buildId:env.BUILD_ID||null },200,{'Cache-Control':'no-store'});
    if (url.pathname === '/api/build-id' && request.method==='GET') {
      return new Response(env.BUILD_ID||'',{status:200,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store, no-cache, must-revalidate, max-age=0','Pragma':'no-cache','Expires':'0'}});
    }

    if (url.pathname === '/api/leaderboard' && request.method==='GET') {
      const metric=url.searchParams.get('metric')||'value';
      const rows=await env.DB.prepare(metricSql(metric)).all();
      return json({metric,results:rows.results});
    }

    if (url.pathname === '/api/marketing-market' && request.method==='GET') {
      const cutoff=Date.now()-30*86400000;
      const rows=await env.DB.prepare('SELECT state_json FROM companies WHERE updated_at>=?').bind(cutoff).all();
      const channelIds=['search','maps','social','hotel','content'] as const;
      const counts:Record<string,number>={search:0,maps:0,social:0,hotel:0,content:0};
      const totalPlayers=rows.results.length;
      for(const row of rows.results as any[]){
        try{
          const state=JSON.parse(String(row.state_json||'{}'));
          const budget=Number(state?.marketing?.dailyBudget||0);
          let focus=String(state?.marketing?.focus||'search');
          if(focus==='organic')focus='search';
          if(budget>0&&channelIds.includes(focus as any))counts[focus]=(counts[focus]||0)+1;
        }catch{}
      }
      const channels=Object.fromEntries(channelIds.map(id=>[id,{players:counts[id]||0,saturation:totalPlayers?Number(((counts[id]||0)/totalPlayers).toFixed(4)):0}]));
      return json({totalPlayers,activeWindowDays:30,channels});
    }

    if (url.pathname === '/api/auth/salt' && request.method==='GET') {
      const email=String(url.searchParams.get('email')||'').trim().toLowerCase();
      const p:any=email?await env.DB.prepare('SELECT password_salt FROM players WHERE email=?').bind(email).first():null;
      return json({salt:String(p?.password_salt||FAKE_SALT)},200,{'Cache-Control':'no-store'});
    }

    if (url.pathname === '/api/auth/register' && request.method==='POST') {
      const body:any=await request.json();
      const email=String(body.email||'').trim().toLowerCase();
      const passwordProof=String(body.passwordProof||'');
      const passwordSalt=String(body.passwordSalt||'');
      const marketingOptIn=body.marketingOptIn===true;
      if (!/^\S+@\S+\.\S+$/.test(email) || !validB64(passwordProof,32) || !validB64(passwordSalt,16)) {
        return json({error:'Valid email and a 10+ character password are required.'},400);
      }
      const exists=await env.DB.prepare('SELECT id FROM players WHERE email=?').bind(email).first();
      if (exists) return json({error:'That email already has an account. Sign in instead.'},409);
      const id=crypto.randomUUID(), now=Date.now();
      const passwordHash='v2:'+await sha256(passwordProof);
      await env.DB.prepare('INSERT INTO players(id,email,display_name,password_hash,password_salt,marketing_opt_in,marketing_opt_in_at,created_at,last_seen_at) VALUES(?,?,?,?,?,?,?,?,?)')
        .bind(id,email,'',passwordHash,passwordSalt,marketingOptIn?1:0,marketingOptIn?now:null,now,now).run();
      const cookie=await createSession(id,env);
      return json({ok:true,player:{id,email,displayName:'',marketingOptIn,tutorialCompleted:false}},201,{'Set-Cookie':cookie,'Cache-Control':'no-store'});
    }

    if (url.pathname === '/api/auth/login' && request.method==='POST') {
      const body:any=await request.json();
      const email=String(body.email||'').trim().toLowerCase();
      const passwordProof=String(body.passwordProof||'');
      if(!validB64(passwordProof,32)) return json({error:'Invalid email or password.'},401);
      const p:any=await env.DB.prepare('SELECT * FROM players WHERE email=?').bind(email).first();
      if (!p) return json({error:'Invalid email or password.'},401);
      const stored=String(p.password_hash||'');
      const ok=stored.startsWith('v2:')
        ? stored===('v2:'+await sha256(passwordProof))
        : stored===passwordProof;
      if (!ok) return json({error:'Invalid email or password.'},401);
      await env.DB.prepare('UPDATE players SET last_seen_at=? WHERE id=?').bind(Date.now(),p.id).run();
      const cookie=await createSession(p.id,env);
      return json({ok:true,player:{id:p.id,email:p.email,displayName:p.display_name,marketingOptIn:Boolean(p.marketing_opt_in),tutorialCompleted:Boolean(p.tutorial_completed),mustChangePassword:Boolean(p.force_password_change)}},200,{'Set-Cookie':cookie,'Cache-Control':'no-store'});
    }

    if (url.pathname === '/api/auth/recover' && request.method==='POST') {
      const body:any=await request.json();
      const email=String(body.email||'').trim().toLowerCase();
      const recoveryCode=String(body.recoveryCode||'').trim();
      if(!email||recoveryCode.length<20) return json({error:'Invalid recovery code.'},401);
      const p:any=await env.DB.prepare('SELECT * FROM players WHERE email=?').bind(email).first();
      if(!p?.recovery_token_hash) return json({error:'Invalid or expired recovery code.'},401);
      const suppliedHash=await sha256(recoveryCode);
      if(String(p.recovery_token_hash)!==suppliedHash) return json({error:'Invalid or expired recovery code.'},401);
      await env.DB.prepare('UPDATE players SET recovery_token_hash=NULL,force_password_change=1,last_seen_at=? WHERE id=?').bind(Date.now(),p.id).run();
      await env.DB.prepare('DELETE FROM sessions WHERE player_id=?').bind(p.id).run();
      const cookie=await createSession(p.id,env);
      return json({ok:true,player:{id:p.id,email:p.email,displayName:p.display_name,marketingOptIn:Boolean(p.marketing_opt_in),tutorialCompleted:Boolean(p.tutorial_completed),mustChangePassword:true}},200,{'Set-Cookie':cookie,'Cache-Control':'no-store'});
    }

    if (url.pathname === '/api/auth/change-password' && request.method==='POST') {
      const player:any=await currentPlayer(request,env); if(!player) return json({error:'Login required.'},401);
      const body:any=await request.json();
      const passwordProof=String(body.passwordProof||''), passwordSalt=String(body.passwordSalt||'');
      if(!validB64(passwordProof,32)||!validB64(passwordSalt,16)) return json({error:'Invalid password update.'},400);
      const passwordHash='v2:'+await sha256(passwordProof);
      await env.DB.prepare('UPDATE players SET password_hash=?,password_salt=?,force_password_change=0,last_seen_at=? WHERE id=?').bind(passwordHash,passwordSalt,Date.now(),player.id).run();
      return json({ok:true,player:{id:player.id,email:player.email,displayName:player.display_name,marketingOptIn:Boolean(player.marketing_opt_in),tutorialCompleted:Boolean(player.tutorial_completed),mustChangePassword:false}},200,{'Cache-Control':'no-store'});
    }

    if (url.pathname === '/api/auth/me' && request.method==='GET') {
      const p:any=await currentPlayer(request,env);
      const headers:Record<string,string>={'Cache-Control':'no-store'};
      if(!p&&cookieToken(request))headers['Set-Cookie']='ia_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
      return json({player:p?{...p,mustChangePassword:Boolean(p.force_password_change)}:null},200,headers);
    }

    if (url.pathname === '/api/tutorial/complete' && request.method==='POST') {
      const player:any=await currentPlayer(request,env); if(!player) return json({error:'Login required.'},401);
      await env.DB.prepare('UPDATE players SET tutorial_completed=1,last_seen_at=? WHERE id=?').bind(Date.now(),player.id).run();
      return json({ok:true});
    }

    if (url.pathname === '/api/auth/logout' && request.method==='POST') {
      const token=cookieToken(request); if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(token)).run();
      return json({ok:true},200,{'Set-Cookie':'ia_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'});
    }

    if (url.pathname === '/api/company' && request.method==='GET') {
      const player:any=await currentPlayer(request,env); if(!player) return json({error:'Login required.'},401);
      const row:any=await env.DB.prepare('SELECT state_json FROM companies WHERE player_id=?').bind(player.id).first();
      return json({state:row?.state_json?JSON.parse(row.state_json):null},200,{'Cache-Control':'no-store'});
    }

    if (url.pathname === '/api/company/sync' && request.method==='POST') {
      const player:any=await currentPlayer(request,env); if (!player) return json({error:'Login required.'},401);
      const body:any=await request.json(); const s=body.state;
      if (!s || typeof s.companyName!=='string') return json({error:'Invalid game state.'},400);
      const now=Date.now();
      const nums=[s.day,s.cash,s.debt,s.reputation,s.rating,s.reviewCount,s.companyValue,s.lifetimeRevenue,s.lifetimeProfit];
      if(nums.some((n:any)=>typeof n!=='number'||!Number.isFinite(n))) return json({error:'Invalid numeric game state.'},400);
      if(s.day<1||s.rating<0||s.rating>5||s.reviewCount<0||s.lifetimeRevenue<0) return json({error:'Invalid game state.'},400);

      const prior:any=await env.DB.prepare('SELECT day,rating,review_count,company_value,lifetime_revenue,lifetime_profit FROM companies WHERE player_id=?').bind(player.id).first();
      if(!prior){
        if(s.day!==1||s.reviewCount!==0||s.lifetimeRevenue!==0||s.lifetimeProfit!==0||s.companyValue>60000) return json({error:'New companies must begin from the official starting state.'},409);
      }else{
        const dayDelta=s.day-prior.day;
        if(dayDelta<0||dayDelta>1) return json({error:'Invalid day progression.'},409);
        const revenueDelta=s.lifetimeRevenue-prior.lifetime_revenue;
        const profitDelta=s.lifetimeProfit-prior.lifetime_profit;
        const reviewDelta=s.reviewCount-prior.review_count;
        const captainSchoolReset=prior.day===7&&s.day===8&&s.captainSchoolReviewsReset===true&&s.reviewCount===0&&s.rating===0;
        if(dayDelta===0&&(revenueDelta!==0||profitDelta!==0||reviewDelta!==0)) return json({error:'Operating results can only advance with a completed game day.'},409);
        if(dayDelta===1){
          const boatCount=Array.isArray(s.boats)?Math.max(1,s.boats.length):1;
          const maxDailyTrips=Math.min(4,boatCount*2);
          const maxDailyRevenue=Math.max(3500,maxDailyTrips*1500);
          const maxDailyProfit=Math.max(3500,maxDailyTrips*1500);
          if(revenueDelta<0||revenueDelta>maxDailyRevenue) return json({error:'Revenue change exceeded daily game limits.'},409);
          if(profitDelta < -12000 || profitDelta > maxDailyProfit) return json({error:'Profit change exceeded daily game limits.'},409);
          if((reviewDelta<0&&!captainSchoolReset)||reviewDelta>maxDailyTrips) return json({error:'Review change exceeded daily fleet limits.'},409);
          if(s.companyValue-prior.company_value>60000+Math.max(0,profitDelta)) return json({error:'Company value change exceeded daily game limits.'},409);
        }
      }

      if(typeof s.captainName==='string'&&s.captainName.trim()){
        await env.DB.prepare('UPDATE players SET display_name=?,last_seen_at=? WHERE id=?').bind(String(s.captainName).trim().slice(0,30),now,player.id).run();
      }
      await env.DB.prepare(`INSERT INTO companies(id,player_id,company_name,day,cash,debt,reputation,rating,review_count,company_value,lifetime_revenue,lifetime_profit,island_id,state_json,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(player_id) DO UPDATE SET company_name=excluded.company_name,day=excluded.day,cash=excluded.cash,debt=excluded.debt,reputation=excluded.reputation,rating=excluded.rating,review_count=excluded.review_count,company_value=excluded.company_value,lifetime_revenue=excluded.lifetime_revenue,lifetime_profit=excluded.lifetime_profit,island_id=excluded.island_id,state_json=excluded.state_json,updated_at=excluded.updated_at`)
        .bind(crypto.randomUUID(),player.id,String(s.companyName).slice(0,40),s.day,s.cash,s.debt,s.reputation,s.rating,s.reviewCount,s.companyValue,s.lifetimeRevenue,s.lifetimeProfit,String(s.islandId).slice(0,30),JSON.stringify(s),now).run();
      return json({ok:true});
    }

    const asset=await env.ASSETS.fetch(request);
    if(request.method==='GET'&&(url.pathname==='/'||url.pathname==='/index.html'||url.pathname==='/build-id.txt')){
      const headers=new Headers(asset.headers);
      headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
      headers.set('Pragma','no-cache');
      headers.set('Expires','0');
      if(env.BUILD_ID)headers.set('X-Island-Build',env.BUILD_ID);
      return new Response(asset.body,{status:asset.status,statusText:asset.statusText,headers});
    }
    return asset;
  }
};
