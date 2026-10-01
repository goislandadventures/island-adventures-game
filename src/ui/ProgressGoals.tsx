import type { CompanyState } from '../game/types/models';

const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);

export default function ProgressGoals({state}:{state:CompanyState}){
  if(state.day<=7)return null;
  const insured=state.boats.filter(b=>b.insured).length;
  const goals=[
    {id:'captain',title:'Crew Up',detail:'Hire your first captain.',done:state.staff.length>=1,progress:`${state.staff.length}/1 captain`},
    {id:'two-boats',title:'Two-Boat Operator',detail:'Have two insured boats and enough crew to operate both.',done:insured>=2&&state.staff.length>=1,progress:`${insured}/2 insured boats · ${state.staff.length}/1 hired captain`},
    {id:'reviews',title:'Review Momentum',detail:'Build enough social proof to become established.',done:state.reviewCount>=25,progress:`${state.reviewCount}/25 reviews`},
    {id:'expand',title:'Island Hopper',detail:'Move your operation beyond Harbor Key.',done:state.islandId!=='harbor',progress:state.islandId==='harbor'?'Still based at Harbor Key':'Expanded'},
    {id:'six-figure',title:'Six-Figure Company',detail:'Reach $100,000 in company value.',done:state.companyValue>=100000,progress:`${money(state.companyValue)} / $100,000`},
    {id:'fleet',title:'Fleet Builder',detail:'Own at least three boats.',done:state.boats.length>=3,progress:`${state.boats.length}/3 boats`},
    {id:'legend',title:'Local Legend',detail:'Reach 100 reviews while holding at least a 4.8 rating.',done:state.reviewCount>=100&&state.rating>=4.8,progress:`${state.reviewCount}/100 reviews · ${state.rating||0}/4.8 rating`},
    {id:'empire',title:'Island Empire',detail:'Reach $500,000 in company value.',done:state.companyValue>=500000,progress:`${money(state.companyValue)} / $500,000`}
  ];
  const complete=goals.filter(g=>g.done).length;
  return <section className="card progressGoals">
    <div className="sectionHead"><div><span className="eyebrow">OWNER MILESTONES</span><h2>Build the company your way</h2></div><strong>{complete}/{goals.length}</strong></div>
    <p className="muted">These are targets, not tutorial answers. The route to them is yours.</p>
    {goals.map(g=><div className={`goalRow ${g.done?'done':''}`} key={g.id}>
      <span>{g.done?'✓':'○'}</span><div><b>{g.title}</b><small>{g.detail}</small><em>{g.progress}</em></div>
    </div>)}
  </section>;
}
