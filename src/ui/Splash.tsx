import { useEffect,useRef,useState } from 'react';
import BoatArt from './BoatArt';

function AlligatorReefTower(){
  const braces:Array<[number,number,number,number]>=[];
  const levels=[190,245,305,370,440,515,595,660];
  const left=(y:number)=>160-(y-150)*.13;
  const right=(y:number)=>160+(y-150)*.13;
  for(let i=0;i<levels.length-1;i++){
    const y1=levels[i],y2=levels[i+1];
    braces.push([left(y1),y1,right(y2),y2],[right(y1),y1,left(y2),y2]);
  }
  return <svg className="splashV5TowerArt" viewBox="0 0 320 760" aria-hidden="true">
    <defs>
      <linearGradient id="v5Steel" x1="0" x2="1"><stop stopColor="#f9ffff"/><stop offset=".22" stopColor="#b7c7c9"/><stop offset=".52" stopColor="#f7ffff"/><stop offset=".78" stopColor="#8d9da0"/><stop offset="1" stopColor="#53656a"/></linearGradient>
      <linearGradient id="v5Column" x1="0" x2="1"><stop stopColor="#eef5f2"/><stop offset=".45" stopColor="#ffffff"/><stop offset=".78" stopColor="#b6c6c4"/><stop offset="1" stopColor="#7c8f90"/></linearGradient>
      <linearGradient id="v5Rust" x1="0" x2="1"><stop stopColor="#40241d"/><stop offset=".4" stopColor="#9b4f35"/><stop offset=".68" stopColor="#d78452"/><stop offset="1" stopColor="#3a241f"/></linearGradient>
      <radialGradient id="v5Glass" cx=".4" cy=".25"><stop stopColor="#d9fbff"/><stop offset=".55" stopColor="#65aab3"/><stop offset="1" stopColor="#17313b"/></radialGradient>
      <filter id="v5TowerShadow" x="-40%" y="-20%" width="180%" height="160%"><feDropShadow dx="0" dy="15" stdDeviation="12" floodColor="#063e54" floodOpacity=".34"/></filter>
      <filter id="v5Glow"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    <g filter="url(#v5TowerShadow)">
      <ellipse cx="160" cy="709" rx="128" ry="24" fill="#d9efcf" opacity=".82"/>
      <ellipse cx="160" cy="712" rx="89" ry="13" fill="#7fcbb7" opacity=".45"/>

      <path d="M82 690 L144 178 M238 690 L176 178" stroke="url(#v5Steel)" strokeWidth="11" fill="none" strokeLinecap="round"/>
      <path d="M100 690 L151 178 M220 690 L169 178" stroke="#52676b" strokeWidth="5" fill="none" opacity=".92"/>

      {levels.map(y=><path key={y} d={`M ${left(y)} ${y} L ${right(y)} ${y}`} stroke="#728488" strokeWidth="5" opacity=".96"/>)}
      {braces.map((b,i)=><path key={i} d={`M ${b[0]} ${b[1]} L ${b[2]} ${b[3]}`} stroke="#75888c" strokeWidth="4.2" opacity=".94"/>)}

      <path d="M141 590 L147 202 L173 202 L179 590 Z" fill="url(#v5Column)" stroke="#6e8080" strokeWidth="4"/>
      <path d="M151 214 L151 578" stroke="#fff" strokeWidth="3" opacity=".72"/>

      <path d="M116 176 H204 L195 205 H125 Z" fill="#111d23" stroke="#061116" strokeWidth="5"/>
      <path d="M124 150 H196 V179 H124 Z" fill="url(#v5Glass)" stroke="#0b171c" strokeWidth="6"/>
      <path d="M132 154 V175 M147 152 V177 M162 152 V177 M177 152 V177 M190 154 V175" stroke="#10252b" strokeWidth="3" opacity=".9"/>
      <path d="M117 145 L160 122 L203 145 Z" fill="#0f181d" stroke="#050b0e" strokeWidth="5"/>
      <rect x="151" y="113" width="18" height="12" rx="3" fill="#121b20"/>
      <circle cx="160" cy="119" r="4.5" fill="#fff2a4" opacity=".9"/>
      <circle cx="160" cy="119" r="10" fill="#fff4b8" opacity=".15" filter="url(#v5Glow)"/>

      <path d="M112 209 H208 L200 229 H120 Z" fill="url(#v5Rust)" stroke="#42251f" strokeWidth="4"/>
      <path d="M105 230 H215" stroke="#1a2d33" strokeWidth="8"/>
      <path d="M115 233 L101 681 M205 233 L219 681" stroke="#1d3238" strokeWidth="5" opacity=".65"/>

      <path d="M88 669 H232" stroke="#182f35" strokeWidth="11" strokeLinecap="round"/>
      <path d="M102 650 H218" stroke="#718387" strokeWidth="5"/>
      <path d="M92 670 L76 700 M228 670 L244 700" stroke="#1b3137" strokeWidth="7"/>

      <g opacity=".28">
        <path d="M129 246 L144 246 M122 305 L140 305 M113 371 L136 371 M105 443 L132 443 M97 518 L128 518" stroke="#c96d44" strokeWidth="5"/>
        <path d="M191 246 L176 246 M198 305 L180 305 M207 371 L184 371 M215 443 L188 443" stroke="#8f533a" strokeWidth="4"/>
      </g>
    </g>
  </svg>;
}

