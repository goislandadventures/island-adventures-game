import { setMarketing,setReviewAsk } from '../game/engine/sim';
import { canonicalMarketingFocus,marketingChannels,marketingPerformance,marketingStrength } from '../game/engine/depth';
import type { CompanyState,MarketingChannelId,MarketingMarketSnapshot } from '../game/types/models';

const budgets:Record<MarketingChannelId,number[]>={
  search:[0,25,50,100,150,250],
  maps:[0,10,25,50,100,150],
  social:[0,10,25,50,75,100],
  hotel:[0,10,25,50,75,100],
  content:[0,10,25,50,75,100]
};

const extra:Record<MarketingChannelId,string>={
  search:'High-intent guests. Small budgets disappear fast.',
  maps:'Great for visitors already looking nearby.',
  social:'Lots of eyeballs for less money, but fewer are ready to book.',
  hotel:'Warm referrals. Hotel bookings also cost a 15% referral fee.',
  content:'Slow today, useful for building discovery and trust over time.'
};

export default function MarketingPanel({state,onChange,market}:{state:CompanyState;onChange:(state:CompanyState)=>void;market?:MarketingMarketSnapshot}){
  const m=state.marketing??{dailyBudget:0,focus:'search' as const,reviewAsk:true};
  const focus=canonicalMarketingFocus(m.focus);
  const strength=marketingStrength(state,market);
  const performance=marketingPerformance(state,market);
  const strengthLabel=strength>=.62?'Strong':strength>=.42?'Okay':'Weak';
  const channelBudgets=budgets[focus];

  return <section className="marketingPanel">
    <div className="sectionHead"><div><span className="eyebrow">GET GUESTS</span><h3>Where should your marketing money go?</h3></div><strong>${m.dailyBudget}/day</strong></div>
    <p className="fine">Your daily budget is a hard cap. Crowding does not secretly charge more than the cap—it makes each dollar buy fewer results. Current overall marketing strength: <b>{strengthLabel}</b> ({Math.round(strength*100)}%).</p>

    <div className="marketingMarketSummary">
      <b>Live player market</b>
      <span>{market?.totalPlayers??0} active registered player{(market?.totalPlayers??0)===1?'':'s'} in the last {market?.activeWindowDays??30} days</span>
    </div>

    <div className="focusButtons channelButtons">
      {(Object.keys(marketingChannels) as MarketingChannelId[]).map(id=>{
        const cfg=marketingChannels[id];
        const stats=market?.channels?.[id];
        const saturation=stats?.saturation??0;
        const hypothetical=marketingPerformance({...state,marketing:{...m,focus:id}},market);
        const selected=focus===id;
        return <button type="button" className={selected?'selected':''} key={id} onClick={()=>onChange(setMarketing(state,m.dailyBudget,id))}>
          <b>{cfg.label}</b>
          <small>{cfg.detail}</small>
          <small>{extra[id]}</small>
          <em>{stats?.players??0}/{market?.totalPlayers??0} players · {Math.round(saturation*100)}% crowded</em>
          <em>Cost pressure ×{hypothetical.costPressure.toFixed(2)} · current-budget lift +{Math.round(hypothetical.bookingBoost*100)}%</em>
        </button>;
      })}
    </div>

    <div className="marketingBudgetHeader"><b>{marketingChannels[focus].label} daily budget</b><span>Cost pressure ×{performance.costPressure.toFixed(2)}</span></div>
    <div className="budgetButtons">{channelBudgets.map(v=><button type="button" className={m.dailyBudget===v?'selected':''} key={v} onClick={()=>onChange(setMarketing(state,v,focus))}>${v}</button>)}</div>
    <p className="marketingEffect">At <b>${m.dailyBudget}/day</b>, {marketingChannels[focus].label} is currently adding about <b>{Math.round(performance.bookingBoost*100)}%</b> to booking demand before island competition, season and reputation are applied.</p>

    <label className="reviewAskToggle"><input type="checkbox" checked={m.reviewAsk} onChange={e=>onChange(setReviewAsk(state,e.target.checked))}/><span><b>Ask happy guests for a review</b><small>This costs nothing. Happy guests are much more likely to leave a review when you actually ask.</small></span></label>
  </section>;
}
