import { boatTemplates, defaultProducts, islands, marinas } from '../data/content';
import type { Booking, CompanyState, DayResult, MarketingFocus, OwnedBoat, Review, StaffMember, TripDecision, TripOutcome, TripProduct, WeatherDay } from '../types/models';
import { RNG } from './rng';
import { applyLoanPayments, calendarForDay, customerForTrip, customerProfiles } from './depth';

const clamp = (n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const referencePrice:Record<string,number>={sandbar:489,snorkel:649,sunset:319,custom:449,eco:399,fishing:699,cruise:399};

export const captainCandidates:StaffMember[]=[
  {id:'capt-casey',name:'Casey Morgan',role:'captain',skill:.78,reliability:.91,hourlyRate:35},
  {id:'capt-alex',name:'Alex Rivera',role:'captain',skill:.86,reliability:.89,hourlyRate:42},
  {id:'capt-morgan',name:'Morgan Lee',role:'captain',skill:.93,reliability:.95,hourlyRate:55}
];

export interface PlanAssessment { stars:number; reasons:string[]; headline:string; }

export function createCompany(captainName='Captain',companyName='Island Adventures',companyColor='#f6c453',seed=20261001):CompanyState{
  return {day:1,seed,captainName,companyName,companyColor,cash:40000,debt:0,reputation:.50,rating:0,reviewCount:0,islandId:'harbor',boats:[],products:structuredClone(defaultProducts),bookings:[],ledger:[],companyValue:40000,lifetimeRevenue:0,lifetimeProfit:0,daysOperated:0,staff:[],marketing:{dailyBudget:0,focus:'organic'},loans:[]};
}

export function rentSlip(state:CompanyState,marinaId:string):CompanyState{
  if(state.marinaId)return state;
  const marina=marinas.find(m=>m.id===marinaId&&m.islandId===state.islandId);
  if(!marina)throw new Error('That marina is not available on this island.');
  if(state.cash<marina.monthlySlip)throw new Error('Not enough cash for slip rent.');
  return {...state,cash:state.cash-marina.monthlySlip,marinaId:marina.id,reputation:clamp(state.reputation+marina.reputationBonus,.1,1),ledger:[...state.ledger,{day:state.day,category:'marina',amount:-marina.monthlySlip,memo:`First month at ${marina.name}`}]};
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
  const ageMap:Record<string,{year:number;condition:number;hours:number}>={
    'old-deck-19':{year:1999,condition:.68,hours:1460},'bay-deck-21':{year:2007,condition:.75,hours:1030},'deck-24':{year:2017,condition:.88,hours:510},'cc-25':{year:2021,condition:.92,hours:340},'pontoon-24':{year:2020,condition:.90,hours:410},'cat-28':{year:2022,condition:.94,hours:260}
  };
  const age=ageMap[templateId]??{year:2018,condition:.86,hours:500};
  const owned:OwnedBoat={...boat,instanceId:`${boat.id}-${state.day}-${state.boats.length+1}`,year:age.year,condition:age.condition,engineHours:age.hours,purchasePrice:boat.basePrice,insured:false,marinaId:state.marinaId};
  return {...state,cash:state.cash-boat.basePrice,boats:[...state.boats,owned],ledger:[...state.ledger,{day:state.day,category:'boat',amount:-boat.basePrice,memo:`Purchased ${boat.name}`}]};
}

export function insuranceQuote(boat:OwnedBoat):number{return Math.max(950,Math.round(boat.purchasePrice*.055));}

export function insureFleet(state:CompanyState):CompanyState{
  const uninsured=state.boats.filter(b=>!b.insured);
  if(!state.boats.length)throw new Error('No boat to insure.');
  if(!uninsured.length)return state;
  const premium=uninsured.reduce((sum,b)=>sum+insuranceQuote(b),0);
  if(state.cash<premium)throw new Error('Not enough cash for insurance.');
  return {...state,cash:state.cash-premium,boats:state.boats.map(b=>({...b,insured:true})),ledger:[...state.ledger,{day:state.day,category:'insurance',amount:-premium,memo:'Fleet insurance'}]};
}

export function serviceBoat(state:CompanyState,instanceId:string):CompanyState{
  const boat=state.boats.find(b=>b.instanceId===instanceId);
  if(!boat)throw new Error('Boat not found.');
  const cost=450;
  if(state.cash<cost)throw new Error('Not enough cash for routine service.');
  return {...state,cash:state.cash-cost,boats:state.boats.map(b=>b.instanceId===instanceId?{...b,condition:clamp(b.condition+.10,.25,1),reliability:clamp(b.reliability+.02,.25,.98)}:b),ledger:[...state.ledger,{day:state.day,category:'maintenance',amount:-cost,memo:`Routine service: ${boat.name}`}]};
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
  return {...state,marketing:{dailyBudget:clamp(Math.round(dailyBudget),0,250),focus}};
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
    windKts:clamp(rng.int(4,22)+windShift,3,25),
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
  const insured=state.boats.filter(b=>b.insured).length;
  if(!insured)return 0;
  return Math.min(insured,1+(state.staff?.length??0));
}

export function generateDemand(state:CompanyState,weather=generateWeather(state)):Booking[]{
  if(!state.boats.some(b=>b.insured))return [];
  if(state.day===1){
    const sandbar=state.products.find(p=>p.type==='sandbar')!;
    const snorkel=state.products.find(p=>p.type==='snorkel')!;
    return [
      {id:'D1-sandbar-0900',tripType:'sandbar',partySize:5,revenue:sandbar.price,source:'maps',guestExpectation:.72,timeSlot:'morning',customerType:'family',customerLabel:'Family Crew'},
      {id:'D1-snorkel-1330',tripType:'snorkel',partySize:4,revenue:snorkel.price,source:'organic',guestExpectation:.82,timeSlot:'afternoon',customerType:'snorkeler',customerLabel:'Serious Snorkelers'}
    ];
  }
  const island=islands.find(i=>i.id===state.islandId)!;
  const rng=new RNG(state.seed^(state.day*7919));
  const sources:Booking['source'][]=['organic','maps','referral','social','hotel','repeat','paid','marketplace'];
  const slots:Booking['timeSlot'][]=['morning','afternoon','evening'];
  const bookings:Booking[]=[];
  const marketing=state.marketing??{dailyBudget:0,focus:'organic' as const};
  const competition=Math.max(.35,island.adCompetition);
  const marketingBoost=1+Math.min(.48,(marketing.dailyBudget/250*.45)/competition);
  const calendar=calendarForDay(state.day);
  for(const product of state.products){
    const ref=referencePrice[product.type]??product.price;
    const priceFit=clamp(1.15-Math.max(0,product.price-ref)/ref*1.2,.25,1.2);
    const reputationFit=.55+state.reputation*.85;
    const probability=clamp(product.baseDemand*island.tourism*weatherFit(product.type,weather)*priceFit*reputationFit*.62*marketingBoost*calendar.demandMultiplier,.06,.98);
    if(rng.chance(probability)){
      let source=rng.pick(sources);
      if(marketing.dailyBudget>0&&rng.chance(.48))source=marketing.focus;
      const customer=customerForTrip(rng,product.type,source);
      bookings.push({id:`D${state.day}-${product.type}-${rng.int(1000,9999)}`,tripType:product.type,partySize:rng.int(2,6),revenue:product.price,source,guestExpectation:Number((.55+rng.next()*.4).toFixed(2)),timeSlot:rng.pick(slots),customerType:customer.type,customerLabel:customer.label});
    }
  }
  return bookings.slice(0,Math.max(1,operatingBoatCount(state)*2));
}

export function assessTripPlan(state:CompanyState,booking:Booking,decision:TripDecision,weather:WeatherDay,boatOverride?:OwnedBoat):PlanAssessment{
  if(decision==='cancel')return {stars:0,reasons:['Rescheduled trips do not receive a trip review.'],headline:'No trip review'};
  const boat=boatOverride??state.boats.find(b=>b.insured)??state.boats[0];
  const reasons:string[]=[];
  let penalty=0;
  const add=(points:number,reason:string)=>{penalty+=points;reasons.push(reason);};

  if(decision==='run'&&weather.stormRisk>.24)add(2,`You chose to run with elevated storm risk (${Math.round(weather.stormRisk*100)}%).`);

  if(booking.tripType==='snorkel'){
    if(decision==='run'&&weather.windKts>=16)add(2,`You ran exposed snorkeling in ${weather.windKts} kt wind instead of moving to protected water or rescheduling.`);
    else if(decision==='run'&&weather.windKts>=11)add(1,`You ran snorkeling in ${weather.windKts} kt wind, making the water rougher than guests expected.`);
    if(decision==='run'&&weather.waterClarity<.55)add(1,`You ran the snorkel with only ${Math.round(weather.waterClarity*100)}% water clarity instead of rescheduling.`);
    if(decision==='protected'&&weather.windKts<10&&weather.waterClarity>=.60)add(1,'You moved the snorkel to protected water even though conditions supported the experience guests booked.');
  }

  if(booking.tripType==='sandbar'){
    if(decision==='run'&&weather.windKts>=21)add(1,`You ran the sandbar in ${weather.windKts} kt wind, which made the ride uncomfortable.`);
    if(decision==='protected'&&weather.windKts<12)add(1,'You downgraded the sandbar plan even though conditions supported running it as booked.');
  }

  if(booking.tripType==='sunset'){
    if(decision==='run'&&weather.windKts>=18)add(1,`You ran the sunset trip in ${weather.windKts} kt wind, hurting comfort.`);
    if(decision==='run'&&weather.rainChance>=60)add(1,`You ran the sunset with a ${weather.rainChance}% rain chance instead of adjusting the plan.`);
    if(decision==='protected'&&weather.windKts<12&&weather.rainChance<40)add(1,'You changed a good-weather sunset trip unnecessarily.');
  }

  if(boat){
    if(boat.condition<.45)add(2,`${boat.name} was in poor condition (${Math.round(boat.condition*100)}%). Service it before carrying guests.`);
    else if(boat.condition<.60)add(1,`${boat.name} needed service; guests noticed the ${Math.round(boat.condition*100)}% condition.`);
    if(boat.reliability<.50)add(1,`${boat.name} was below 50% reliability and the trip felt less polished.`);
  }

  if(booking.customerType==='family'&&decision==='run'&&weather.windKts>=16)add(1,'This family valued a comfortable ride, and the conditions were rough for their expectations.');
  if(booking.customerType==='snorkeler'&&booking.tripType==='snorkel'&&decision==='run'&&weather.waterClarity<.65)add(1,`These serious snorkelers expected better visibility than ${Math.round(weather.waterClarity*100)}% clarity.`);
  if(booking.customerType==='luxury'&&boat&&boat.condition<.75)add(1,'Premium private guests expected a more polished boat condition.');
  if(booking.customerType==='celebration'&&booking.tripType==='sandbar'&&decision==='protected'&&weather.windKts<16)add(1,'The celebration group wanted the sandbar experience they booked, and conditions were still workable.');
  if(booking.customerType==='bargain'){
    const product=state.products.find(p=>p.type===booking.tripType);
    const ref=referencePrice[booking.tripType]??product?.price??booking.revenue;
    if((product?.price??booking.revenue)>ref*1.25)add(1,'Value-focused guests felt the trip price was high for the experience delivered.');
  }

  const stars=clamp(5-penalty,1,5);
  return {stars,reasons,headline:stars===5?'5★ experience on plan':`${stars}★ risk: ${reasons[0]??'guest expectations are at risk'}`};
}

function createReview(rng:RNG,assessment:PlanAssessment,protectedWater:boolean,booking:Booking):Review{
  const profile=customerProfiles[booking.customerType];
  const five=protectedWater
    ? [`${booking.customerLabel}: Captain changed the plan for the weather and absolutely nailed it.`,`${booking.customerLabel}: Protected water was perfect and we still had an amazing day.`]
    : [`${booking.customerLabel}: Best day of our trip.`,`${booking.customerLabel}: Captain knew exactly where to go.`,`${booking.customerLabel}: Exactly what we wanted — ${profile.likes}.`];
  const text=assessment.stars===5?rng.pick(five):assessment.reasons[0]??'One part of the trip fell short of expectations.';
  return {stars:assessment.stars,text,reasons:assessment.reasons};
}

export function simulateDay(input:CompanyState,decisions:Record<string,TripDecision>):{state:CompanyState;result:DayResult}{
  let state=structuredClone(input);
  state.staff=state.staff??[];
  state.marketing=state.marketing??{dailyBudget:0,focus:'organic'};
  state.loans=state.loans??[];
  const weather=generateWeather(state);
  const calendar=calendarForDay(state.day);
  const bookings=generateDemand(state,weather);
  const rng=new RNG(state.seed+state.day*12347);
  const availableBoats=state.boats.filter(b=>b.insured).slice(0,operatingBoatCount(state));
  let revenue=0,expenses=0,refunds=0,tripsRun=0;
  const reviews:Review[]=[];
  const tripOutcomes:TripOutcome[]=[];
  const usage:Record<string,number>={};

  const marketingSpend=Math.min(state.cash,state.marketing.dailyBudget);
  if(marketingSpend>0)expenses+=marketingSpend;

  if(!availableBoats.length){
    const loanResult=applyLoanPayments(state);
    state=loanResult.state;
    return {state:{...state,day:state.day+1},result:{weather,calendar,decisions,bookingsGenerated:[],tripsRun:0,reviews:[],tripOutcomes:[],revenue:0,expenses:loanResult.payment,refunds:0,loanPayment:loanResult.payment,summary:'No insured boat was available, so no trips ran.'}};
  }

  bookings.forEach((booking,index)=>{
    const decision=decisions[booking.id]??'run';
    const product=state.products.find(p=>p.type===booking.tripType)!;
    const boat=availableBoats[index%availableBoats.length];

    if(decision==='cancel'){
      const fee=Math.round(booking.revenue*.08);
      expenses+=fee;refunds+=fee;
      const safeCall=weather.windKts>=18||weather.stormRisk>.23||(booking.tripType==='snorkel'&&weather.windKts>=15);
      state.reputation=clamp(state.reputation+(safeCall ? .003 : -.005),.1,1);
      tripOutcomes.push({bookingId:booking.id,tripType:booking.tripType,timeSlot:booking.timeSlot,decision,revenue:0,expenses:fee,satisfaction:0,note:safeCall?'Rescheduled for safety; guests understood the captain’s call.':'Rescheduled even though conditions were workable.'});
      return;
    }

    const protectedWater=decision==='protected';
    const assessment=assessTripPlan(state,booking,decision,weather,boat);
    const fuelGallons=boat.fuelBurnGph*product.durationHours*product.fuelMultiplier*(protectedWater ? .78 : 1);
    const island=islands.find(i=>i.id===state.islandId)!;
    let tripExpense=Math.round(fuelGallons*island.fuelPrice);
    const boatIndex=availableBoats.findIndex(b=>b.instanceId===boat.instanceId);
    const hiredCaptain=boatIndex>0?state.staff[boatIndex-1]:undefined;
    if(hiredCaptain)tripExpense+=Math.round(hiredCaptain.hourlyRate*product.durationHours);

    revenue+=booking.revenue;expenses+=tripExpense;tripsRun+=1;
    usage[boat.instanceId]=(usage[boat.instanceId]??0)+1;
    const review=createReview(rng,assessment,protectedWater,booking);
    reviews.push(review);

    const captainNote=hiredCaptain?` Captain ${hiredCaptain.name} ran this boat.`:'';
    tripOutcomes.push({bookingId:booking.id,tripType:booking.tripType,timeSlot:booking.timeSlot,decision,revenue:booking.revenue,expenses:tripExpense,satisfaction:assessment.stars/5,review,boatInstanceId:boat.instanceId,note:`${protectedWater?'Moved this trip to protected water.':'Ran this trip as booked.'}${captainNote}`});
  });

  let maintenanceEvent:string|undefined;
  state.boats=state.boats.map(boat=>{
    const used=usage[boat.instanceId]??0;
    if(!used)return boat;
    const exposed=tripOutcomes.filter(x=>x.boatInstanceId===boat.instanceId&&x.decision==='run').length;
    const failureRisk=clamp((1-boat.reliability)*(1.2-boat.condition)*.30+Math.max(0,boat.engineHours-1000)/10000+(exposed&&weather.windKts>16?.025:0),.01,.28);
    let condition=clamp(boat.condition-used*.003,.25,1);
    if(!maintenanceEvent&&rng.chance(failureRisk)){
      const event=rng.pick([{text:'Battery gave up after the last trip.',cost:240},{text:'Prop found something expensive underwater.',cost:520},{text:'Bilge pump chose today to retire.',cost:310},{text:'Steering needed an unexpected repair.',cost:690}]);
      maintenanceEvent=`${boat.name}: ${event.text}`;expenses+=event.cost;condition=clamp(condition-.04,.25,1);
    }
    return {...boat,condition,engineHours:boat.engineHours+used*3};
  });

  let wildlifeEvent:string|undefined;
  if(tripsRun&&rng.chance(.22))wildlifeEvent=rng.pick(['Dolphins cruised alongside the boat.','A sea turtle surfaced beside the guests.','An eagle ray glided under the boat.','A manatee caused a very slow marina departure.']);

  const netBeforeDebt=revenue-expenses;
  const oldStars=state.rating*state.reviewCount;
  const newStars=reviews.reduce((s,r)=>s+r.stars,0);
  state.reviewCount+=reviews.length;
  state.rating=state.reviewCount?Number(((oldStars+newStars)/state.reviewCount).toFixed(2)):state.rating;
  if(reviews.length)state.reputation=clamp(state.reputation+reviews.reduce((s,r)=>s+(r.stars-3)*.006,0),.1,1);
  state.cash+=netBeforeDebt;state.lifetimeRevenue+=revenue;state.lifetimeProfit+=netBeforeDebt;state.daysOperated+=1;
  const loanResult=applyLoanPayments(state);
  state=loanResult.state;
  const loanPayment=loanResult.payment;
  state.lifetimeProfit-=loanPayment;
  expenses+=loanPayment;

  if(revenue)state.ledger.push({day:state.day,category:'charters',amount:revenue,memo:`${tripsRun} charter(s)`});
  if(marketingSpend)state.ledger.push({day:state.day,category:'marketing',amount:-marketingSpend,memo:`${state.marketing.focus} marketing`});
  const nonMarketingExpenses=expenses-marketingSpend;
  if(nonMarketingExpenses)state.ledger.push({day:state.day,category:'operating',amount:-nonMarketingExpenses,memo:'Fuel, payroll, reschedules and maintenance'});
  state.companyValue=Math.round(state.cash+state.boats.reduce((sum,b)=>sum+b.purchasePrice*b.condition*.8,0)-state.debt+state.reputation*25000+state.lifetimeProfit*.25);
  state.day+=1;

  return {state,result:{weather,calendar,decisions,bookingsGenerated:bookings,tripsRun,reviews,tripOutcomes,revenue,expenses,refunds,maintenanceEvent,wildlifeEvent,loanPayment,summary:`${calendar.dayOfWeek}, Week ${calendar.week}: ${tripsRun} trip(s), ${revenue} revenue, ${expenses} total cash out, ${reviews.length} review(s).`}};
}
