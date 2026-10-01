import { boatTemplates,marinas } from '../data/content';
import type {
  Booking, BusinessEvent, BusinessEventChoice, CalendarInfo, CompanyState, CustomerType,
  Loan, MaintenanceLevel, OwnedBoat, TripType, UsedBoatListing
} from '../types/models';
import { RNG } from './rng';

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const monthLengths=[31,28,31,30,31,30,31,31,30,31,30,31];

export const customerProfiles:Record<CustomerType,{label:string;likes:string;warning:string;tipBias:number}> = {
  family:{label:'Family Crew',likes:'a smooth, safe, easy day',warning:'Families notice rough rides and tired-looking boats.',tipBias:.02},
  couple:{label:'Couple Getaway',likes:'privacy, comfort and a memorable view',warning:'They dislike changes that were not really needed.',tipBias:.05},
  celebration:{label:'Celebration Group',likes:'fun, music and getting the trip they booked',warning:'They can handle some chop, but hate losing the main event for no reason.',tipBias:.04},
  snorkeler:{label:'Serious Snorkelers',likes:'clear water and a great place to snorkel',warning:'Bad visibility hurts this group fast.',tipBias:.03},
  luxury:{label:'Premium Private Guests',likes:'a polished boat and flexible service',warning:'They expect the boat and service to look sharp.',tipBias:.08},
  bargain:{label:'Value Hunters',likes:'feeling like they got their money’s worth',warning:'They care less about fancy extras and more about value.',tipBias:-.02},
  repeat:{label:'Repeat Guests',likes:'another great day like last time',warning:'They notice when today feels worse than the trip that brought them back.',tipBias:.06}
};

export function nextHundred(hours:number):number{
  return (Math.floor(hours/100)+1)*100;
}
export function nextThreeHundred(hours:number):number{
  return (Math.floor(hours/300)+1)*300;
}

export function marketingStrength(state:CompanyState):number{
  const m=state.marketing??{dailyBudget:0,focus:'organic' as const,reviewAsk:true};
  const budget=Math.min(1,m.dailyBudget/250);
  const reviews=Math.min(1,(state.reviewCount??0)/100);
  const reputation=clamp(state.reputation??.5,0,1);
  const reviewHabit=m.reviewAsk?.10:0;
  return clamp(.12+budget*.43+reputation*.22+reviews*.13+reviewHabit,0,1);
}

export function calendarForDay(day:number,state?:CompanyState):CalendarInfo{
  const dayNames:CalendarInfo['dayOfWeek'][]=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dayOfWeek=dayNames[(day-1)%7];
  const week=Math.ceil(day/7);
  const gameYear=Math.floor((day-1)/365)+1;
  let offset=(31+((day-1)%365))%365; // game always begins February 1
  let month=1;
  while(offset>=monthLengths[month]){offset-=monthLengths[month];month=(month+1)%12;}
  const dayOfMonth=offset+1;
  const monthNumber=month+1;
  const strength=state?marketingStrength(state):.45;
  const marketingLabel:CalendarInfo['marketingLabel']=strength>=.62?'Strong':strength>=.42?'Okay':'Weak';
  const afterFeb14=monthNumber>2||(monthNumber===2&&dayOfMonth>=14);
  const throughSep1=monthNumber<9||(monthNumber===9&&dayOfMonth<=1);
  const season:CalendarInfo['season']=monthNumber===2&&dayOfMonth<14?'warmup':afterFeb14&&throughSep1?'busy':'slow';
  let seasonMult:number;
  if(season==='busy')seasonMult=.88+strength*.55;
  else if(season==='warmup')seasonMult=.42+strength*.34;
  else seasonMult=strength>=.62?.50:strength>=.42?.34:.20;
  const weekend=dayOfWeek==='Fri'||dayOfWeek==='Sat'||dayOfWeek==='Sun';
  const weekendMult=weekend?1.10:.95;
  const demandMultiplier=Number((seasonMult*weekendMult).toFixed(2));
  const date=`${monthNames[month]} ${dayOfMonth}`;
  const note=season==='busy'
    ? `${date}: busy season. Strong marketing can keep the calendar packed.`
    : season==='warmup'
      ? `${date}: the year starts slowly, but things wake up around February 14.`
      : `${date}: slow season. Strong marketers can hold about half their busy-season demand; weak marketing can fall near one-fifth.`;
  return {day,week,dayOfWeek,month:monthNumber,monthName:monthNames[month],dayOfMonth,gameYear,season,demandMultiplier,note,marketingStrength:strength,marketingLabel};
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
  const marketFactor=state.islandId==='captains'?.82:state.islandId==='pelican'?1.08:state.islandId==='reef'||state.islandId==='lighthouse'?1.04:1;
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
    const askingPrice=Math.round(template.basePrice*(.38+condition*.48)*(.88+rng.next()*.22)*marketFactor/250)*250;
    const next100=nextHundred(engineHours);
    const next300=nextThreeHundred(engineHours);
    const inspectionNote=condition>.84
      ? `Clean survey. Next engine service: ${Math.min(next100,next300)} hours.`
      : engineHours>1400
        ? `High hours. Watch the engine service clock: ${Math.min(next100,next300)} hours next.`
        : condition<.62
          ? 'Cheap for a reason. Deferred maintenance is visible.'
          : `Normal used-boat wear. Next engine service: ${Math.min(next100,next300)} hours.`;
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
    insuranceDeclined:false,
    next100Service:nextHundred(listing.engineHours),
    next300Service:nextThreeHundred(listing.engineHours),
    marinaId:state.marinaId
  };
}

