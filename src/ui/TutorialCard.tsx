import { useEffect,useState } from 'react';
import { tutorialForDay } from '../game/data/tutorial';

const KEY='island-adventures-tutorial-dismissed';

function dismissedDays():number[]{
  try{return JSON.parse(localStorage.getItem(KEY)||'[]') as number[];}catch{return [];}
}

export default function TutorialCard({day}:{day:number}){
  const tutorial=tutorialForDay(day);
  const [open,setOpen]=useState(true);
  const [dismissed,setDismissed]=useState(()=>dismissedDays().includes(day));

  useEffect(()=>{
    setDismissed(dismissedDays().includes(day));
    setOpen(true);
  },[day]);

  if(!tutorial||dismissed)return null;

  const dismiss=()=>{
    const days=Array.from(new Set([...dismissedDays(),day]));
    try{localStorage.setItem(KEY,JSON.stringify(days));}catch{}
    setDismissed(true);
  };

  return <section className="tutorialCard">
    <button className="tutorialHeader" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>
      <div><span>CAPTAIN SCHOOL · DAY {day} OF 7</span><strong>{tutorial.title}</strong></div>
      <b>{open?'−':'+'}</b>
    </button>
    {open&&<div className="tutorialBody">
      <p>{tutorial.summary}</p>
      <ul>{tutorial.lessons.map(item=><li key={item}>{item}</li>)}</ul>
      <div className="tutorialGoal"><span>TODAY'S GOAL</span><b>{tutorial.goal}</b></div>
      <button className="tutorialDone" onClick={dismiss}>Got it for today</button>
    </div>}
  </section>;
}
