import { boatTemplates,marinas } from '../data/content';
import type {
  Booking, BusinessEvent, BusinessEventChoice, CalendarInfo, CompanyState, CustomerType,
  Loan, MaintenanceLevel, MarketingChannelId, MarketingFocus, MarketingMarketSnapshot, OwnedBoat, TripType, UsedBoatListing
} from '../types/models';
import { RNG } from './rng';

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const gameMonths=[{name:'Feb',num:2,len:28},{name:'Mar',num:3,len:31},{name:'Apr',num:4,len:30},{name:'May',num:5,len:31},{name:'Jun',num:6,len:30},{name:'Jul',num:7,len:31},{name:'Aug',num:8,len:31},{name:'Sep',num:9,len:30},{name:'Oct',num:10,len:31},{name:'Nov',num:11,len:30},{name:'Dec',num:12,len:31},{name:'Jan',num:1,len:31}];

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

export const marketingChannels:Record<MarketingChannelId,{label:string;detail:string;costIndex:number;maxBookingBoost:number;budgetScale:number}> = {
  search:{label:'Google Search',detail:'Highest intent, but every click is expensive.',costIndex:1.75,maxBookingBoost:.78,budgetScale:65},
  maps:{label:'Google Maps',detail:'Strong local intent with lower cost than Search.',costIndex:1.05,maxBookingBoost:.62,budgetScale:55},
  social:{label:'Social',detail:'Cheap reach, but fewer people are ready to book right now.',costIndex:.65,maxBookingBoost:.40,budgetScale:38},
  hotel:{label:'Hotels',detail:'Warm visitor referrals, but booked trips pay a referral cut.',costIndex:1.20,maxBookingBoost:.55,budgetScale:50},
  content:{label:'Content / PR',detail:'Slowest immediate payoff, cheapest long-game visibility.',costIndex:.55,maxBookingBoost:.30,budgetScale:75}
};

export function canonicalMarketingFocus(focus:MarketingFocus|undefined):MarketingChannelId{
  return !focus||focus==='organic'?'search':focus;
}

export function marketingPerformance(state:CompanyState,market?:MarketingMarketSnapshot){
  const m=state.marketing??{dailyBudget:0,focus:'search' as const,reviewAsk:true};
  const focus=canonicalMarketingFocus(m.focus);
  const config=marketingChannels[focus];
  const saturation=clamp(market?.channels?.[focus]?.saturation??0,0,1);
  const costPressure=config.costIndex*(1+saturation*1.5);
  const budget=Math.max(0,m.dailyBudget);
  const reach=budget<=0?0:1-Math.exp(-budget/(config.budgetScale*costPressure));
  const crowdPenalty=1-saturation*.45;
  const bookingBoost=clamp(config.maxBookingBoost*reach*crowdPenalty,0,config.maxBookingBoost);
  return {focus,config,saturation,costPressure,bookingBoost,effectiveBudget:budget/costPressure};
}

export function marketingStrength(state:CompanyState,market?:MarketingMarketSnapshot):number{
  const performance=marketingPerformance(state,market);
  const reviews=Math.min(1,(state.reviewCount??0)/100);
  const reputation=clamp(state.reputation??.5,0,1);
  const reviewHabit=state.marketing?.reviewAsk?.10:0;
  return clamp(.10+performance.bookingBoost*.48+reputation*.22+reviews*.13+reviewHabit,0,1);
}

function gameDayForDate(gameYear:number,month:number,dayOfMonth:number):number{
  const index=gameMonths.findIndex(m=>m.num===month);
  if(index<0)throw new Error('Invalid game month.');
  const before=gameMonths.slice(0,index).reduce((sum,m)=>sum+m.len,0);
  return (gameYear-1)*365+before+dayOfMonth;
}

function memorialDayOfMonth(gameYear:number):number{
  const dayNames:CalendarInfo['dayOfWeek'][]=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  for(let d=31;d>=25;d--){
    const absolute=gameDayForDate(gameYear,5,d);
    if(dayNames[(absolute-1)%7]==='Mon')return d;
  }
  return 31;
}