export function buyUsedBoat(state:CompanyState,listingId:string,finance=false):CompanyState{
  if(state.day<=7)throw new Error('The used-boat market opens after Captain School.');
  if(!state.marinaId)throw new Error('Pick a marina before buying another boat.');
  const listing=generateUsedBoatMarket(state).find(x=>x.listingId===listingId);
  if(!listing)throw new Error('That boat is gone. Check the market again tomorrow.');
  if(state.boats.some(b=>b.instanceId===`used-${listingId}`))throw new Error('You already bought this boat.');
  const marina=marinas.find(m=>m.id===state.marinaId);
  const template=boatTemplates.find(b=>b.id===listing.templateId);
  if(!marina||!template)throw new Error('Marina or boat data unavailable.');
  if(template.lengthFt>marina.maxBoatFt)throw new Error('That boat is too big for your current marina.');
  const owned=ownedFromListing(state,listing);
  const cashRequired=finance?Math.ceil(listing.askingPrice*.25):listing.askingPrice;
  if(state.cash<cashRequired)throw new Error('Not enough cash for this boat.');

  let loans=[...(state.loans??[])];
  let debt=state.debt??0;
  let memo=`Bought used ${listing.name}`;
  if(finance){
    const principal=listing.askingPrice-cashRequired;
    const apr=.099;
    const dailyPayment=Math.ceil((principal*(1+apr*.25))/90);
    const loan:Loan={id:`loan-${owned.instanceId}`,originalPrincipal:principal,balance:principal,apr,dailyPayment,boatInstanceId:owned.instanceId};
    loans.push(loan); debt+=principal; memo=`Financed used ${listing.name}; 25% down`;
  }
  return {
    ...state,cash:state.cash-cashRequired,debt,loans,boats:[...state.boats,owned],
    ledger:[...state.ledger,{day:state.day,category:'boat',amount:-cashRequired,memo}]
  };
}

export function serviceStatus(boat:OwnedBoat):{kind:'300hr'|'100hr'|'ok';dueAt:number;overdue:number;label:string}{
  const due300=boat.engineHours>=boat.next300Service;
  const due100=boat.engineHours>=boat.next100Service;
  if(due300){
    const overdue=Math.max(0,boat.engineHours-boat.next300Service);
    return {kind:'300hr',dueAt:boat.next300Service,overdue,label:`300-hour service ${overdue>0?`${Math.round(overdue)} hours overdue`:'due now'}`};
  }
  if(due100){
    const overdue=Math.max(0,boat.engineHours-boat.next100Service);
    return {kind:'100hr',dueAt:boat.next100Service,overdue,label:`100-hour service ${overdue>0?`${Math.round(overdue)} hours overdue`:'due now'}`};
  }
  const dueAt=Math.min(boat.next100Service,boat.next300Service);
  return {kind:'ok',dueAt,overdue:0,label:`Next engine service at ${dueAt} hours`};
}

