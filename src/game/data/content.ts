import type { BoatTemplate, Island, Marina, TripProduct } from '../types/models';

export const islands: Island[] = [
  { id: 'harbor', name: 'Harbor Key', unlockValue: 0, tourism: 0.75, adCompetition: 0.35, fuelPrice: 5.85, weatherExposure: 'moderate', description: 'Affordable slips and a forgiving place to learn the business.' },
  { id: 'sunset', name: 'Sunset Key', unlockValue: 85000, tourism: 0.95, adCompetition: 0.65, fuelPrice: 6.15, weatherExposure: 'protected', description: 'Resorts, restaurants and premium evening demand.' },
  { id: 'sandbar', name: 'Sandbar Key', unlockValue: 125000, tourism: 1.05, adCompetition: 0.72, fuelPrice: 6.05, weatherExposure: 'moderate', description: 'Families and party groups chase shallow turquoise water.' },
  { id: 'reef', name: 'Reef Key', unlockValue: 180000, tourism: 1.12, adCompetition: 0.78, fuelPrice: 6.30, weatherExposure: 'exposed', description: 'Premium snorkeling demand with real offshore weather risk.' },
  { id: 'mangrove', name: 'Mangrove Key', unlockValue: 230000, tourism: 0.82, adCompetition: 0.42, fuelPrice: 5.95, weatherExposure: 'protected', description: 'Wildlife, protected water and eco-charter opportunities.' },
  { id: 'pelican', name: 'Pelican Key', unlockValue: 340000, tourism: 1.30, adCompetition: 0.95, fuelPrice: 6.55, weatherExposure: 'moderate', description: 'Heavy tourism, expensive ads and huge upside.' },
  { id: 'lighthouse', name: 'Lighthouse Key', unlockValue: 500000, tourism: 1.18, adCompetition: 0.70, fuelPrice: 6.70, weatherExposure: 'exposed', description: 'Long offshore runs, iconic destinations and high-paying guests.' },
  { id: 'captains', name: "Captain's Key", unlockValue: 650000, tourism: 0.65, adCompetition: 0.25, fuelPrice: 5.75, weatherExposure: 'protected', description: 'Boat yards, mechanics and the best used-boat deals.' }
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
  { id: 'old-deck-19', name: '1999 Island Deck 19', class: 'deck', lengthFt: 19, seats: 6, basePrice: 9500, fuelBurnGph: 5.0, cruiseMph: 24, reliability: 0.63, comfort: 0.67, appeal: 0.55, offshore: 0.45 },
  { id: 'bay-deck-21', name: '2007 Bay Breeze 21', class: 'deck', lengthFt: 21, seats: 6, basePrice: 15800, fuelBurnGph: 5.8, cruiseMph: 26, reliability: 0.70, comfort: 0.73, appeal: 0.65, offshore: 0.50 },
  { id: 'deck-24', name: 'Coastal Deck 24', class: 'deck', lengthFt: 24, seats: 6, basePrice: 28500, fuelBurnGph: 7.5, cruiseMph: 29, reliability: 0.79, comfort: 0.82, appeal: 0.78, offshore: 0.62 },
  { id: 'cc-25', name: 'Reef Runner 25', class: 'center-console', lengthFt: 25, seats: 6, basePrice: 52000, fuelBurnGph: 9.0, cruiseMph: 34, reliability: 0.86, comfort: 0.70, appeal: 0.86, offshore: 0.91 },
  { id: 'pontoon-24', name: 'Sandbar Party 24', class: 'pontoon', lengthFt: 24, seats: 6, basePrice: 34000, fuelBurnGph: 6.0, cruiseMph: 20, reliability: 0.82, comfort: 0.90, appeal: 0.83, offshore: 0.25 },
  { id: 'cat-28', name: 'Island Cat 28', class: 'catamaran', lengthFt: 28, seats: 6, basePrice: 88000, fuelBurnGph: 11.0, cruiseMph: 31, reliability: 0.90, comfort: 0.93, appeal: 0.94, offshore: 0.94 }
];

export const defaultProducts: TripProduct[] = [
  { type: 'sandbar', name: 'Private Sandbar', durationHours: 3, price: 489, baseDemand: 1.00, weatherTolerance: 0.82, fuelMultiplier: 0.75 },
  { type: 'snorkel', name: 'Private Snorkel', durationHours: 4, price: 649, baseDemand: 0.90, weatherTolerance: 0.55, fuelMultiplier: 1.15 },
  { type: 'sunset', name: 'Sunset Cruise', durationHours: 1.5, price: 319, baseDemand: 0.78, weatherTolerance: 0.72, fuelMultiplier: 0.45 }
];