function holidayProfile(gameYear:number,month:number,dayOfMonth:number){
  const absolute=gameDayForDate(gameYear,month,dayOfMonth);
  const memorial=memorialDayOfMonth(gameYear);
  const memorialMonday=gameDayForDate(gameYear,5,memorial);
  const memorialWeekend=absolute>=memorialMonday-3&&absolute<=memorialMonday;
  const julyFourthWeekend=month===7&&dayOfMonth>=2&&dayOfMonth<=5;
  const laborDay=month===9&&dayOfMonth>=1&&dayOfMonth<=7&&calendarForAbsoluteDay(absolute).dayOfWeek==='Mon';
  const laborWeekend=laborDay||(
    month===9&&dayOfMonth<=7&&
    (()=>{for(let d=1;d<=7;d++){const a=gameDayForDate(gameYear,9,d);if(calendarForAbsoluteDay(a).dayOfWeek==='Mon')return absolute>=a-3&&absolute<=a;}return false;})()
  );
  const thanksgiving=month===11&&dayOfMonth>=22&&dayOfMonth<=28&&calendarForAbsoluteDay(absolute).dayOfWeek==='Thu';
  let thanksgivingWeekend=false;
  if(month===11){
    for(let d=22;d<=28;d++){
      const a=gameDayForDate(gameYear,11,d);
      if(calendarForAbsoluteDay(a).dayOfWeek==='Thu'&&absolute>=a&&absolute<=a+3){thanksgivingWeekend=true;break;}
    }
  }
  const hellWeek=(month===12&&dayOfMonth>=24)||(month===1&&dayOfMonth<=1);
  if(memorialWeekend)return {label:'Memorial Day Weekend',peak:true,multiplier:2.05,crowdRisk:.055};
  if(julyFourthWeekend)return {label:'July 4th Weekend',peak:true,multiplier:2.10,crowdRisk:.060};
  if(hellWeek)return {label:'Hell Week',peak:true,multiplier:1.78,crowdRisk:.045};
  if(laborWeekend)return {label:'Labor Day Weekend',peak:false,multiplier:1.55,crowdRisk:.028};
  if(thanksgiving||thanksgivingWeekend)return {label:'Thanksgiving Weekend',peak:false,multiplier:1.50,crowdRisk:.026};
  return {label:undefined as string|undefined,peak:false,multiplier:1,crowdRisk:0};
}

function calendarForAbsoluteDay(day:number):{dayOfWeek:CalendarInfo['dayOfWeek']}{
  const dayNames:CalendarInfo['dayOfWeek'][]=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return {dayOfWeek:dayNames[(day-1)%7]};
}

export function activeHotelDealsForDay(state:CompanyState,day=state.day){
  return (state.activeHotelDeals??[]).filter(d=>d.startDay<=day&&d.endDay>=day);
}

