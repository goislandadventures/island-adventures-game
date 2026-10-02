import { useEffect,useLayoutEffect,useMemo,useRef,useState } from 'react';
import { boatTemplates,islands,marinas } from '../game/data/content';
import { assessTripPlan,buyBoat,createCompany,declineInsurance,generateDemand,generateWeather,insuranceQuote,insureFleet,rentSlip,setPrice,simulateDay,takeStartupLoan,weatherLabel } from '../game/engine/sim';
import { businessEventForDay,calendarForDay,customerProfiles,maintainBoat,serviceStatus } from '../game/engine/depth';
import { hurricaneForDay } from '../game/engine/hurricane';
import { clearGame,loadGame,normalizeState,saveGame } from '../game/engine/save';
import type { CompanyState,DayResult,TripDecision,TripType } from '../game/types/models';
import type { GameMode } from './StartMode';
import type { Player } from './api';
import { syncCompany } from './api';
import Leaderboard from './Leaderboard';
import TutorialCard from './TutorialCard';
import GrowthPanel from './GrowthPanel';
import MarketingPanel from './MarketingPanel';
import MarketplacePanel from './MarketplacePanel';
import BusinessEventCard from './BusinessEventCard';
import ProgressGoals from './ProgressGoals';
import HurricaneCard from './HurricaneCard';
import './styles.css';

const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const pct=(n:number)=>`${Math.round(n*100)}%`;
const tripIcon:Record<string,string>={sandbar:'🏝️',snorkel:'🤿',sunset:'🌅',custom:'🧭',eco:'🐬',fishing:'🎣',cruise:'🚤'};
const sourceFee:Record<string,string>={marketplace:'25% booking-site fee',hotel:'15% hotel referral fee',organic:'Direct · no booking fee',maps:'Direct · no booking fee',social:'Direct · no booking fee',referral:'Direct · no booking fee',repeat:'Direct · no booking fee',paid:'Direct · ad cost already paid',content:'Direct · no booking fee'};

