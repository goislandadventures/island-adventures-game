import { boatTemplates } from '../data/content';
import type {
  Booking, BusinessEvent, BusinessEventChoice, CalendarInfo, CompanyState, CustomerType,
  Loan, MaintenanceLevel, OwnedBoat, TripType, UsedBoatListing
} from '../types/models';
import { RNG } from './rng';

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));

export const customerProfiles:Record<CustomerType,{label:string;likes:string;warning:string}> = {
  family:{label:'Family Crew',likes:'comfort, safety and an easy pace',warning:'Poor boat condition and rough rides matter more to families.'},
  couple:{label:'Couple Getaway',likes:'privacy, comfort and memorable scenery',warning:'Unnecessary plan downgrades hurt more when conditions are actually good.'},
  celebration:{label:'Celebration Group',likes:'fun, energy and the trip they booked',warning:'They tolerate some chop, but hate losing the main experience without a reason.'},
  snorkeler:{label:'Serious Snorkelers',likes:'clear water, reef quality and good conditions',warning:'Visibility and exposed wind matter more than almost anything else.'},
  luxury:{label:'Premium Private Guests',likes:'polish, comfort and flexibility',warning:'Boat condition and service quality have a higher bar.'},
  bargain:{label:'Value Hunters',likes:'getting what they paid for',warning:'They are less demanding on luxury but react strongly to unnecessary changes.'},
  repeat:{label:'Repeat Guests',likes:'consistency and smart captain judgment',warning:'They compare today with the good experience that brought them back.'}
};

export function calendarForDay(day:number):CalendarInfo{
  const dayNames:CalendarInfo['dayOfWeek'][]=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const week=Math.ceil(day/7);
  const dayOfWeek=dayNames[(day-1)%7];
  const cycle=((week-1)%12)+1;
  const season:CalendarInfo['season']=cycle<=4?'peak':cycle<=8?'shoulder':'slow';
  const seasonMult=season==='peak'?1.20:season==='shoulder'?1:.78;
  const weekend=dayOfWeek==='Fri'||dayOfWeek==='Sat'||dayOfWeek==='Sun';
  const demandMultiplier=Number((seasonMult*(weekend?1.14:.94)).toFixed(2));
  const note=season==='peak'
    ? `${dayOfWeek}: peak-season demand${weekend?' plus weekend traffic':''}.`
    : season==='slow'
      ? `${dayOfWeek}: slow-season demand. Protect cash and avoid overexpanding.`
      : `${dayOfWeek}: shoulder-season demand${weekend?' with a weekend bump':''}.`;
  return {day,week,dayOfWeek,season,demandMultiplier,note};
}

export function customerForTrip(rng:RNG,tripType:TripType,source:Booking['source']):{type:CustomerType;label:string}{
  let pool:CustomerType[];
  if(source==='repeat')pool=['repeat','family','couple'];
  else if(tripType==='snorkel')pool=['snorkeler','family','luxury','couple'];
  else if(tripType==='sandbar')pool=['celebration','family','bargain','luxury'];
  else if(tripType==='sunset')pool=['couple','luxury','repeat'];
  else if(tripType==='eco')pool=['family','couple','repeat'];
  else pool=['family','couple','luxury','bargain','repeat'];
  const type=rng.pick(pool);
  return {type,label:customerProfiles[type].label};
}

