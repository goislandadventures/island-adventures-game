import type { CompanyState,MarketingMarketSnapshot } from '../game/types/models';

export type Player = { id:string; email:string; displayName?:string; display_name?:string; marketingOptIn?:boolean; marketing_opt_in?:number; tutorialCompleted?:boolean; tutorial_completed?:number; mustChangePassword?:boolean; force_password_change?:number };

async function api<T>(path:string, options:RequestInit={}):Promise<T>{
  const res=await fetch(path,{credentials:'include',headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
  const raw=await res.text();
  let data:any={};
  try{data=raw?JSON.parse(raw):{}}catch{}
  if(!res.ok) throw new Error(data?.error||(`Account service error (${res.status}). Please try again.`));
  return data as T;
}
function bytesToB64(bytes:Uint8Array){
  let s=''; for(const b of bytes)s+=String.fromCharCode(b); return btoa(s);
}
function b64ToBytes(s:string){
  const raw=atob(s); const out=new Uint8Array(raw.length); for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i); return out;
}
async function passwordProof(password:string,saltB64:string){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:b64ToBytes(saltB64),iterations:120000},key,256);
  return bytesToB64(new Uint8Array(bits));
}
function newSalt(){return bytesToB64(crypto.getRandomValues(new Uint8Array(16)));}

export async function register(payload:{email:string;password:string;marketingOptIn:boolean}){
  if(payload.password.length<10) throw new Error('Password must be at least 10 characters.');
  const passwordSalt=newSalt();
  const proof=await passwordProof(payload.password,passwordSalt);
  return api<{player:Player}>('/api/auth/register',{method:'POST',body:JSON.stringify({
    email:payload.email,
    passwordProof:proof,
    passwordSalt,
    marketingOptIn:payload.marketingOptIn
  })});
}
export async function recover(payload:{email:string;recoveryCode:string}){
  return api<{player:Player}>('/api/auth/recover',{method:'POST',body:JSON.stringify({email:payload.email,recoveryCode:payload.recoveryCode})});
}
export async function login(payload:{email:string;password:string}){
  const salt=await api<{salt:string}>('/api/auth/salt?email='+encodeURIComponent(payload.email.trim().toLowerCase()));
  const proof=await passwordProof(payload.password,salt.salt);
  return api<{player:Player}>('/api/auth/login',{method:'POST',body:JSON.stringify({email:payload.email,passwordProof:proof})});
}
export const me=()=>api<{player:Player|null}>('/api/auth/me');
export const logout=()=>api<{ok:boolean}>('/api/auth/logout',{method:'POST'});
export async function changePassword(password:string){
  if(password.length<10) throw new Error('Password must be at least 10 characters.');
  const passwordSalt=newSalt();
  const proof=await passwordProof(password,passwordSalt);
  return api<{player:Player}>('/api/auth/change-password',{method:'POST',body:JSON.stringify({passwordProof:proof,passwordSalt})});
}
export const completeTutorial=()=>api<{ok:boolean}>('/api/tutorial/complete',{method:'POST'});
export const loadCompany=()=>api<{state:CompanyState|null}>('/api/company');
export const syncCompany=(state:CompanyState)=>api<{ok:boolean}>('/api/company/sync',{method:'POST',body:JSON.stringify({state})});
export const loadLeaderboard=(metric:string)=>api<{metric:string;results:any[]}>(`/api/leaderboard?metric=${encodeURIComponent(metric)}`);

export const loadMarketingMarket=()=>api<MarketingMarketSnapshot>('/api/marketing-market');
