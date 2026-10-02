import { useEffect,useLayoutEffect,useMemo,useRef,useState } from 'react';
import { boatTemplates,islands,marinas } from '../game/data/content';
import { assessTripPlan,buyBoat,createCompany,declineInsurance,generateDemand,generateWeather,insuranceQuote,insureFleet,rentSlip,setPrice,simulateDay,takeStartupLoan,weatherLabel } from '../game/engine/sim';
import { businessEventForDay,calendarForDay,customerProfiles,maintainBoat,serviceStatus } from '../game/engine/depth';
import { hurricaneForDay } from '../game/engine/hurricane';
import { normalizeState } from '../game/engine/save';
import type { CompanyState,DayResult,MarketingMarketSnapshot,TripDecision,TripType } from '../game/types/models';
import type { GameMode } from './StartMode';
import type { Player } from './api';
import { completeTutorial,loadMarketingMarket,logout,syncCompany } from './api';
import Leaderboard from './Leaderboard';
import TutorialCard,{type TutorialTab} from './TutorialCard';
import GrowthPanel from './GrowthPanel';
import MarketingPanel from './MarketingPanel';
import MarketplacePanel from './MarketplacePanel';
import BusinessEventCard from './BusinessEventCard';
import ProgressGoals from './ProgressGoals';
import HurricaneCard from './HurricaneCard';
import HelpPanel from './HelpPanel';
import GameMenu from './GameMenu';
import { playDayResultSounds,playGameSound } from './sound';
import BoatArt from './BoatArt';
import './styles.css';

const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const pct=(n:number)=>`${Math.round(n*100)}%`;
const tripIcon:Record<string,string>={sandbar:'🏝️',snorkel:'🤿',sunset:'🌅',custom:'🧭',eco:'🐬',fishing:'🎣',cruise:'🚤'};
const sourceFee:Record<string,string>={marketplace:'25% booking-site fee',hotel:'15% hotel referral fee',search:'Google Search · ad cost already paid',organic:'Direct · no booking fee',maps:'Google Maps · ad cost already paid',social:'Social · ad cost already paid',referral:'Direct · no booking fee',repeat:'Direct · no booking fee',paid:'Direct · ad cost already paid',content:'Content/PR · no booking fee'};
const companyColors=[
  {name:'Sunshine Yellow',value:'#f6c453'},
  {name:'Sunset Coral',value:'#ff8066'},
  {name:'Island Aqua',value:'#62c8db'},
  {name:'Palm Green',value:'#67bb70'},
  {name:'Reef Purple',value:'#9b7de3'}
];

