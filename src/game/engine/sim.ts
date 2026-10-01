import { boatTemplates, defaultProducts, islands, marinas } from '../data/content';
import type { Booking, CompanyState, DayResult, OwnedBoat, Review, TripDecision, TripOutcome, TripProduct, WeatherDay } from '../types/models';
import { RNG } from './rng';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function createCompany(captainName = 'Captain', companyName = 'Island Adventures', companyColor = '#f6c453', seed = 20261001): CompanyState {
  return {
    day: 1,
    seed,
    captainName,
    companyName,
    companyColor,
    cash: 40000,
    debt: 0,
    reputation: 0.50,
    rating: 0,
    reviewCount: 0,
    islandId: 'harbor',
    boats: [],
    products: structuredClone(defaultProducts),
    bookings: [],
    ledger: [],
    companyValue: 40000,
    lifetimeRevenue: 0,
    lifetimeProfit: 0,
    daysOperated: 0
  };
}

export function rentSlip(state: CompanyState, marinaId: string): CompanyState {
  if (state.marinaId) return state;
  const marina = marinas.find(m => m.id === marinaId && m.islandId === state.islandId);
  if (!marina) throw new Error('That marina is not available on this island.');
  if (state.cash < marina.monthlySlip) throw new Error('Not enough cash for slip rent.');
  return {
    ...state,
    cash: state.cash - marina.monthlySlip,
    marinaId: marina.id,
    reputation: clamp(state.reputation + marina.reputationBonus, 0.1, 1),
    ledger: [...state.ledger, { day: state.day, category: 'marina', amount: -marina.monthlySlip, memo: `First month at ${marina.name}` }]
  };
}

export function buyBoat(state: CompanyState, templateId = 'old-deck-19'): CompanyState {
  if (!state.marinaId) throw new Error('Rent a slip before buying a boat.');
  const marina = marinas.find(m => m.id === state.marinaId)!;
  const boat = boatTemplates.find(b => b.id === templateId);
  if (!boat) throw new Error('Boat not found.');
  if (boat.lengthFt > marina.maxBoatFt) throw new Error('That boat is too large for your current slip.');
  if (state.cash < boat.basePrice) throw new Error('Not enough cash to buy boat.');
  const ageMap: Record<string, { year: number; condition: number; hours: number }> = {
    'old-deck-19': { year: 1999, condition: 0.68, hours: 1460 },
    'bay-deck-21': { year: 2007, condition: 0.75, hours: 1030 },
    'deck-24': { year: 2017, condition: 0.88, hours: 510 },
    'cc-25': { year: 2021, condition: 0.92, hours: 340 },
    'pontoon-24': { year: 2020, condition: 0.90, hours: 410 },
    'cat-28': { year: 2022, condition: 0.94, hours: 260 }
  };
  const age = ageMap[templateId] ?? { year: 2018, condition: 0.86, hours: 500 };
  const owned: OwnedBoat = {
    ...boat,
    instanceId: `${boat.id}-${state.day}-${state.boats.length + 1}`,
    year: age.year,
    condition: age.condition,
    engineHours: age.hours,
    purchasePrice: boat.basePrice,
    insured: false,
    marinaId: state.marinaId
  };
  return {
    ...state,
    cash: state.cash - boat.basePrice,
    boats: [...state.boats, owned],
    ledger: [...state.ledger, { day: state.day, category: 'boat', amount: -boat.basePrice, memo: `Purchased ${boat.name}` }]
  };
}

export function insuranceQuote(boat: OwnedBoat): number {
  return Math.max(950, Math.round(boat.purchasePrice * 0.055));
}

export function insureFleet(state: CompanyState): CompanyState {
  if (!state.boats.length) throw new Error('No boat to insure.');
  const uninsured = state.boats.filter(b => !b.insured);
  const premium = uninsured.reduce((sum, b) => sum + insuranceQuote(b), 0);
  if (!uninsured.length) return state;
  if (state.cash < premium) throw new Error('Not enough cash for insurance.');
  return {
    ...state,
    cash: state.cash - premium,
    boats: state.boats.map(b => ({ ...b, insured: true })),
    ledger: [...state.ledger, { day: state.day, category: 'insurance', amount: -premium, memo: 'Annual fleet insurance' }]
  };
}

export function setPrice(state: CompanyState, type: TripProduct['type'], price: number): CompanyState {
  return { ...state, products: state.products.map(p => p.type === type ? { ...p, price: Math.max(99, Math.round(price)) } : p) };
}

export function generateWeather(state: CompanyState): WeatherDay {
  if (state.day === 1) return { day: 1, windKts: 17, windDirection: 'E', rainChance: 20, stormRisk: 0.08, waterClarity: 0.72, temperatureF: 82 };
  const rng = new RNG(state.seed + state.day * 9973);
  const directions = ['N','NE','E','SE','S','SW','W','NW'] as const;
  return {
    day: state.day,
    windKts: rng.int(4, 22),
    windDirection: rng.pick(directions),
    rainChance: rng.int(5, 75),
    stormRisk: Number((rng.next() * 0.32).toFixed(2)),
    waterClarity: Number((0.45 + rng.next() * 0.5).toFixed(2)),
    temperatureF: rng.int(74, 90)
  };
}

