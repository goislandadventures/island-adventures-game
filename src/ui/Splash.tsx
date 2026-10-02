import { useEffect,useRef,useState } from 'react';

function WorldBoat({x,y,scale=1,flip=false,top='#263f4c',accent='#f1d596'}:{x:number;y:number;scale?:number;flip?:boolean;top?:string;accent?:string}){
  return <g transform={`translate(${x} ${y}) scale(${flip?-scale:scale} ${scale})`} opacity=".96">
    <ellipse cx="0" cy="22" rx="62" ry="8" fill="#064f63" opacity=".20"/>
    <path d="M-58 3 Q-34 -10 2 -11 Q38 -12 59 -1 Q49 17 24 22 H-31 Q-50 17 -58 3Z" fill="#fffaf0" stroke="#58747b" strokeWidth="3"/>
    <path d="M-48 6 Q-10 13 46 5 Q40 16 22 20 H-31 Q-44 15 -48 6Z" fill="#c4c5bb" opacity=".72"/>
    <path d="M-43 -2 Q-4 -12 39 -5 L47 2 Q0 1 -43 6Z" fill={accent} opacity=".95"/>
    <path d="M-7 -18 H29 L39 -5 H-19Z" fill="#54b8d2" stroke="#285b72" strokeWidth="3"/>
    <path d="M0 -19 Q5 -42 17 -44 Q31 -43 36 -19" fill="none" stroke={top} strokeWidth="6" strokeLinecap="round"/>
    <path d="M-5 -42 H37" fill="none" stroke={top} strokeWidth="6" strokeLinecap="round"/>
    <path d="M58 -4 Q70 -2 68 13 L65 35 Q63 44 53 40 L46 35 L50 2Z" fill="#263238" stroke="#111b20" strokeWidth="3"/>
    <path d="M-49 13 Q-5 22 45 12" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity=".75"/>
  </g>;
}