export default function App({mode,player,initialState,onUpgrade,onReturnTitle,onSwitchMode}:{mode:GameMode;player?:Player;initialState?:CompanyState;onUpgrade:()=>void;onReturnTitle:()=>void;onSwitchMode:()=>void}){
  const [state,setState]=useState<CompanyState>(()=>initialState?normalizeState(initialState):createCompany('',''));
  const [last,setLast]=useState<DayResult|null>(null);
  const [tab,setTab]=useState<'dock'|'grow'|'fleet'|'books'|'leaders'>('dock');
  const [tripDecisions,setTripDecisions]=useState<Record<string,TripDecision>>({});
  const [captainName,setCaptainName]=useState(state.captainName);
  const [companyName,setCompanyName]=useState(state.companyName);
  const [companyColor,setCompanyColor]=useState(state.companyColor||'#f6c453');
  const [demoComplete,setDemoComplete]=useState(mode==='demo'&&state.day>7);
  const [syncStatus,setSyncStatus]=useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [choiceSaved,setChoiceSaved]=useState(false);
  const choiceSavedTimer=useRef<number|undefined>(undefined);
  const [marketingMarket,setMarketingMarket]=useState<MarketingMarketSnapshot|undefined>();
  const [tutorialSpotlight,setTutorialSpotlight]=useState<TutorialTab|null>(null);
  const [helpOpen,setHelpOpen]=useState(false);
  const [captainSchoolActive,setCaptainSchoolActive]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [signingOut,setSigningOut]=useState(false);
  const [registeredTutorialComplete,setRegisteredTutorialComplete]=useState(
    Boolean(player?.tutorialCompleted||player?.tutorial_completed||(mode==='registered'&&state.day>7))
  );

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
  const calendar=useMemo(()=>calendarForDay(state.day,state,marketingMarket),[state,marketingMarket]);
  const hurricane=useMemo(()=>hurricaneForDay(state),[state.day,state.seed]);
  const businessEvent=useMemo(()=>hurricane?null:businessEventForDay(state),[state.day,state.seed,state.lastBusinessEventDay,hurricane]);
  const todaysBookings=useMemo(()=>generateDemand(state,weather,marketingMarket,mode==='demo'),[state,weather,marketingMarket,mode]);
  const currentIsland=islands.find(i=>i.id===state.islandId)??islands[0];
  const currentMarina=marinas.find(m=>m.id===state.marinaId);
  const ready=Boolean(currentMarina&&state.boats.length>0);
  const showTutorial=mode==='demo'
    ? !demoComplete&&state.day<=7
    : !registeredTutorialComplete&&state.day<=7;
  const tutorialNavigate=(next:TutorialTab)=>{
    setTab(next);
    window.requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'smooth'}));
  };
  const finishRegisteredTutorial=()=>{
    if(mode!=='registered')return;
    setRegisteredTutorialComplete(true);
    completeTutorial().catch(()=>{});
  };

  useEffect(()=>{
    if(!setupStarted)return;
    let alive=true;
    const refresh=()=>loadMarketingMarket().then(data=>{if(alive)setMarketingMarket(data)}).catch(()=>{});
    refresh();
    const timer=window.setInterval(refresh,60000);
    return()=>{alive=false;window.clearInterval(timer)};
  },[setupStarted]);

  useEffect(()=>{
    if(mode!=='registered'||!setupStarted)return;
    setSyncStatus('saving');
    const timer=window.setTimeout(()=>syncCompany(state).then(()=>setSyncStatus('saved')).catch(()=>setSyncStatus('error')),1200);
    return()=>window.clearTimeout(timer);
  },[state,mode,setupStarted]);

  const commit=(next:CompanyState)=>{
    setState(next);
    if(state.day<=7&&(tab==='grow'||tab==='fleet')){
      setChoiceSaved(true);
      if(choiceSavedTimer.current)window.clearTimeout(choiceSavedTimer.current);
      choiceSavedTimer.current=window.setTimeout(()=>setChoiceSaved(false),1800);
    }
  };
  const begin=()=>{if(!captainName.trim()||!companyName.trim())return;commit(createCompany(captainName.trim(),companyName.trim(),companyColor));};
  const chooseMarina=(id:string)=>{try{commit(rentSlip(state,id));}catch(e){alert((e as Error).message)}};
  const chooseBoat=(id:string)=>{try{commit(buyBoat(state,id));}catch(e){alert((e as Error).message)}};
  const insure=()=>{try{commit(insureFleet(state));}catch(e){alert((e as Error).message)}};
  const skipInsurance=(id:string)=>commit(declineInsurance(state,id));
  const startupLoan=(amount:number)=>{try{commit(takeStartupLoan(state,amount));}catch(e){alert((e as Error).message)}};
  const doMaintenance=(instanceId:string,level:'dock'|'100hr'|'300hr')=>{try{commit(maintainBoat(state,instanceId,level));playGameSound('service');}catch(e){alert((e as Error).message)}};
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
    const tripsLeavingDock=!hurricane&&todaysBookings.some(b=>(tripDecisions[b.id]??'run')!=='cancel');
    if(tripsLeavingDock)playGameSound('motor');
    const out=simulateDay(state,tripDecisions,marketingMarket,mode==='demo');
    commit(out.state);setLast(out.result);setTab('dock');
    playDayResultSounds(out.result,state.day);
    if(mode==='demo'&&out.state.day>7)setDemoComplete(true);
  };
  const continueAfterResults=()=>{
    setLast(null);
    setTripDecisions({});
    setTab('dock');
    window.scrollTo(0,0);
  };
  const restartDemo=()=>{
    if(mode!=='demo')return;
    const fresh=createCompany('','');
    setLast(null);
    setState(fresh);
    setCaptainName('');
    setCompanyName('');
    setCompanyColor(fresh.companyColor||'#f6c453');
    setTripDecisions({});
    setTab('dock');
    setDemoComplete(false);
    setCaptainSchoolActive(false);
    setMenuOpen(false);
    setHelpOpen(false);
    window.scrollTo(0,0);
  };
  const signOutAccount=async()=>{
    if(mode!=='registered'||signingOut)return;
    setSigningOut(true);
    try{
      if(setupStarted)await syncCompany(state).catch(()=>{});
      await logout();
      onReturnTitle();
    }catch(e){
      alert((e as Error).message||'Could not sign out. Please try again.');
      setSigningOut(false);
    }
  };
  const openHelpFromMenu=()=>{
    setMenuOpen(false);
    setHelpOpen(true);
  };
  const modeControl=mode==='registered'
    ? <button type="button" className="gameHeaderControl signOutControl" disabled={signingOut} onClick={signOutAccount}>{signingOut?'Signing out…':'Sign out'}</button>
    : <button type="button" className="gameHeaderControl" onClick={()=>setMenuOpen(true)}>☰ Menu</button>;

  if(last)return <main className="shell dayDebriefShell">
    <header className="brand"><div className="logo" style={{background:state.companyColor}}><img src="/branding/island-adventures-logo-mobile.png" alt="" aria-hidden="true"/></div><div className="brandText"><h1>{mode==='demo'?'Island Adventures Demo':state.companyName}</h1><p>{mode==='demo'?currentIsland.name:`${state.captainName} · ${currentIsland.name}`}</p></div><div className="headerModeActions"><div className={`modeBadge ${mode}`}>{mode==='registered'?'ONLINE':'DEMO'}</div>{modeControl}</div></header>
    <section className="card event dayDebrief">
      <span className="eyebrow">DAY {last.weather.day} COMPLETE · CAPTAIN'S LOG</span>
      <h2>{last.tripsRun?`${last.tripsRun} charter${last.tripsRun===1?'':'s'} complete`:'Day closed out'}</h2>
      <p className="dayDebriefIntro">Day {state.day} has not started yet. Review what your choices caused before moving on.</p>
      {last.tripOutcomes.map(x=><p className="story" key={x.bookingId}><b>{x.timeSlot[0].toUpperCase()+x.timeSlot.slice(1)} {state.products.find(p=>p.type===x.tripType)?.name}:</b> {x.note}</p>)}
      {last.hurricaneSummary&&<p className="story hurricaneStory">🌀 {last.hurricaneSummary}</p>}
      {last.destroyedBoatNames?.length?<p className="story danger">Destroyed: {last.destroyedBoatNames.join(', ')}</p>:null}
      {last.wildlifeEvent&&<p className="story">🐬 {last.wildlifeEvent}</p>}
      {last.maintenanceEvent&&<p className="story danger">🔧 {last.maintenanceEvent}</p>}
      {last.loanPayment>0&&<p className="story financeStory">💳 Loan payments today: {money(last.loanPayment)}</p>}
      <div className="resultGrid"><div><span>Fares</span><b>{money(last.revenue)}</b></div><div><span>Tips</span><b>{money(last.tips)}</b></div><div><span>Expenses</span><b>-{money(last.expenses)}</b></div><div><span>Net cash</span><b>{money(last.revenue+last.tips-last.expenses)}</b></div></div>
      {last.reviews.length?<div className="dayReviews"><h3>Guest reviews</h3>{last.reviews.map((r,i)=><blockquote key={i}><b>{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</b> “{r.text}”{mode==='demo'&&r.stars<5&&<div className="reviewCause"><strong>Why this wasn't 5★</strong><ul>{r.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul></div>}</blockquote>)}</div>:<p className="muted">No guest review was posted today.</p>}
      <div className="dayAdvanceBox"><b>{demoComplete?'Captain School week complete.':`Next up: Day ${state.day}`}</b><span>{demoComplete?'Your graduation screen is next.':'The next forecast and bookings appear only after you continue.'}</span></div>
      <button className="primary big" onClick={continueAfterResults}>{demoComplete?'See Captain School Graduation →':`Start Day ${state.day} →`}</button>
    </section>
    {menuOpen&&mode!=='registered'&&<GameMenu onClose={()=>setMenuOpen(false)} onReturnTitle={onReturnTitle} onSwitchMode={onSwitchMode} onRestartDemo={restartDemo} onHelp={openHelpFromMenu}/>}
    {helpOpen&&<HelpPanel onClose={()=>setHelpOpen(false)}/>}
  </main>;

  if(!setupStarted)return <main className="shell onboarding">
    <div className="onboardingGameControl">{modeControl}</div>
    {menuOpen&&mode==='demo'&&<GameMenu onClose={()=>setMenuOpen(false)} onReturnTitle={onReturnTitle} onSwitchMode={onSwitchMode} onRestartDemo={restartDemo} onHelp={openHelpFromMenu}/>}
    {helpOpen&&<HelpPanel onClose={()=>setHelpOpen(false)}/>}
    <header className="heroBrand"><img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="miniBrand"/><div><p>Build your charter company across the islands.</p></div></header>
    <section className="mapCard introMap"><IslandMap active={0} companyValue={0}/></section>
    <section className="card setupCard"><span className="eyebrow">{mode==='demo'?'ONE-WEEK DEMO':'REGISTERED OWNER'}</span><h2>Start with $10,000 and a dream</h2>
      <label>Captain name<input value={captainName} maxLength={22} placeholder="Captain Jim" onChange={e=>setCaptainName(e.target.value)}/></label>
      <label>Charter company<input value={companyName} maxLength={28} placeholder="Keys Adventure Co." onChange={e=>setCompanyName(e.target.value)}/></label>
      <fieldset className="colorField"><legend>Company color</legend><div className="colorRow">{companyColors.map(color=><label className={`colorChoice ${companyColor===color.value?'picked':''}`} key={color.value} style={{background:color.value}} title={color.name}><input type="radio" name="companyColor" value={color.value} checked={companyColor===color.value} onChange={()=>setCompanyColor(color.value)}/><span>{companyColor===color.value?'✓':''}</span></label>)}</div><small>Selected: <i className="selectedColorChip" style={{background:companyColor}}/> {companyColors.find(color=>color.value===companyColor)?.name??'Custom Color'}</small></fieldset>
      <button className="primary big" disabled={!captainName.trim()||!companyName.trim()} onClick={begin}>Launch Company →</button>
      <p className="fine">{mode==='demo'?'No account. Play the full seven-day Captain School tutorial.':`Signed in as ${player?.displayName||player?.display_name||player?.email}. Your company will sync to the cloud.`}</p>
    </section>
  </main>;

  return <main className="shell">
    <header className="brand"><div className="logo" style={{background:state.companyColor}}><img src="/branding/island-adventures-logo-mobile.png" alt="" aria-hidden="true"/></div><div className="brandText"><h1>{mode==='demo'?'Island Adventures Demo':state.companyName}</h1><p>{mode==='demo'?currentIsland.name:`${state.captainName} · ${currentIsland.name}`}</p></div><div className="headerModeActions"><div className={`modeBadge ${mode}`}>{mode==='registered'?'ONLINE':'DEMO'}</div>{modeControl}</div></header>
    {mode==='registered'&&<div className={`syncLine ${syncStatus}`}>{syncStatus==='saving'?'Saving…':syncStatus==='saved'?'Cloud saved':syncStatus==='error'?'Save retry needed':''}</div>}
    <section className="hud"><div><span>Cash</span><strong>{money(state.cash)}</strong></div><div><span>Rating</span><strong>{state.reviewCount?`${state.rating} ★`:'New'}</strong></div><div><span>Company</span><strong>{money(state.companyValue)}</strong></div></section>
    {showTutorial&&<TutorialCard day={state.day} mode={mode} playerId={player?.id} onNavigate={tutorialNavigate} onSpotlight={setTutorialSpotlight} onWeekComplete={finishRegisteredTutorial} onActiveChange={setCaptainSchoolActive}/>} 
    {state.day===8&&mode!=='demo'&&<section className="card weekTwoUnlock"><span className="eyebrow">CAPTAIN SCHOOL COMPLETE</span><h2>Week 2: now you own the decisions.</h2><p>The training wheels are off. Guests want different things, busy season matters, used boats come and go, bills keep showing up, and surprise decisions happen. There is no single right way to build your company now.</p></section>}
    {setupStarted&&<section className="calendarStrip"><div><span>{calendar.monthName.toUpperCase()} {calendar.dayOfMonth} · WEEK {calendar.week}</span><strong>{calendar.season==='busy'?'BUSY SEASON':calendar.season==='warmup'?'WARMING UP':'SLOW SEASON'}</strong></div><p>{calendar.note}</p><b>{calendar.marketingLabel} marketing · Demand ×{calendar.demandMultiplier.toFixed(2)}</b></section>}

    {tab==='dock'&&<>
      <section className="mapCard"><IslandMap active={Math.max(0,islands.findIndex(i=>i.id===state.islandId))} boatClass={state.boats[0]?.class} companyValue={state.companyValue}/><div className="mapText"><b>{currentIsland.name}</b><span>{currentIsland.description}</span><small>Tourism {Math.round(currentIsland.tourism*100)} · Fuel {money(currentIsland.fuelPrice)}/gal · {currentIsland.weatherExposure} exposure</small></div></section>

      {!state.marinaId&&<section className="card"><span className="eyebrow">STEP 1</span><h2>Pick your first slip</h2><p className="muted">A marina is your boat’s parking spot. Fancy marinas cost more and make insurance pricier, but guests there tend to tip better.</p>{marinas.filter(m=>m.islandId==='harbor').map(m=><div className="choice" key={m.id}><div><b>{m.name}</b><small>{money(m.monthlySlip)}/mo · storm protection {pct(m.stormProtection)} · insurance ×{m.insuranceMultiplier.toFixed(2)} · tip boost +{Math.round(m.tipBonus*100)}%</small></div><button onClick={()=>chooseMarina(m.id)}>Pick it</button></div>)}</section>}

      {state.marinaId&&!state.boats.length&&!state.startupLoanTaken&&<section className="card startupLoan"><span className="eyebrow">OPTIONAL STARTUP LOAN</span><h2>Borrow money or stay debt-free?</h2><p>You can borrow up to <b>$20,000</b> once, before your first operating day. The rate is ugly: <b>24.99% APR for 2 game years</b>, and the payment comes out every day whether you have bookings or not.</p><div className="loanChoices">{[5000,10000,15000,20000].map(amount=>{const rate=.2499/365;const pay=Math.ceil(amount*rate/(1-Math.pow(1+rate,-730)));return <button type="button" key={amount} onClick={()=>startupLoan(amount)}><b>Borrow {money(amount)}</b><small>about {money(pay)}/game day for 730 days</small></button>})}</div><p className="fine">Taking a loan gives you access to better boats, but the debt cancels out the borrowed cash when company value is calculated.</p></section>}

      {state.marinaId&&!state.boats.length&&<section className="card"><span className="eyebrow">STEP 2</span><h2>Buy your first boat</h2><p className="muted">These are old boats with mixed-age engines. A newer engine with low hours can make an old hull a much better buy. Keep enough cash for fuel, repairs, marketing and service.</p>{boatTemplates.filter(b=>b.lengthFt<=(currentMarina?.maxBoatFt??99)).map(b=><div className="boatCard" key={b.id}><div className="boatSprite"><BoatArt kind={b.class}/></div><div className="grow"><b>{b.name}</b><small>Hull {b.hullYear} · Engine {b.engineYear} · {b.startingEngineHours} hrs</small><small>{b.lengthFt}′ · {b.seats} guests · reliability {pct(b.reliability)}</small><div className="meters"><span>Comfort <i style={{width:pct(b.comfort)}}/></span><span>Offshore <i style={{width:pct(b.offshore)}}/></span></div></div><div className="buy"><strong>{money(b.basePrice)}</strong><button disabled={state.cash<b.basePrice} onClick={()=>chooseBoat(b.id)}>{state.cash>=b.basePrice?'Buy':'Need cash'}</button></div></div>)}</section>}

      {state.boats.length>0&&!state.boats[0].insured&&!state.boats[0].insuranceDeclined&&<section className="card attention"><span className="eyebrow">STEP 3 · YOUR CALL</span><h2>Insure it or risk it?</h2><p>You can run <b>{state.boats[0].name}</b> without insurance. That saves cash now, but a major hurricane can wipe the boat out completely.</p><div className="quote"><span>One-year premium here</span><strong>{money(insuranceQuote(state.boats[0],currentMarina))}</strong></div><div className="insuranceChoices"><button className="primary" onClick={insure}>🛡️ Buy Insurance</button><button className="riskBtn" onClick={()=>skipInsurance(state.boats[0].instanceId)}>🎲 Skip It & Take the Risk</button></div></section>}

      {ready&&!demoComplete&&hurricane&&<HurricaneCard state={state} event={hurricane} onChange={commit} onRun={runDay}/>}
      {ready&&!demoComplete&&businessEvent&&<BusinessEventCard state={state} event={businessEvent} onChange={commit}/>} 
      {ready&&!demoComplete&&!hurricane&&<section className={`card forecast ${forecast.level}`}><div className="forecastTop"><div><span className="eyebrow">DAY {state.day} · CAPTAIN'S REPORT</span><h2>{forecast.title}</h2></div><div className="weatherIcon">{forecast.level==='good'?'☀️':forecast.level==='caution'?'🌤️':'🌬️'}</div></div><div className="weatherGrid"><div><span>Wind</span><b>{weather.windKts} kt {weather.windDirection}</b></div><div><span>Rain</span><b>{weather.rainChance}%</b></div><div><span>Water</span><b>{Math.round(weather.waterClarity*100)}% clear</b></div><div><span>Temp</span><b>{weather.temperatureF}°</b></div></div><p>{forecast.detail}</p></section>}

      {ready&&!demoComplete&&!hurricane&&<section className="fiveStarGoal"><span>DAILY GOAL</span><strong>Earn 5★ on every completed charter.</strong>{mode==='demo'&&<small>The game will tell you exactly what would cost a star. Reviews are no longer randomly downgraded.</small>}</section>}

      {ready&&!demoComplete&&!hurricane&&<section className="card"><div className="sectionHead"><div><span className="eyebrow">TODAY'S CALENDAR</span><h2>{todaysBookings.length?`${todaysBookings.length} booking${todaysBookings.length>1?'s':''}`:'No bookings yet'}</h2></div><strong className="potential">{money(todaysBookings.reduce((s,b)=>s+b.revenue,0))}</strong></div>
        {todaysBookings.length?todaysBookings.map((b,idx)=>{
          const operating=state.boats.slice(0,Math.min(state.boats.length,1+state.staff.length));
          const boat=operating.length?operating[idx%operating.length]:undefined;
          const decision=tripDecisions[b.id];
          const assessment=decision?assessTripPlan(state,b,decision,weather,boat):null;
          return <div className="tripPlan" key={b.id}><div className="booking"><span className="tripEmoji">{tripIcon[b.tripType]}</span><div className="grow"><b>{b.timeSlot[0].toUpperCase()+b.timeSlot.slice(1)} · {state.products.find(p=>p.type===b.tripType)?.name}</b><small>{b.partySize} guests · {b.customerLabel} · via {b.source}{b.boatsRequired>1?' · 2 boats needed':''}{boat?` · ${boat.name}`:''}</small><small className="sourceCost">{sourceFee[b.source]}</small></div><strong>{money(b.revenue)}</strong></div><div className="customerExpect"><b>Guest priorities:</b> {customerProfiles[b.customerType].likes}. <span>{customerProfiles[b.customerType].warning}</span></div><div className="miniChoices"><button type="button" className={tripDecisions[b.id]==='run'?'selected':''} onClick={()=>setTripDecision(b.id,'run')}>🚤 Run as booked</button><button type="button" className={tripDecisions[b.id]==='protected'?'selected':''} onClick={()=>setTripDecision(b.id,'protected')}>🛟 Protected</button><button type="button" className={tripDecisions[b.id]==='cancel'?'selected':''} onClick={()=>setTripDecision(b.id,'cancel')}>📅 Reschedule</button></div>{mode==='demo'&&assessment&&<div className="reviewPreview"><b>{assessment.reasons.length?'Captain School warning':'Captain School check'}</b>{assessment.reasons.length>0?<ul>{assessment.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul>:<p>This plan protects the guest experience.</p>}</div>}</div>;
        }):<div className="quietDay"><h3>Nothing booked today.</h3><p className="muted">You can use the quiet day to work on a boat, or close the calendar and move to tomorrow.</p>{state.boats.map(b=>{const svc=serviceStatus(b);return <div className="quietBoat" key={b.instanceId}><div><b>{b.name}</b><small>Hull {b.year} · Engine {b.engineYear} · {b.engineHours.toFixed(1)} hrs</small><em className={svc.kind==='ok'?'serviceOk':'serviceDue'}>{svc.label}</em></div><div className="quietActions"><button type="button" onClick={()=>doMaintenance(b.instanceId,'dock')}>Dock check $75</button><button type="button" disabled={svc.kind==='300hr'} onClick={()=>doMaintenance(b.instanceId,'100hr')}>100-hour $350</button><button type="button" onClick={()=>doMaintenance(b.instanceId,'300hr')}>300-hour $700</button></div></div>})}{businessEvent&&<p className="eventBlockNotice">Make today’s owner decision before closing the day.</p>}<button className="primary big" disabled={Boolean(businessEvent)} onClick={runDay}>Close the Day →</button></div>}
        {todaysBookings.length>0&&<><div className="decisionTitle">Captain's plan for the day</div>{state.day===1&&<p className="captainHint">17 kt east wind. Each trip gets its own decision. The morning sandbar and afternoon snorkel do not have to use the same plan.</p>}{businessEvent&&<p className="eventBlockNotice">Pick an owner decision first.</p>}{hurricane&&state.hurricanePlan?.day!==state.day&&<p className="eventBlockNotice">Choose whether to haul the fleet or leave it in the water.</p>}{!hurricane&&todaysBookings.some(b=>!tripDecisions[b.id])&&<p className="tripChoiceNotice">Make a choice for each trip.</p>}<button className="primary big" data-sound={todaysBookings.some(b=>(tripDecisions[b.id]??'run')!=='cancel')?'none':undefined} disabled={Boolean(businessEvent)||(Boolean(hurricane)&&state.hurricanePlan?.day!==state.day)||(!hurricane&&todaysBookings.some(b=>!tripDecisions[b.id]))} onClick={runDay}>{hurricane?'Face the Storm →':"Run Today's Plan →"}</button></>}
      </section>}


      {demoComplete&&<section className="card demoComplete"><span className="eyebrow">WEEK 1 COMPLETE</span><h2>You graduated from Captain School.</h2><p>You completed all seven tutorial days. Create a free owner account to keep building boats, reviews, revenue and company value. Registered companies are eligible for the Island leaderboards.</p><button className="primary big" onClick={onUpgrade}>Create Account & Keep Playing →</button><p className="fine">Your demo is intentionally not ranked.</p></section>}
    </>}

    {tab==='grow'&&<>{state.day<=7&&<div className="tutorialAutoSaveBar">✓ Choices are saved as you make them. No Save button needed—tap <b>Dock</b> when you’re finished.</div>}<section className="card page"><MarketingPanel state={state} onChange={commit} market={marketingMarket}/><span className="eyebrow">PRICING</span><h2>Your charter menu</h2><p className="muted">Higher prices improve margin but can lower conversion.</p>{state.products.map(p=><div className="priceCard" key={p.type}><div className="tripEmoji">{tripIcon[p.type]}</div><div className="grow"><b>{p.name}</b><small>{p.durationHours} hours · demand {pct(p.baseDemand)}</small></div><label className="priceInput"><span>$</span><input type="number" min="99" step="10" value={p.price} disabled={demoComplete} onChange={e=>changePrice(p.type,Number(e.target.value))}/></label></div>)}</section></>}

    {tab==='fleet'&&<>{state.day<=7&&<div className="tutorialAutoSaveBar">✓ Choices are saved as you make them. No Save button needed—tap <b>Dock</b> when you’re finished.</div>}<section className="card page"><span className="eyebrow">FLEET</span><h2>{state.boats.length?`${state.boats.length} boat${state.boats.length>1?'s':''}`:'No boat yet'}</h2>{state.boats.map(b=>{const svc=serviceStatus(b);return <div key={b.instanceId} className="fleetSummary"><div className="bigBoat"><BoatArt kind={b.class}/></div><h3>{b.name}</h3><div className="stats"><div><span>Hull year</span><b>{b.year}</b></div><div><span>Engine year</span><b>{b.engineYear}</b></div><div><span>Condition</span><b>{pct(b.condition)}</b></div><div><span>Reliability</span><b>{pct(b.reliability)}</b></div><div><span>Engine hours</span><b>{b.engineHours.toFixed(1)}</b></div><div><span>Next service</span><b className={svc.kind==='ok'?'positive':'negative'}>{svc.label}</b></div><div><span>Insurance</span><b>{b.insured?'Covered':'No coverage'}</b></div></div></div>})}</section><MarketplacePanel state={state} onChange={commit}/><GrowthPanel state={state} onChange={commit}/></>}

    {tab==='books'&&<><ProgressGoals state={state}/><section className="card page"><span className="eyebrow">COMPANY BOOKS</span><h2>{state.companyName}</h2><div className="resultGrid"><div><span>Fares + tips earned</span><b>{money(state.lifetimeRevenue)}</b></div><div><span>Lifetime profit</span><b>{money(state.lifetimeProfit)}</b></div><div><span>Debt</span><b>{money(state.debt)}</b></div><div><span>Daily loan payments</span><b>{money((state.loans??[]).reduce((s,l)=>s+l.dailyPayment,0))}</b></div><div><span>Days operated</span><b>{state.daysOperated}</b></div></div><h3>Recent ledger</h3>{state.ledger.slice(-8).reverse().map((x,i)=><div className="ledger" key={`${x.day}-${i}`}><span>Day {x.day} · {x.memo}</span><b className={x.amount>=0?'positive':'negative'}>{x.amount>=0?'+':''}{money(x.amount)}</b></div>)}</section></>}

    {tab==='leaders'&&<Leaderboard registered={mode==='registered'}/>}

    {menuOpen&&mode!=='registered'&&<GameMenu onClose={()=>setMenuOpen(false)} onReturnTitle={onReturnTitle} onSwitchMode={onSwitchMode} onRestartDemo={restartDemo} onHelp={openHelpFromMenu}/>}
    {choiceSaved&&<div className="choiceSavedToast" role="status">✓ Choice saved</div>}
    {!captainSchoolActive&&<button className="globalHelpBtn" type="button" onClick={()=>setHelpOpen(true)} aria-label="Open help">? Help</button>}
    {helpOpen&&<HelpPanel onClose={()=>setHelpOpen(false)}/>}
    <nav className={`bottomNav ${tutorialSpotlight?'tutorialNav':''}`}>
      <button className={`${tab==='dock'?'active ':''}${tutorialSpotlight==='dock'?'coachTarget':''}`} onClick={()=>setTab('dock')}><span>⚓</span>Dock</button>
      <button className={`${tab==='grow'?'active ':''}${tutorialSpotlight==='grow'?'coachTarget':''}`} onClick={()=>setTab('grow')}><span>📣</span>Grow</button>
      <button className={`${tab==='fleet'?'active ':''}${tutorialSpotlight==='fleet'?'coachTarget':''}`} onClick={()=>setTab('fleet')}><span>🚤</span>Fleet</button>
      <button className={`${tab==='leaders'?'active ':''}${tutorialSpotlight==='leaders'?'coachTarget':''}`} onClick={()=>setTab('leaders')}><span>🏆</span>Rank</button>
      <button className={`${tab==='books'?'active ':''}${tutorialSpotlight==='books'?'coachTarget':''}`} onClick={()=>setTab('books')}><span>📒</span>Books</button>
    </nav>
  </main>;
}

function IslandMap({active,boatClass,companyValue=0}:{active:number;boatClass?:CompanyState['boats'][number]['class'];companyValue?:number}){
  return <div className="ocean">{islands.map((i,idx)=><div key={i.id} className={`island i${idx} ${idx===active?'active':''} ${companyValue>=i.unlockValue?'unlocked':'locked'}`}><img src="/images/island-map-3d.svg" className="islandArt" alt="" aria-hidden="true"/><small>{i.name}</small>{companyValue<i.unlockValue&&<em aria-label="Locked">🔒</em>}</div>)}{boatClass&&<div className="mapBoat"><BoatArt kind={boatClass}/></div>}<div className="wave w1">≈≈≈</div><div className="wave w2">≈≈</div></div>;
}