export default function App({mode,player,initialState,onUpgrade}:{mode:GameMode;player?:Player;initialState?:CompanyState;onUpgrade:()=>void}){
  const [state,setState]=useState<CompanyState>(()=>initialState?normalizeState(initialState):(mode==='owner'?loadGame():null)??createCompany('',''));
  const [last,setLast]=useState<DayResult|null>(null);
  const [tab,setTab]=useState<'dock'|'trips'|'fleet'|'books'|'leaders'>('dock');
  const [tripDecisions,setTripDecisions]=useState<Record<string,TripDecision>>({});
  const [captainName,setCaptainName]=useState(state.captainName);
  const [companyName,setCompanyName]=useState(state.companyName);
  const [companyColor,setCompanyColor]=useState(state.companyColor||'#f6c453');
  const [demoComplete,setDemoComplete]=useState(mode==='demo'&&state.day>7);
  const [syncStatus,setSyncStatus]=useState<'idle'|'saving'|'saved'|'error'>('idle');

  const setupStarted=Boolean(state.captainName&&state.companyName);
  const previousSetupStarted=useRef(setupStarted);

  useLayoutEffect(()=>{
    if(setupStarted && !previousSetupStarted.current){
      window.scrollTo(0,0);
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
      const frame=window.requestAnimationFrame(()=>{
        window.scrollTo(0,0);
        document.documentElement.scrollTop=0;
        document.body.scrollTop=0;
      });
      previousSetupStarted.current=setupStarted;
      return()=>window.cancelAnimationFrame(frame);
    }
    previousSetupStarted.current=setupStarted;
  },[setupStarted]);

  const weather=useMemo(()=>generateWeather(state),[state]);
  const forecast=useMemo(()=>weatherLabel(weather),[weather]);
  const calendar=useMemo(()=>calendarForDay(state.day,state),[state]);
  const hurricane=useMemo(()=>hurricaneForDay(state),[state.day,state.seed]);
  const businessEvent=useMemo(()=>hurricane?null:businessEventForDay(state),[state.day,state.seed,state.lastBusinessEventDay,hurricane]);
  const todaysBookings=useMemo(()=>generateDemand(state,weather),[state,weather]);
  const currentIsland=islands.find(i=>i.id===state.islandId)!;
  const currentMarina=marinas.find(m=>m.id===state.marinaId);
  const ready=Boolean(currentMarina&&state.boats.length>0);

  useEffect(()=>{if(mode==='owner'&&setupStarted)saveGame(state);},[state,mode,setupStarted]);
  useEffect(()=>{
    if(mode!=='registered'||!setupStarted)return;
    setSyncStatus('saving');
    const timer=window.setTimeout(()=>syncCompany(state).then(()=>setSyncStatus('saved')).catch(()=>setSyncStatus('error')),1200);
    return()=>window.clearTimeout(timer);
  },[state,mode,setupStarted]);

  const commit=(next:CompanyState)=>{setState(next);if(mode==='owner')saveGame(next);};
  const begin=()=>{if(!captainName.trim()||!companyName.trim())return;commit(createCompany(captainName.trim(),companyName.trim(),companyColor));};
  const chooseMarina=(id:string)=>{try{commit(rentSlip(state,id));}catch(e){alert((e as Error).message)}};
  const chooseBoat=(id:string)=>{try{commit(buyBoat(state,id));}catch(e){alert((e as Error).message)}};
  const insure=()=>{try{commit(insureFleet(state));}catch(e){alert((e as Error).message)}};
  const skipInsurance=(id:string)=>commit(declineInsurance(state,id));
  const startupLoan=(amount:number)=>{try{commit(takeStartupLoan(state,amount));}catch(e){alert((e as Error).message)}};
  const doMaintenance=(instanceId:string,level:'dock'|'100hr'|'300hr')=>{try{commit(maintainBoat(state,instanceId,level));}catch(e){alert((e as Error).message)}};
  const changePrice=(type:TripType,value:number)=>commit(setPrice(state,type,value));

  useEffect(()=>{
    setTripDecisions({});
  },[state.day,ready]);

  useLayoutEffect(()=>{
    if(!setupStarted)return;
    window.scrollTo(0,0);
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    const frame=window.requestAnimationFrame(()=>{
      window.scrollTo(0,0);
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
    });
    return()=>window.cancelAnimationFrame(frame);
  },[state.day,setupStarted]);

  const setTripDecision=(id:string,decision:TripDecision)=>setTripDecisions(prev=>({...prev,[id]:decision}));
  const runDay=()=>{
    if(mode==='demo'&&demoComplete)return;
    if(businessEvent)return;
    if(hurricane&&state.hurricanePlan?.day!==state.day)return;
    if(!hurricane&&todaysBookings.some(b=>!tripDecisions[b.id]))return;
    const out=simulateDay(state,tripDecisions);
    commit(out.state);setLast(out.result);setTab('dock');
    if(mode==='demo'&&out.state.day>7)setDemoComplete(true);
  };
  const reset=()=>{
    if(mode!=='owner')return;
    clearGame();setLast(null);setState(createCompany('',''));setCaptainName('');setCompanyName('');
  };

  if(!setupStarted)return <main className="shell onboarding">
    <header className="heroBrand"><img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="miniBrand"/><div><p>Build your charter company across the islands.</p></div></header>
    <section className="mapCard introMap"><IslandMap active={0} companyValue={0}/></section>
    <section className="card setupCard"><span className="eyebrow">{mode==='demo'?'ONE-WEEK DEMO':mode==='owner'?'DEVELOPMENT TEST':'REGISTERED OWNER'}</span><h2>Start with $10,000 and a dream</h2>
      <label>Captain name<input value={captainName} maxLength={22} placeholder="Captain Jim" onChange={e=>setCaptainName(e.target.value)}/></label>
      <label>Charter company<input value={companyName} maxLength={28} placeholder="Keys Adventure Co." onChange={e=>setCompanyName(e.target.value)}/></label>
      <fieldset className="colorField"><legend>Company color</legend><div className="colorRow">{['#f6c453','#ff8066','#62c8db','#67bb70','#9b7de3'].map(color=><label className={`colorChoice ${companyColor===color?'picked':''}`} key={color} style={{background:color}}><input type="radio" name="companyColor" value={color} checked={companyColor===color} onChange={()=>setCompanyColor(color)}/><span>{companyColor===color?'✓':''}</span></label>)}</div><small>Selected: <i className="selectedColorChip" style={{background:companyColor}}/> {companyColor}</small></fieldset>
      <button className="primary big" disabled={!captainName.trim()||!companyName.trim()} onClick={begin}>Launch Company →</button>
      <p className="fine">{mode==='demo'?'No account. Play the full seven-day Captain School tutorial.':mode==='owner'?'No login. Local save only and excluded from rankings.':`Signed in as ${player?.displayName||player?.display_name||player?.email}. Your company will sync to the cloud.`}</p>
    </section>
  </main>;

  return <main className="shell">
    <header className="brand"><div className="logo" style={{background:state.companyColor}}>IA</div><div className="brandText"><h1>{state.companyName}</h1><p>{state.captainName} · {currentIsland.name}</p></div><div className={`modeBadge ${mode}`}>{mode==='registered'?'ONLINE':mode==='demo'?'DEMO':'TEST'}</div></header>
    {mode==='registered'&&<div className={`syncLine ${syncStatus}`}>{syncStatus==='saving'?'Saving…':syncStatus==='saved'?'Cloud saved':syncStatus==='error'?'Save retry needed':''}</div>}
    <section className="hud"><div><span>Cash</span><strong>{money(state.cash)}</strong></div><div><span>Rating</span><strong>{state.reviewCount?`${state.rating} ★`:'New'}</strong></div><div><span>Company</span><strong>{money(state.companyValue)}</strong></div></section>
    {!demoComplete&&<TutorialCard day={state.day}/>}
    {state.day===8&&mode!=='demo'&&<section className="card weekTwoUnlock"><span className="eyebrow">CAPTAIN SCHOOL COMPLETE</span><h2>Week 2: now you own the decisions.</h2><p>The training wheels are off. Guests want different things, busy season matters, used boats come and go, bills keep showing up, and surprise decisions happen. There is no single right way to build your company now.</p></section>}
    {setupStarted&&<section className="calendarStrip"><div><span>{calendar.monthName.toUpperCase()} {calendar.dayOfMonth} · WEEK {calendar.week}</span><strong>{calendar.season==='busy'?'BUSY SEASON':calendar.season==='warmup'?'WARMING UP':'SLOW SEASON'}</strong></div><p>{calendar.note}</p><b>{calendar.marketingLabel} marketing · Demand ×{calendar.demandMultiplier.toFixed(2)}</b></section>}

    {tab==='dock'&&<>
      <section className="mapCard"><IslandMap active={Math.max(0,islands.findIndex(i=>i.id===state.islandId))} boat={state.boats.length>0} companyValue={state.companyValue}/><div className="mapText"><b>{currentIsland.name}</b><span>{currentIsland.description}</span><small>Tourism {Math.round(currentIsland.tourism*100)} · Fuel {money(currentIsland.fuelPrice)}/gal · {currentIsland.weatherExposure} exposure</small></div></section>

      {!state.marinaId&&<section className="card"><span className="eyebrow">STEP 1</span><h2>Pick your first slip</h2><p className="muted">A marina is your boat’s parking spot. Fancy marinas cost more and make insurance pricier, but guests there tend to tip better.</p>{marinas.filter(m=>m.islandId==='harbor').map(m=><div className="choice" key={m.id}><div><b>{m.name}</b><small>{money(m.monthlySlip)}/mo · storm protection {pct(m.stormProtection)} · insurance ×{m.insuranceMultiplier.toFixed(2)} · tip boost +{Math.round(m.tipBonus*100)}%</small></div><button onClick={()=>chooseMarina(m.id)}>Pick it</button></div>)}</section>}

      {state.marinaId&&!state.boats.length&&!state.startupLoanTaken&&<section className="card startupLoan"><span className="eyebrow">OPTIONAL STARTUP LOAN</span><h2>Borrow money or stay debt-free?</h2><p>You can borrow up to <b>$20,000</b> once, before your first operating day. The rate is ugly: <b>24.99% APR for 2 game years</b>, and the payment comes out every day whether you have bookings or not.</p><div className="loanChoices">{[5000,10000,15000,20000].map(amount=>{const rate=.2499/365;const pay=Math.ceil(amount*rate/(1-Math.pow(1+rate,-730)));return <button type="button" key={amount} onClick={()=>startupLoan(amount)}><b>Borrow {money(amount)}</b><small>about {money(pay)}/game day for 730 days</small></button>})}</div><p className="fine">Taking a loan gives you access to better boats, but the debt cancels out the borrowed cash when company value is calculated.</p></section>}

      {state.marinaId&&!state.boats.length&&<section className="card"><span className="eyebrow">STEP 2</span><h2>Buy your first boat</h2><p className="muted">These are old boats with mixed-age engines. A newer engine with low hours can make an old hull a much better buy. Keep enough cash for fuel, repairs, marketing and service.</p>{boatTemplates.filter(b=>b.lengthFt<=(currentMarina?.maxBoatFt??99)).map(b=><div className="boatCard" key={b.id}><div className="boatSprite">🚤</div><div className="grow"><b>{b.name}</b><small>Hull {b.hullYear} · Engine {b.engineYear} · {b.startingEngineHours} hrs</small><small>{b.lengthFt}′ · {b.seats} guests · reliability {pct(b.reliability)}</small><div className="meters"><span>Comfort <i style={{width:pct(b.comfort)}}/></span><span>Offshore <i style={{width:pct(b.offshore)}}/></span></div></div><div className="buy"><strong>{money(b.basePrice)}</strong><button disabled={state.cash<b.basePrice} onClick={()=>chooseBoat(b.id)}>{state.cash>=b.basePrice?'Buy':'Need cash'}</button></div></div>)}</section>}

      {state.boats.length>0&&!state.boats[0].insured&&!state.boats[0].insuranceDeclined&&<section className="card attention"><span className="eyebrow">STEP 3 · YOUR CALL</span><h2>Insure it or risk it?</h2><p>You can run <b>{state.boats[0].name}</b> without insurance. That saves cash now, but a major hurricane can wipe the boat out completely.</p><div className="quote"><span>One-year premium here</span><strong>{money(insuranceQuote(state.boats[0],currentMarina))}</strong></div><div className="insuranceChoices"><button className="primary" onClick={insure}>🛡️ Buy Insurance</button><button className="riskBtn" onClick={()=>skipInsurance(state.boats[0].instanceId)}>🎲 Skip It & Take the Risk</button></div></section>}

      {ready&&!demoComplete&&hurricane&&<HurricaneCard state={state} event={hurricane} onChange={commit} onRun={runDay}/>}
      {ready&&!demoComplete&&businessEvent&&<BusinessEventCard state={state} event={businessEvent} onChange={commit}/>} 
      {ready&&!demoComplete&&!hurricane&&<section className={`card forecast ${forecast.level}`}><div className="forecastTop"><div><span className="eyebrow">DAY {state.day} · CAPTAIN'S REPORT</span><h2>{forecast.title}</h2></div><div className="weatherIcon">{forecast.level==='good'?'☀️':forecast.level==='caution'?'🌤️':'🌬️'}</div></div><div className="weatherGrid"><div><span>Wind</span><b>{weather.windKts} kt {weather.windDirection}</b></div><div><span>Rain</span><b>{weather.rainChance}%</b></div><div><span>Water</span><b>{Math.round(weather.waterClarity*100)}% clear</b></div><div><span>Temp</span><b>{weather.temperatureF}°</b></div></div><p>{forecast.detail}</p></section>}

      {ready&&!demoComplete&&!hurricane&&<section className="fiveStarGoal"><span>DAILY GOAL</span><strong>Earn 5★ on every completed charter.</strong><small>The game will tell you exactly what would cost a star. Reviews are no longer randomly downgraded.</small></section>}

      {ready&&!demoComplete&&!hurricane&&<section className="card"><div className="sectionHead"><div><span className="eyebrow">TODAY'S CALENDAR</span><h2>{todaysBookings.length?`${todaysBookings.length} booking${todaysBookings.length>1?'s':''}`:'No bookings yet'}</h2></div><strong className="potential">{money(todaysBookings.reduce((s,b)=>s+b.revenue,0))}</strong></div>
        {todaysBookings.length?todaysBookings.map((b,idx)=>{
          const operating=state.boats.slice(0,Math.min(state.boats.length,1+state.staff.length));
          const boat=operating.length?operating[idx%operating.length]:undefined;
          const decision=tripDecisions[b.id];
          const assessment=decision?assessTripPlan(state,b,decision,weather,boat):null;
          return <div className="tripPlan" key={b.id}><div className="booking"><span className="tripEmoji">{tripIcon[b.tripType]}</span><div className="grow"><b>{b.timeSlot[0].toUpperCase()+b.timeSlot.slice(1)} · {state.products.find(p=>p.type===b.tripType)?.name}</b><small>{b.partySize} guests · {b.customerLabel} · via {b.source}{b.boatsRequired>1?' · 2 boats needed':''}{boat?` · ${boat.name}`:''}</small><small className="sourceCost">{sourceFee[b.source]}</small></div><strong>{money(b.revenue)}</strong></div><div className="customerExpect"><b>Guest priorities:</b> {customerProfiles[b.customerType].likes}. <span>{customerProfiles[b.customerType].warning}</span></div><div className="miniChoices"><button type="button" className={tripDecisions[b.id]==='run'?'selected':''} onClick={()=>setTripDecision(b.id,'run')}>🚤 Run as booked</button><button type="button" className={tripDecisions[b.id]==='protected'?'selected':''} onClick={()=>setTripDecision(b.id,'protected')}>🛟 Protected</button><button type="button" className={tripDecisions[b.id]==='cancel'?'selected':''} onClick={()=>setTripDecision(b.id,'cancel')}>📅 Reschedule</button></div>{assessment&&<div className={`reviewPreview stars${assessment.stars}`}><b>{assessment.headline}</b>{assessment.reasons.length>0&&<ul>{assessment.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul>}</div>}</div>;
        }):<div className="quietDay"><h3>Nothing booked today.</h3><p className="muted">You can use the quiet day to work on a boat, or close the calendar and move to tomorrow.</p>{state.boats.map(b=>{const svc=serviceStatus(b);return <div className="quietBoat" key={b.instanceId}><div><b>{b.name}</b><small>Hull {b.year} · Engine {b.engineYear} · {b.engineHours.toFixed(1)} hrs</small><em className={svc.kind==='ok'?'serviceOk':'serviceDue'}>{svc.label}</em></div><div className="quietActions"><button type="button" onClick={()=>doMaintenance(b.instanceId,'dock')}>Dock check $75</button><button type="button" disabled={svc.kind==='300hr'} onClick={()=>doMaintenance(b.instanceId,'100hr')}>100-hour $350</button><button type="button" onClick={()=>doMaintenance(b.instanceId,'300hr')}>300-hour $700</button></div></div>})}{businessEvent&&<p className="eventBlockNotice">Make today’s owner decision before closing the day.</p>}<button className="primary big" disabled={Boolean(businessEvent)} onClick={runDay}>Close the Day →</button></div>}
        {todaysBookings.length>0&&<><div className="decisionTitle">Captain's plan for the day</div>{state.day===1&&<p className="captainHint">17 kt east wind. Each trip gets its own decision. The morning sandbar and afternoon snorkel do not have to use the same plan.</p>}{businessEvent&&<p className="eventBlockNotice">Pick an owner decision first.</p>}{hurricane&&state.hurricanePlan?.day!==state.day&&<p className="eventBlockNotice">Choose whether to haul the fleet or leave it in the water.</p>}{!hurricane&&todaysBookings.some(b=>!tripDecisions[b.id])&&<p className="tripChoiceNotice">Make a choice for each trip.</p>}<button className="primary big" disabled={Boolean(businessEvent)||(Boolean(hurricane)&&state.hurricanePlan?.day!==state.day)||(!hurricane&&todaysBookings.some(b=>!tripDecisions[b.id]))} onClick={runDay}>{hurricane?'Face the Storm →':"Run Today's Plan →"}</button></>}
      </section>}

      {last&&<section className="card event"><span className="eyebrow">CAPTAIN'S LOG · DAY {last.weather.day}</span><h2>{last.tripsRun?'Boats are back at the dock':'Day closed out'}</h2>{last.tripOutcomes.map(x=><p className="story" key={x.bookingId}><b>{x.timeSlot} {state.products.find(p=>p.type===x.tripType)?.name}:</b> {x.note}</p>)}{last.hurricaneSummary&&<p className="story hurricaneStory">🌀 {last.hurricaneSummary}</p>}{last.destroyedBoatNames?.length?<p className="story danger">Destroyed: {last.destroyedBoatNames.join(', ')}</p>:null}{last.wildlifeEvent&&<p className="story">🐬 {last.wildlifeEvent}</p>}{last.maintenanceEvent&&<p className="story danger">🔧 {last.maintenanceEvent}</p>}{last.loanPayment>0&&<p className="story financeStory">💳 Loan payments today: {money(last.loanPayment)}</p>}<div className="resultGrid"><div><span>Fares</span><b>{money(last.revenue)}</b></div><div><span>Tips</span><b>{money(last.tips)}</b></div><div><span>Expenses</span><b>-{money(last.expenses)}</b></div><div><span>Net cash</span><b>{money(last.revenue+last.tips-last.expenses)}</b></div></div>{last.reviews.map((r,i)=><blockquote key={i}><b>{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</b> “{r.text}”{r.stars<5&&<div className="reviewCause"><strong>Why this wasn't 5★</strong><ul>{r.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul></div>}</blockquote>)}</section>}

      {demoComplete&&<section className="card demoComplete"><span className="eyebrow">WEEK 1 COMPLETE</span><h2>You graduated from Captain School.</h2><p>You completed all seven tutorial days. Create a free owner account to keep building boats, reviews, revenue and company value. Registered companies are eligible for the Island leaderboards.</p><button className="primary big" onClick={onUpgrade}>Create Account & Keep Playing →</button><p className="fine">Your demo is intentionally not ranked.</p></section>}
    </>}

    {tab==='trips'&&<><section className="card page"><MarketingPanel state={state} onChange={commit}/><span className="eyebrow">PRICING</span><h2>Your charter menu</h2><p className="muted">Higher prices improve margin but can lower conversion.</p>{state.products.map(p=><div className="priceCard" key={p.type}><div className="tripEmoji">{tripIcon[p.type]}</div><div className="grow"><b>{p.name}</b><small>{p.durationHours} hours · demand {pct(p.baseDemand)}</small></div><label className="priceInput"><span>$</span><input type="number" min="99" step="10" value={p.price} disabled={demoComplete} onChange={e=>changePrice(p.type,Number(e.target.value))}/></label></div>)}</section></>}

    {tab==='fleet'&&<><section className="card page"><span className="eyebrow">FLEET</span><h2>{state.boats.length?`${state.boats.length} boat${state.boats.length>1?'s':''}`:'No boat yet'}</h2>{state.boats.map(b=>{const svc=serviceStatus(b);return <div key={b.instanceId} className="fleetSummary"><div className="bigBoat">🚤</div><h3>{b.name}</h3><div className="stats"><div><span>Hull year</span><b>{b.year}</b></div><div><span>Engine year</span><b>{b.engineYear}</b></div><div><span>Condition</span><b>{pct(b.condition)}</b></div><div><span>Reliability</span><b>{pct(b.reliability)}</b></div><div><span>Engine hours</span><b>{b.engineHours.toFixed(1)}</b></div><div><span>Next service</span><b className={svc.kind==='ok'?'positive':'negative'}>{svc.kind==='ok'?`${svc.dueAt} hrs`:svc.label}</b></div><div><span>Insurance</span><b>{b.insured?'Covered':'No coverage'}</b></div></div></div>})}</section><MarketplacePanel state={state} onChange={commit}/><GrowthPanel state={state} onChange={commit}/></>}

    {tab==='books'&&<><ProgressGoals state={state}/><section className="card page"><span className="eyebrow">COMPANY BOOKS</span><h2>{state.companyName}</h2><div className="resultGrid"><div><span>Fares + tips earned</span><b>{money(state.lifetimeRevenue)}</b></div><div><span>Lifetime profit</span><b>{money(state.lifetimeProfit)}</b></div><div><span>Debt</span><b>{money(state.debt)}</b></div><div><span>Daily loan payments</span><b>{money((state.loans??[]).reduce((s,l)=>s+l.dailyPayment,0))}</b></div><div><span>Days operated</span><b>{state.daysOperated}</b></div></div><h3>Recent ledger</h3>{state.ledger.slice(-8).reverse().map((x,i)=><div className="ledger" key={`${x.day}-${i}`}><span>Day {x.day} · {x.memo}</span><b className={x.amount>=0?'positive':'negative'}>{x.amount>=0?'+':''}{money(x.amount)}</b></div>)}{mode==='owner'&&<button className="dangerBtn" onClick={reset}>Reset Development Save</button>}</section></>}

    {tab==='leaders'&&<Leaderboard registered={mode==='registered'}/>}

    <nav className="bottomNav"><button className={tab==='dock'?'active':''} onClick={()=>setTab('dock')}><span>⚓</span>Dock</button><button className={tab==='trips'?'active':''} onClick={()=>setTab('trips')}><span>🗓️</span>Trips</button><button className={tab==='fleet'?'active':''} onClick={()=>setTab('fleet')}><span>🚤</span>Fleet</button><button className={tab==='leaders'?'active':''} onClick={()=>setTab('leaders')}><span>🏆</span>Rank</button><button className={tab==='books'?'active':''} onClick={()=>setTab('books')}><span>📒</span>Books</button></nav>
  </main>;
}

function IslandMap({active,boat=false,companyValue=0}:{active:number;boat?:boolean;companyValue?:number}){
  return <div className="ocean">{islands.map((i,idx)=><div key={i.id} className={`island i${idx} ${idx===active?'active':''} ${companyValue>=i.unlockValue?'unlocked':'locked'}`}><span>{i.id==='reef'?'🪸':'🌴'}</span><small>{i.name}</small>{companyValue<i.unlockValue&&<em>🔒</em>}</div>)}{boat&&<div className="mapBoat">🚤</div>}<div className="wave w1">≈≈≈</div><div className="wave w2">≈≈</div></div>;
}