function weatherFit(type: TripProduct['type'], w: WeatherDay, protectedWater = false): number {
  const effectiveWind = protectedWater ? Math.max(3, w.windKts - 7) : w.windKts;
  const windPenalty = Math.max(0, effectiveWind - (type === 'snorkel' ? 9 : 14)) * (type === 'snorkel' ? 0.055 : 0.025);
  const rainPenalty = (w.rainChance / 100) * (type === 'sunset' ? 0.45 : 0.22);
  const clarityBonus = type === 'snorkel' ? (w.waterClarity - 0.5) * 0.5 : 0;
  return clamp(1 - windPenalty - rainPenalty + clarityBonus, 0.12, 1.15);
}

export function weatherLabel(weather: WeatherDay): { level: 'good' | 'caution' | 'rough'; title: string; detail: string } {
  if (weather.stormRisk > 0.24 || weather.windKts >= 19) return { level: 'rough', title: 'Rough day', detail: 'Protected-water alternatives or rescheduling deserve serious consideration.' };
  if (weather.windKts >= 12 || weather.rainChance >= 55) return { level: 'caution', title: 'Captain’s call', detail: 'Some trips are workable, but destination choice will matter.' };
  return { level: 'good', title: 'Good boating day', detail: 'Conditions support most trips, subject to normal captain judgment.' };
}

export function generateDemand(state: CompanyState, weather = generateWeather(state)): Booking[] {
  if (!state.boats.some(b => b.insured)) return [];
  if (state.day === 1) {
    const sandbar = state.products.find(p => p.type === 'sandbar')!;
    const snorkel = state.products.find(p => p.type === 'snorkel')!;
    return [
      { id:'D1-sandbar-0900', tripType:'sandbar', partySize:5, revenue:sandbar.price, source:'maps', guestExpectation:0.72, timeSlot:'morning' },
      { id:'D1-snorkel-1330', tripType:'snorkel', partySize:4, revenue:snorkel.price, source:'organic', guestExpectation:0.82, timeSlot:'afternoon' }
    ];
  }
  const island = islands.find(i => i.id === state.islandId)!;
  const rng = new RNG(state.seed ^ (state.day * 7919));
  const sources: Booking['source'][] = ['organic','maps','referral','social','hotel','repeat','paid','marketplace'];
  const slots: Booking['timeSlot'][] = ['morning','afternoon','evening'];
  const bookings: Booking[] = [];
  for (const product of state.products) {
    const referencePrice = product.type === 'snorkel' ? 649 : product.type === 'sandbar' ? 489 : 319;
    const priceFit = clamp(1.15 - Math.max(0, product.price - referencePrice) / referencePrice * 1.2, 0.25, 1.2);
    const reputationFit = 0.55 + state.reputation * 0.85;
    const probability = clamp(product.baseDemand * island.tourism * weatherFit(product.type, weather) * priceFit * reputationFit * 0.62, 0.08, 0.94);
    if (rng.chance(probability)) bookings.push({ id:`D${state.day}-${product.type}-${rng.int(1000,9999)}`, tripType:product.type, partySize:rng.int(2,6), revenue:product.price, source:rng.pick(sources), guestExpectation:Number((0.55+rng.next()*0.4).toFixed(2)), timeSlot:rng.pick(slots) });
  }
  return bookings.slice(0, Math.max(1, state.boats.length * 2));
}

function createReview(rng: RNG, satisfaction: number, protectedWater: boolean): Review {
  const stars = clamp(Math.round(2 + satisfaction * 3), 1, 5);
  const five = protectedWater
    ? ['Captain changed the plan for the weather and absolutely nailed it.','Protected water was perfect and we still had an amazing day.','Loved that the captain adapted instead of forcing a rough trip.']
    : ['Best day of our trip.','Captain knew exactly where to go.','Private, relaxed and worth every penny.','We saw wildlife and never felt rushed.'];
  const four = ['Really fun day on the water.','Great trip and friendly captain.','Would absolutely go again.'];
  const low = ['Conditions were rougher than expected.','The day did not go quite as planned.','Fun idea, but the experience missed expectations.'];
  return { stars, text: stars >= 5 ? rng.pick(five) : stars === 4 ? rng.pick(four) : rng.pick(low) };
}