export function generateUsedBoatMarket(state:CompanyState):UsedBoatListing[]{
  const rng=new RNG(state.seed+state.day*4409+state.islandId.length*97);
  const candidates=[...boatTemplates];
  const listings:UsedBoatListing[]=[];
  while(candidates.length&&listings.length<5){
    const idx=rng.int(0,candidates.length-1);
    const template=candidates.splice(idx,1)[0];
    const age=rng.int(3,27);
    const year=2026-age;
    const condition=Number((.48+rng.next()*.48).toFixed(2));
    const engineHours=rng.int(220,2100);
    const reliability=Number(clamp(template.reliability*(.74+condition*.28)-(engineHours>1400?.06:0),.42,.98).toFixed(2));
    const askingPrice=Math.round(template.basePrice*(.38+condition*.48)*(.88+rng.next()*.22)/250)*250;
    const inspectionNote=condition>.84
      ? 'Clean survey. Mostly cosmetic wear.'
      : engineHours>1400
        ? 'High hours. Budget for preventive maintenance.'
        : condition<.62
          ? 'Cheap for a reason. Deferred maintenance is visible.'
          : 'Average used-boat condition with normal wear.';
    listings.push({
      listingId:`MKT-${state.day}-${template.id}-${listings.length+1}`,
      templateId:template.id,name:template.name,year,condition,engineHours,askingPrice,reliability,inspectionNote
    });
  }
  return listings;
}

function ownedFromListing(state:CompanyState,listing:UsedBoatListing):OwnedBoat{
  const template=boatTemplates.find(b=>b.id===listing.templateId);
  if(!template)throw new Error('Boat template not found.');
  return {
    ...template,
    instanceId:`used-${listing.listingId}`,
    year:listing.year,
    condition:listing.condition,
    engineHours:listing.engineHours,
    purchasePrice:listing.askingPrice,
    reliability:listing.reliability,
    insured:false,
    marinaId:state.marinaId
  };
}

export function buyUsedBoat(state:CompanyState,listingId:string,finance=false):CompanyState{
  if(state.day<=7)throw new Error('The used-boat market unlocks after Captain School.');
  if(!state.marinaId)throw new Error('You need a marina before buying another boat.');
  const listing=generateUsedBoatMarket(state).find(x=>x.listingId===listingId);
  if(!listing)throw new Error('That listing is no longer available.');
  const owned=ownedFromListing(state,listing);
  const cashRequired=finance?Math.ceil(listing.askingPrice*.25):listing.askingPrice;
  if(state.cash<cashRequired)throw new Error('Not enough cash for this purchase.');

  let loans=[...(state.loans??[])];
  let debt=state.debt??0;
  let memo=`Purchased used ${listing.name}`;
  if(finance){
    const principal=listing.askingPrice-cashRequired;
    const apr=.099;
    const dailyPayment=Math.ceil((principal*(1+apr*.25))/90);
    const loan:Loan={id:`loan-${owned.instanceId}`,originalPrincipal:principal,balance:principal,apr,dailyPayment,boatInstanceId:owned.instanceId};
    loans.push(loan); debt+=principal; memo=`Financed used ${listing.name}; 25% down`;
  }
  return {
    ...state,
    cash:state.cash-cashRequired,
    debt,
    loans,
    boats:[...state.boats,owned],
    ledger:[...state.ledger,{day:state.day,category:'boat',amount:-cashRequired,memo}]
  };
}

export function maintainBoat(state:CompanyState,instanceId:string,level:MaintenanceLevel):CompanyState{
  const boat=state.boats.find(b=>b.instanceId===instanceId);
  if(!boat)throw new Error('Boat not found.');
  const plans={
    quick:{cost:120,condition:.03,reliability:.005,label:'Quick dockside service'},
    routine:{cost:450,condition:.10,reliability:.02,label:'Routine preventive service'},
    major:{cost:1200,condition:.22,reliability:.06,label:'Major preventive service'}
  } as const;
  const plan=plans[level];
  if(state.cash<plan.cost)throw new Error('Not enough cash for that maintenance.');
  return {
    ...state,
    cash:state.cash-plan.cost,
    boats:state.boats.map(b=>b.instanceId===instanceId?{
      ...b,condition:clamp(b.condition+plan.condition,.25,1),reliability:clamp(b.reliability+plan.reliability,.25,.99)
    }:b),
    ledger:[...state.ledger,{day:state.day,category:'maintenance',amount:-plan.cost,memo:`${plan.label}: ${boat.name}`}]
  };
}