function AlligatorWorld(){
  const levels=[438,486,538,594,654,718,786,848];
  const half=(y:number)=>46+(y-400)*.19;
  const left=(y:number)=>500-half(y);
  const right=(y:number)=>500+half(y);
  const braces:Array<[number,number,number,number]>= [];
  for(let i=0;i<levels.length-1;i++){
    const y1=levels[i],y2=levels[i+1];
    braces.push([left(y1),y1,right(y2),y2],[right(y1),y1,left(y2),y2]);
  }

  return <svg className="splashV6World" viewBox="0 0 1000 1600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="v6Sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#07569e"/>
        <stop offset=".36" stopColor="#1479ba"/>
        <stop offset=".72" stopColor="#43a9d3"/>
        <stop offset="1" stopColor="#a7dfe9"/>
      </linearGradient>
      <linearGradient id="v6Sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0795ad"/>
        <stop offset=".20" stopColor="#0faabd"/>
        <stop offset=".52" stopColor="#19c2c5"/>
        <stop offset=".78" stopColor="#35d3c8"/>
        <stop offset="1" stopColor="#6fe1d2"/>
      </linearGradient>
      <linearGradient id="v6Steel" x1="0" x2="1">
        <stop stopColor="#4b5e63"/>
        <stop offset=".18" stopColor="#aab7b8"/>
        <stop offset=".42" stopColor="#f4f7f1"/>
        <stop offset=".60" stopColor="#c2ceca"/>
        <stop offset=".82" stopColor="#697b7d"/>
        <stop offset="1" stopColor="#3b4e54"/>
      </linearGradient>
      <linearGradient id="v6Column" x1="0" x2="1">
        <stop stopColor="#cfd8d4"/>
        <stop offset=".27" stopColor="#f8faf5"/>
        <stop offset=".58" stopColor="#ffffff"/>
        <stop offset=".78" stopColor="#aebdb8"/>
        <stop offset="1" stopColor="#708583"/>
      </linearGradient>
      <linearGradient id="v6Rust" x1="0" x2="1">
        <stop stopColor="#342019"/>
        <stop offset=".28" stopColor="#6f3528"/>
        <stop offset=".55" stopColor="#ad5e3f"/>
        <stop offset=".78" stopColor="#6b372a"/>
        <stop offset="1" stopColor="#2c1b18"/>
      </linearGradient>
      <linearGradient id="v6Lantern" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#beeef1"/>
        <stop offset=".32" stopColor="#4c9da8"/>
        <stop offset=".72" stopColor="#173e4c"/>
        <stop offset="1" stopColor="#0c2029"/>
      </linearGradient>
      <radialGradient id="v6SandA">
        <stop stopColor="#f4efb4" stopOpacity=".80"/>
        <stop offset=".42" stopColor="#cfeac5" stopOpacity=".56"/>
        <stop offset="1" stopColor="#7ad2c5" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="v6SandB">
        <stop stopColor="#dbe9aa" stopOpacity=".58"/>
        <stop offset=".46" stopColor="#9fdec1" stopOpacity=".34"/>
        <stop offset="1" stopColor="#69c7bd" stopOpacity="0"/>
      </radialGradient>
      <filter id="v6Blur20"><feGaussianBlur stdDeviation="20"/></filter>
      <filter id="v6Blur8"><feGaussianBlur stdDeviation="8"/></filter>
      <filter id="v6TowerShadow" x="-50%" y="-30%" width="200%" height="190%">
        <feDropShadow dx="0" dy="18" stdDeviation="13" floodColor="#083e50" floodOpacity=".28"/>
      </filter>
      <filter id="v6WaterNoise" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency=".012 .065" numOctaves="2" seed="17" result="noise"/>
        <feColorMatrix in="noise" type="matrix" values="1 0 0 0 .9  0 1 0 0 1  0 0 1 0 1  0 0 0 .18 0" result="softNoise"/>
        <feBlend in="SourceGraphic" in2="softNoise" mode="screen"/>
      </filter>
      <pattern id="v6Caustics" width="190" height="110" patternUnits="userSpaceOnUse">
        <path d="M-20 35 C18 3 55 57 96 27 C129 4 164 10 205 42" fill="none" stroke="#efffff" strokeWidth="3" strokeOpacity=".15"/>
        <path d="M11 92 C53 59 92 112 136 78 C162 58 188 60 211 81" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity=".12"/>
      </pattern>
    </defs>

    {/* Sky and atmosphere */}
    <rect width="1000" height="850" fill="url(#v6Sky)"/>
    <ellipse cx="520" cy="760" rx="650" ry="170" fill="#d9f4f4" opacity=".20" filter="url(#v6Blur20)"/>
    <path d="M-80 610 C80 555 210 608 330 580 C455 552 548 592 660 567 C795 536 912 555 1080 505" fill="none" stroke="#ffffff" strokeWidth="32" strokeLinecap="round" opacity=".13" filter="url(#v6Blur20)"/>
    <path d="M38 682 C170 640 258 676 359 655 C477 632 563 657 688 624 C785 598 873 605 995 568" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" opacity=".34" filter="url(#v6Blur8)"/>
    <path d="M50 734 C201 706 333 728 458 702 C594 674 716 691 949 645" fill="none" stroke="#eaffff" strokeWidth="3" opacity=".45"/>

    {/* Sea and reef */}
    <rect y="830" width="1000" height="770" fill="url(#v6Sea)"/>
    <rect y="830" width="1000" height="770" fill="url(#v6Caustics)" opacity=".92"/>
    <ellipse cx="505" cy="980" rx="450" ry="205" fill="url(#v6SandA)" filter="url(#v6Blur20)"/>
    <ellipse cx="180" cy="1270" rx="350" ry="210" fill="url(#v6SandB)" filter="url(#v6Blur20)"/>
    <ellipse cx="870" cy="1320" rx="345" ry="220" fill="url(#v6SandA)" opacity=".72" filter="url(#v6Blur20)"/>
    <ellipse cx="555" cy="1510" rx="470" ry="190" fill="#ccefcf" opacity=".16" filter="url(#v6Blur20)"/>
    <g fill="#195f64" opacity=".065" filter="url(#v6Blur8)">
      <path d="M77 1032 C126 990 213 994 265 1038 C301 1069 292 1110 244 1130 C183 1156 113 1134 82 1088 C65 1063 65 1044 77 1032Z"/>
      <path d="M721 1110 C774 1062 862 1073 906 1116 C937 1147 923 1189 873 1210 C818 1233 754 1209 723 1167 C706 1144 708 1126 721 1110Z"/>
      <path d="M360 1352 C411 1311 482 1319 526 1356 C557 1383 546 1420 503 1440 C453 1463 392 1443 364 1404 C348 1381 348 1362 360 1352Z"/>
    </g>
    <g fill="none" stroke="#f1ffff" strokeLinecap="round">
      <path d="M-40 900 C168 868 295 890 474 857 C642 826 805 838 1050 793" strokeWidth="5" opacity=".22"/>
      <path d="M-22 946 C140 919 305 944 483 912 C648 883 820 893 1035 855" strokeWidth="3" opacity=".17"/>
      <path d="M-28 1160 C137 1128 296 1154 453 1119 C638 1078 799 1096 1040 1052" strokeWidth="5" opacity=".18"/>
      <path d="M-35 1230 C168 1192 307 1221 485 1183 C648 1149 821 1158 1045 1115" strokeWidth="3" opacity=".14"/>
      <path d="M-20 1460 C147 1427 308 1450 482 1416 C656 1382 820 1393 1035 1351" strokeWidth="4" opacity=".13"/>
    </g>

    {/* Horizon line */}
    <path d="M0 830 H1000" stroke="#dffcff" strokeWidth="4" opacity=".85"/>
    <path d="M0 838 H1000" stroke="#096f86" strokeWidth="2" opacity=".28"/>

    {/* Distant fleet and swimmers at real scale */}
    <g className="v6EnvironmentalBoats">
      <WorldBoat x={112} y={820} scale={.40}/>
      <WorldBoat x={244} y={812} scale={.30} flip/>
      <WorldBoat x={345} y={834} scale={.35}/>
      <WorldBoat x={670} y={821} scale={.37} flip top="#294a50"/>
      <WorldBoat x={795} y={837} scale={.42}/>
      <WorldBoat x={912} y={820} scale={.28} flip/>
    </g>
    <g fill="#143f51" opacity=".82">
      <circle cx="302" cy="858" r="4"/><circle cx="321" cy="853" r="4"/><circle cx="354" cy="860" r="3.5"/>
      <circle cx="625" cy="859" r="4"/><circle cx="650" cy="853" r="3.5"/><circle cx="705" cy="865" r="4"/>
    </g>
    <g fill="none" stroke="#f4ffff" strokeWidth="2.2" opacity=".35">
      <ellipse cx="302" cy="866" rx="13" ry="3"/><ellipse cx="625" cy="867" rx="15" ry="3"/><ellipse cx="705" cy="873" rx="12" ry="2.5"/>
    </g>

    {/* Alligator Reef Lighthouse */}
    <g filter="url(#v6TowerShadow)">
      {/* lower reef/platform */}
      <ellipse cx="500" cy="895" rx="150" ry="26" fill="#e4e3af" opacity=".62"/>
      <ellipse cx="500" cy="897" rx="94" ry="12" fill="#86c8ae" opacity=".48"/>
      <path d="M346 839 H655" stroke="#162e34" strokeWidth="13" strokeLinecap="round"/>
      <path d="M365 823 H636" stroke="#5b6d70" strokeWidth="7"/>
      <path d="M369 845 L347 878 M631 845 L653 878" stroke="#1e363c" strokeWidth="8" strokeLinecap="round"/>
      <path d="M386 808 H614" stroke="#7c8b8b" strokeWidth="5"/>

      {/* four main legs */}
      <path d="M355 872 L451 421 M645 872 L549 421" stroke="url(#v6Steel)" strokeWidth="15" fill="none" strokeLinecap="round"/>
      <path d="M382 872 L464 421 M618 872 L536 421" stroke="#42595f" strokeWidth="7" fill="none" opacity=".88"/>

      {/* level horizontals + lattice */}
      {levels.map(y=><path key={'h'+y} d={`M ${left(y)} ${y} H ${right(y)}`} stroke="#6f8184" strokeWidth="6" opacity=".98"/>)}
      {braces.map((b,i)=><path key={'b'+i} d={`M ${b[0]} ${b[1]} L ${b[2]} ${b[3]}`} stroke="#718286" strokeWidth="5" opacity=".96"/>)}

      {/* secondary lattice for density */}
      {levels.slice(0,-1).map((y,i)=>{
        const y2=levels[i+1], mid=(y+y2)/2;
        return <g key={'m'+y} opacity=".72">
          <path d={`M ${left(y)+8} ${y} L ${right(mid)-8} ${mid}`} stroke="#94a1a1" strokeWidth="2.7"/>
          <path d={`M ${right(y)-8} ${y} L ${left(mid)+8} ${mid}`} stroke="#94a1a1" strokeWidth="2.7"/>
          <path d={`M ${left(mid)+8} ${mid} L ${right(y2)-8} ${y2}`} stroke="#94a1a1" strokeWidth="2.7"/>
          <path d={`M ${right(mid)-8} ${mid} L ${left(y2)+8} ${y2}`} stroke="#94a1a1" strokeWidth="2.7"/>
        </g>;
      })}

      {/* central white column */}
      <path d="M470 781 L480 447 L520 447 L530 781 Z" fill="url(#v6Column)" stroke="#728785" strokeWidth="4"/>
      <path d="M486 457 L486 767" stroke="#ffffff" strokeWidth="4" opacity=".76"/>
      <path d="M514 458 L520 772" stroke="#788b89" strokeWidth="2" opacity=".58"/>

      {/* broad gallery/platform seen in reference */}
      <path d="M405 401 H595 L580 438 H420 Z" fill="#111e23" stroke="#081216" strokeWidth="7"/>
      <path d="M393 390 H607" stroke="#09151a" strokeWidth="10" strokeLinecap="round"/>
      <path d="M409 438 H591" stroke="#6a3a2e" strokeWidth="9" opacity=".92"/>
      <path d="M423 445 H577" stroke="#b26245" strokeWidth="4" opacity=".72"/>

      {/* lantern room */}
      <path d="M438 331 H562 V397 H438 Z" fill="url(#v6Lantern)" stroke="#0a151a" strokeWidth="8"/>
      <path d="M450 335 V393 M472 333 V395 M500 333 V395 M528 333 V395 M550 335 V393" stroke="#10262d" strokeWidth="4"/>
      <path d="M433 326 H567" stroke="#0c171c" strokeWidth="9" strokeLinecap="round"/>
      <path d="M445 314 H555" stroke="#1c2b31" strokeWidth="6"/>
      <path d="M430 323 L500 286 L570 323 Z" fill="#10191e" stroke="#080d10" strokeWidth="7"/>
      <path d="M492 273 H508 V288 H492 Z" fill="#121b20"/>
      <circle cx="500" cy="279" r="5" fill="#f7dda0"/>
      <circle cx="500" cy="279" r="15" fill="#fff1a7" opacity=".10" filter="url(#v6Blur8)"/>

      {/* weathering and rust streaks */}
      <g opacity=".30" strokeLinecap="round">
        <path d="M430 453 L425 505" stroke="#b45f42" strokeWidth="5"/>
        <path d="M450 448 L444 483" stroke="#7c3d31" strokeWidth="3"/>
        <path d="M569 451 L575 516" stroke="#9f5038" strokeWidth="5"/>
        <path d="M397 610 L388 650" stroke="#a5553b" strokeWidth="4"/>
        <path d="M603 607 L612 646" stroke="#8a4735" strokeWidth="4"/>
        <path d="M463 560 L461 602" stroke="#bd6746" strokeWidth="3"/>
      </g>

      {/* lower service deck */}
      <path d="M404 768 H596 L612 803 H388 Z" fill="#273a3f" stroke="#132329" strokeWidth="6"/>
      <path d="M382 807 H618" stroke="#172b31" strokeWidth="10"/>
      <path d="M406 771 L392 808 M594 771 L608 808" stroke="#7b8b8c" strokeWidth="6"/>
      <path d="M430 776 H570" stroke="#a86449" strokeWidth="4" opacity=".50"/>
    </g>

    {/* boats tucked around the tower like the reference */}
    <g className="v6TowerBoats">
      <WorldBoat x={420} y={850} scale={.48} top="#233e46"/>
      <WorldBoat x={575} y={865} scale={.58} flip top="#2f514c" accent="#e4d0a4"/>
      <WorldBoat x={708} y={892} scale={.66} top="#31554d" accent="#f2e2b3"/>
      <WorldBoat x={260} y={890} scale={.43} flip/>
    </g>

    {/* subtle foreground shimmer only; no toy foreground boats */}
    <g className="v6Sparkles" fill="#ffffff">
      <ellipse cx="120" cy="1034" rx="62" ry="3.5" opacity=".28"/>
      <ellipse cx="760" cy="1012" rx="76" ry="4" opacity=".31"/>
      <ellipse cx="455" cy="1205" rx="52" ry="3" opacity=".23"/>
      <ellipse cx="864" cy="1328" rx="68" ry="3.5" opacity=".26"/>
      <ellipse cx="227" cy="1415" rx="47" ry="3" opacity=".22"/>
    </g>
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
    if(!audio.paused){audio.pause();audio.currentTime=0;return}
    try{await audio.play()}catch{setSoundPlaying(false)}
  };
  const enter=()=>{const audio=audioRef.current;onEnter();if(audio){try{audio.pause();audio.currentTime=0}catch{}}};

  return <main className="splash splashV6">
    <div className="splashV6Scene">
      <AlligatorWorld/>
      <div className="splashV6Hero">
        <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="splashV6Logo"/>
        <div className="splashV6Tag">Build your fleet. Rule the islands.</div>
        <div className="splashV6Buttons">
          <button className="soundPrompt" onClick={toggleSound}>{soundPlaying?'■ Stop theme':'♫ Tap for theme'}</button>
          <button className="enterGame" onClick={enter}>ENTER THE ISLANDS</button>
        </div>
      </div>
      <small className="splashV6Build">Version 1.0 © 2026</small>
    </div>
  </main>;
}
