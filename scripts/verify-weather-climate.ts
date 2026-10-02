import { createCompany, generateWeather } from '../src/game/engine/sim.ts';
import { calendarForDay } from '../src/game/engine/depth.ts';

const targetHigh:Record<number,number>={
  1:75.8,2:78.1,3:80.7,4:84.1,5:87.5,6:90.3,
  7:90.9,8:91.6,9:89.9,10:86.2,11:81.2,12:77.9
};

const signatures=new Set<string>();
const monthTemp:Record<number,number[]>={};
const monthRain:Record<number,number[]>={};
const monthWind:Record<number,number[]>={};
for(let m=1;m<=12;m++){monthTemp[m]=[];monthRain[m]=[];monthWind[m]=[];}

for(let seed=1;seed<=20;seed++){
  const state=createCompany('Climate Test','Weather Co','#f6c453',seed);
  const visible=new Set<string>();
  const yearSignature:string[]=[];

  for(let day=1;day<=365;day++){
    state.day=day;
    const w=generateWeather(state);
    const cal=calendarForDay(day);
    monthTemp[cal.month].push(w.temperatureF);
    monthRain[cal.month].push(w.rainChance);
    monthWind[cal.month].push(w.windKts);

    const key=`${w.temperatureF}|${w.windKts}|${w.windDirection}|${w.rainChance}|${w.waterClarity}`;
    visible.add(key);
    yearSignature.push(key);

    if(w.temperatureF<58||w.temperatureF>95)throw new Error(`Seed ${seed} day ${day}: unrealistic temperature ${w.temperatureF}`);
    if(w.windKts<3||w.windKts>32)throw new Error(`Seed ${seed} day ${day}: unrealistic wind ${w.windKts}`);
    if(w.rainChance<4||w.rainChance>92)throw new Error(`Seed ${seed} day ${day}: rain chance out of range ${w.rainChance}`);
    if(w.waterClarity<.32||w.waterClarity>.96)throw new Error(`Seed ${seed} day ${day}: clarity out of range ${w.waterClarity}`);
  }

  if(visible.size<300)throw new Error(`Seed ${seed}: only ${visible.size} unique visible weather days; year is too repetitive.`);
  const sig=yearSignature.join(';');
  if(signatures.has(sig))throw new Error(`Seed ${seed}: duplicated another company's full weather year.`);
  signatures.add(sig);
}

const avg=(xs:number[])=>xs.reduce((a,b)=>a+b,0)/Math.max(1,xs.length);
for(let month=1;month<=12;month++){
  const actual=avg(monthTemp[month]);
  if(Math.abs(actual-targetHigh[month])>5.5){
    throw new Error(`Month ${month}: mean daytime temperature ${actual.toFixed(1)}° is too far from NOAA normal high ${targetHigh[month]}°.`);
  }
}

const wetMonths=[6,7,8,9,10];
const dryMonths=[12,1,2,3,4];
const wetRain=avg(wetMonths.flatMap(m=>monthRain[m]));
const dryRain=avg(dryMonths.flatMap(m=>monthRain[m]));
if(wetRain-dryRain<14)throw new Error(`Wet season is not wet enough relative to dry season: wet ${wetRain.toFixed(1)}%, dry ${dryRain.toFixed(1)}%.`);

const sepOctRain=avg([9,10].flatMap(m=>monthRain[m]));
const marAprRain=avg([3,4].flatMap(m=>monthRain[m]));
if(sepOctRain-marAprRain<18)throw new Error(`Fall rain peak is too weak: Sep-Oct ${sepOctRain.toFixed(1)}%, Mar-Apr ${marAprRain.toFixed(1)}%.`);

const winterWind=avg([12,1,2,3].flatMap(m=>monthWind[m]));
const summerWind=avg([6,7,8].flatMap(m=>monthWind[m]));
if(winterWind-summerWind<2)throw new Error(`Seasonal wind pattern is too flat: winter ${winterWind.toFixed(1)} kt, summer ${summerWind.toFixed(1)} kt.`);

console.log(`NOAA weather invariant passed: 20 unique seeded years, wet-season rain ${wetRain.toFixed(1)}% vs dry ${dryRain.toFixed(1)}%, winter wind ${winterWind.toFixed(1)} kt vs summer ${summerWind.toFixed(1)} kt.`);
