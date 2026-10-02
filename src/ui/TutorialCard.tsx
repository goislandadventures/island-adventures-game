import { useEffect,useMemo,useState } from 'react';
import { tutorialForDay } from '../game/data/tutorial';

const KEY='island-adventures-turtle-school-v3';

function dismissedDays():number[]{
  try{return JSON.parse(localStorage.getItem(KEY)||'[]') as number[];}catch{return [];}
}

type CoachMessage={label:string;title?:string;text:string};

export default function TutorialCard({day}:{day:number}){
  const tutorial=tutorialForDay(day);
  const [step,setStep]=useState(0);
  const [dismissed,setDismissed]=useState(()=>dismissedDays().includes(day));

  useEffect(()=>{
    setDismissed(dismissedDays().includes(day));
    setStep(0);
  },[day]);

  const messages=useMemo<CoachMessage[]>(()=>{
    if(!tutorial)return [];
    const dayOneTour=day===1?[
      {label:'WELCOME TO CAPTAIN SCHOOL',title:'Meet your guide',text:'Before we touch the boats, I’ll show you the five buttons at the bottom. You do not need to know anything about boats or business to play.'},
      {label:'BOTTOM BUTTON · 1 OF 5',title:'⚓ Dock',text:'This is home base. Check weather, see today’s bookings, choose what to do with each trip, handle hurricanes, and move the day forward.'},
      {label:'BOTTOM BUTTON · 2 OF 5',title:'📣 Grow',text:'This is how you get guests. Pick a marketing channel, choose a daily budget, watch how crowded that channel is, and set your trip prices.'},
      {label:'BOTTOM BUTTON · 3 OF 5',title:'🚤 Fleet',text:'Your boats and crew live here. Check hull and engine age, engine hours, maintenance, insurance, captains, used boats, and island expansion.'},
      {label:'BOTTOM BUTTON · 4 OF 5',title:'🏆 Rank',text:'See how your company compares with real registered players. Reviews, revenue, profit and company value can all become bragging rights.'},
      {label:'BOTTOM BUTTON · 5 OF 5',title:'📒 Books',text:'This is the money scoreboard. See what you earned, what you spent, what you owe, and the milestones you are chasing.'},
      {label:'DAY 1 STARTS NOW',title:tutorial.title,text:tutorial.summary}
    ]:[{label:`CAPTAIN SCHOOL · DAY ${day} OF 7`,title:tutorial.title,text:tutorial.summary}];

    return [
      ...dayOneTour,
      ...tutorial.lessons.map((text,index)=>({label:`LESSON ${index+1} OF ${tutorial.lessons.length}`,text})),
      {label:"TODAY'S GOAL",text:tutorial.goal}
    ];
  },[tutorial,day]);

  if(!tutorial||dismissed||!messages.length)return null;

  const last=step===messages.length-1;
  const dismiss=()=>{
    const days=Array.from(new Set([...dismissedDays(),day]));
    try{localStorage.setItem(KEY,JSON.stringify(days));}catch{}
    setDismissed(true);
  };
  const current=messages[Math.min(step,messages.length-1)];

  return <div className="captainSchoolOverlay" role="dialog" aria-modal="true" aria-label={`Captain School Day ${day}`}>
    <div className="captainSchoolShade"/>
    <div className="turtleCoach">
      <div className="coachBubble">
        <span>{current.label}</span>
        {current.title&&<h3>{current.title}</h3>}
        <p>{current.text}</p>
        <div className="coachProgress" aria-label={`Step ${step+1} of ${messages.length}`}>
          {messages.map((_,i)=><i key={i} className={i<=step?'done':''}/>)}
        </div>
        <button className="coachNext" onClick={last?dismiss:()=>setStep(s=>s+1)}>
          {last?'Got it for today':'Next'}
        </button>
      </div>
      <div className="turtleCoachAvatar" aria-hidden="true">
        <img src="/branding/captain-school-turtle.jpg" alt=""/>
      </div>
    </div>
  </div>;
}
