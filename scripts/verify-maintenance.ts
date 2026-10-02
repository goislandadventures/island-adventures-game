import { buyBoat, createCompany, generateDemand, rentSlip, resolveMaintenanceIncident, simulateDay } from '../src/game/engine/sim.ts';
import type { CompanyState, MaintenanceDecision } from '../src/game/types/models.ts';

function readyState(seed:number){
  let state=createCompany('Test Captain','Test Charters','#f6c453',seed);
  state=rentSlip(state,'old-cut-docks');
  state=buyBoat(state,'old-deck-19');
  state.boats=state.boats.map(b=>({...b,reliability:.25,condition:.20,deferredMaintenance:4}));
  return state;
}

let incidentState:CompanyState|undefined;
let incidentDayExpenses=0;
for(let seed=1;seed<=100&&!incidentState;seed++){
  const state=readyState(seed);
  const bookings=generateDemand(state,undefined,undefined,false);
  const decisions=Object.fromEntries(bookings.map(b=>[b.id,'run'])) as Record<string,'run'>;
  const out=simulateDay(state,decisions,undefined,false);
  if(out.result.maintenanceIncident){
    const tripExpenses=out.result.tripOutcomes.reduce((sum,x)=>sum+x.expenses,0);
    if(out.result.expenses!==tripExpenses+out.result.fixedCosts){
      throw new Error(`Equipment failure auto-charged money. Expenses ${out.result.expenses}, expected operating/fixed only ${tripExpenses+out.result.fixedCosts}.`);
    }
    if(!out.state.pendingMaintenance)throw new Error('Generated equipment failure was not persisted as pending maintenance.');
    incidentState=out.state;
    incidentDayExpenses=out.result.expenses;
  }
}
if(!incidentState)throw new Error('Could not generate an equipment failure in deterministic test seeds.');

const incident=incidentState.pendingMaintenance!;
if(incident.component!=='battery'&&incident.component!=='propeller'&&incident.component!=='pump'&&incident.component!=='steering'&&incident.component!=='engine'&&incident.component!=='electronics'&&incident.component!=='upholstery'&&incident.component!=='safety'&&incident.component!=='navigation'){
  throw new Error('Unexpected equipment component.');
}

let blocked=false;
try{ simulateDay(incidentState,{},undefined,false); }catch{ blocked=true; }
if(!blocked)throw new Error('Game allowed another operating day with unresolved equipment failure.');

for(const decision of ['cheap','premium','replace','defer'] as MaintenanceDecision[]){
  const before=structuredClone(incidentState);
  const beforeBoat=before.boats.find(b=>b.instanceId===incident.boatInstanceId)!;
  const next=resolveMaintenanceIncident(before,decision);
  if(next.pendingMaintenance)throw new Error(`${decision} did not clear pending maintenance.`);
  const afterBoat=next.boats.find(b=>b.instanceId===incident.boatInstanceId)!;
  const expectedCost=decision==='cheap'?incident.cheapCost:decision==='premium'?incident.premiumCost:decision==='replace'?incident.replaceCost:0;
  if(next.cash!==before.cash-expectedCost)throw new Error(`${decision} cash change was incorrect.`);
  if(decision==='defer'){
    if((afterBoat.deferredMaintenance??0)!==(beforeBoat.deferredMaintenance??0)+1)throw new Error('Deferring did not increase future maintenance risk.');
    if(afterBoat.reliability>=beforeBoat.reliability)throw new Error('Deferring did not reduce reliability.');
  }else if(afterBoat.reliability<beforeBoat.reliability){
    throw new Error(`${decision} repair made reliability worse.`);
  }
}

console.log(`Maintenance invariant passed. Failure became a decision, auto-repair cost stayed $0, operating expenses stayed ${incidentDayExpenses}, and all four owner choices behaved correctly.`);
