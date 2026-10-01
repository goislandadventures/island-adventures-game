import type { CompanyState } from '../types/models';

const OWNER_KEY='island-adventures-owner-save-v1';
const LEGACY_KEY='island-adventures-save-v1';

export function normalizeState(parsed:CompanyState):CompanyState{
  return {
    ...parsed,
    companyColor:parsed.companyColor||'#f6c453',
    daysOperated:parsed.daysOperated??0,
    staff:parsed.staff??[],
    marketing:{dailyBudget:parsed.marketing?.dailyBudget??0,focus:parsed.marketing?.focus??'organic',reviewAsk:parsed.marketing?.reviewAsk??true},
    loans:parsed.loans??[],
    debt:parsed.debt??0,
    boats:(parsed.boats??[]).map(b=>({
      ...b,
      insuranceDeclined:b.insuranceDeclined??false,
      next100Service:b.next100Service??((Math.floor((b.engineHours??0)/100)+1)*100),
      next300Service:b.next300Service??((Math.floor((b.engineHours??0)/300)+1)*300)
    }))
  };
}

export function saveGame(state:CompanyState):void{
  try{localStorage.setItem(OWNER_KEY,JSON.stringify(state));}catch{}
}
export function loadGame():CompanyState|null{
  try{
    const raw=localStorage.getItem(OWNER_KEY)||localStorage.getItem(LEGACY_KEY);
    if(!raw)return null;
    return normalizeState(JSON.parse(raw) as CompanyState);
  }catch{return null;}
}
export function clearGame():void{
  try{localStorage.removeItem(OWNER_KEY);localStorage.removeItem(LEGACY_KEY);}catch{}
}
