export type TripType = 'sandbar' | 'snorkel' | 'sunset' | 'custom' | 'eco' | 'fishing' | 'cruise';
export type WeatherExposure = 'protected' | 'moderate' | 'exposed';
export type BoatClass = 'deck' | 'center-console' | 'pontoon' | 'catamaran' | 'fishing' | 'cruiser';
export type TripDecision = 'run' | 'protected' | 'cancel';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export interface Island { id:string; name:string; unlockValue:number; tourism:number; adCompetition:number; fuelPrice:number; weatherExposure:WeatherExposure; description:string; }
export interface Marina { id:string; islandId:string; name:string; monthlySlip:number; maxBoatFt:number; reputationBonus:number; stormProtection:number; fuelAvailable:boolean; }
export interface BoatTemplate { id:string; name:string; class:BoatClass; lengthFt:number; seats:number; basePrice:number; fuelBurnGph:number; cruiseMph:number; reliability:number; comfort:number; appeal:number; offshore:number; }
export interface OwnedBoat extends BoatTemplate { instanceId:string; year:number; condition:number; engineHours:number; purchasePrice:number; insured:boolean; marinaId?:string; }
export interface TripProduct { type:TripType; name:string; durationHours:number; price:number; baseDemand:number; weatherTolerance:number; fuelMultiplier:number; }
export interface WeatherDay { day:number; windKts:number; windDirection:'N'|'NE'|'E'|'SE'|'S'|'SW'|'W'|'NW'; rainChance:number; stormRisk:number; waterClarity:number; temperatureF:number; }
export interface Booking { id:string; tripType:TripType; partySize:number; revenue:number; source:'organic'|'paid'|'maps'|'referral'|'repeat'|'hotel'|'marketplace'|'social'; guestExpectation:number; timeSlot:TimeSlot; }
export interface Review { stars:number; text:string; }
export interface LedgerEntry { day:number; category:string; amount:number; memo:string; }
export interface CompanyState { day:number; seed:number; captainName:string; companyName:string; companyColor:string; cash:number; debt:number; reputation:number; rating:number; reviewCount:number; islandId:string; marinaId?:string; boats:OwnedBoat[]; products:TripProduct[]; bookings:Booking[]; ledger:LedgerEntry[]; companyValue:number; lifetimeRevenue:number; lifetimeProfit:number; daysOperated:number; }
export interface TripOutcome { bookingId:string; tripType:TripType; timeSlot:TimeSlot; decision:TripDecision; revenue:number; expenses:number; satisfaction:number; review?:Review; note:string; }
export interface DayResult { weather:WeatherDay; decisions:Record<string,TripDecision>; bookingsGenerated:Booking[]; tripsRun:number; reviews:Review[]; tripOutcomes:TripOutcome[]; revenue:number; expenses:number; refunds:number; maintenanceEvent?:string; wildlifeEvent?:string; summary:string; }
