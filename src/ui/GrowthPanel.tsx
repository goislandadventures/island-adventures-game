import { boatTemplates,islands,marinas } from '../game/data/content';
import { buyBoat,captainCandidates,expandToIsland,hireCaptain,insureFleet } from '../game/engine/sim';
import { maintainBoat,serviceStatus } from '../game/engine/depth';
import type { CompanyState } from '../game/types/models';

const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const pct=(n:number)=>`${Math.round(n*100)}%`;

export default function GrowthPanel({state,onChange}:{state:CompanyState;onChange:(state:CompanyState)=>void}){
  const currentMarina=marinas.find(m=>m.id===state.marinaId);
  const act=(fn:()=>CompanyState)=>{try{onChange(fn())}catch(e){alert((e as Error).message)}};

  return <>
    <section className="card growthSection">
      <span className="eyebrow">CREW</span><h2>Captains</h2>
      <p className="muted">You run boat one. Each hired captain lets you put one more boat to work. Insurance is optional; captains are not.</p>
      {state.staff.length>0&&state.staff.map(s=><div className="growthRow" key={s.id}><div><b>Captain {s.name}</b><small>Skill {pct(s.skill)} · Reliability {pct(s.reliability)}</small></div><strong>{money(s.hourlyRate)}/hr</strong></div>)}
      {captainCandidates.filter(c=>!state.staff.some(s=>s.id===c.id)).map(c=><div className="growthRow" key={c.id}><div><b>{c.name}</b><small>Skill {pct(c.skill)} · Reliability {pct(c.reliability)} · $250 onboarding</small></div><button type="button" onClick={()=>act(()=>hireCaptain(state,c.id))}>Hire {money(c.hourlyRate)}/hr</button></div>)}
    </section>

    <section className="card growthSection">
      <span className="eyebrow">FLEET GROWTH</span><h2>Boats & maintenance</h2>
      {state.boats.map(b=>{const svc=serviceStatus(b);return <div className="boatManage" key={b.instanceId}><div className="growthRow"><div><b>{b.name}</b><small>{b.year} · {Math.round(b.engineHours)} hrs · condition {pct(b.condition)} · reliability {pct(b.reliability)} · {b.insured?'insured':'UNINSURED'}</small><em className={svc.kind==='ok'?'serviceOk':'serviceDue'}>{svc.label}</em></div></div><div className="maintenanceChoices"><button type="button" onClick={()=>act(()=>maintainBoat(state,b.instanceId,'dock'))}>Dock check $120</button><button type="button" disabled={svc.kind==='300hr'} onClick={()=>act(()=>maintainBoat(state,b.instanceId,'100hr'))}>100-hour $450</button><button type="button" onClick={()=>act(()=>maintainBoat(state,b.instanceId,'300hr'))}>300-hour $900</button></div></div>})}
      {state.boats.some(b=>!b.insured)&&<><button type="button" className="primary big" onClick={()=>act(()=>insureFleet(state))}>Add Insurance to Uninsured Boat(s)</button><p className="fine">Insurance is optional. It costs more at premium marinas, but it can save the company if a hurricane destroys a boat.</p></>}
      <h3>Add another boat</h3>
      <p className="fine">Extra boats only earn money when you have captains to run them. A 7–12 guest booking needs two boats and two captains.</p>
      {boatTemplates.filter(b=>b.lengthFt<=(currentMarina?.maxBoatFt??0)).map(b=><div className="growthRow" key={b.id}><div><b>{b.name}</b><small>{b.lengthFt}′ · {b.seats} guests · reliability {pct(b.reliability)}</small></div><button type="button" disabled={state.cash<b.basePrice} onClick={()=>act(()=>buyBoat(state,b.id))}>{money(b.basePrice)}</button></div>)}
    </section>

    <section className="card growthSection">
      <span className="eyebrow">EXPANSION</span><h2>Island chain</h2>
      <p className="muted">New markets unlock from company value. Each island changes tourism demand, fuel cost and weather exposure. Relocating moves your fleet to that island’s primary marina.</p>
      {islands.map(i=>{
        const unlocked=state.companyValue>=i.unlockValue;
        const current=i.id===state.islandId;
        const marina=marinas.find(m=>m.islandId===i.id);
        return <div className={`growthRow islandGrowth ${current?'current':''}`} key={i.id}><div><b>{i.name}{current?' · Current base':''}</b><small>{i.description} · tourism {Math.round(i.tourism*100)} · fuel {money(i.fuelPrice)}/gal · {i.weatherExposure} exposure{!unlocked?` · Unlock at ${money(i.unlockValue)}`:marina?` · ${money(marina.monthlySlip)}/mo slip`:''}</small></div>{!current&&<button type="button" disabled={!unlocked} onClick={()=>act(()=>expandToIsland(state,i.id))}>{unlocked?'Relocate':'Locked'}</button>}</div>;
      })}
    </section>
  </>;
}
