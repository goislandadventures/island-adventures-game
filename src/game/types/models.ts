export type TripType = 'sandbar' | 'snorkel' | 'sunset' | 'custom' | 'eco' | 'fishing' | 'cruise';
export type WeatherExposure = 'protected' | 'moderate' | 'exposed';
export type BoatClass = 'deck' | 'center-console' | 'pontoon' | 'catamaran' | 'fishing' | 'cruiser';
export type TripDecision = 'run' | 'protected' | 'cancel';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type MarketingChannelId = 'search' | 'maps' | 'social' | 'hotel' | 'content';
export type MarketingFocus = MarketingChannelId | 'organic';
export type CustomerType = 'family' | 'couple' | 'celebration' | 'snorkeler' | 'luxury' | 'bargain' | 'repeat';
export type MaintenanceLevel = 'dock' | '100hr' | '300hr';
export type MaintenanceDecision = 'cheap' | 'premium' | 'replace' | 'defer';
export type EquipmentSystem = 'engine'|'propeller'|'battery'|'steering'|'pump'|'electronics'|'upholstery'|'safety'|'navigation';
export type FailurePhase = 'overnight'|'inspection'|'pre-departure'|'charter';

export interface Island {
  id:string; name:string; unlockValue:number; tourism:number; adCompetition:number; fuelPrice:number;
  weatherExposure:WeatherExposure; description:string;
}
export interface Marina {
  id:string; islandId:string; name:string; monthlySlip:number; maxBoatFt:number; reputationBonus:number;
  stormProtection:number; fuelAvailable:boolean; insuranceMultiplier:number; tipBonus:number;
}
export interface BoatTemplate {
  id:string; name:string; class:BoatClass; lengthFt:number; seats:number; basePrice:number; fuelBurnGph:number;
  cruiseMph:number; reliability:number; comfort:number; appeal:number; offshore:number;
  hullYear:number; engineYear:number; startingEngineHours:number;
}
export interface OwnedBoat extends BoatTemplate {
  instanceId:string; year:number; engineYear:number; condition:number; engineHours:number; purchasePrice:number; insured:boolean;
  insuranceDeclined?:boolean; insuranceRenewalDay?:number; marinaId?:string;
  next100Service:number; next300Service:number; deferredMaintenance?:number;
}
export interface UsedBoatListing {
  listingId:string; templateId:string; name:string; year:number; engineYear:number; condition:number; engineHours:number;
  askingPrice:number; reliability:number; inspectionNote:string;
}
export interface Loan {
  id:string; originalPrincipal:number; balance:number; apr:number; dailyPayment:number; boatInstanceId?:string;
}
export interface TripProduct {
  type:TripType; name:string; durationHours:number; price:number; baseDemand:number; weatherTolerance:number; fuelMultiplier:number;
}
export interface WeatherDay {
  day:number; windKts:number; windDirection:'N'|'NE'|'E'|'SE'|'S'|'SW'|'W'|'NW'; rainChance:number;
  stormRisk:number; waterClarity:number; temperatureF:number;
}
export interface CalendarInfo {
  day:number; week:number; dayOfWeek:'Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun';
  month:number; monthName:string; dayOfMonth:number; gameYear:number;
  season:'warmup'|'busy'|'slow'; demandMultiplier:number; note:string;
  marketingStrength:number; marketingLabel:'Strong'|'Okay'|'Weak';
}
export interface Booking {
  id:string; tripType:TripType; partySize:number; revenue:number;
  source:'organic'|'paid'|'search'|'maps'|'referral'|'repeat'|'hotel'|'marketplace'|'social'|'content';
  guestExpectation:number; timeSlot:TimeSlot; customerType:CustomerType; customerLabel:string;
  boatsRequired:number; neverTips:boolean; tipCeiling:number;
}
export interface Review { stars:number; text:string; reasons:string[]; }
export interface LedgerEntry { day:number; category:string; amount:number; memo:string; }
export interface StaffMember { id:string; name:string; role:'captain'; skill:number; reliability:number; hourlyRate:number; }
export interface MarketingSettings { dailyBudget:number; focus:MarketingFocus; reviewAsk:boolean; }
export interface MarketingMarketChannel { players:number; saturation:number; }
export interface MarketingMarketSnapshot { totalPlayers:number; activeWindowDays:number; channels:Record<MarketingChannelId,MarketingMarketChannel>; }
export interface HurricanePlan { day:number; haulBoats:boolean; }
export interface MaintenanceIncident {
  id:string; boatInstanceId:string; boatName:string; component:EquipmentSystem; phase:FailurePhase;
  title:string; description:string; severity:'minor'|'moderate'|'major';
  cheapCost:number; premiumCost:number; replaceCost:number;
}
export interface CompanyState {
  day:number; seed:number; captainName:string; companyName:string; companyColor:string; cash:number; debt:number;
  reputation:number; rating:number; reviewCount:number; islandId:string; marinaId?:string; boats:OwnedBoat[];
  products:TripProduct[]; bookings:Booking[]; ledger:LedgerEntry[]; companyValue:number; lifetimeRevenue:number;
  lifetimeProfit:number; daysOperated:number; staff:StaffMember[]; marketing:MarketingSettings; loans:Loan[];
  lastBusinessEventDay?:number; hurricanePlan?:HurricanePlan; startupLoanTaken?:boolean;
  captainSchoolReviewsReset?:boolean; captainSchoolFarewellSeen?:boolean; pendingMaintenance?:MaintenanceIncident;
}
export interface TripOutcome {
  bookingId:string; tripType:TripType; timeSlot:TimeSlot; decision:TripDecision; revenue:number; expenses:number;
  tip:number; satisfaction:number; review?:Review; note:string; boatInstanceId?:string; boatInstanceIds?:string[];
}
export interface DayResult {
  weather:WeatherDay; calendar:CalendarInfo; decisions:Record<string,TripDecision>; bookingsGenerated:Booking[];
  tripsRun:number; reviews:Review[]; tripOutcomes:TripOutcome[]; revenue:number; tips:number; expenses:number; refunds:number;
  maintenanceEvent?:string; maintenanceIncident?:MaintenanceIncident; wildlifeEvent?:string; loanPayment:number; fixedCosts:number;
  hurricaneSummary?:string; destroyedBoatNames?:string[]; summary:string;
}
export interface BusinessEventChoice {
  id:string; label:string; detail:string; cashDelta:number; reputationDelta:number;
}
export interface BusinessEvent {
  id:string; day:number; title:string; description:string; choices:BusinessEventChoice[];
}
export interface HurricaneEvent {
  day:number; category:1|2|3|4|5; name:string; warning:string;
}
