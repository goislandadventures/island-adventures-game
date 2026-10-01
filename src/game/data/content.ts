import type { BoatTemplate, Island, Marina, TripProduct } from '../types/models';

export const islands: Island[] = [
  { id: 'harbor', name: 'Harbor Key', unlockValue: 0, tourism: 0.75, adCompetition: 0.35, fuelPrice: 5.85, weatherExposure: 'moderate', description: 'Affordable slips and a forgiving place to learn the business.' },
  { id: 'sunset', name: 'Sunset Key', unlockValue: 22000, tourism: 0.95, adCompetition: 0.65, fuelPrice: 6.15, weatherExposure: 'protected', description: 'Resorts, restaurants and premium evening demand.' },
  { id: 'sandbar', name: 'Sandbar Key', unlockValue: 35000, tourism: 1.05, adCompetition: 0.72, fuelPrice: 6.05, weatherExposure: 'moderate', description: 'Families and party groups chase shallow turquoise water.' },
  { id: 'reef', name: 'Reef Key', unlockValue: 52000, tourism: 1.12, adCompetition: 0.78, fuelPrice: 6.30, weatherExposure: 'exposed', description: 'Premium snorkeling demand with real offshore weather risk.' },
  { id: 'mangrove', name: 'Mangrove Key', unlockValue: 70000, tourism: 0.82, adCompetition: 0.42, fuelPrice: 5.95, weatherExposure: 'protected', description: 'Wildlife, protected water and eco-charter opportunities.' },
  { id: 'pelican', name: 'Pelican Key', unlockValue: 95000, tourism: 1.30, adCompetition: 0.95, fuelPrice: 6.55, weatherExposure: 'moderate', description: 'Heavy tourism, expensive ads and huge upside.' },
  { id: 'lighthouse', name: 'Lighthouse Key', unlockValue: 130000, tourism: 1.18, adCompetition: 0.70, fuelPrice: 6.70, weatherExposure: 'exposed', description: 'Long offshore runs, iconic destinations and high-paying guests.' },
  { id: 'captains', name: "Captain's Key", unlockValue: 175000, tourism: 0.65, adCompetition: 0.25, fuelPrice: 5.75, weatherExposure: 'protected', description: 'Boat yards, mechanics and the best used-boat deals.' }
];

export const marinas: Marina[] = [
  { id: 'harbor-house', islandId: 'harbor', name: 'Harbor House Marina', monthlySlip: 780, maxBoatFt: 28, reputationBonus: 0.02, stormProtection: 0.80, fuelAvailable: true, insuranceMultiplier: 1.15, tipBonus: 0.03 },
  { id: 'pelican-pier', islandId: 'harbor', name: 'Pelican Pier', monthlySlip: 560, maxBoatFt: 24, reputationBonus: 0, stormProtection: 0.62, fuelAvailable: false, insuranceMultiplier: 1.00, tipBonus: 0.01 },
  { id: 'old-cut-docks', islandId: 'harbor', name: 'Old Cut Docks', monthlySlip: 420, maxBoatFt: 22, reputationBonus: -0.01, stormProtection: 0.45, fuelAvailable: true, insuranceMultiplier: 0.90, tipBonus: 0 },
  { id: 'sunset-basin', islandId: 'sunset', name: 'Sunset Basin', monthlySlip: 1280, maxBoatFt: 34, reputationBonus: 0.06, stormProtection: 0.90, fuelAvailable: true, insuranceMultiplier: 1.35, tipBonus: 0.07 },
  { id: 'reef-run', islandId: 'reef', name: 'Reef Run Marina', monthlySlip: 1450, maxBoatFt: 36, reputationBonus: 0.08, stormProtection: 0.55, fuelAvailable: true, insuranceMultiplier: 1.28, tipBonus: 0.05 },
  { id: 'sandbar-harbor', islandId: 'sandbar', name: 'Sandbar Harbor', monthlySlip: 1180, maxBoatFt: 32, reputationBonus: 0.05, stormProtection: 0.68, fuelAvailable: true, insuranceMultiplier: 1.22, tipBonus: 0.04 },
  { id: 'mangrove-basin', islandId: 'mangrove', name: 'Mangrove Basin', monthlySlip: 980, maxBoatFt: 30, reputationBonus: 0.04, stormProtection: 0.92, fuelAvailable: true, insuranceMultiplier: 1.12, tipBonus: 0.03 },
  { id: 'pelican-yacht', islandId: 'pelican', name: 'Pelican Yacht Basin', monthlySlip: 1850, maxBoatFt: 40, reputationBonus: 0.09, stormProtection: 0.82, fuelAvailable: true, insuranceMultiplier: 1.45, tipBonus: 0.09 },
  { id: 'lighthouse-docks', islandId: 'lighthouse', name: 'Lighthouse Docks', monthlySlip: 1640, maxBoatFt: 38, reputationBonus: 0.08, stormProtection: 0.50, fuelAvailable: true, insuranceMultiplier: 1.34, tipBonus: 0.06 },
  { id: 'captains-yard', islandId: 'captains', name: "Captain's Yard", monthlySlip: 720, maxBoatFt: 42, reputationBonus: 0.03, stormProtection: 0.86, fuelAvailable: true, insuranceMultiplier: 1.02, tipBonus: 0.02 }
];

