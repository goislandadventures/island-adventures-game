import type { CompanyState,HurricaneEvent } from '../game/types/models';
import { setHurricanePlan } from '../game/engine/hurricane';

export default function HurricaneCard({state,event,onChange,onRun}:{state:CompanyState;event:HurricaneEvent;onChange:(state:CompanyState)=>void;onRun:()=>void}){
  const plan=state.hurricanePlan?.day===state.day?state.hurricanePlan:null;
  return <section className={`card hurricaneCard cat${event.category}`}>
    <div className="hurricaneTop"><div><span className="eyebrow">HURRICANE WARNING</span><h2>{event.name} · Category {event.category}</h2></div><div className="hurricaneIcon">🌀</div></div>
    <p>{event.warning}</p>
    <div className="stormRule"><b>Game rule:</b> Category 3, 4 or 5 destroys every boat left in the water. Insurance can pay part of the loss. An uninsured boat is simply gone.</div>
    <div className="stormChoices">
      <button type="button" className={plan?.haulBoats?'selected':''} onClick={()=>onChange(setHurricanePlan(state,true))}><b>🚚 Haul the fleet</b><small>Pay to pull every boat out of the water. Safest choice.</small></button>
      <button type="button" className={plan&&!plan.haulBoats?'selected dangerChoice':''} onClick={()=>onChange(setHurricanePlan(state,false))}><b>🎲 Leave them in the water</b><small>Save the haul-out money and accept the storm risk.</small></button>
    </div>
    {plan&&<><p className="stormPlan">Plan selected: <b>{plan.haulBoats?'Haul every boat':'Leave the fleet in the water'}</b>.</p><button type="button" className="primary big" onClick={onRun}>Face the Storm →</button></>}
  </section>;
}