export function simulateDay(input: CompanyState, decisions: Record<string, TripDecision>): { state: CompanyState; result: DayResult } {
  let state = structuredClone(input);
  const weather = generateWeather(state);
  const bookings = generateDemand(state, weather);
  const rng = new RNG(state.seed + state.day * 12347);
  const boat = state.boats[0];
  let revenue = 0, expenses = 0, refunds = 0, tripsRun = 0;
  const reviews: Review[] = [];
  const tripOutcomes: TripOutcome[] = [];
  if (!boat || !boat.insured) return { state:{...state,day:state.day+1}, result:{weather,decisions,bookingsGenerated:[],tripsRun:0,reviews:[],tripOutcomes:[],revenue:0,expenses:0,refunds:0,summary:'No insured boat was available, so no trips ran.'} };

  for (const booking of bookings) {
    const decision = decisions[booking.id] ?? 'run';
    const product = state.products.find(p => p.type === booking.tripType)!;
    if (decision === 'cancel') {
      const fee = Math.round(booking.revenue * 0.08);
      expenses += fee; refunds += fee;
      const safeCall = weather.windKts >= 18 || weather.stormRisk > 0.23 || booking.tripType === 'snorkel' && weather.windKts >= 15;
      state.reputation = clamp(state.reputation + (safeCall ? 0.003 : -0.005), 0.1, 1);
      tripOutcomes.push({bookingId:booking.id,tripType:booking.tripType,timeSlot:booking.timeSlot,decision,revenue:0,expenses:fee,satisfaction:0,note:'Canceled or rescheduled.'});
      continue;
    }
    const protectedWater = decision === 'protected';
    const fit = weatherFit(product.type, weather, protectedWater);
    const boatQuality = (boat.comfort + boat.appeal + boat.reliability * boat.condition) / 3;
    const adaptation = protectedWater && weather.windKts >= 12 ? 0.10 : 0;
    const expectationPenalty = protectedWater && booking.tripType === 'snorkel' ? 0.035 : 0;
    const satisfaction = clamp(0.35*fit + 0.38*boatQuality + 0.27*state.reputation + adaptation - expectationPenalty + (rng.next()-0.5)*0.12,0.05,1);
    revenue += booking.revenue; tripsRun += 1;
    const fuelGallons = boat.fuelBurnGph * product.durationHours * product.fuelMultiplier * (protectedWater ? 0.78 : 1);
    const island = islands.find(i=>i.id===state.islandId)!;
    const tripExpense = Math.round(fuelGallons * island.fuelPrice); expenses += tripExpense;
    const review = rng.chance(0.72) ? createReview(rng,satisfaction,protectedWater) : undefined;
    if (review) reviews.push(review);
    tripOutcomes.push({bookingId:booking.id,tripType:booking.tripType,timeSlot:booking.timeSlot,decision,revenue:booking.revenue,expenses:tripExpense,satisfaction,review,note:protectedWater?'Moved this trip to protected water.':'Ran this trip as booked.'});
  }

  let maintenanceEvent:string|undefined;
  const exposedRuns = tripOutcomes.filter(x=>x.decision==='run').length;
  const failureRisk = clamp((1-boat.reliability)*(1.2-boat.condition)*0.30 + Math.max(0,boat.engineHours-1000)/10000 + (exposedRuns && weather.windKts>16 ? 0.025 : 0),0.01,0.28);
  if (tripsRun && rng.chance(failureRisk)) {
    const event=rng.pick([{text:'Battery gave up after the last trip.',cost:240},{text:'Prop found something expensive underwater.',cost:520},{text:'Bilge pump chose today to retire.',cost:310},{text:'Steering needed an unexpected repair.',cost:690}]);
    maintenanceEvent=event.text; expenses+=event.cost; state.boats[0]={...boat,condition:clamp(boat.condition-0.04,0.25,1),engineHours:boat.engineHours+tripsRun*3};
  } else if (tripsRun) state.boats[0]={...boat,condition:clamp(boat.condition-tripsRun*0.003,0.25,1),engineHours:boat.engineHours+tripsRun*3};

  let wildlifeEvent:string|undefined;
  if (tripsRun && rng.chance(0.22)) wildlifeEvent=rng.pick(['Dolphins cruised alongside the boat.','A sea turtle surfaced beside the guests.','An eagle ray glided under the boat.','A manatee caused a very slow marina departure.']);
  const net=revenue-expenses, oldStars=state.rating*state.reviewCount, newStars=reviews.reduce((s,r)=>s+r.stars,0);
  state.reviewCount+=reviews.length; state.rating=state.reviewCount?Number(((oldStars+newStars)/state.reviewCount).toFixed(2)):state.rating;
  if (reviews.length) state.reputation=clamp(state.reputation+reviews.reduce((s,r)=>s+(r.stars-3)*0.006,0),0.1,1);
  state.cash+=net; state.lifetimeRevenue+=revenue; state.lifetimeProfit+=net; state.daysOperated+=1;
  if (revenue) state.ledger.push({day:state.day,category:'charters',amount:revenue,memo:`${tripsRun} charter(s)`});
  if (expenses) state.ledger.push({day:state.day,category:'operating',amount:-expenses,memo:'Fuel, reschedules and maintenance'});
  state.companyValue=Math.round(state.cash+state.boats.reduce((sum,b)=>sum+b.basePrice*b.condition*0.8,0)-state.debt+state.reputation*25000+state.lifetimeProfit*0.25);
  state.day+=1;
  return {state,result:{weather,decisions,bookingsGenerated:bookings,tripsRun,reviews,tripOutcomes,revenue,expenses,refunds,maintenanceEvent,wildlifeEvent,summary:`${tripsRun} trip(s), $${revenue} revenue, $${expenses} expenses, ${reviews.length} review(s).`}};
}
