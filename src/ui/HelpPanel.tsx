import { weekOneTutorial } from '../game/data/tutorial';

const tabHelp=[
  ['⚓ Dock','Home base: weather, bookings, trip decisions, storms, marina choices and ending the day.'],
  ['📣 Grow','Marketing and pricing: choose a channel, set the budget, watch competition and change trip prices.'],
  ['🚤 Fleet','Boats and crew: engine hours, maintenance, insurance, captains, used boats and expansion.'],
  ['🏆 Rank','Leaderboards: compare company value, reviews, rating, revenue and profit with real players.'],
  ['📒 Books','Money: income, expenses, debt, loan payments, profit and financial goals.']
] as const;

export default function HelpPanel({onClose}:{onClose:()=>void}){
  return <div className="helpOverlay" role="dialog" aria-modal="true" aria-label="Island Adventures Help">
    <div className="helpSheet">
      <header className="helpHeader">
        <div><span>CAPTAIN SCHOOL HANDBOOK</span><h2>Everything you need in one place</h2></div>
        <button type="button" className="helpClose" onClick={onClose} aria-label="Close help">×</button>
      </header>
      <section className="helpSection">
        <h3>The five bottom buttons</h3>
        <ul>{tabHelp.map(([title,text])=><li key={title}><b>{title}</b><span>{text}</span></li>)}</ul>
      </section>
      {weekOneTutorial.map(day=><section className="helpSection" key={day.day}>
        <span className="eyebrow">DAY {day.day} OF 7</span>
        <h3>{day.title}</h3>
        <p>{day.summary}</p>
        <ul>{day.lessons.map(item=><li key={item}>{item}</li>)}</ul>
        <div className="helpGoal"><b>Today’s goal:</b> {day.goal}</div>
      </section>)}
      <button type="button" className="primary big helpDone" onClick={onClose}>Back to the Game</button>
    </div>
  </div>;
}
