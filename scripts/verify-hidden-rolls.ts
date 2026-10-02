import { assessTripPlan, buyBoat, createCompany, generateDemand, generateWeather, rentSlip, simulateDay } from '../src/game/engine/sim.ts';
import type { TripProduct, WeatherDay } from '../src/game/types/models.ts';

const sandbar:TripProduct={type:'sandbar',name:'Private Sandbar',durationHours:3,price:489,baseDemand:.8,weatherTolerance:.8,fuelMultiplier:1};

function ready(seed:number){
  let state=createCompany('Test Captain','Variable Charters','#f6c453',seed);
  state=rentSlip(state,'old-cut-docks');
  state=buyBoat(state,'old-deck-19');
  state.products=[sandbar];
  state.boats=state.boats.map(b=>({...b,condition:.88,reliability:.92,deferredMaintenance:0}));
  return state;
}

// Day 1 must no longer be a fixed weather script.
const dayOneWeather=new Set<string>();
for(let seed=1;seed<=20;seed++)dayOneWeather.add(JSON.stringify(generateWeather(ready(seed))));
if(dayOneWeather.size<10)throw new Error(`Day 1 weather is not varying enough across new companies: ${dayOneWeather.size} unique results.`);

// Captain School guidance may warn about conditions, but must never pre-decide the review.
const forcedWeather:WeatherDay={day:1,windKts:26,windDirection:'E',rainChance:65,stormRisk:.35,waterClarity:.48,temperatureF:82};
const sample=ready(999);
const sampleBooking=generateDemand(sample,forcedWeather,undefined,false)[0];
const preview=assessTripPlan(sample,sampleBooking,'run',forcedWeather,sample.boats[0]);
if(preview.experienceScore!==5)throw new Error('Captain School preview is still deterministically downgrading a risky trip.');
if(preview.reasons.some(r=>/%|storm risk \(/i.test(r)))throw new Error('A hidden probability leaked into player-facing guidance.');

// Under materially risky weather, the same choice must be able to land both well and poorly.
let riskyDays=0;
let goodTrips=0;
let imperfectTrips=0;
for(let seed=1;seed<=100&&riskyDays<20;seed++){
  for(let day=8;day<=35&&riskyDays<20;day++){
    const state=ready(seed);
    state.day=day;
    const weather=generateWeather(state);
    if(!(weather.stormRisk>=.18||weather.windKts>=20))continue;
    riskyDays++;
    const bookings=generateDemand(state,weather,undefined,false);
    const decisions=Object.fromEntries(bookings.map(b=>[b.id,'run'])) as Record<string,'run'>;
    const out=simulateDay(state,decisions,undefined,false);
    for(const trip of out.result.tripOutcomes){
      if(trip.satisfaction>=1)goodTrips++;
      else imperfectTrips++;
    }
    const exposed=JSON.stringify(out.result);
    for(const key of ['"outcomeRisk"','"outcomeRoll"','"failureRisk"','"roll"']){
      if(exposed.includes(key))throw new Error(`Hidden simulation value leaked into DayResult: ${key}`);
    }
    if(out.result.reviews.some(r=>r.text.includes('%')||r.reasons.some(x=>/storm risk \(/i.test(x))))throw new Error('A hidden probability leaked into a review.');
  }
}
if(riskyDays!==20)throw new Error(`Only found ${riskyDays} qualifying risky-weather days.`);
if(goodTrips===0||imperfectTrips===0)throw new Error(`Weather outcomes are still effectively binary across risky days: good=${goodTrips}, imperfect=${imperfectTrips}.`);

// Equipment failure remains a hidden weighted roll: bad equipment raises risk, but does not guarantee failure.
let failures=0;
let cleanRuns=0;
for(let seed=1001;seed<=1020;seed++){
  const state=ready(seed);
  state.boats=state.boats.map(b=>({...b,condition:.28,reliability:.30,deferredMaintenance:3}));
  const bookings=generateDemand(state,undefined,undefined,false);
  const decisions=Object.fromEntries(bookings.map(b=>[b.id,'run'])) as Record<string,'run'>;
  const out=simulateDay(state,decisions,undefined,false);
  if(out.result.maintenanceIncident)failures++;
  else cleanRuns++;
}
if(failures===0||cleanRuns===0)throw new Error(`Equipment failure roll is not behaving variably across 20 seeds: failures=${failures}, clean=${cleanRuns}.`);

console.log(`Hidden-roll invariant passed: 20 risky weather days produced both good and imperfect trips; 20 equipment runs produced ${failures} failures and ${cleanRuns} clean runs; no hidden probability leaked to player state.`);
