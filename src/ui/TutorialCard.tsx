import { useEffect,useMemo,useState } from 'react';
import { tutorialForDay } from '../game/data/tutorial';

const KEY='island-adventures-turtle-school-v5';

export type TutorialTab='dock'|'grow'|'fleet'|'leaders'|'books';
type CoachMessage={label:string;title?:string;text:string;tab?:TutorialTab;spotlight?:TutorialTab};

function dismissedDays():number[]{
  try{return JSON.parse(localStorage.getItem(KEY)||'[]') as number[];}catch{return [];}
}

function TurtleGuide(){
  return <svg className="turtleGuideSvg" viewBox="0 0 260 260" aria-hidden="true">
    <defs>
      <radialGradient id="tgSkin" cx=".35" cy=".2"><stop stopColor="#ffd96d"/><stop offset=".62" stopColor="#e8a834"/><stop offset="1" stopColor="#b96b22"/></radialGradient>
      <radialGradient id="tgShell" cx=".42" cy=".25"><stop stopColor="#b96b28"/><stop offset=".55" stopColor="#804016"/><stop offset="1" stopColor="#4b2512"/></radialGradient>
      <linearGradient id="tgBlue" x1="0" x2="1"><stop stopColor="#33d6ef"/><stop offset=".55" stopColor="#1298cf"/><stop offset="1" stopColor="#08608f"/></linearGradient>
      <linearGradient id="tgGlass" x1="0" x2="1"><stop stopColor="#6ce8ff"/><stop offset=".45" stopColor="#148dca"/><stop offset="1" stopColor="#073d67"/></linearGradient>
      <filter id="tgShadow"><feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#17324d" floodOpacity=".28"/></filter>
    </defs>
    <g filter="url(#tgShadow)">
      <ellipse cx="132" cy="164" rx="74" ry="70" fill="url(#tgShell)" stroke="#542512" strokeWidth="5"/>
      <path d="M97 116 Q130 92 163 116 Q184 151 165 193 Q131 218 96 192 Q78 151 97 116Z" fill="url(#tgSkin)" stroke="#9c5d1e" strokeWidth="4"/>
      <path d="M102 133 Q130 112 160 132 M94 158 Q130 143 169 160 M102 185 Q130 170 160 188 M119 111 L124 201 M145 109 L141 204" fill="none" stroke="#b9782a" strokeWidth="3" opacity=".72"/>
      <ellipse cx="132" cy="83" rx="49" ry="44" fill="url(#tgSkin)" stroke="#9c5d1e" strokeWidth="4"/>
      <path d="M92 64 Q131 38 174 61 L163 42 Q130 24 101 42 Z" fill="#efd3a4" stroke="#9b7044" strokeWidth="4"/>
      <path d="M103 41 Q132 23 161 41 L163 30 Q132 13 105 29 Z" fill="#e6c28d" stroke="#9b7044" strokeWidth="4"/>
      <path d="M87 70 Q108 59 128 66 L125 91 Q102 98 87 84 Z" fill="url(#tgGlass)" stroke="#17324d" strokeWidth="6"/>
      <path d="M135 66 Q156 59 176 70 L175 84 Q159 98 138 91 Z" fill="url(#tgGlass)" stroke="#17324d" strokeWidth="6"/>
      <path d="M126 70 Q132 66 138 70" fill="none" stroke="#17324d" strokeWidth="6" strokeLinecap="round"/>
      <path d="M111 70 Q119 65 125 67 M145 68 Q154 64 161 68" fill="none" stroke="#9af4ff" strokeWidth="4" strokeLinecap="round" opacity=".8"/>
      <path d="M112 101 Q131 120 152 100 Q148 124 132 127 Q116 123 112 101Z" fill="#65120f" stroke="#8e3d1b" strokeWidth="3"/>
      <path d="M121 113 Q132 105 143 114 Q136 126 127 124Z" fill="#f06f68"/>
      <path d="M84 117 Q64 112 47 126 Q30 142 37 157 Q43 167 52 158 L66 146 L57 164 Q53 177 65 181 Q78 180 91 154" fill="url(#tgSkin)" stroke="#9c5d1e" strokeWidth="4"/>
      <path d="M181 118 Q201 112 218 126 Q236 141 229 157 Q223 168 214 159 L200 147 L209 164 Q213 177 201 181 Q187 180 174 154" fill="url(#tgSkin)" stroke="#9c5d1e" strokeWidth="4"/>
      <path d="M98 115 Q132 104 166 116 L170 143 Q132 155 94 143 Z" fill="url(#tgBlue)" stroke="#08608f" strokeWidth="4"/>
      <path d="M104 125 Q132 135 160 124 M111 136 Q132 144 153 136" fill="none" stroke="#85edff" strokeWidth="3" opacity=".65"/>
      <path d="M96 210 Q75 218 69 237 Q76 248 96 243 L121 226" fill="url(#tgSkin)" stroke="#9c5d1e" strokeWidth="4"/>
      <path d="M166 210 Q187 218 193 237 Q186 248 166 243 L141 226" fill="url(#tgSkin)" stroke="#9c5d1e" strokeWidth="4"/>
    </g>
  </svg>;
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
      <div className="turtleCoachAvatar"><TurtleGuide/></div>
    </div>
  </div>;
}
