import { useEffect, useMemo, useState } from 'react';
import { boatTemplates, islands, marinas } from '../game/data/content';
import { buyBoat, createCompany, generateDemand, generateWeather, insuranceQuote, insureFleet, rentSlip, setPrice, simulateDay, weatherLabel } from '../game/engine/sim';
import { loadGame, saveGame } from '../game/engine/save';
import type { CompanyState, DayResult, TripDecision, TripType } from '../game/types/models';
import './styles.css';

const money = (n: number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const pct = (n: number) => `${Math.round(n * 100)}%`;
const tripIcon: Record<string,string> = { sandbar:'🏝️', snorkel:'🤿', sunset:'🌅', custom:'🧭', eco:'🐬', fishing:'🎣', cruise:'🚤' };

export default function App() {
  const [state, setState] = useState<CompanyState>(() => loadGame() ?? createCompany('', ''));
  const [last, setLast] = useState<DayResult | null>(null);
  const [tab, setTab] = useState<'dock'|'trips'|'fleet'|'books'|'leaders'>('dock');
  const [tripDecisions, setTripDecisions] = useState<Record<string, TripDecision>>({});
  const [captainName, setCaptainName] = useState(state.captainName);
  const [companyName, setCompanyName] = useState(state.companyName);
  const [companyColor, setCompanyColor] = useState(state.companyColor || '#f6c453');
  const setupStarted = Boolean(state.captainName && state.companyName);
  const weather = useMemo(() => generateWeather(state), [state]);
  const forecast = useMemo(() => weatherLabel(weather), [weather]);
  const todaysBookings = useMemo(() => generateDemand(state, weather), [state, weather]);
  const currentIsland = islands.find(i => i.id === state.islandId)!;
  const currentMarina = marinas.find(m => m.id === state.marinaId);
  const ready = Boolean(currentMarina && state.boats.length && state.boats.every(b => b.insured));

  useEffect(() => { if (setupStarted) saveGame(state); }, [state, setupStarted]);

  const commit = (next: CompanyState) => { setState(next); saveGame(next); };
  const begin = () => {
    if (!captainName.trim() || !companyName.trim()) return;
    commit(createCompany(captainName.trim(), companyName.trim(), companyColor));
  };
  const chooseMarina = (id: string) => { try { commit(rentSlip(state,id)); } catch(e) { alert((e as Error).message); } };
  const chooseBoat = (id: string) => { try { commit(buyBoat(state,id)); } catch(e) { alert((e as Error).message); } };
  const insure = () => { try { commit(insureFleet(state)); } catch(e) { alert((e as Error).message); } };
  const changePrice = (type: TripType, value: number) => commit(setPrice(state,type,value));
  useEffect(() => {
    const next: Record<string, TripDecision> = {};
    for (const b of todaysBookings) next[b.id] = b.tripType === 'snorkel' && weather.windKts >= 12 ? 'protected' : 'run';
    setTripDecisions(next);
  }, [state.day, ready]);
  const setTripDecision = (id: string, decision: TripDecision) => setTripDecisions(prev => ({...prev,[id]:decision}));
  const runDay = () => {
    const out = simulateDay(state, tripDecisions);
    commit(out.state); setLast(out.result); setTab('dock');
  };
  const reset = () => { localStorage.removeItem('island-adventures-save-v1'); setLast(null); setState(createCompany('', '')); setCaptainName(''); setCompanyName(''); };

  if (!setupStarted) return <main className="shell onboarding">
    <header className="heroBrand">
      <div className="logo" style={{background: companyColor}}>IA</div>
      <div><h1>Island Adventures</h1><p>Build your charter company across the islands.</p></div>
    </header>
    <section className="mapCard introMap"><IslandMap active={0} /></section>
    <section className="card setupCard">
      <span className="eyebrow">NEW COMPANY</span><h2>Start with $40,000 and a dream</h2>
      <label>Captain name<input value={captainName} maxLength={22} placeholder="Captain Jim" onChange={e=>setCaptainName(e.target.value)} /></label>
      <label>Charter company<input value={companyName} maxLength={28} placeholder="Keys Adventure Co." onChange={e=>setCompanyName(e.target.value)} /></label>
      <label>Company color<div className="colorRow">{['#f6c453','#ff8066','#62c8db','#67bb70','#9b7de3'].map(c=><button aria-label={`Choose ${c}`} className={`colorDot ${companyColor===c?'picked':''}`} key={c} style={{background:c}} onClick={()=>setCompanyColor(c)} />)}</div></label>
      <button className="primary big" disabled={!captainName.trim()||!companyName.trim()} onClick={begin}>Launch Company →</button>
      <p className="fine">Owner-test mode: no login required. Progress saves on this device.</p>
    </section>
  </main>;

  return <main className="shell">
    <header className="brand"><div className="logo" style={{background:state.companyColor}}>IA</div><div className="brandText"><h1>{state.companyName}</h1><p>{state.captainName} · Harbor Key</p></div><button className="iconBtn" onClick={()=>setTab('books')}>☰</button></header>
    <section className="hud">
      <div><span>Cash</span><strong>{money(state.cash)}</strong></div>
      <div><span>Rating</span><strong>{state.reviewCount ? `${state.rating} ★` : 'New'}</strong></div>
      <div><span>Company</span><strong>{money(state.companyValue)}</strong></div>
    </section>

    {tab==='dock' && <>
      <section className="mapCard"><IslandMap active={0} boat={state.boats.length>0} /><div className="mapText"><b>{currentIsland.name}</b><span>{currentIsland.description}</span></div></section>

      {!state.marinaId && <section className="card"><span className="eyebrow">STEP 1</span><h2>Pick your first slip</h2><p className="muted">Cheaper docks save cash. Better marinas protect boats and help your reputation.</p>{marinas.filter(m=>m.islandId==='harbor').map(m=><div className="choice" key={m.id}><div><b>{m.name}</b><small>{money(m.monthlySlip)}/mo · up to {m.maxBoatFt}′ · storm protection {pct(m.stormProtection)}</small></div><button onClick={()=>chooseMarina(m.id)}>Rent</button></div>)}</section>}

      {state.marinaId && !state.boats.length && <section className="card"><span className="eyebrow">STEP 2</span><h2>Buy your first boat</h2><p className="muted">You need enough cash left for insurance and bad luck.</p>{boatTemplates.filter(b=>b.basePrice<=state.cash && b.lengthFt<=(currentMarina?.maxBoatFt??99)).slice(0,4).map(b=><div className="boatCard" key={b.id}><div className="boatSprite">🚤</div><div className="grow"><b>{b.name}</b><small>{b.lengthFt}′ · {b.seats} guests · reliability {pct(b.reliability)}</small><div className="meters"><span>Comfort <i style={{width:pct(b.comfort)}}/></span><span>Offshore <i style={{width:pct(b.offshore)}}/></span></div></div><div className="buy"><strong>{money(b.basePrice)}</strong><button onClick={()=>chooseBoat(b.id)}>Buy</button></div></div>)}</section>}

      {state.boats.length>0 && !state.boats[0].insured && <section className="card attention"><span className="eyebrow">STEP 3</span><h2>Insurance before customers</h2><p><b>{state.boats[0].name}</b> is sitting at the dock uninsured.</p><div className="quote"><span>Annual premium</span><strong>{money(insuranceQuote(state.boats[0]))}</strong></div><button className="primary" onClick={insure}>Insure the Boat</button></section>}

      {ready && <section className={`card forecast ${forecast.level}`}><div className="forecastTop"><div><span className="eyebrow">DAY {state.day} · CAPTAIN'S REPORT</span><h2>{forecast.title}</h2></div><div className="weatherIcon">{forecast.level==='good'?'☀️':forecast.level==='caution'?'🌤️':'🌬️'}</div></div><div className="weatherGrid"><div><span>Wind</span><b>{weather.windKts} kt {weather.windDirection}</b></div><div><span>Rain</span><b>{weather.rainChance}%</b></div><div><span>Water</span><b>{Math.round(weather.waterClarity*100)}% clear</b></div><div><span>Temp</span><b>{weather.temperatureF}°</b></div></div><p>{forecast.detail}</p></section>}

      {ready && <section className="card"><div className="sectionHead"><div><span className="eyebrow">TODAY'S CALENDAR</span><h2>{todaysBookings.length ? `${todaysBookings.length} booking${todaysBookings.length>1?'s':''}` : 'No bookings yet'}</h2></div><strong className="potential">{money(todaysBookings.reduce((s,b)=>s+b.revenue,0))}</strong></div>{todaysBookings.length ? todaysBookings.map(b=><div className="tripPlan" key={b.id}><div className="booking"><span className="tripEmoji">{tripIcon[b.tripType]}</span><div className="grow"><b>{b.timeSlot[0].toUpperCase()+b.timeSlot.slice(1)} · {state.products.find(p=>p.type===b.tripType)?.name}</b><small>{b.partySize} guests · via {b.source}</small></div><strong>{money(b.revenue)}</strong></div><div className="miniChoices"><button className={tripDecisions[b.id]==='run'?'selected':''} onClick={()=>setTripDecision(b.id,'run')}>🚤 Run booked</button><button className={tripDecisions[b.id]==='protected'?'selected':''} onClick={()=>setTripDecision(b.id,'protected')}>🛟 Protected</button><button className={tripDecisions[b.id]==='cancel'?'selected':''} onClick={()=>setTripDecision(b.id,'cancel')}>📅 Reschedule</button></div></div>) : <p className="muted">Some days are slow. Pricing and reputation will matter more as the game expands.</p>}
        {todaysBookings.length>0 && <><div className="decisionTitle">Captain's plan for the day</div><p className="muted">Choose separately for every charter. Day 1 is intentionally 17 kt: the sandbar can run as booked while the snorkel can move to protected water.</p><button className="primary big" onClick={runDay}>Run Today's Plan →</button></>}
      </section>}

      {last && <section className="card event"><span className="eyebrow">CAPTAIN'S LOG · DAY {last.weather.day}</span><h2>{last.tripsRun ? 'Boats are back at the dock' : 'Day closed out'}</h2><div>{last.tripOutcomes.map(x=><p className="story" key={x.bookingId}><b>{x.timeSlot} {state.products.find(p=>p.type===x.tripType)?.name}:</b> {x.note}</p>)}</div>{last.wildlifeEvent&&<p className="story">🐬 {last.wildlifeEvent}</p>}{last.maintenanceEvent&&<p className="story danger">🔧 {last.maintenanceEvent}</p>}<div className="resultGrid"><div><span>Revenue</span><b>{money(last.revenue)}</b></div><div><span>Expenses</span><b>-{money(last.expenses)}</b></div><div><span>Net</span><b>{money(last.revenue-last.expenses)}</b></div></div>{last.reviews.map((r,i)=><blockquote key={i}><b>{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</b> “{r.text}”</blockquote>)}</section>}
    </>}

    {tab==='trips' && <section className="card page"><span className="eyebrow">PRICING</span><h2>Your charter menu</h2><p className="muted">Higher prices improve margin but can lower conversion. Prices save instantly.</p>{state.products.map(p=><div className="priceCard" key={p.type}><div className="tripEmoji">{tripIcon[p.type]}</div><div className="grow"><b>{p.name}</b><small>{p.durationHours} hours · demand {pct(p.baseDemand)}</small></div><label className="priceInput"><span>$</span><input type="number" min="99" step="10" value={p.price} onChange={e=>changePrice(p.type,Number(e.target.value))}/></label></div>)}</section>}

    {tab==='fleet' && <section className="card page"><span className="eyebrow">FLEET</span><h2>{state.boats.length ? state.boats[0].name : 'No boat yet'}</h2>{state.boats.map(b=><div key={b.instanceId}><div className="bigBoat">🚤</div><div className="stats"><div><span>Year</span><b>{b.year}</b></div><div><span>Condition</span><b>{pct(b.condition)}</b></div><div><span>Reliability</span><b>{pct(b.reliability)}</b></div><div><span>Hours</span><b>{Math.round(b.engineHours)}</b></div><div><span>Fuel burn</span><b>{b.fuelBurnGph} gph</b></div><div><span>Insured</span><b>{b.insured?'Yes':'No'}</b></div></div></div>)}</section>}

    {tab==='books' && <section className="card page"><span className="eyebrow">COMPANY BOOKS</span><h2>{state.companyName}</h2><div className="resultGrid"><div><span>Lifetime revenue</span><b>{money(state.lifetimeRevenue)}</b></div><div><span>Lifetime profit</span><b>{money(state.lifetimeProfit)}</b></div><div><span>Days operated</span><b>{state.daysOperated}</b></div></div><h3>Recent ledger</h3>{state.ledger.slice(-8).reverse().map((x,i)=><div className="ledger" key={`${x.day}-${i}`}><span>Day {x.day} · {x.memo}</span><b className={x.amount>=0?'positive':'negative'}>{x.amount>=0?'+':''}{money(x.amount)}</b></div>)}<button className="dangerBtn" onClick={reset}>Reset Prototype Save</button></section>}

    {tab==='leaders' && <section className="card page"><span className="eyebrow">OWNER CHALLENGE</span><h2>Leaderboards</h2><p className="muted">Registered companies compete by company value, lifetime revenue, lifetime profit, most reviews, and best rating. Best-rating boards require at least 10 reviews. Demo and owner-test saves stay out of public rankings.</p><div className="stats"><div><span>Your company value</span><b>{money(state.companyValue)}</b></div><div><span>Your reviews</span><b>{state.reviewCount}</b></div><div><span>Your rating</span><b>{state.reviewCount?state.rating:'New'}</b></div></div></section>}
    <nav className="bottomNav"><button className={tab==='dock'?'active':''} onClick={()=>setTab('dock')}><span>⚓</span>Dock</button><button className={tab==='trips'?'active':''} onClick={()=>setTab('trips')}><span>🗓️</span>Trips</button><button className={tab==='fleet'?'active':''} onClick={()=>setTab('fleet')}><span>🚤</span>Fleet</button><button className={tab==='leaders'?'active':''} onClick={()=>setTab('leaders')}><span>🏆</span>Rank</button><button className={tab==='books'?'active':''} onClick={()=>setTab('books')}><span>📒</span>Books</button></nav>
  </main>;
}

function IslandMap({active,boat=false}:{active:number;boat?:boolean}) {
  return <div className="ocean">{islands.slice(0,5).map((i,idx)=><div key={i.id} className={`island i${idx} ${idx===active?'active':''}`}><span>{idx===3?'🪸':'🌴'}</span><small>{i.name}</small>{idx>0&&<em>🔒</em>}</div>)}{boat&&<div className="mapBoat">🚤<i/></div>}<div className="wave w1">≈≈≈</div><div className="wave w2">≈≈</div></div>;
}
