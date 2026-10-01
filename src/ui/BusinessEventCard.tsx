import type { BusinessEvent,CompanyState } from '../game/types/models';
import { resolveBusinessEvent } from '../game/engine/depth';

export default function BusinessEventCard({state,event,onChange}:{state:CompanyState;event:BusinessEvent;onChange:(state:CompanyState)=>void}){
  const choose=(id:string)=>{try{onChange(resolveBusinessEvent(state,event,id));}catch(e){alert((e as Error).message)}};
  return <section className="card businessEvent">
    <span className="eyebrow">OWNER DECISION</span>
    <h2>{event.title}</h2>
    <p>{event.description}</p>
    <div className="eventChoices">
      {event.choices.map(choice=><button type="button" key={choice.id} onClick={()=>choose(choice.id)}>
        <b>{choice.label}</b><small>{choice.detail}</small>
      </button>)}
    </div>
    <p className="fine">Resolve this before running today’s charters.</p>
  </section>;
}
