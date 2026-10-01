import { setMarketing } from '../game/engine/sim';
import type { CompanyState,MarketingFocus } from '../game/types/models';

const focuses:{id:MarketingFocus;label:string;detail:string}[]=[
  {id:'organic',label:'Search',detail:'Direct/organic discovery'},
  {id:'maps',label:'Maps',detail:'Local-intent customers'},
  {id:'social',label:'Social',detail:'Trip inspiration traffic'},
  {id:'hotel',label:'Hotels',detail:'Visitor/referral demand'}
];

export default function MarketingPanel({state,onChange}:{state:CompanyState;onChange:(state:CompanyState)=>void}){
  const m=state.marketing??{dailyBudget:0,focus:'organic' as MarketingFocus};
  return <section className="marketingPanel">
    <div className="sectionHead"><div><span className="eyebrow">MARKETING</span><h3>Daily demand boost</h3></div><strong>${m.dailyBudget}/day</strong></div>
    <p className="fine">Spend is charged each operating day. More budget increases booking probability; focus changes where more customers come from.</p>
    <div className="budgetButtons">{[0,25,50,100,150,250].map(v=><button type="button" className={m.dailyBudget===v?'selected':''} key={v} onClick={()=>onChange(setMarketing(state,v,m.focus))}>${v}</button>)}</div>
    <div className="focusButtons">{focuses.map(f=><button type="button" className={m.focus===f.id?'selected':''} key={f.id} onClick={()=>onChange(setMarketing(state,m.dailyBudget,f.id))}><b>{f.label}</b><small>{f.detail}</small></button>)}</div>
  </section>;
}
