import { buyUsedBoat, generateUsedBoatMarket } from '../game/engine/depth';
import type { CompanyState } from '../game/types/models';

const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const pct=(n:number)=>`${Math.round(n*100)}%`;

export default function MarketplacePanel({state,onChange}:{state:CompanyState;onChange:(state:CompanyState)=>void}){
  if(state.day<=7)return null;
  const listings=generateUsedBoatMarket(state).filter(l=>!state.boats.some(b=>b.instanceId===`used-${l.listingId}`));
  const act=(listingId:string,finance:boolean)=>{
    try{onChange(buyUsedBoat(state,listingId,finance));}catch(e){alert((e as Error).message)}
  };
  return <section className="card marketPanel">
    <div className="sectionHead"><div><span className="eyebrow">USED-BOAT MARKET</span><h2>Today’s listings</h2></div><strong>Refreshes daily</strong></div>
    <p className="muted">Cheap boats can accelerate growth or turn into repair bills. Inspect condition, hours and reliability before buying.</p>
    {listings.length?listings.map(l=><div className="marketCard" key={l.listingId}>
      <div className="marketBoat">🚤</div>
      <div className="grow">
        <b>{l.name}</b>
        <small>Hull {l.year} · engine {l.engineYear} · {Math.round(l.engineHours)} hrs</small>
        <small>condition {pct(l.condition)} · reliability {pct(l.reliability)}</small>
        <p>{l.inspectionNote}</p>
      </div>
      <div className="marketActions">
        <strong>{money(l.askingPrice)}</strong>
        <button type="button" onClick={()=>act(l.listingId,false)}>Buy cash</button>
        <button type="button" onClick={()=>act(l.listingId,true)}>25% down</button>
      </div>
    </div>):<p className="muted">You bought every listing available today. Check again tomorrow.</p>}
    <p className="fine">Financed boats require 25% down and use expensive 24.99% APR financing over 2 game years. Payments come out every day.</p>
  </section>;
}
