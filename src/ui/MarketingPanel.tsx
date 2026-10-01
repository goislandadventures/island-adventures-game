import { setMarketing,setReviewAsk } from '../game/engine/sim';
import { marketingStrength } from '../game/engine/depth';
import type { CompanyState,MarketingFocus } from '../game/types/models';

const focuses:{id:MarketingFocus;label:string;detail:string}[]=[
  {id:'organic',label:'Search',detail:'Direct/organic discovery'},
  {id:'maps',label:'Maps',detail:'Local-intent customers'},
  {id:'social',label:'Social',detail:'Trip inspiration traffic'},
  {id:'hotel',label:'Hotels',detail:'Visitor/referral demand'},
  {id:'content',label:'Content/PR',detail:'Long-game trust and discovery'}
];

export default function MarketingPanel({state,onChange}:{state:CompanyState;onChange:(state:CompanyState)=>void}){
  const m=state.marketing??{dailyBudget:0,focus:'organic' as MarketingFocus,reviewAsk:true};
  const strength=marketingStrength(state);
  const strengthLabel=strength>=.62?'Strong':strength>=.42?'Okay':'Weak';
  return <section className="marketingPanel">
    <div className="sectionHead"><div><span className="eyebrow">GET FOUND</span><h3>Help people discover you</h3></div><strong>${m.dailyBudget}/day</strong></div>
    <p className="fine">Marketing costs money every day, but weak marketing gets crushed in slow season. Current marketing strength: <b>{strengthLabel}</b> ({Math.round(strength*100)}%).</p>
    <div className="budgetButtons">{[0,25,50,100,150,250].map(v=><button type="button" className={m.dailyBudget===v?'selected':''} key={v} onClick={()=>onChange(setMarketing(state,v,m.focus))}>${v}</button>)}</div>
    <div className="focusButtons">{focuses.map(f=><button type="button" className={m.focus===f.id?'selected':''} key={f.id} onClick={()=>onChange(setMarketing(state,m.dailyBudget,f.id))}><b>{f.label}</b><small>{f.detail}</small></button>)}</div>
    <label className="reviewAskToggle"><input type="checkbox" checked={m.reviewAsk} onChange={e=>onChange(setReviewAsk(state,e.target.checked))}/><span><b>Ask happy guests for a review</b><small>This costs nothing. Happy guests are much more likely to leave a review when you actually ask.</small></span></label>
  </section>;
}
