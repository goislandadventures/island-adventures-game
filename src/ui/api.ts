import type { CompanyState } from '../game/types/models';

export type Player = { id:string; email:string; displayName?:string; display_name?:string; marketingOptIn?:boolean; marketing_opt_in?:number };

async function api<T>(path:string, options:RequestInit={}):Promise<T>{
  const res=await fetch(path,{credentials:'include',headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error((data as any).error||'Request failed');
  return data as T;
}
export const register=(payload:{email:string;displayName:string;password:string;marketingOptIn:boolean})=>api<{player:Player}>('/api/auth/register',{method:'POST',body:JSON.stringify(payload)});
export const login=(payload:{email:string;password:string})=>api<{player:Player}>('/api/auth/login',{method:'POST',body:JSON.stringify(payload)});
export const me=()=>api<{player:Player|null}>('/api/auth/me');
export const logout=()=>api<{ok:boolean}>('/api/auth/logout',{method:'POST'});
export const loadCompany=()=>api<{state:CompanyState|null}>('/api/company');
export const syncCompany=(state:CompanyState)=>api<{ok:boolean}>('/api/company/sync',{method:'POST',body:JSON.stringify({state})});
export const loadLeaderboard=(metric:string)=>api<{metric:string;results:any[]}>(`/api/leaderboard?metric=${encodeURIComponent(metric)}`);
