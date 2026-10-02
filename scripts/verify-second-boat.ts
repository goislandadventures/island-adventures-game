import { buyBoat, captainCandidates, captainPerformance, createCompany, generateDemand, hireCaptain, rentSlip, simulateDay, takeStartupLoan } from '../src/game/engine/sim.ts';
import { marinas } from '../src/game/data/content.ts';

function baseState(seed:number){
  let state=createCompany('Test Captain','Two Boat Charters','#f6c453',seed);
  state=rentSlip(state,'old-cut-docks');
  state.cash=100000;
  state=buyBoat(state,'old-deck-19');
  state.day=8;
  state.reputation=.95;
  state.reviewCount=50;
  state.rating=4.9;
  state.products=state.products.map(p=>({...p,baseDemand:1,price:Math.min(p.price,399)}));
  return state;
}

let oneBoatMax=0;
for(let seed=1;seed<=60;seed++){
  const state=baseState(seed);
  oneBoatMax=Math.max(oneBoatMax,generateDemand(state,undefined,undefined,false).reduce((sum,b)=>sum+b.boatsRequired,0));
}
if(oneBoatMax>2)throw new Error(`One boat exceeded two daily boat-trips: ${oneBoatMax}.`);

let sawFour=false;
for(let seed=1;seed<=120&&!sawFour;seed++){
  let state=baseState(seed);
  state.cash=100000;
  state=buyBoat(state,'old-deck-19');
  state=hireCaptain(state,'capt-casey');
  const boatTrips=generateDemand(state,undefined,undefined,false).reduce((sum,b)=>sum+b.boatsRequired,0);
  if(boatTrips>4)throw new Error(`Two-boat fleet exceeded four daily boat-trips: ${boatTrips}.`);
  if(boatTrips===4)sawFour=true;
}
if(!sawFour)throw new Error('Two boats plus a captain never produced the four-trip opportunity across deterministic test seeds.');

const highPlayer=baseState(700);
const lowPlayer={...highPlayer,reputation:.35,reviewCount:50,rating:2.6};
const cheap=captainCandidates.reduce((a,b)=>a.hourlyRate<=b.hourlyRate?a:b);
const premium=captainCandidates.reduce((a,b)=>a.hourlyRate>=b.hourlyRate?a:b);
const cheapHigh=captainPerformance(highPlayer,cheap);
const cheapLow=captainPerformance(lowPlayer,cheap);
const premiumHigh=captainPerformance(highPlayer,premium);
if(!(cheapHigh.mistakeRisk>premiumHigh.mistakeRisk))throw new Error('Cheaper captain does not carry higher guest-mistake risk.');
if(!(cheapHigh.repairRisk>premiumHigh.repairRisk))throw new Error('Cheaper captain does not carry higher repair risk.');
if(!(cheapHigh.repairRisk>cheapHigh.mistakeRisk))throw new Error('Captain-related boat repair risk should be more frequent than bad-review mistakes.');
if(!(cheapLow.mistakeRisk>cheapHigh.mistakeRisk&&cheapLow.repairRisk>cheapHigh.repairRisk))throw new Error('Player performance is not influencing hired-captain outcomes.');

let state=createCompany('Loan Test','Two Boat Costs','#f6c453',900);
state=rentSlip(state,'old-cut-docks');
state=takeStartupLoan(state,5000);
state.cash=100000;
state=buyBoat(state,'old-deck-19');
const marina=marinas.find(m=>m.id===state.marinaId)!;
const beforeSecond=state.cash;
state=buyBoat(state,'old-deck-19');
const secondPurchaseCost=beforeSecond-state.cash;
const secondBoatPrice=state.boats[1].purchasePrice;
if(secondPurchaseCost!==secondBoatPrice+marina.monthlySlip)throw new Error(`Second boat did not add exactly one additional slip. Charged ${secondPurchaseCost}; expected ${secondBoatPrice+marina.monthlySlip}.`);
state=hireCaptain(state,'capt-casey');
state.day=31;
const expectedLoanPayment=state.loans.reduce((sum,l)=>sum+l.dailyPayment,0);
const bookings=generateDemand(state,undefined,undefined,false);
const decisions=Object.fromEntries(bookings.map(b=>[b.id,'cancel'])) as Record<string,'cancel'>;
const out=simulateDay(state,decisions,undefined,false);
if(out.result.loanPayment!==expectedLoanPayment)throw new Error(`Loan payment was multiplied by fleet size: got ${out.result.loanPayment}, expected ${expectedLoanPayment}.`);
const slipEntry=out.state.ledger.find(x=>x.day===31&&x.category==='marina'&&x.memo.startsWith('Monthly slips'));
if(!slipEntry)throw new Error('Two-boat monthly slip expense was not posted.');
if(slipEntry.amount!==-(marina.monthlySlip*2))throw new Error(`Two-boat slip expense was ${slipEntry.amount}, expected ${-(marina.monthlySlip*2)}.`);

console.log('Second-boat invariant passed: one boat caps at 2 trips, two staffed boats can reach 4, fleet operating costs scale, loan payments stay contractual, and cheaper captains carry more repair risk than review risk.');
