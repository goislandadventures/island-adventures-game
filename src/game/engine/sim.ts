import { boatTemplates, defaultProducts, islands, marinas } from '../data/content';
import type { Booking, CompanyState, DayResult, MarketingFocus, MarketingMarketSnapshot, Marina, OwnedBoat, Review, StaffMember, TripDecision, TripOutcome, TripProduct, WeatherDay } from '../types/models';
import { RNG } from './rng';
import { applyLoanPayments, calendarForDay, canonicalMarketingFocus, customerForTrip, customerProfiles, marketingPerformance, nextHundred, nextThreeHundred, serviceStatus } from './depth';
import { applyHurricane, hurricaneForDay } from './hurricane';

const clamp = (n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const referencePrice:Record<string,number>={sandbar:489,snorkel:649,sunset:319,custom:449,eco:399,fishing:699,cruise:399};
const RUNNING_COST_PER_ENGINE_HOUR=179;
const HOURS_PER_TRIP=1.5;
const STARTING_CASH=10000;
const STARTUP_LOAN_APR=.2499;
const STARTUP_LOAN_DAYS=730;
const startupValue=(cash:number,debt:number)=>Math.round(cash-debt);

export const captainCandidates:StaffMember[]=[
  {id:'capt-casey',name:'Casey Morgan',role:'captain',skill:.78,reliability:.91,hourlyRate:35},
  {id:'capt-alex',name:'Alex Rivera',role:'captain',skill:.86,reliability:.89,hourlyRate:42},
  {id:'capt-morgan',name:'Morgan Lee',role:'captain',skill:.93,reliability:.95,hourlyRate:55}
];

export interface PlanAssessment { experienceScore:number; reasons:string[]; headline:string; }

export function createCompany(captainName='Captain',companyName='Island Adventures',companyColor='#f6c453',seed=20261001):CompanyState{
  return {day:1,seed,captainName,companyName,companyColor,cash:STARTING_CASH,debt:0,reputation:.50,rating:0,reviewCount:0,islandId:'harbor',boats:[],products:structuredClone(defaultProducts),bookings:[],ledger:[],companyValue:STARTING_CASH,lifetimeRevenue:0,lifetimeProfit:0,daysOperated:0,staff:[],marketing:{dailyBudget:0,focus:'search',reviewAsk:true},loans:[],startupLoanTaken:false};
}

export function rentSlip(state:CompanyState,marinaId:string):CompanyState{
  if(state.marinaId)return state;
  const marina=marinas.find(m=>m.id===marinaId&&m.islandId===state.islandId);
  if(!marina)throw new Error('That marina is not available on this island.');
  if(state.cash<marina.monthlySlip)throw new Error('Not enough cash for slip rent.');
  const cash=state.cash-marina.monthlySlip;
  return {...state,cash,companyValue:state.daysOperated===0?startupValue(cash,state.debt):state.companyValue,marinaId:marina.id,reputation:clamp(state.reputation+marina.reputationBonus,.1,1),ledger:[...state.ledger,{day:state.day,category:'marina',amount:-marina.monthlySlip,memo:`First month at ${marina.name}`}]};
}

export function expandToIsland(state:CompanyState,islandId:string):CompanyState{
  if(islandId===state.islandId)return state;
  const island=islands.find(i=>i.id===islandId);
  if(!island)throw new Error('Island not found.');
  if(state.companyValue<island.unlockValue)throw new Error(`Reach $${island.unlockValue.toLocaleString()} company value to unlock ${island.name}.`);
  const marina=marinas.find(m=>m.islandId===islandId);
  if(!marina)throw new Error('No marina is available there yet.');
  const relocation=500;
  const total=marina.monthlySlip+relocation;
  if(state.cash<total)throw new Error('Not enough cash to relocate the company.');
  return {...state,cash:state.cash-total,islandId,marinaId:marina.id,boats:state.boats.map(b=>({...b,marinaId:marina.id})),reputation:clamp(state.reputation+marina.reputationBonus,.1,1),ledger:[...state.ledger,{day:state.day,category:'expansion',amount:-total,memo:`Relocated to ${marina.name}, ${island.name}`}]};
}

export function buyBoat(state:CompanyState,templateId='old-deck-19'):CompanyState{
  if(!state.marinaId)throw new Error('Rent a slip before buying a boat.');
  const marina=marinas.find(m=>m.id===state.marinaId)!;
  const boat=boatTemplates.find(b=>b.id===templateId);
  if(!boat)throw new Error('Boat not found.');
  if(boat.lengthFt>marina.maxBoatFt)throw new Error('That boat is too large for your current marina.');
  if(state.cash<boat.basePrice)throw new Error('Not enough cash to buy boat.');
  const condition=clamp(boat.reliability+.08,.55,.91);
  const owned:OwnedBoat={...boat,instanceId:`${boat.id}-${state.day}-${state.boats.length+1}`,year:boat.hullYear,engineYear:boat.engineYear,condition,engineHours:boat.startingEngineHours,purchasePrice:boat.basePrice,insured:false,insuranceDeclined:false,marinaId:state.marinaId,next100Service:nextHundred(boat.startingEngineHours),next300Service:nextThreeHundred(boat.startingEngineHours)};
  const cash=state.cash-boat.basePrice;
  return {...state,cash,companyValue:state.daysOperated===0?startupValue(cash,state.debt):state.companyValue,boats:[...state.boats,owned],ledger:[...state.ledger,{day:state.day,category:'boat',amount:-boat.basePrice,memo:`Purchased ${boat.name}`}]};
}

export function insuranceQuote(boat:OwnedBoat,marina?:Marina):number{
  const base=Math.max(650,Math.round(boat.purchasePrice*.06));
  return Math.round(base*(marina?.insuranceMultiplier??1));
}

export function insureFleet(state:CompanyState):CompanyState{
  const uninsured=state.boats.filter(b=>!b.insured);
  if(!state.boats.length)throw new Error('You need a boat first.');
  if(!uninsured.length)return state;
  const marina=marinas.find(m=>m.id===state.marinaId);
  const premium=uninsured.reduce((sum,b)=>sum+insuranceQuote(b,marina),0);
  if(state.cash<premium)throw new Error('You do not have enough cash for that insurance.');
  const cash=state.cash-premium;
  return {...state,cash,companyValue:state.daysOperated===0?startupValue(cash,state.debt):state.companyValue,boats:state.boats.map(b=>b.insured?b:{...b,insured:true,insuranceDeclined:false,insuranceRenewalDay:state.day+365}),ledger:[...state.ledger,{day:state.day,category:'insurance',amount:-premium,memo:`One year of boat insurance at ${marina?.name??'the marina'}`}]};
}

export function declineInsurance(state:CompanyState,instanceId:string):CompanyState{
  return {...state,boats:state.boats.map(b=>b.instanceId===instanceId?{...b,insured:false,insuranceDeclined:true}:b)};
}
export function serviceBoat(state:CompanyState,instanceId:string):CompanyState{
  const boat=state.boats.find(b=>b.instanceId===instanceId);
  if(!boat)throw new Error('Boat not found.');
  const cost=450;
  if(state.cash<cost)throw new Error('Not enough cash for routine service.');
  return {...state,cash:state.cash-cost,boats:state.boats.map(b=>b.instanceId===instanceId?{...b,condition:clamp(b.condition+.10,.25,1),reliability:clamp(b.reliability+.02,.25,.98)}:b),ledger:[...state.ledger,{day:state.day,category:'maintenance',amount:-cost,memo:`Routine service: ${boat.name}`}]};
}

export function takeStartupLoan(state:CompanyState,amount:number):CompanyState{
  if(state.daysOperated>0||state.day>1)throw new Error('Startup financing is only available before your first operating day.');
  if(state.startupLoanTaken)throw new Error('You already took your one startup loan.');
  const principal=Math.min(20000,Math.max(0,Math.round(amount/1000)*1000));
  if(principal<5000)throw new Error('Choose a startup loan from $5,000 to $20,000.');
  const dailyRate=STARTUP_LOAN_APR/365;
  const payment=Math.ceil(principal*dailyRate/(1-Math.pow(1+dailyRate,-STARTUP_LOAN_DAYS)));
  const loan={id:'startup-loan',originalPrincipal:principal,balance:principal,apr:STARTUP_LOAN_APR,dailyPayment:payment};
  const cash=state.cash+principal;
  const debt=state.debt+principal;
  return {...state,cash,debt,companyValue:startupValue(cash,debt),startupLoanTaken:true,loans:[...state.loans,loan],ledger:[...state.ledger,{day:state.day,category:'loan',amount:principal,memo:`Startup loan · 24.99% APR · 2 game years`}]};
}

export function hireCaptain(state:CompanyState,candidateId:string):CompanyState{
  const candidate=captainCandidates.find(c=>c.id===candidateId);
  if(!candidate)throw new Error('Captain candidate not found.');
  if(state.staff.some(s=>s.id===candidateId))return state;
  const onboarding=250;
  if(state.cash<onboarding)throw new Error('Not enough cash for hiring/onboarding.');
  return {...state,cash:state.cash-onboarding,staff:[...state.staff,candidate],ledger:[...state.ledger,{day:state.day,category:'staff',amount:-onboarding,memo:`Hired Captain ${candidate.name}`}]};
}

export function setMarketing(state:CompanyState,dailyBudget:number,focus:MarketingFocus):CompanyState{
  return {...state,marketing:{...(state.marketing??{reviewAsk:true}),dailyBudget:clamp(Math.round(dailyBudget),0,250),focus}};
}
export function setReviewAsk(state:CompanyState,reviewAsk:boolean):CompanyState{
  return {...state,marketing:{...(state.marketing??{dailyBudget:0,focus:'search'}),reviewAsk}};
}
export function setPrice(state:CompanyState,type:TripProduct['type'],price:number):CompanyState{
  return {...state,products:state.products.map(p=>p.type===type?{...p,price:Math.max(99,Math.round(price))}:p)};
}

export function generateWeather(state:CompanyState):WeatherDay{
  if(state.day===1)return {day:1,windKts:17,windDirection:'E',rainChance:20,stormRisk:.08,waterClarity:.72,temperatureF:82};
  const rng=new RNG(state.seed+state.day*9973);
  const directions=['N','NE','E','SE','S','SW','W','NW'] as const;
  const island=islands.find(i=>i.id===state.islandId);
  const exposure=island?.weatherExposure??'moderate';
  const windShift=exposure==='protected'?-2:exposure==='exposed'?2:0;
  const stormShift=exposure==='protected'?-.04:exposure==='exposed'?.04:0;
  return {
    day:state.day,
    windKts:clamp(rng.int(4,28)+windShift,3,30),
    windDirection:rng.pick(directions),
    rainChance:rng.int(5,75),
    stormRisk:Number(clamp(rng.next()*.32+stormShift,.02,.42).toFixed(2)),
    waterClarity:Number((.45+rng.next()*.5).toFixed(2)),
    temperatureF:rng.int(74,90)
  };
}

function weatherFit(type:TripProduct['type'],w:WeatherDay,protectedWater=false):number{
  const effectiveWind=protectedWater?Math.max(3,w.windKts-7):w.windKts;
  const windPenalty=Math.max(0,effectiveWind-(type==='snorkel'?9:14))*(type==='snorkel'?.055:.025);
  const rainPenalty=(w.rainChance/100)*(type==='sunset'?.45:.22);
  const clarityBonus=type==='snorkel'?(w.waterClarity-.5)*.5:0;
  return clamp(1-windPenalty-rainPenalty+clarityBonus,.12,1.15);
}

export function weatherLabel(weather:WeatherDay):{level:'good'|'caution'|'rough';title:string;detail:string}{
  if(weather.stormRisk>.24||weather.windKts>=19)return {level:'rough',title:'Rough day',detail:'Protected-water alternatives or rescheduling deserve serious consideration.'};
  if(weather.windKts>=12||weather.rainChance>=55)return {level:'caution',title:'Captain’s call',detail:'Some trips are workable, but destination choice will matter.'};
  return {level:'good',title:'Good boating day',detail:'Conditions support most trips, subject to normal captain judgment.'};
}

function operatingBoatCount(state:CompanyState):number{
  if(!state.boats.length)return 0;
  return Math.min(state.boats.length,1+(state.staff?.length??0));
}
export function generateDemoDemand(state:CompanyState):Booking[]{
  if(!state.boats.length)return [];
  const rng=new RNG((state.seed^0x5f3759df)+(state.day*104729));
  const products=[...state.products];
  if(!products.length)return [];
  const firstIndex=rng.int(0,products.length-1);
  const first=products[firstIndex];
  const remaining=products.filter((_,i)=>i!==firstIndex);
  const second=remaining.length?rng.pick(remaining):first;
  const picked=[first,second];
  const slots:Booking['timeSlot'][]=['morning','afternoon','evening'];
  const chosenSlots=[rng.pick(slots),rng.pick(slots)];
  if(chosenSlots[1]===chosenSlots[0])chosenSlots[1]=slots[(slots.indexOf(chosenSlots[0])+1+rng.int(0,1))%slots.length];
  const sources:Booking['source'][]=['organic','maps','search','social','hotel','referral','repeat'];
  return picked.map((product,index)=>{
    const source=rng.pick(sources);
    const customer=customerForTrip(rng,product.type,source);
    const neverTips=rng.chance(.12);
    const baseTip=customer.type==='luxury'?.40:customer.type==='couple'||customer.type==='repeat'?.34:customer.type==='celebration'?.36:.28;
    return {
      id:`DEMO-D${state.day}-${index+1}-${product.type}-${rng.int(1000,9999)}`,
      tripType:product.type,
      partySize:rng.int(2,6),
      revenue:product.price,
      source,
      guestExpectation:Number((.58+rng.next()*.34).toFixed(2)),
      timeSlot:chosenSlots[index],
      customerType:customer.type,
      customerLabel:customer.label,
      boatsRequired:1,
      neverTips,
      tipCeiling:Number(clamp(baseTip*(.82+rng.next()*.32),.12,.40).toFixed(2))
    };
  });
}

export function generateDemand(state:CompanyState,weather=generateWeather(state),market?:MarketingMarketSnapshot,demoMode=false):Booking[]{
  if(demoMode)return generateDemoDemand(state);
  if(!state.boats.length||hurricaneForDay(state))return [];
  if(state.day===1){
    const sandbar=state.products.find(p=>p.type==='sandbar')!;
    const snorkel=state.products.find(p=>p.type==='snorkel')!;
    return [
      {id:'D1-sandbar-0900',tripType:'sandbar',partySize:5,revenue:sandbar.price,source:'maps',guestExpectation:.72,timeSlot:'morning',customerType:'family',customerLabel:'Family Crew',boatsRequired:1,neverTips:false,tipCeiling:.28},
      {id:'D1-snorkel-1330',tripType:'snorkel',partySize:4,revenue:snorkel.price,source:'organic',guestExpectation:.82,timeSlot:'afternoon',customerType:'snorkeler',customerLabel:'Serious Snorkelers',boatsRequired:1,neverTips:false,tipCeiling:.32}
    ];
  }
  const island=islands.find(i=>i.id===state.islandId)!;
  const rng=new RNG(state.seed^(state.day*7919));
  const slots:Booking['timeSlot'][]=['morning','afternoon','evening'];
  const bookings:Booking[]=[];
  const marketing=state.marketing??{dailyBudget:0,focus:'search' as const,reviewAsk:true};
  const competition=Math.max(.35,island.adCompetition);
  const marketingPerf=marketingPerformance(state,market);
  const paidBoost=1+(marketingPerf.bookingBoost/competition);
  const calendar=calendarForDay(state.day,state,market);
  const capacity=operatingBoatCount(state);
  for(const product of state.products){
    const ref=referencePrice[product.type]??product.price;
    const priceFit=clamp(1.15-Math.max(0,product.price-ref)/ref*1.2,.25,1.2);
    const reputationFit=.50+state.reputation*.82;
    const probability=clamp(product.baseDemand*island.tourism*weatherFit(product.type,weather)*priceFit*reputationFit*.62*paidBoost*calendar.demandMultiplier,.025,.98);
    if(rng.chance(probability)){
      let source:Booking['source'];
      if(state.reviewCount>=10&&state.reputation>.65&&rng.chance(.20))source=rng.chance(.55)?'repeat':'referral';
      else if(rng.chance(.10))source='marketplace';
      else if(marketing.dailyBudget>0&&rng.chance(.55))source=canonicalMarketingFocus(marketing.focus);
      else source=rng.pick<Booking['source']>(['organic','maps','social','hotel','paid']);
      const customer=customerForTrip(rng,product.type,source);
      const largeGroup=capacity>=2&&product.type!=='sunset'&&rng.chance(.16);
      const boatsRequired=largeGroup?2:1;
      const partySize=largeGroup?rng.int(7,12):rng.int(2,6);
      const noTipChance=customer.type==='bargain'?.30:customer.type==='luxury'?.10:.18;
      const neverTips=rng.chance(noTipChance);
      const baseTip=customer.type==='luxury'?.40:customer.type==='couple'||customer.type==='repeat'?.34:customer.type==='celebration'?.36:.28;
      const tipCeiling=Number(clamp(baseTip*(.80+rng.next()*.35),.12,.40).toFixed(2));
      bookings.push({id:`D${state.day}-${product.type}-${rng.int(1000,9999)}`,tripType:product.type,partySize,revenue:product.price*boatsRequired,source,guestExpectation:Number((.55+rng.next()*.4).toFixed(2)),timeSlot:rng.pick(slots),customerType:customer.type,customerLabel:customer.label,boatsRequired,neverTips,tipCeiling});
    }
  }
  const maxBoatTrips=capacity*2;
  const kept:Booking[]=[];
  let boatTrips=0;
  for(const booking of bookings){
    if(boatTrips+booking.boatsRequired>maxBoatTrips)continue;
    kept.push(booking);boatTrips+=booking.boatsRequired;
  }
  return kept;
}
export function assessTripPlan(state:CompanyState,booking:Booking,decision:TripDecision,weather:WeatherDay,boatOverride?:OwnedBoat):PlanAssessment{
  if(decision==='cancel')return {experienceScore:0,reasons:['Rescheduled trips do not receive a trip review.'],headline:'No trip review'};
  const boat=boatOverride??state.boats.find(b=>b.insured)??state.boats[0];
  const reasons:string[]=[];
  const criticalReasons:string[]=[];
  const add=(critical:boolean,reason:string)=>{
    reasons.push(reason);
    if(critical)criticalReasons.push(reason);
  };

  if(decision==='run'&&weather.stormRisk>.24)add(true,`You chose to run with elevated storm risk (${Math.round(weather.stormRisk*100)}%).`);

  if(booking.tripType==='snorkel'){
    if(decision==='run'&&weather.windKts>14)add(true,`You ran exposed snorkeling in ${weather.windKts} kt wind instead of moving to protected water or rescheduling.`);
    else if(decision==='run'&&weather.windKts>=11)add(false,`You ran snorkeling in ${weather.windKts} kt wind, making the water rougher than guests expected.`);
    if(decision==='run'&&weather.waterClarity<.55)add(false,`You ran the snorkel with only ${Math.round(weather.waterClarity*100)}% water clarity instead of rescheduling.`);
    if(decision==='protected'&&weather.windKts<10&&weather.waterClarity>=.60)add(false,'You moved the snorkel to protected water even though conditions supported the experience guests booked.');
  }

  if(booking.tripType==='sandbar'){
    if(decision==='run'&&weather.windKts>25)add(true,`You ran the sandbar in ${weather.windKts} kt wind, which made the ride seriously uncomfortable.`);
  }

  if(booking.tripType==='sunset'){
    if(decision==='run'&&weather.windKts>=18)add(true,`You ran the sunset trip in ${weather.windKts} kt wind, badly hurting comfort.`);
    if(decision==='run'&&weather.rainChance>=60)add(false,`You ran the sunset with a ${weather.rainChance}% rain chance instead of adjusting the plan.`);
    if(decision==='protected'&&weather.windKts<12&&weather.rainChance<40)add(false,'You changed a good-weather sunset trip unnecessarily.');
  }

  if(boat){
    if(boat.condition<.45)add(booking.tripType!=='sandbar',`${boat.name} was in poor condition (${Math.round(boat.condition*100)}%). Service it before carrying guests.`);
    else if(boat.condition<.60)add(false,`${boat.name} needed service; guests noticed the ${Math.round(boat.condition*100)}% condition.`);
    if(boat.reliability<.50)add(false,`${boat.name} was below 50% reliability and the trip felt less polished.`);
  }

  if(booking.customerType==='family'&&decision==='run'&&weather.windKts>=16)add(false,'This family valued a comfortable ride, and the conditions were rough for their expectations.');
  if(booking.customerType==='snorkeler'&&booking.tripType==='snorkel'&&decision==='run'&&weather.waterClarity<.65)add(false,`These serious snorkelers expected better visibility than ${Math.round(weather.waterClarity*100)}% clarity.`);
  if(booking.customerType==='luxury'&&boat&&boat.condition<.75)add(false,'Premium private guests expected a more polished boat condition.');
  if(booking.customerType==='celebration'&&booking.tripType==='sandbar'&&decision==='protected'&&weather.windKts<16)add(false,'The celebration group wanted the sandbar experience they booked, and conditions were still workable.');
  if(booking.customerType==='bargain'){
    const product=state.products.find(p=>p.type===booking.tripType);
    const ref=referencePrice[booking.tripType]??product?.price??booking.revenue;
    if((product?.price??booking.revenue)>ref*1.25)add(false,'Value-focused guests felt the trip price was high for the experience delivered.');
  }

  // Reviews are intentionally forgiving. Minor imperfections never stack into a bad rating.
  // A 4-star trip requires at least one genuinely critical operating mistake.
  // 1-star reviews are reserved for catastrophic events handled outside normal trip scoring.
  const experienceScore=criticalReasons.length?4:5;
  const headline=experienceScore===4
    ? `4★ critical error: ${criticalReasons[0]}`
    : reasons.length
      ? '5★ trip — minor issues did not ruin the experience'
      : '5★ experience on plan';
  return {experienceScore,reasons,headline};
}

function createReview(rng:RNG,assessment:PlanAssessment,protectedWater:boolean,booking:Booking):Review{
  const profile=customerProfiles[booking.customerType];
  const five=protectedWater
    ? [`${booking.customerLabel}: The captain changed the plan for the weather and absolutely nailed it.`,`${booking.customerLabel}: Calmer water was the right call and we still had an amazing day.`]
    : [`${booking.customerLabel}: Best day of our trip.`,`${booking.customerLabel}: The captain knew exactly where to go.`,`${booking.customerLabel}: Exactly what we wanted — ${profile.likes}.`];
  const stars=assessment.experienceScore;
  const text=stars===5?rng.pick(five):assessment.reasons[0]??'One part of the trip missed the mark.';
  return {stars,text,reasons:assessment.reasons};
}

function shouldLeaveReview(rng:RNG,state:CompanyState,experienceScore:number):boolean{
  const ask=state.marketing?.reviewAsk??true;
  if(experienceScore===1)return true;
  if(experienceScore===4)return rng.chance(ask?.42:.22);
  return rng.chance(ask?.86:.34);
}

function channelCommission(source:Booking['source']):number{
  if(source==='marketplace')return .25;
  if(source==='hotel')return .15;
  return 0;
}

function calculateTip(rng:RNG,state:CompanyState,booking:Booking,experienceScore:number,marina?:Marina):number{
  if(experienceScore<5||booking.neverTips)return 0;
  const profile=customerProfiles[booking.customerType];
  const base=.04+rng.next()*Math.max(.01,booking.tipCeiling-.04);
  const rate=clamp(base+profile.tipBias+(marina?.tipBonus??0),0,.40);
  return Math.round(booking.revenue*rate);
}

function renewalExpense(state:CompanyState):{state:CompanyState;expense:number}{
  const marina=marinas.find(m=>m.id===state.marinaId);
  let expense=0;
  const boats=state.boats.map(b=>{
    if(!b.insured||!b.insuranceRenewalDay||b.insuranceRenewalDay>state.day)return b;
    const premium=insuranceQuote(b,marina);
    expense+=premium;
    return {...b,insuranceRenewalDay:state.day+365};
  });
  const ledger=[...state.ledger];
  if(expense)ledger.push({day:state.day,category:'insurance',amount:-expense,memo:'Annual insurance renewal'});
  if(state.day>1&&(state.day-1)%30===0&&marina){
    expense+=marina.monthlySlip;
    ledger.push({day:state.day,category:'marina',amount:-marina.monthlySlip,memo:`Monthly slip: ${marina.name}`});
  }
  return {state:{...state,boats,ledger},expense};
}

function computeCompanyValue(state:CompanyState):number{
  const fleet=state.boats.reduce((sum,b)=>sum+b.purchasePrice*b.condition*.72,0);
  const earnedReputation=state.reviewCount*Math.max(20,state.rating*18);
  const profitValue=Math.max(0,state.lifetimeProfit*.20);
  return Math.round(state.cash+fleet-state.debt+earnedReputation+profitValue);
}

export function simulateDay(input:CompanyState,decisions:Record<string,TripDecision>,market?:MarketingMarketSnapshot,demoMode=false):{state:CompanyState;result:DayResult}{
  let state=structuredClone(input);
  state.staff=state.staff??[];
  state.marketing=state.marketing??{dailyBudget:0,focus:'search',reviewAsk:true};
  state.loans=state.loans??[];
  const weather=generateWeather(state);
  const calendar=calendarForDay(state.day,state,market);
  const hurricane=demoMode&&state.day<=7?null:hurricaneForDay(state);
  const rng=new RNG(state.seed+state.day*12347);
  let revenue=0,tips=0,expenses=0,refunds=0,tripsRun=0,fixedCosts=0;
  const reviews:Review[]=[];
  const tripOutcomes:TripOutcome[]=[];
  const usage:Record<string,number>={};

  const renew=renewalExpense(state);
  state=renew.state;expenses+=renew.expense;fixedCosts+=renew.expense;
  const marketingSpend=Math.min(Math.max(0,state.cash),state.marketing.dailyBudget);
  if(marketingSpend>0){expenses+=marketingSpend;fixedCosts+=marketingSpend;}

  if(hurricane){
    const storm=applyHurricane(state,hurricane);
    state=storm.state;expenses+=storm.expenses;fixedCosts+=storm.expenses;
    const catastrophicReviews:Review[]=storm.destroyedBoatNames.length?[{
      stars:1,
      text:`Catastrophic failure: the fleet was left in the water during ${hurricane.name} and ${storm.destroyedBoatNames.join(', ')} was destroyed.`,
      reasons:['A major hurricane destroyed a boat after the fleet was left in the water.']
    }]:[];
    if(catastrophicReviews.length){
      const oldStars=state.rating*state.reviewCount;
      state.reviewCount+=1;
      state.rating=Number(((oldStars+1)/state.reviewCount).toFixed(2));
      state.reputation=clamp(state.reputation-.04,.1,1);
    }
    state.cash-=renew.expense+marketingSpend;
    if(marketingSpend)state.ledger.push({day:state.day,category:'marketing',amount:-marketingSpend,memo:`${state.marketing.focus} marketing`});
    const loanResult=applyLoanPayments(state);state=loanResult.state;expenses+=loanResult.payment;fixedCosts+=loanResult.payment;
    state.lifetimeProfit-=expenses;state.daysOperated+=1;state.companyValue=computeCompanyValue(state);state.day+=1;
    return {state,result:{weather,calendar,decisions,bookingsGenerated:[],tripsRun:0,reviews:catastrophicReviews,tripOutcomes:[],revenue:0,tips:0,expenses,refunds:0,loanPayment:loanResult.payment,fixedCosts,hurricaneSummary:storm.summary,destroyedBoatNames:storm.destroyedBoatNames,summary:storm.summary}};
  }

  const bookings=generateDemand(state,weather,market,demoMode);
  const availableBoats=state.boats.slice(0,operatingBoatCount(state));
  if(!availableBoats.length){
    state.cash-=renew.expense+marketingSpend;
    if(marketingSpend)state.ledger.push({day:state.day,category:'marketing',amount:-marketingSpend,memo:`${state.marketing.focus} marketing`});
    const loanResult=applyLoanPayments(state);state=loanResult.state;expenses+=loanResult.payment;fixedCosts+=loanResult.payment;
    state.lifetimeProfit-=expenses;state.daysOperated+=1;state.companyValue=computeCompanyValue(state);state.day+=1;
    return {state,result:{weather,calendar,decisions,bookingsGenerated:[],tripsRun:0,reviews:[],tripOutcomes:[],revenue:0,tips:0,expenses,refunds:0,loanPayment:loanResult.payment,fixedCosts,summary:'No boat was available, so no trips ran.'}};
  }

  bookings.forEach(booking=>{
    const decision=decisions[booking.id]??'run';
    const product=state.products.find(p=>p.type===booking.tripType)!;
    if(decision==='cancel'){
      const fee=Math.round(booking.revenue*.08);
      expenses+=fee;refunds+=fee;
      const safeCall=weather.windKts>=18||weather.stormRisk>.23||(booking.tripType==='snorkel'&&weather.windKts>=15);
      state.reputation=clamp(state.reputation+(safeCall ? .003 : -.005),.1,1);
      tripOutcomes.push({bookingId:booking.id,tripType:booking.tripType,timeSlot:booking.timeSlot,decision,revenue:0,expenses:fee,tip:0,satisfaction:0,note:safeCall?'You moved the trip for safety. Guests understood.':'You moved a trip that probably could have run.'});
      return;
    }

    const needed=Math.min(booking.boatsRequired,availableBoats.length);
    const chosen=[...availableBoats].sort((a,b)=>(usage[a.instanceId]??0)-(usage[b.instanceId]??0)).filter(b=>(usage[b.instanceId]??0)<2).slice(0,needed);
    if(chosen.length<needed){
      state.reputation=clamp(state.reputation-.01,.1,1);
      tripOutcomes.push({bookingId:booking.id,tripType:booking.tripType,timeSlot:booking.timeSlot,decision,revenue:0,expenses:0,tip:0,satisfaction:0,note:'You accepted this booking but did not have enough boats and captains to run it.'});
      return;
    }

    const protectedWater=decision==='protected';
    const worstBoat=[...chosen].sort((a,b)=>a.condition-b.condition)[0];
    const assessment=assessTripPlan(state,booking,decision,weather,worstBoat);
    const island=islands.find(i=>i.id===state.islandId)!;
    const marina=marinas.find(m=>m.id===state.marinaId);
    let tripExpense=0;

    chosen.forEach(boat=>{
      const fuelGallons=boat.fuelBurnGph*product.durationHours*product.fuelMultiplier*(protectedWater ? .78 : 1);
      tripExpense+=Math.round(fuelGallons*island.fuelPrice);
      tripExpense+=Math.round(HOURS_PER_TRIP*RUNNING_COST_PER_ENGINE_HOUR);
      const fleetIndex=availableBoats.findIndex(b=>b.instanceId===boat.instanceId);
      const hiredCaptain=fleetIndex>0?state.staff[fleetIndex-1]:undefined;
      if(hiredCaptain)tripExpense+=Math.round(hiredCaptain.hourlyRate*product.durationHours);
      usage[boat.instanceId]=(usage[boat.instanceId]??0)+1;
    });

    tripExpense+=Math.round(booking.revenue*channelCommission(booking.source));
    const tip=calculateTip(rng,state,booking,assessment.experienceScore,marina);
    revenue+=booking.revenue;tips+=tip;expenses+=tripExpense;tripsRun+=1;

    let review:Review|undefined;
    if(shouldLeaveReview(rng,state,assessment.experienceScore)){review=createReview(rng,assessment,protectedWater,booking);reviews.push(review);}
    const captainNote=chosen.length>1?` Two boats worked together for this ${booking.partySize}-guest group.`:'';
    const tipNote=tip>0?` Tip: ${tip}.`:assessment.experienceScore<5?' No tip because the guest experience missed the mark.':booking.neverTips?' Great trip, but this group simply did not tip.':' No tip this time.';
    tripOutcomes.push({bookingId:booking.id,tripType:booking.tripType,timeSlot:booking.timeSlot,decision,revenue:booking.revenue,expenses:tripExpense,tip,satisfaction:assessment.experienceScore/5,review,boatInstanceId:chosen[0].instanceId,boatInstanceIds:chosen.map(b=>b.instanceId),note:`${protectedWater?'Moved this trip to calmer water.':'Ran this trip as booked.'}${captainNote}${tipNote}`});
  });

  let maintenanceEvent:string|undefined;
  state.boats=state.boats.map(boat=>{
    const used=usage[boat.instanceId]??0;
    if(!used)return boat;
    const exposed=tripOutcomes.filter(x=>x.boatInstanceIds?.includes(boat.instanceId)&&x.decision==='run').length;
    const newHours=boat.engineHours+used*HOURS_PER_TRIP;
    const overdue100=newHours>=boat.next100Service;
    const overdue300=newHours>=boat.next300Service;
    const serviceRisk=overdue300?.16:overdue100?.07:0;
    const overdueWear=overdue300?.014:overdue100?.007:0;
    const failureRisk=clamp((1-boat.reliability)*(1.2-boat.condition)*.30+Math.max(0,newHours-1000)/10000+(exposed&&weather.windKts>16?.025:0)+serviceRisk,.01,.42);
    let condition=clamp(boat.condition-used*.003-overdueWear*used,.20,1);
    let reliability=clamp(boat.reliability-overdueWear*.55*used,.25,.99);
    if(!maintenanceEvent&&rng.chance(failureRisk)){
      const event=rng.pick([{text:'The battery quit.',cost:240},{text:'The prop hit something expensive.',cost:520},{text:'The bilge pump gave up.',cost:310},{text:'The steering needed a surprise repair.',cost:690}]);
      maintenanceEvent=`${boat.name}: ${event.text}`;expenses+=event.cost;condition=clamp(condition-.04,.20,1);reliability=clamp(reliability-.02,.25,.99);
    }else if((overdue300||overdue100)&&!maintenanceEvent){
      const due=overdue300?boat.next300Service:boat.next100Service;
      maintenanceEvent=`${boat.name}: engine service is overdue past ${due} hours. Reliability is dropping.`;
    }
    return {...boat,condition,reliability,engineHours:newHours};
  });

  let wildlifeEvent:string|undefined;
  if(tripsRun&&rng.chance(.22))wildlifeEvent=rng.pick(['Dolphins cruised alongside the boat.','A sea turtle surfaced beside the guests.','An eagle ray glided under the boat.','A manatee caused a very slow marina departure.']);

  const oldStars=state.rating*state.reviewCount;
  const newStars=reviews.reduce((s,r)=>s+r.stars,0);
  state.reviewCount+=reviews.length;
  state.rating=state.reviewCount?Number(((oldStars+newStars)/state.reviewCount).toFixed(2)):state.rating;
  if(reviews.length)state.reputation=clamp(state.reputation+reviews.reduce((s,r)=>s+(r.stars-3)*.006,0),.1,1);
  state.cash+=revenue+tips-expenses;
  state.lifetimeRevenue+=revenue+tips;
  state.lifetimeProfit+=revenue+tips-expenses;
  state.daysOperated+=1;

  if(revenue)state.ledger.push({day:state.day,category:'charters',amount:revenue,memo:`${tripsRun} charter(s)`});
  if(tips)state.ledger.push({day:state.day,category:'tips',amount:tips,memo:'Guest tips'});
  if(marketingSpend)state.ledger.push({day:state.day,category:'marketing',amount:-marketingSpend,memo:`${state.marketing.focus} marketing`});
  const variableExpenses=expenses-marketingSpend-renew.expense;
  if(variableExpenses)state.ledger.push({day:state.day,category:'operating',amount:-variableExpenses,memo:'Fuel, boat wear, commissions, payroll, reschedules and repairs'});

  const loanResult=applyLoanPayments(state);
  state=loanResult.state;
  expenses+=loanResult.payment;fixedCosts+=loanResult.payment;state.lifetimeProfit-=loanResult.payment;
  state.companyValue=computeCompanyValue(state);
  state.day+=1;

  return {state,result:{weather,calendar,decisions,bookingsGenerated:bookings,tripsRun,reviews,tripOutcomes,revenue,tips,expenses,refunds,maintenanceEvent,wildlifeEvent,loanPayment:loanResult.payment,fixedCosts,summary:`${calendar.monthName} ${calendar.dayOfMonth}: ${tripsRun} trip(s), $${revenue} fares, $${tips} tips, $${expenses} expenses, ${reviews.length} review(s).`}};
}
