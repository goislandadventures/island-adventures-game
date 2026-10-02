import { buyBoat, createCompany, generateDemand, rentSlip } from '../src/game/engine/sim.ts';

function prepared(seed:number){
  let state=createCompany('Test Captain','Test Charters','#f6c453',seed);
  state=rentSlip(state,'old-cut-docks');
  state=buyBoat(state,'old-deck-19');
  return state;
}

const weekSignatures=new Set<string>();

for(let seed=1;seed<=500;seed++){
  const base=prepared(seed);
  const week:string[]=[];

  for(let day=1;day<=7;day++){
    const state={...base,day};
    for(const demoMode of [false,true]){
      const bookings=generateDemand(state,undefined,undefined,demoMode);

      if(bookings.length!==2){
        throw new Error(`Seed ${seed} day ${day} mode ${demoMode?'demo':'registered'} produced ${bookings.length} bookings instead of exactly 2.`);
      }

      if(new Set(bookings.map(b=>b.id)).size!==2){
        throw new Error(`Seed ${seed} day ${day} produced duplicate booking IDs.`);
      }

      if(new Set(bookings.map(b=>b.timeSlot)).size!==2){
        throw new Error(`Seed ${seed} day ${day} put both Captain School bookings in the same time slot.`);
      }

      for(const booking of bookings){
        if(booking.tripType==='sunset'&&booking.timeSlot!=='evening'){
          throw new Error(`Seed ${seed} day ${day} generated a Sunset booking outside evening.`);
        }
      }

      if(!demoMode){
        week.push(bookings.map(b=>`${b.tripType}:${b.customerType}:${b.source}:${b.partySize}:${b.timeSlot}`).join('|'));
      }
    }
  }

  const signature=week.join('||');
  if(weekSignatures.has(signature)){
    throw new Error(`Seed ${seed} duplicated another seed's full Captain School booking week.`);
  }
  weekSignatures.add(signature);
}

console.log(`Captain School invariant passed: 500 seeds × 7 days × 2 modes = ${500*7*2} day checks, always exactly 2 bookings.`);