function KeysDepthWater(){
  return <svg className="splashV5WaterArt" viewBox="0 0 1000 1200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="v5Sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#078fb0"/>
        <stop offset=".22" stopColor="#12abc2"/>
        <stop offset=".5" stopColor="#26c5cc"/>
        <stop offset=".74" stopColor="#4ed9d1"/>
        <stop offset="1" stopColor="#7fe6d9"/>
      </linearGradient>
      <radialGradient id="v5SandA"><stop stopColor="#f2f0b8" stopOpacity=".68"/><stop offset=".45" stopColor="#bde8cc" stopOpacity=".48"/><stop offset="1" stopColor="#76d3c8" stopOpacity="0"/></radialGradient>
      <radialGradient id="v5SandB"><stop stopColor="#e7efb5" stopOpacity=".54"/><stop offset=".5" stopColor="#a5dfca" stopOpacity=".35"/><stop offset="1" stopColor="#5fc8c0" stopOpacity="0"/></radialGradient>
      <pattern id="v5Caustics" width="140" height="90" patternUnits="userSpaceOnUse">
        <path d="M-10 31 C26 6 56 52 91 25 C111 10 132 15 151 32" fill="none" stroke="#efffff" strokeWidth="3" strokeOpacity=".20"/>
        <path d="M12 78 C38 56 70 92 104 62 C122 47 142 51 157 67" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity=".15"/>
      </pattern>
      <filter id="v5WaterSoft"><feGaussianBlur stdDeviation="16"/></filter>
    </defs>
    <rect width="1000" height="1200" fill="url(#v5Sea)"/>
    <ellipse cx="520" cy="430" rx="420" ry="200" fill="url(#v5SandA)" filter="url(#v5WaterSoft)"/>
    <ellipse cx="210" cy="790" rx="300" ry="190" fill="url(#v5SandB)" filter="url(#v5WaterSoft)"/>
    <ellipse cx="840" cy="915" rx="310" ry="200" fill="url(#v5SandA)" opacity=".72" filter="url(#v5WaterSoft)"/>
    <ellipse cx="500" cy="1090" rx="410" ry="180" fill="#b9ebd5" opacity=".18" filter="url(#v5WaterSoft)"/>
    <rect width="1000" height="1200" fill="url(#v5Caustics)" opacity=".9"/>
    <g fill="none" stroke="#e9ffff" strokeLinecap="round">
      <path d="M-20 260 C180 222 322 255 491 217 C655 180 802 195 1040 152" strokeWidth="5" opacity=".18"/>
      <path d="M-10 307 C161 281 332 312 499 277 C688 237 822 251 1040 213" strokeWidth="3" opacity=".14"/>
      <path d="M-10 654 C145 623 315 650 468 615 C633 577 818 586 1030 547" strokeWidth="5" opacity=".17"/>
      <path d="M-10 714 C170 679 328 711 491 671 C648 632 832 643 1040 601" strokeWidth="3" opacity=".14"/>
      <path d="M-20 1007 C152 974 319 1004 489 966 C662 926 823 945 1030 903" strokeWidth="4" opacity=".15"/>
    </g>
    <g fill="#ffffff" opacity=".36">
      <ellipse cx="127" cy="495" rx="74" ry="4"/>
      <ellipse cx="365" cy="348" rx="49" ry="3"/>
      <ellipse cx="724" cy="482" rx="83" ry="4"/>
      <ellipse cx="889" cy="693" rx="56" ry="3"/>
      <ellipse cx="533" cy="859" rx="69" ry="4"/>
      <ellipse cx="206" cy="1040" rx="57" ry="3"/>
    </g>
  </svg>;
}

