import type { CompanyState } from '../types/models';

const OWNER_KEY='island-adventures-owner-save-v1';
const LEGACY_KEY='island-adventures-save-v1';

export function saveGame(state:CompanyState):void{
  try{localStorage.setItem(OWNER_KEY,JSON.stringify(state));}catch{}
}
export function loadGame():CompanyState|null{
  try{
    const raw=localStorage.getItem(OWNER_KEY)||localStorage.getItem(LEGACY_KEY);
    if(!raw)return null;
    const parsed=JSON.parse(raw) as CompanyState;
    return {...parsed,companyColor:parsed.companyColor||'#f6c453',daysOperated:parsed.daysOperated??0};
  }catch{return null;}
}
export function clearGame():void{
  try{localStorage.removeItem(OWNER_KEY);localStorage.removeItem(LEGACY_KEY);}catch{}
}