export function calendarForDay(day:number,state?:CompanyState,market?:MarketingMarketSnapshot):CalendarInfo{
  const dayNames:CalendarInfo['dayOfWeek'][]=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dayOfWeek=dayNames[(day-1)%7];
  const week=Math.ceil(day/7);
  const gameYear=Math.floor((day-1)/365)+1;
  let offset=(day-1)%365; // game always begins February 1
  let monthIndex=0;
  while(offset>=gameMonths[monthIndex].len){offset-=gameMonths[monthIndex].len;monthIndex+=1;}
  const monthInfo=gameMonths[monthIndex];
  const dayOfMonth=offset+1;
  const monthNumber=monthInfo.num;
  const strength=state?marketingStrength(state,market):.45;
  const marketingLabel:CalendarInfo['marketingLabel']=strength>=.62?'Strong':strength>=.42?'Okay':'Weak';
  const afterFeb14=monthNumber>2||(monthNumber===2&&dayOfMonth>=14);
  const throughSep1=monthNumber<9||(monthNumber===9&&dayOfMonth<=1);
  const season:CalendarInfo['season']=monthNumber===2&&dayOfMonth<14?'warmup':afterFeb14&&throughSep1?'busy':'slow';

  let seasonMult:number;
  if(season==='busy')seasonMult=.90+strength*.58;
  else if(monthNumber===9)seasonMult=strength>=.62?.38:strength>=.42?.27:.16;
  else if(season==='warmup')seasonMult=.48+strength*.34;
  else seasonMult=strength>=.62?.58:strength>=.42?.42:.27;

  const isWeekend=dayOfWeek==='Fri'||dayOfWeek==='Sat'||dayOfWeek==='Sun';
  const weekendMult=isWeekend?1.38:.92;
  const holiday=holidayProfile(gameYear,monthNumber,dayOfMonth);
  const hotelDeals=state?activeHotelDealsForDay(state,day):[];
  const hotelBoost=hotelDeals.reduce((sum,d)=>sum+d.demandBoost,0);
  const demandMultiplier=Number((seasonMult*weekendMult*holiday.multiplier*(1+hotelBoost)).toFixed(2));
  const date=`${monthInfo.name} ${dayOfMonth}`;

  let note:string;
  if(monthNumber===8&&dayOfMonth===1)note=`${date}: slow season is one month away. Build cash reserves, keep maintenance current and prepare now for September.`;
  else if(monthNumber===12&&dayOfMonth===1)note=`${date}: Hell Week starts December 24. Prepare the boats, crew and cash cushion before the holiday rush.`;
  else if(holiday.label)note=`${date}: ${holiday.label}. Demand is unusually high, but crowded docks and heavy boat traffic raise operating risk.`;
  else if(monthNumber===9&&dayOfMonth>1)note=`${date}: September is the slowest month of the year. Strong marketing and hotel partnerships matter more now.`;
  else if(season==='busy')note=`${date}: busy season runs February 14 through September 1. Weekends materially outpace normal weekdays.`;
  else if(season==='warmup')note=`${date}: early February is still warming up. Busy season begins February 14.`;
  else note=`${date}: slow season. Weekends and holiday periods can still create sharp demand spikes.`;

  if(hotelDeals.length)note+=` ${hotelDeals.length} hotel agreement${hotelDeals.length===1?' is':'s are'} active today.`;
  const crowdRisk=Math.max(holiday.crowdRisk,isWeekend&&season==='busy'?.014:0);
  return {day,week,dayOfWeek,month:monthNumber,monthName:monthInfo.name,dayOfMonth,gameYear,season,demandMultiplier,note,marketingStrength:strength,marketingLabel,isWeekend,holidayLabel:holiday.label,peakDemand:holiday.peak,crowdRisk};
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
    const engineYear=Math.max(year,template.engineYear);
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
      templateId:template.id,name:template.name,year,engineYear,condition,engineHours,askingPrice,reliability,inspectionNote
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
    engineYear:listing.engineYear,
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
  const purchaseCashRequired=finance?Math.ceil(listing.askingPrice*.25):listing.askingPrice;
  const additionalSlip=state.boats.length?marina.monthlySlip:0;
  const cashRequired=purchaseCashRequired+additionalSlip;
  if(state.cash<cashRequired)throw new Error('Not enough cash for this boat and its marina slip.');

  let loans=[...(state.loans??[])];
  let debt=state.debt??0;
  let memo=`Bought used ${listing.name}`;
  if(finance){
    const principal=listing.askingPrice-purchaseCashRequired;
    const apr=.2499;
    const dailyRate=apr/365;
    const dailyPayment=Math.ceil(principal*dailyRate/(1-Math.pow(1+dailyRate,-730)));
    const loan:Loan={id:`loan-${owned.instanceId}`,originalPrincipal:principal,balance:principal,apr,dailyPayment,boatInstanceId:owned.instanceId};
    loans.push(loan); debt+=principal; memo=`Financed used ${listing.name}; 25% down · 24.99% APR · 2 game years`;
  }
  const ledger=[...state.ledger,{day:state.day,category:'boat',amount:-purchaseCashRequired,memo}];
  if(additionalSlip)ledger.push({day:state.day,category:'marina',amount:-additionalSlip,memo:`Additional monthly slip for ${listing.name} at ${marina.name}`});
  return {
    ...state,cash:state.cash-cashRequired,debt,loans,boats:[...state.boats,owned],ledger
  };
}