export function applyLoanPayments(state:CompanyState):{state:CompanyState;payment:number}{
  const loans=state.loans??[];
  if(!loans.length)return {state:{...state,debt:0,loans:[]},payment:0};
  let available=Math.max(0,state.cash);
  let total=0;
  const next:Loan[]=[];
  for(const loan of loans){
    if(loan.balance<=0)continue;
    const due=Math.min(loan.dailyPayment,loan.balance);
    const paid=Math.min(available,due);
    available-=paid; total+=paid;
    const balance=Math.max(0,loan.balance-paid);
    if(balance>0)next.push({...loan,balance});
  }
  const debt=next.reduce((sum,l)=>sum+l.balance,0);
  const ledger=total?[...state.ledger,{day:state.day,category:'loan',amount:-total,memo:'Boat loan payment(s)'}]:state.ledger;
  return {state:{...state,cash:state.cash-total,debt,loans:next,ledger},payment:total};
}

export function businessEventForDay(state:CompanyState):BusinessEvent|null{
  if(state.day<=7||state.lastBusinessEventDay===state.day||state.day%3!==0)return null;
  const rng=new RNG(state.seed+state.day*661);
  const events:Omit<BusinessEvent,'day'>[]=[
    {
      id:'hotel-partner',title:'Hotel concierge partnership',
      description:'A nearby hotel wants a preferred-charter partner. They can send volume, but expect fast response and a referral fee.',
      choices:[
        {id:'accept',label:'Accept partnership',detail:'Pay $250 setup; gain reputation for professional distribution.',cashDelta:-250,reputationDelta:.018},
        {id:'pass',label:'Pass for now',detail:'Keep your margins and stay independent.',cashDelta:0,reputationDelta:0}
      ]
    },
    {
      id:'captain-callout',title:'Captain calls out',
      description:'One hired captain cannot work today. You can pay a replacement premium or absorb the disruption.',
      choices:[
        {id:'cover',label:'Hire emergency coverage',detail:'Pay $350 and protect operating reputation.',cashDelta:-350,reputationDelta:.006},
        {id:'absorb',label:'Absorb the disruption',detail:'Save cash but take a small reputation hit.',cashDelta:0,reputationDelta:-.012}
      ]
    },
    {
      id:'viral-post',title:'A guest post is taking off',
      description:'Yesterday’s trip is getting shared. You can put a little money behind the attention or let it run organically.',
      choices:[
        {id:'boost',label:'Boost the momentum',detail:'Spend $180; gain a stronger reputation bump.',cashDelta:-180,reputationDelta:.025},
        {id:'organic',label:'Let it run',detail:'Free, with a smaller reputation gain.',cashDelta:0,reputationDelta:.010}
      ]
    },
    {
      id:'marina-increase',title:'Marina rate increase',
      description:'The marina announces a rate increase. You can pay a short-term retention fee to lock your current rate or accept higher overhead later.',
      choices:[
        {id:'lock',label:'Lock current rate',detail:'Pay $300 now for stability.',cashDelta:-300,reputationDelta:.004},
        {id:'accept',label:'Accept the increase',detail:'Keep cash today.',cashDelta:0,reputationDelta:0}
      ]
    }
  ];
  return {...rng.pick(events),day:state.day};
}

export function resolveBusinessEvent(state:CompanyState,event:BusinessEvent,choiceId:string):CompanyState{
  const choice:BusinessEventChoice|undefined=event.choices.find(c=>c.id===choiceId);
  if(!choice)throw new Error('Event choice not found.');
  if(choice.cashDelta<0&&state.cash<Math.abs(choice.cashDelta))throw new Error('Not enough cash for that choice.');
  return {
    ...state,
    cash:state.cash+choice.cashDelta,
    reputation:clamp(state.reputation+choice.reputationDelta,.1,1),
    lastBusinessEventDay:event.day,
    ledger:choice.cashDelta!==0?[...state.ledger,{day:state.day,category:'event',amount:choice.cashDelta,memo:`${event.title}: ${choice.label}`}]:state.ledger
  };
}
