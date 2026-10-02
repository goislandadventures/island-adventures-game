import { useEffect,useMemo,useState } from 'react';
import { tutorialForDay } from '../game/data/tutorial';

const KEY='island-adventures-tutorial-dismissed';

function dismissedDays():number[]{
  try{return JSON.parse(localStorage.getItem(KEY)||'[]') as number[];}catch{return [];}
}

export default function TutorialCard({day}:{day:number}){
  const tutorial=tutorialForDay(day);
  const [step,setStep]=useState(0);
  const [dismissed,setDismissed]=useState(()=>dismissedDays().includes(day));

  useEffect(()=>{
    setDismissed(dismissedDays().includes(day));
    setStep(0);
  },[day]);

  const messages=useMemo(()=>{
    if(!tutorial)return [];
    return [
      {label:`CAPTAIN SCHOOL · DAY ${day} OF 7`,text:tutorial.summary},
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
        {step===0&&<h3>{tutorial.title}</h3>}
        <p>{current.text}</p>
        <div className="coachProgress" aria-label={`Step ${step+1} of ${messages.length}`}>
          {messages.map((_,i)=><i key={i} className={i<=step?'done':''}/>)}
        </div>
        <button className="coachNext" onClick={last?dismiss:()=>setStep(s=>s+1)}>
          {last?'Got it for today':'Next'}
        </button>
      </div>
      <div className="turtleCoachAvatar" aria-hidden="true">
        <img src="/images/island-adventures-charter-game.jpg" alt=""/>
      </div>
    </div>
  </div>;
}
