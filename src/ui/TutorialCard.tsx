import { useEffect,useMemo,useState } from 'react';
import { tutorialForDay } from '../game/data/tutorial';

const KEY='island-adventures-turtle-school-v5';

export type TutorialTab='dock'|'grow'|'fleet'|'leaders'|'books';
type CoachMessage={label:string;title?:string;text:string;tab?:TutorialTab;spotlight?:TutorialTab};

function dismissedDays():number[]{
  try{return JSON.parse(localStorage.getItem(KEY)||'[]') as number[];}catch{return [];}
}

export default function TutorialCard({day,onNavigate,onSpotlight}:{day:number;onNavigate?:(tab:TutorialTab)=>void;onSpotlight?:(tab:TutorialTab|null)=>void}){
  const tutorial=tutorialForDay(day);
  const [step,setStep]=useState(0);
  const [dismissed,setDismissed]=useState(()=>dismissedDays().includes(day));

  useEffect(()=>{setDismissed(dismissedDays().includes(day));setStep(0)},[day]);

  const messages=useMemo<CoachMessage[]>(()=>{
    if(!tutorial)return [];
    const dayOneTour:CoachMessage[]=day===1?[
      {label:'WELCOME TO CAPTAIN SCHOOL',title:'I’m your deckhand for the week',text:'First, I’ll show you the five buttons at the bottom. You do not need to know boats, money, or business stuff. I’ll teach it as we go.',tab:'dock'},
      {label:'BOTTOM BUTTON · 1 OF 5',title:'⚓ Dock',text:'This is home base. Check the weather, see who booked, choose what to do with each trip, handle storms, and finish the day.',tab:'dock',spotlight:'dock'},
      {label:'BOTTOM BUTTON · 2 OF 5',title:'📣 Grow',text:'This is where you find guests. Pick where to advertise, choose how much to spend, watch how crowded each channel is, and change trip prices.',tab:'grow',spotlight:'grow'},
      {label:'BOTTOM BUTTON · 3 OF 5',title:'🚤 Fleet',text:'Everything with boats and crew lives here: engine hours, service, insurance, captains, used boats, and eventually new islands.',tab:'fleet',spotlight:'fleet'},
      {label:'BOTTOM BUTTON · 4 OF 5',title:'🏆 Rank',text:'This is the real-player scoreboard. See how your company compares in reviews, revenue, profit, rating, and company value.',tab:'leaders',spotlight:'leaders'},
      {label:'BOTTOM BUTTON · 5 OF 5',title:'📒 Books',text:'This tells you where the money went. See income, expenses, debt, loan payments, profit, and the goals you are chasing.',tab:'books',spotlight:'books'},
      {label:'TOUR COMPLETE',title:'Back to the Dock',text:'That’s the whole game in five buttons. Now we’ll build your first charter company one choice at a time.',tab:'dock',spotlight:'dock'},
      {label:'DAY 1 STARTS NOW',title:tutorial.title,text:tutorial.summary,tab:'dock'}
    ]:[{label:`CAPTAIN SCHOOL · DAY ${day} OF 7`,title:tutorial.title,text:tutorial.summary,tab:day===2?'grow':day===3||day===4?'fleet':day===5?'books':'dock'}];
    return [...dayOneTour,...tutorial.lessons.map((text,index)=>({label:`LESSON ${index+1} OF ${tutorial.lessons.length}`,text})),{label:"TODAY'S GOAL",text:tutorial.goal}];
  },[tutorial,day]);

  const current=messages[Math.min(step,Math.max(0,messages.length-1))];
  useEffect(()=>{
    if(dismissed||!current)return;
    if(current.tab)onNavigate?.(current.tab);
    onSpotlight?.(current.spotlight??null);
    return()=>onSpotlight?.(null);
  },[current,dismissed,onNavigate,onSpotlight]);

  if(!tutorial||dismissed||!messages.length)return null;
  const last=step===messages.length-1;
  const dismiss=()=>{
    const days=Array.from(new Set([...dismissedDays(),day]));
    try{localStorage.setItem(KEY,JSON.stringify(days));}catch{}
    onSpotlight?.(null);
    if(day===1)onNavigate?.('dock');
    setDismissed(true);
  };

  return <div className="captainSchoolOverlay captainSchoolV5" role="dialog" aria-modal="true" aria-label={`Captain School Day ${day}`}>
    <div className="captainSchoolShade"/>
    <div className="turtleCoach">
      <div className="coachBubble">
        <span>{current.label}</span>
        {current.title&&<h3>{current.title}</h3>}
        <p>{current.text}</p>
        <div className="coachProgress" aria-label={`Step ${step+1} of ${messages.length}`}>{messages.map((_,i)=><i key={i} className={i<=step?'done':''}/>)}</div>
        <button className="coachNext" onClick={last?dismiss:()=>setStep(s=>s+1)}>{last?'Got it for today':'Next'}</button>
      </div>
      <div className="turtleCoachAvatar"><img src="/branding/captain-school-turtle-exact-v8.webp" alt="Captain School turtle guide"/></div>
    </div>
  </div>;
}