export function serviceStatus(boat:OwnedBoat):{kind:'300hr'|'100hr'|'ok';dueAt:number;overdue:number;hoursUntil:number;serviceType:'100hr'|'300hr';label:string}{
  const dueAt=Math.min(boat.next100Service,boat.next300Service);
  const serviceType: '100hr'|'300hr' = boat.next300Service<=boat.next100Service?'300hr':'100hr';
  const delta=Number((dueAt-boat.engineHours).toFixed(1));
  if(delta<=0){
    const overdue=Math.max(0,Number((-delta).toFixed(1)));
    return {
      kind:serviceType,
      dueAt,
      overdue,
      hoursUntil:0,
      serviceType,
      label:`${serviceType==='300hr'?'300-hour':'100-hour'} service ${overdue>0?`${overdue.toFixed(overdue%1?1:0)} engine hours overdue`:'due now'}`
    };
  }
  const hoursUntil=delta;
  return {
    kind:'ok',
    dueAt,
    overdue:0,
    hoursUntil,
    serviceType,
    label:`${serviceType==='300hr'?'300-hour':'100-hour'} service in ${hoursUntil.toFixed(hoursUntil%1?1:0)} engine hours`
  };
}

export function maintainBoat(state:CompanyState,instanceId:string,level:MaintenanceLevel):CompanyState{
  const boat=state.boats.find(b=>b.instanceId===instanceId);
  if(!boat)throw new Error('Boat not found.');
  const plans={
    dock:{cost:75,condition:.03,reliability:.005,label:'Dock check & cleanup'},
    '100hr':{cost:350,condition:.05,reliability:.025,label:'100-hour engine service'},
    '300hr':{cost:700,condition:.10,reliability:.065,label:'300-hour engine service'}
  } as const;
  const plan=plans[level];
  if(state.cash<plan.cost)throw new Error('Not enough cash for that service.');
  const currentHours=boat.engineHours;
  const currentService=serviceStatus(boat);
  if(level==='100hr'&&currentService.serviceType==='300hr')throw new Error('The 300-hour service is due now; it replaces the 100-hour service.');
  let next100=boat.next100Service;
  let next300=boat.next300Service;
  if(level==='100hr'){
    const remainingIntervalsTo300=Math.max(1,Math.round((boat.next300Service-boat.next100Service)/100));
    next100=Number((currentHours+100).toFixed(1));
    next300=Number((currentHours+remainingIntervalsTo300*100).toFixed(1));
  }else if(level==='300hr'){
    next100=Number((currentHours+100).toFixed(1));
    next300=Number((currentHours+300).toFixed(1));
  }
  const cash=state.cash-plan.cost;
  return {
    ...state,
    cash,
    companyValue:state.daysOperated===0?Math.round(cash-state.debt):state.companyValue,
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
        {id:'accept',label:'Make the 7-day deal',detail:'Pay $250. This hotel sends meaningful extra demand for 7 game days, and overlapping hotel agreements stack.',cashDelta:-250,reputationDelta:.018},
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
  const activeHotelDeals=(state.activeHotelDeals??[]).filter(d=>d.endDay>=state.day);
  if(event.id==='hotel-partner'&&choiceId==='accept'){
    activeHotelDeals.push({
      id:`hotel-${event.day}-${activeHotelDeals.length+1}`,
      startDay:event.day,
      endDay:event.day+6,
      demandBoost:.22
    });
  }
  return {
    ...state,
    cash:state.cash+choice.cashDelta,
    reputation:clamp(state.reputation+choice.reputationDelta,.1,1),
    activeHotelDeals,
    lastBusinessEventDay:event.day,
    ledger:choice.cashDelta!==0?[...state.ledger,{day:state.day,category:'event',amount:choice.cashDelta,memo:`${event.title}: ${choice.label}`}]:state.ledger
  };
}