function DistantFleet(){
  const boats=[
    {x:80,y:95,s:.62},{x:205,y:72,s:.44},{x:318,y:104,s:.54},{x:478,y:76,s:.42},
    {x:610,y:108,s:.55},{x:746,y:82,s:.46},{x:865,y:102,s:.58}
  ];
  return <svg className="splashV5DistantFleet" viewBox="0 0 950 180" aria-hidden="true">
    {boats.map((b,i)=><g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
      <ellipse cx="0" cy="18" rx="58" ry="7" fill="#084e61" opacity=".18"/>
      <path d="M-49 4 Q-12 -10 43 1 Q34 16 8 20 H-24 Q-41 16 -49 4Z" fill="#fff7df" stroke="#284a59" strokeWidth="3"/>
      <path d="M-6 -8 H26 L34 1 H-18Z" fill="#2a7d95"/>
      <path d="M-3 -13 Q7 -31 18 -31 Q29 -31 34 -13" fill="none" stroke="#344c50" strokeWidth="4"/>
    </g>)}
  </svg>;
}

export default function Splash({onEnter}:{onEnter:()=>void}){
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const [soundPlaying,setSoundPlaying]=useState(false);
  useEffect(()=>{
    const audio=new Audio('/audio/splash-theme.mp3');
    audio.preload='metadata';
    audio.loop=true;
    audio.volume=.7;
    audioRef.current=audio;
    const handlePause=()=>setSoundPlaying(false);
    const handlePlay=()=>setSoundPlaying(true);
    audio.addEventListener('pause',handlePause);
    audio.addEventListener('play',handlePlay);
    return()=>{
      audio.pause();
      audio.currentTime=0;
      audio.removeEventListener('pause',handlePause);
      audio.removeEventListener('play',handlePlay);
    };
  },[]);
  const toggleSound=async()=>{
    const audio=audioRef.current;
    if(!audio)return;
    if(!audio.paused){
      audio.pause();
      audio.currentTime=0;
      return;
    }
    try{await audio.play()}catch{setSoundPlaying(false)}
  };
  const enter=()=>{const audio=audioRef.current;onEnter();if(audio){try{audio.pause();audio.currentTime=0}catch{}}};

  return <main className="splash splashV5"><div className="splashV5Scene">
    <div className="splashV5Sky">
      <div className="splashV5Atmosphere"/>
      <div className="splashV5CloudBand cloudBandOne"/>
      <div className="splashV5CloudBand cloudBandTwo"/>
    </div>
    <div className="splashV5Horizon"/>
    <div className="splashV5Sea"><KeysDepthWater/></div>

    <DistantFleet/>
    <div className="splashV5Tower"><AlligatorReefTower/></div>

    <div className="splashV5Boat splashV5BoatLeft"><span className="splashV5Wake"/><BoatArt kind="center-console"/></div>
    <div className="splashV5Boat splashV5BoatRight"><span className="splashV5Wake"/><BoatArt kind="deck"/></div>

    <div className="splashV5Hero">
      <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="splashV5Logo"/>
      <div className="splashV5Tag">Build your fleet. Rule the islands.</div>
      <div className="splashV5Buttons">
        <button className="soundPrompt" onClick={toggleSound}>{soundPlaying?'■ Stop theme':'♫ Tap for theme'}</button>
        <button className="enterGame" onClick={enter}>ENTER THE ISLANDS</button>
      </div>
    </div>

    <div className="splashV5Location">ALLIGATOR REEF · FLORIDA KEYS</div>
    <small className="splashV5Build">Version 1.0 © 2026</small>
  </div></main>;
}
