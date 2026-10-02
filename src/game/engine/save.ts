import type { CompanyState } from '../types/models';

export function normalizeState(parsed:CompanyState):CompanyState{
  return {
    ...parsed,
    companyColor:parsed.companyColor||'#f6c453',
    daysOperated:parsed.daysOperated??0,
    staff:parsed.staff??[],
    marketing:{dailyBudget:parsed.marketing?.dailyBudget??0,focus:parsed.marketing?.focus==='organic'?'search':(parsed.marketing?.focus??'search'),reviewAsk:parsed.marketing?.reviewAsk??true},
    loans:parsed.loans??[],
    debt:parsed.debt??0,
    startupLoanTaken:parsed.startupLoanTaken??false,
    captainSchoolReviewsReset:parsed.captainSchoolReviewsReset??false,
    captainSchoolFarewellSeen:parsed.captainSchoolFarewellSeen??false,
    pendingMaintenance:parsed.pendingMaintenance,
    boats:(parsed.boats??[]).map(b=>({
      ...b,
      insuranceDeclined:b.insuranceDeclined??false,
      engineYear:b.engineYear??b.year,
      next100Service:b.next100Service??((Math.floor((b.engineHours??0)/100)+1)*100),
      next300Service:b.next300Service??((Math.floor((b.engineHours??0)/300)+1)*300)
    }))
  };
}