export const boatTemplates: BoatTemplate[] = [
  { id: 'old-deck-19', name: '1996 Island Deck 19', class: 'deck', lengthFt: 19, seats: 6, basePrice: 6500, fuelBurnGph: 5.0, cruiseMph: 24, reliability: 0.58, comfort: 0.64, appeal: 0.50, offshore: 0.42, hullYear: 1996, engineYear: 2011, startingEngineHours: 860 },
  { id: 'bay-deck-21', name: '2001 Bay Breeze 20', class: 'deck', lengthFt: 20, seats: 6, basePrice: 9500, fuelBurnGph: 5.5, cruiseMph: 25, reliability: 0.66, comfort: 0.70, appeal: 0.60, offshore: 0.48, hullYear: 2001, engineYear: 2014, startingEngineHours: 620 },
  { id: 'deck-24', name: '2006 Coastal Deck 21', class: 'deck', lengthFt: 21, seats: 6, basePrice: 14000, fuelBurnGph: 5.8, cruiseMph: 26, reliability: 0.74, comfort: 0.76, appeal: 0.68, offshore: 0.52, hullYear: 2006, engineYear: 2015, startingEngineHours: 400 },
  { id: 'pontoon-24', name: '2004 Sandbar Cruiser 22', class: 'pontoon', lengthFt: 22, seats: 6, basePrice: 16500, fuelBurnGph: 5.7, cruiseMph: 20, reliability: 0.76, comfort: 0.84, appeal: 0.74, offshore: 0.28, hullYear: 2004, engineYear: 2018, startingEngineHours: 310 },
  { id: 'cc-25', name: '2008 Reef Runner 23', class: 'center-console', lengthFt: 23, seats: 6, basePrice: 19500, fuelBurnGph: 7.8, cruiseMph: 31, reliability: 0.81, comfort: 0.68, appeal: 0.80, offshore: 0.84, hullYear: 2008, engineYear: 2020, startingEngineHours: 290 },
  { id: 'cat-28', name: '2010 Island Cat 26', class: 'catamaran', lengthFt: 26, seats: 6, basePrice: 24000, fuelBurnGph: 9.2, cruiseMph: 29, reliability: 0.83, comfort: 0.88, appeal: 0.88, offshore: 0.88, hullYear: 2010, engineYear: 2017, startingEngineHours: 550 }
];

export const defaultProducts: TripProduct[] = [
  { type: 'sandbar', name: 'Private Sandbar', durationHours: 3, price: 489, baseDemand: 1.00, weatherTolerance: 0.82, fuelMultiplier: 0.75 },
  { type: 'snorkel', name: 'Private Snorkel', durationHours: 4, price: 649, baseDemand: 0.90, weatherTolerance: 0.55, fuelMultiplier: 1.15 },
  { type: 'sunset', name: 'Sunset Cruise', durationHours: 1.5, price: 319, baseDemand: 0.78, weatherTolerance: 0.72, fuelMultiplier: 0.45 },
  { type: 'custom', name: 'Build-Your-Own Adventure', durationHours: 5, price: 749, baseDemand: 0.42, weatherTolerance: 0.68, fuelMultiplier: 1.20 }
];
