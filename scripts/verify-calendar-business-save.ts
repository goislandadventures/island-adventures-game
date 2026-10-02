import { createCompany, generateWeather, rentSlip, buyBoat } from '../src/game/engine/sim.ts';
import { calendarForDay, resolveBusinessEvent } from '../src/game/engine/depth.ts';
import { isCaptainSchoolReviewReset } from '../src/worker/index.ts';
import type { BusinessEvent, CompanyState } from '../src/game/types/models.ts';

function ready(seed=123):CompanyState{
  let state=createCompany('Test Captain','Calendar Charters','#f6c453',seed);
  state=rentSlip(state,'old-cut-docks');
  state=buyBoat(state,'old-deck-19');
  state.reputation=.8;
  state.reviewCount=50;
  state.rating=4.8;
  state.marketing={dailyBudget:80,focus:'search',reviewAsk:true};
  return state;
}

function findDay(month:number,dayOfMonth:number,gameYear=1){
  for(let day=(gameYear-1)*365+1;day<=gameYear*365;day++){
    const cal=calendarForDay(day);
    if(cal.month===month&&cal.dayOfMonth===dayOfMonth)return day;
  }
  throw new Error(`Could not find month ${month} day ${dayOfMonth}`);
}

const feb14=findDay(2,14);
const sep1=findDay(9,1);
const sep2=findDay(9,2);
if(calendarForDay(feb14).season!=='busy')throw new Error('Busy season does not begin February 14.');
if(calendarForDay(sep1).season!=='busy')throw new Error('Busy season does not include September 1.');
if(calendarForDay(sep2).season!=='slow')throw new Error('Slow season does not begin September 2.');

const state=ready();
const monthAverages:Record<number,number>={};
for(let month=1;month<=12;month++){
  const values:number[]=[];
  for(let day=1;day<=365;day++){
    const cal=calendarForDay(day,state);
    if(cal.month===month)values.push(cal.demandMultiplier);
  }
  monthAverages[month]=values.reduce((a,b)=>a+b,0)/values.length;
}
const sepAverage=monthAverages[9];
for(const month of [1,2,3,4,5,6,7,8,10,11,12]){
  if(!(sepAverage<monthAverages[month]))throw new Error(`September is not the slowest month: Sep ${sepAverage.toFixed(2)} vs month ${month} ${monthAverages[month].toFixed(2)}.`);
}

let busyWeekday:number|undefined;
let busyWeekend:number|undefined;
for(let day=findDay(3,1);day<=findDay(4,30);day++){
  const cal=calendarForDay(day,state);
  if(cal.holidayLabel)continue;
  if(cal.isWeekend&&busyWeekend===undefined)busyWeekend=cal.demandMultiplier;
  if(!cal.isWeekend&&busyWeekday===undefined)busyWeekday=cal.demandMultiplier;
}
if(!busyWeekday||!busyWeekend||busyWeekend/busyWeekday<1.35)throw new Error(`Weekend demand is not materially above weekdays: weekday=${busyWeekday}, weekend=${busyWeekend}.`);

const memorialDays=[] as ReturnType<typeof calendarForDay>[];
const julyDays=[] as ReturnType<typeof calendarForDay>[];
for(let day=1;day<=365;day++){
  const cal=calendarForDay(day,state);
  if(cal.holidayLabel==='Memorial Day Weekend')memorialDays.push(cal);
  if(cal.holidayLabel==='July 4th Weekend')julyDays.push(cal);
}
if(memorialDays.length<3||julyDays.length!==4)throw new Error('Peak holiday weekends are not being marked correctly.');
if(!memorialDays.every(x=>x.peakDemand&&x.crowdRisk>=.05))throw new Error('Memorial Day weekend is not flagged as high-risk peak demand.');
if(!julyDays.every(x=>x.peakDemand&&x.crowdRisk>=.05))throw new Error('July 4th weekend is not flagged as high-risk peak demand.');

const aug1=calendarForDay(findDay(8,1),state);
const dec1=calendarForDay(findDay(12,1),state);
if(!/slow season is one month away/i.test(aug1.note))throw new Error('August 1 slow-season warning is missing.');
if(!/Hell Week starts December 24/i.test(dec1.note))throw new Error('December 1 Hell Week warning is missing.');
for(const d of [24,25,26,27,28,29,30,31]){
  if(calendarForDay(findDay(12,d),state).holidayLabel!=='Hell Week')throw new Error(`December ${d} is not marked Hell Week.`);
}
if(calendarForDay(findDay(1,1),state).holidayLabel!=='Hell Week')throw new Error('January 1 is not marked Hell Week.');

const hotelEvent=(day:number):BusinessEvent=>({
  id:'hotel-partner',
  day,
  title:'A hotel wants to send you guests',
  description:'test',
  choices:[
    {id:'accept',label:'Make the 7-day deal',detail:'test',cashDelta:-250,reputationDelta:.018},
    {id:'pass',label:'Skip it',detail:'test',cashDelta:0,reputationDelta:0}
  ]
});
let dealState={...state,day:9,cash:10000};
const noDeal=calendarForDay(12,{...dealState,day:12}).demandMultiplier;
dealState=resolveBusinessEvent(dealState,hotelEvent(9),'accept');
if(dealState.activeHotelDeals?.[0]?.endDay!==15)throw new Error('Hotel agreement is not exactly 7 game days inclusive.');
const oneDeal=calendarForDay(12,{...dealState,day:12}).demandMultiplier;
dealState={...dealState,day:12,lastBusinessEventDay:undefined};
dealState=resolveBusinessEvent(dealState,hotelEvent(12),'accept');
const twoDeals=calendarForDay(12,dealState).demandMultiplier;
if(!(oneDeal>noDeal*1.15))throw new Error(`One hotel deal did not noticeably improve demand: ${noDeal} -> ${oneDeal}.`);
if(!(twoDeals>oneDeal*1.15))throw new Error(`Stacked hotel deals did not stack noticeably: ${oneDeal} -> ${twoDeals}.`);
if(calendarForDay(19,{...dealState,day:19}).demandMultiplier!==calendarForDay(19,{...state,day:19}).demandMultiplier)throw new Error('Expired hotel deals are still affecting demand.');

for(let seed=1;seed<=100;seed++){
  const weatherState=ready(seed);
  let calm=0;
  for(let day=1;day<=14;day++){
    weatherState.day=day;
    if(generateWeather(weatherState).windKts<=10)calm++;
  }
  if(calm<2)throw new Error(`Seed ${seed} has only ${calm} calm snorkel-capable days in the first 14 days.`);
}

if(!isCaptainSchoolReviewReset({day:7},{day:8,captainSchoolReviewsReset:true,reviewCount:0,rating:0}))throw new Error('Valid Day 7 -> 8 Captain School review reset is rejected.');
if(isCaptainSchoolReviewReset({day:6},{day:8,captainSchoolReviewsReset:true,reviewCount:0,rating:0}))throw new Error('Invalid multi-day review reset was accepted.');
if(isCaptainSchoolReviewReset({day:7},{day:8,captainSchoolReviewsReset:false,reviewCount:0,rating:0}))throw new Error('Review reset without the Captain School flag was accepted.');

console.log('Calendar/business/save invariant passed: weather has calm breaks, weekends and peak holidays surge, September is slowest, hotel deals stack for 7 days, and Day 7 -> 8 cloud-save review reset is valid.');