export function maintainBoat(state:CompanyState,instanceId:string,level:MaintenanceLevel):CompanyState{
  const boat=state.boats.find(b=>b.instanceId===instanceId);
  if(!boat)throw new Error('Boat not found.');
  const plans={
    dock:{cost:120,condition:.03,reliability:.005,label:'Dock check & cleanup'},
    '100hr':{cost:450,condition:.05,reliability:.025,label:'100-hour engine service'},
    '300hr':{cost:900,condition:.10,reliability:.065,label:'300-hour engine service'}
  } as const;
  const plan=plans[level];
  if(state.cash<plan.cost)throw new Error('Not enough cash for that service.');
  const currentHours=boat.engineHours;
  const next100=level==='100hr'||level==='300hr'?nextHundred(currentHours):boat.next100Service;
  const next300=level==='300hr'?nextThreeHundred(currentHours):boat.next300Service;
  return {
    ...state,
    cash:state.cash-plan.cost,
    boats:state.boats.map(b=>b.instanceId===instanceId?{
      ...b,
      condition:clamp(b.condition+plan.condition,.25,1),
      reliability:clamp(b.reliability+plan.reliability,.25,.99),
      next100Service:next100,
      next300Service:next300
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
      id:'hotel-partner',title:'A hotel wants to send you guests',
      description:'A nearby hotel likes your reviews. They will send visitors your way, but they want a cut.',
      choices:[
        {id:'accept',label:'Make the deal',detail:'Pay $250 to get set up and gain a little reputation.',cashDelta:-250,reputationDelta:.018},
        {id:'pass',label:'Skip it',detail:'Keep your cash and do your own marketing.',cashDelta:0,reputationDelta:0}
      ]
    },
    {
      id:'captain-callout',title:'Your other captain calls out',
      description:'The second boat needs a driver today. Pay for emergency help or deal with fewer trips.',
      choices:[
        {id:'cover',label:'Find a replacement',detail:'Pay $350 and keep your reputation steady.',cashDelta:-350,reputationDelta:.006},
        {id:'absorb',label:'Run short-handed',detail:'Save the cash, but guests notice the disruption.',cashDelta:0,reputationDelta:-.012}
      ]
    },
    {
      id:'viral-post',title:'A guest video is blowing up',
      description:'People are suddenly sharing yesterday’s trip. Spend a little to push it farther, or enjoy the free attention.',
      choices:[
        {id:'boost',label:'Give it a boost',detail:'Spend $180 for a bigger reputation bump.',cashDelta:-180,reputationDelta:.025},
        {id:'organic',label:'Let it ride',detail:'Free attention, smaller reputation bump.',cashDelta:0,reputationDelta:.010}
      ]
    },
    {
      id:'marina-increase',title:'The marina raises the rent',
      description:'Dock space just got more expensive. You can pay now to lock your old rate for a while or keep the cash.',
      choices:[
        {id:'lock',label:'Lock the old rate',detail:'Pay $300 now for some breathing room.',cashDelta:-300,reputationDelta:.004},
        {id:'accept',label:'Keep the cash',detail:'No cost today.',cashDelta:0,reputationDelta:0}
      ]
    }
  ];
  const eligible=events.filter(e=>e.id!=='captain-callout'||state.staff.length>0);
  return {...rng.pick(eligible),day:state.day};
}

export function resolveBusinessEvent(state:CompanyState,event:BusinessEvent,choiceId:string):CompanyState{
  const choice:BusinessEventChoice|undefined=event.choices.find(c=>c.id===choiceId);
  if(!choice)throw new Error('That choice is not available.');
  if(choice.cashDelta<0&&state.cash<Math.abs(choice.cashDelta))throw new Error('You do not have enough cash for that choice.');
  return {
    ...state,
    cash:state.cash+choice.cashDelta,
    reputation:clamp(state.reputation+choice.reputationDelta,.1,1),
    lastBusinessEventDay:event.day,
    ledger:choice.cashDelta!==0?[...state.ledger,{day:state.day,category:'event',amount:choice.cashDelta,memo:`${event.title}: ${choice.label}`}]:state.ledger
  };
}
