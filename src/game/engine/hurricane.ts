import { marinas } from '../data/content';
import type { CompanyState,HurricaneEvent } from '../types/models';
import { RNG } from './rng';

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const names=['Hurricane Marlin','Hurricane Paloma','Hurricane Kestrel','Hurricane Isla','Hurricane Mako','Hurricane Sol','Hurricane Cayo','Hurricane Coral'];

function categoryFrom(rng:RNG):1|2|3|4|5{
  const x=rng.next();
  if(x<.30)return 1;
  if(x<.60)return 2;
  if(x<.82)return 3;
  if(x<.95)return 4;
  return 5;
}

export function hurricaneForDay(state:CompanyState):HurricaneEvent|null{
  const cycleDay=(state.day-1)%365;
  if(cycleDay<120||cycleDay>302)return null; // Jun 1 through Nov 30, game starts Feb 1
  const gameYear=Math.floor((state.day-1)/365)+1;
  const rng=new RNG(state.seed+gameYear*9109);
  const first=120+rng.int(0,182);
  let second=-1;
  if(rng.chance(.45)){
    do{second=120+rng.int(0,182)}while(Math.abs(second-first)<14);
  }
  let slot=-1;
  if(cycleDay===first)slot=0;
  else if(cycleDay===second)slot=1;
  if(slot<0)return null;
  const stormRng=new RNG(state.seed+gameYear*1777+slot*313);
  const category=categoryFrom(stormRng);
  const name=stormRng.pick(names);
  const warning=category>=3
    ? 'Major hurricane. Any boat left in the water will be destroyed.'
    : 'Hurricane conditions. Boats left in the water can take expensive damage.';
  return {day:state.day,category,name,warning};
}

export function setHurricanePlan(state:CompanyState,haulBoats:boolean):CompanyState{
  return {...state,hurricanePlan:{day:state.day,haulBoats}};
}

export function applyHurricane(state:CompanyState,event:HurricaneEvent):{
  state:CompanyState; expenses:number; summary:string; destroyedBoatNames:string[];
}{
  const plan=state.hurricanePlan?.day===state.day?state.hurricanePlan:null;
  if(!plan)throw new Error('Choose what to do with the boats before the hurricane arrives.');
  const marina=marinas.find(m=>m.id===state.marinaId);
  const protection=marina?.stormProtection??.45;
  let next=structuredClone(state);
  let expenses=0;
  const destroyed:string[]=[];

  if(plan.haulBoats){
    const perBoat=Math.round(300+200*(1-protection));
    const total=perBoat*next.boats.length;
    if(next.cash<total)throw new Error('You do not have enough cash to haul the whole fleet.');
    next.cash-=total; expenses+=total;
    if(total)next.ledger.push({day:next.day,category:'storm',amount:-total,memo:`Hauled fleet for ${event.name}`});
    next.hurricanePlan=undefined;
    return {state:next,expenses,summary:`${event.name} arrived as Category ${event.category}. You hauled the fleet. The boats are safe.`,destroyedBoatNames:[]};
  }

  if(event.category>=3){
    let payout=0;
    for(const boat of next.boats){
      destroyed.push(boat.name);
      if(boat.insured)payout+=Math.round(boat.purchasePrice*boat.condition*.80);
    }
    next.boats=[];
    if(payout){
      next.cash+=payout;
      next.ledger.push({day:next.day,category:'insurance',amount:payout,memo:`Insurance payout after ${event.name}`});
    }
    next.hurricanePlan=undefined;
    const insuredHelp=payout?` Insurance paid ${payout.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0})}.`:'';
    return {state:next,expenses,summary:`${event.name} hit as Category ${event.category}. Every boat left in the water was destroyed.${insuredHelp}`,destroyedBoatNames:destroyed};
  }

  const rng=new RNG(next.seed+next.day*5551+event.category);
  next.boats=next.boats.map(boat=>{
    const rawDamage=(event.category===1?.07:.17)*(1-protection*.65)*(0.8+rng.next()*.5);
    const repair=Math.max(180,Math.round(boat.purchasePrice*rawDamage));
    const outOfPocket=boat.insured?Math.round(repair*.35):repair;
    expenses+=outOfPocket;
    next.cash-=outOfPocket;
    next.ledger.push({day:next.day,category:'storm',amount:-outOfPocket,memo:`${event.name} damage: ${boat.name}`});
    return {
      ...boat,
      condition:clamp(boat.condition-rawDamage,.20,1),
      reliability:clamp(boat.reliability-rawDamage*.35,.30,.99)
    };
  });
  next.hurricanePlan=undefined;
  return {
    state:next,
    expenses,
    summary:`${event.name} passed as Category ${event.category}. The fleet stayed in the water and took ${expenses.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0})} in out-of-pocket damage.`,
    destroyedBoatNames:destroyed
  };
}
