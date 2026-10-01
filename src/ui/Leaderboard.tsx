import { useEffect,useState } from 'react';
import { loadLeaderboard } from './api';

const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const metrics=[['value','Top Owners'],['revenue','Revenue'],['profit','Profit'],['reviews','Most Reviews'],['rating','Best Reviews']] as const;

export default function Leaderboard({registered}:{registered:boolean}){
  const [metric,setMetric]=useState('value');
  const [rows,setRows]=useState<any[]>([]);
  const [error,setError]=useState('');
  useEffect(()=>{setError('');loadLeaderboard(metric).then(r=>setRows(r.results)).catch(e=>setError((e as Error).message));},[metric]);
  return <section className="card page"><span className="eyebrow">OWNER CHALLENGE</span><h2>Island Leaderboards</h2>
    <p className="muted">{registered?'Your registered company syncs automatically and is eligible to rank.':'You can view rankings, but Demo and Development Test companies are excluded.'}</p>
    <div className="metricTabs">{metrics.map(([id,label])=><button key={id} className={metric===id?'selected':''} onClick={()=>setMetric(id)}>{label}</button>)}</div>
    {metric==='rating'&&<p className="fine">Best Reviews requires at least 10 reviews.</p>}
    {error&&<p className="formError">{error}</p>}
    <div className="leaderList">{rows.length?rows.map((r,i)=><div className="leaderRow" key={`${r.company_name}-${i}`}><strong>#{i+1}</strong><div className="grow"><b>{r.company_name}</b><small>{r.review_count} reviews · {r.rating?Number(r.rating).toFixed(2):'New'} ★</small></div><b>{metric==='reviews'?r.review_count:metric==='rating'?Number(r.rating).toFixed(2):metric==='revenue'?money(r.lifetime_revenue):metric==='profit'?money(r.lifetime_profit):money(r.company_value)}</b></div>):<p className="muted">No ranked companies yet. First captains to launch will set the board.</p>}</div>
  </section>;
}
