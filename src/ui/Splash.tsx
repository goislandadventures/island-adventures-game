import { useEffect,useRef,useState } from 'react';

function ReefBoat({x,y,s=1,flip=false,canopy='#284f55',hull='#fffdf4',accent='#d9c18c'}:{x:number;y:number;s?:number;flip?:boolean;canopy?:string;hull?:string;accent?:string}){
  return <g transform={`translate(${x} ${y}) scale(${flip?-s:s} ${s})`}>
    <ellipse cx="0" cy="18" rx="63" ry="8" fill="#075369" opacity=".16"/>
    <path d="M-61 2 Q-34 -11 8 -11 Q43 -10 61 0 Q51 16 26 21 H-33 Q-52 16 -61 2Z" fill={hull} stroke="#5a7278" strokeWidth="2.5"/>
    <path d="M-52 5 Q-9 13 48 5 Q41 16 23 19 H-32 Q-45 15 -52 5Z" fill="#9aa8a7" opacity=".46"/>
    <path d="M-45 -1 Q-3 -12 41 -5 L49 2 Q1 1 -45 7Z" fill={accent} opacity=".86"/>
    <path d="M-9 -17 H29 L39 -5 H-20Z" fill="#5ec0d5" stroke="#326b80" strokeWidth="2.5"/>
    <path d="M0 -19 Q5 -39 18 -41 Q31 -40 36 -19 M-4 -40 H37" fill="none" stroke={canopy} strokeWidth="5" strokeLinecap="round"/>
    <path d="M58 -4 Q70 -2 68 12 L65 33 Q63 42 54 39 L47 34 L50 1Z" fill="#26353b" stroke="#162126" strokeWidth="2.5"/>
    <path d="M-47 12 Q-4 21 44 11" fill="none" stroke="#fff" strokeWidth="2.4" opacity=".72"/>
  </g>;
}

function AlligatorReefWorld(){
  const cx=500;
  const upperTop=560;
  const upperBottom=810;
  const levels=[570,600,632,666,702,740,778,806];
  const half=(y:number)=>42+(y-upperTop)*.25;
  const L=(y:number)=>cx-half(y);
  const R=(y:number)=>cx+half(y);

  return <svg className="splashV7World" viewBox="0 0 1000 1600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="v7Sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#07539a"/>
        <stop offset=".38" stopColor="#0e75b7"/>
        <stop offset=".72" stopColor="#3ca3cf"/>
        <stop offset="1" stopColor="#a6dce8"/>
      </linearGradient>
      <linearGradient id="v7Sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#098fa7"/>
        <stop offset=".18" stopColor="#08a9b8"/>
        <stop offset=".44" stopColor="#11bebf"/>
        <stop offset=".70" stopColor="#27cec4"/>
        <stop offset="1" stopColor="#59ddce"/>
      </linearGradient>
      <linearGradient id="v7Steel" x1="0" x2="1">
        <stop stopColor="#6d7979"/>
        <stop offset=".15" stopColor="#c9d0cc"/>
        <stop offset=".36" stopColor="#f7f8f2"/>
        <stop offset=".55" stopColor="#bfc8c3"/>
        <stop offset=".78" stopColor="#8e9997"/>
        <stop offset="1" stopColor="#566365"/>
      </linearGradient>
      <linearGradient id="v7White" x1="0" x2="1">
        <stop stopColor="#b8c6c2"/>
        <stop offset=".25" stopColor="#eef3ef"/>
        <stop offset=".55" stopColor="#ffffff"/>
        <stop offset=".82" stopColor="#bdc9c4"/>
        <stop offset="1" stopColor="#788986"/>
      </linearGradient>
      <linearGradient id="v7Weathered" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#d7d7ca"/>
        <stop offset=".25" stopColor="#a9aaa2"/>
        <stop offset=".52" stopColor="#ece9db"/>
        <stop offset=".75" stopColor="#8e918c"/>
        <stop offset="1" stopColor="#5b6463"/>
      </linearGradient>
      <linearGradient id="v7Rust" x1="0" x2="1">
        <stop stopColor="#4a2921"/>
        <stop offset=".35" stopColor="#9d5239"/>
        <stop offset=".58" stopColor="#c87550"/>
        <stop offset=".82" stopColor="#6e382c"/>
        <stop offset="1" stopColor="#33211c"/>
      </linearGradient>
      <linearGradient id="v7Glass" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#b9e9e8"/>
        <stop offset=".35" stopColor="#519aa1"/>
        <stop offset=".72" stopColor="#163e4a"/>
        <stop offset="1" stopColor="#0a1c23"/>
      </linearGradient>
      <radialGradient id="v7Sand">
        <stop stopColor="#f0ecb2" stopOpacity=".78"/>
        <stop offset=".38" stopColor="#cbe7be" stopOpacity=".52"/>
        <stop offset="1" stopColor="#76cfc1" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="v7SandSoft">
        <stop stopColor="#dfe9ad" stopOpacity=".50"/>
        <stop offset=".45" stopColor="#9edbbd" stopOpacity=".30"/>
        <stop offset="1" stopColor="#5bc4ba" stopOpacity="0"/>
      </radialGradient>
      <filter id="v7Blur20"><feGaussianBlur stdDeviation="20"/></filter>
      <filter id="v7Blur9"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="v7TowerShadow" x="-60%" y="-30%" width="220%" height="190%">
        <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#073d4e" floodOpacity=".28"/>
      </filter>
      <filter id="v7Texture" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency=".012 .028" numOctaves="2" seed="23" result="n"/>
        <feColorMatrix in="n" type="matrix" values="1 0 0 0 .5  0 1 0 0 .6  0 0 1 0 .6  0 0 0 .06 0" result="t"/>
        <feBlend in="SourceGraphic" in2="t" mode="overlay"/>
      </filter>
      <pattern id="v7Caustics" width="190" height="112" patternUnits="userSpaceOnUse">
        <path d="M-25 34 C10 5 51 56 96 27 C130 5 169 12 213 43" fill="none" stroke="#eaffff" strokeWidth="2.8" strokeOpacity=".13"/>
        <path d="M8 91 C50 60 89 108 135 77 C163 58 189 61 218 83" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity=".10"/>
      </pattern>
    </defs>

    {/* big Keys sky */}
    <rect width="1000" height="985" fill="url(#v7Sky)"/>
    <ellipse cx="510" cy="865" rx="720" ry="170" fill="#e9fbfb" opacity=".15" filter="url(#v7Blur20)"/>
    <path d="M-60 785 C109 731 232 784 354 751 C471 720 564 753 679 724 C818 690 916 710 1060 672" fill="none" stroke="#ffffff" strokeWidth="34" strokeLinecap="round" opacity=".10" filter="url(#v7Blur20)"/>
    <path d="M17 832 C151 796 264 829 374 803 C489 775 599 799 713 769 C823 742 916 750 1009 723" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" opacity=".30" filter="url(#v7Blur9)"/>
    <path d="M0 914 C164 888 303 910 460 881 C626 850 798 863 1000 827" fill="none" stroke="#edffff" strokeWidth="2.4" opacity=".42"/>

    {/* water and reef */}
    <rect y="970" width="1000" height="630" fill="url(#v7Sea)"/>
    <rect y="970" width="1000" height="630" fill="url(#v7Caustics)" opacity=".95"/>
    <ellipse cx="510" cy="1100" rx="470" ry="180" fill="url(#v7Sand)" filter="url(#v7Blur20)"/>
    <ellipse cx="165" cy="1360" rx="345" ry="195" fill="url(#v7SandSoft)" filter="url(#v7Blur20)"/>
    <ellipse cx="875" cy="1390" rx="360" ry="210" fill="url(#v7Sand)" opacity=".66" filter="url(#v7Blur20)"/>
    <g fill="#125e65" opacity=".055" filter="url(#v7Blur9)">
      <path d="M92 1144 C145 1103 221 1112 270 1150 C303 1177 293 1212 248 1231 C194 1254 129 1236 98 1197 C82 1176 81 1155 92 1144Z"/>
      <path d="M702 1210 C757 1165 840 1174 890 1216 C924 1245 911 1282 863 1303 C806 1327 744 1304 710 1264 C693 1243 692 1223 702 1210Z"/>
    </g>
    <g fill="none" stroke="#edffff" strokeLinecap="round">
      <path d="M-30 1033 C152 1006 311 1024 478 993 C644 963 813 973 1030 935" strokeWidth="4" opacity=".20"/>
      <path d="M-18 1081 C171 1052 317 1076 487 1045 C659 1014 813 1024 1034 986" strokeWidth="2.5" opacity=".15"/>
      <path d="M-20 1268 C153 1235 314 1261 471 1227 C652 1188 806 1203 1035 1161" strokeWidth="4" opacity=".16"/>
      <path d="M-20 1350 C161 1317 315 1344 493 1306 C655 1272 823 1281 1036 1244" strokeWidth="2.6" opacity=".12"/>
      <path d="M-10 1512 C165 1482 329 1503 486 1471 C653 1438 824 1447 1020 1411" strokeWidth="3" opacity=".11"/>
    </g>
    <path d="M0 970 H1000" stroke="#e7ffff" strokeWidth="4" opacity=".78"/>
    <path d="M0 978 H1000" stroke="#0b7485" strokeWidth="2" opacity=".28"/>

    {/* distant boats stay tiny like the photograph */}
    <g opacity=".88">
      <ReefBoat x={108} y={969} s={.34}/>
      <ReefBoat x={232} y={957} s={.27} flip/>
      <ReefBoat x={336} y={975} s={.30}/>
      <ReefBoat x={695} y={968} s={.31} flip canopy="#2f574f"/>
      <ReefBoat x={809} y={981} s={.36}/>
      <ReefBoat x={930} y={963} s={.25} flip/>
    </g>

    {/* ALLIGATOR REEF LIGHTHOUSE — actual two-mass silhouette */}
    <g filter="url(#v7TowerShadow)">
      {/* lantern */}
      <path d="M451 503 H549 V557 H451 Z" fill="url(#v7Glass)" stroke="#09171c" strokeWidth="7"/>
      <path d="M460 507 V553 M478 505 V555 M500 505 V555 M522 505 V555 M540 507 V553" stroke="#112d34" strokeWidth="3.5"/>
      <path d="M443 494 H557" stroke="#0b171c" strokeWidth="8" strokeLinecap="round"/>
      <path d="M452 480 H548" stroke="#1f3035" strokeWidth="5"/>
      <path d="M440 492 L500 461 L560 492 Z" fill="#101a1e" stroke="#080e11" strokeWidth="6"/>
      <path d="M493 450 H507 V463 H493 Z" fill="#121b1f"/>
      <circle cx="500" cy="456" r="4.2" fill="#f1d28c"/>

      {/* upper gallery */}
      <path d="M423 554 H577 L565 579 H435 Z" fill="#142226" stroke="#081215" strokeWidth="6"/>
      <path d="M414 548 H586" stroke="#111d21" strokeWidth="8" strokeLinecap="round"/>
      <path d="M431 579 H569" stroke="url(#v7Rust)" strokeWidth="7"/>

      {/* four white lattice legs */}
      <path d={`M ${L(upperBottom)} ${upperBottom} L ${L(upperTop)} ${upperTop}`} stroke="url(#v7Steel)" strokeWidth="12" fill="none" strokeLinecap="round"/>
      <path d={`M ${R(upperBottom)} ${upperBottom} L ${R(upperTop)} ${upperTop}`} stroke="url(#v7Steel)" strokeWidth="12" fill="none" strokeLinecap="round"/>
      <path d="M438 808 L474 561 M562 808 L526 561" stroke="#6f7d7e" strokeWidth="5.5" fill="none" opacity=".86"/>

      {/* dense upper lattice */}
      {levels.map((y,i)=><g key={'level'+y}>
        <path d={`M ${L(y)} ${y} H ${R(y)}`} stroke="#788587" strokeWidth={i===levels.length-1?5.5:4.2} opacity=".96"/>
        {i<levels.length-1&&<>
          <path d={`M ${L(y)+4} ${y} L ${R(levels[i+1])-4} ${levels[i+1]}`} stroke="#8b9696" strokeWidth="3.1" opacity=".90"/>
          <path d={`M ${R(y)-4} ${y} L ${L(levels[i+1])+4} ${levels[i+1]}`} stroke="#8b9696" strokeWidth="3.1" opacity=".90"/>
          <path d={`M ${L(y)+10} ${y+8} L ${R((y+levels[i+1])/2)-9} ${(y+levels[i+1])/2}`} stroke="#a4adab" strokeWidth="1.8" opacity=".70"/>
          <path d={`M ${R(y)-10} ${y+8} L ${L((y+levels[i+1])/2)+9} ${(y+levels[i+1])/2}`} stroke="#a4adab" strokeWidth="1.8" opacity=".70"/>
        </>}
      </g>)}

      {/* actual white center column only in upper tower */}
      <path d="M480 794 L486 579 H514 L520 794 Z" fill="url(#v7White)" stroke="#748682" strokeWidth="3.5"/>
      <path d="M490 588 L490 784" stroke="#fff" strokeWidth="3" opacity=".70"/>
      <path d="M511 590 L515 786" stroke="#81918d" strokeWidth="1.8" opacity=".45"/>

      {/* weathered big middle platform */}
      <path d="M369 790 H631 L616 831 H384 Z" fill="url(#v7Weathered)" stroke="#4b5758" strokeWidth="6"/>
      <path d="M356 832 H644" stroke="#111f23" strokeWidth="13" strokeLinecap="round"/>
      <path d="M379 786 H621" stroke="#7f8b89" strokeWidth="6"/>
      <path d="M388 829 H612" stroke="#151f22" strokeWidth="7"/>
      <g opacity=".33" strokeLinecap="round">
        <path d="M407 798 L402 823" stroke="#b25e42" strokeWidth="4"/>
        <path d="M454 795 L449 824" stroke="#8f4b38" strokeWidth="3"/>
        <path d="M536 797 L542 826" stroke="#a65a40" strokeWidth="4"/>
        <path d="M590 798 L596 820" stroke="#7c4334" strokeWidth="3"/>
      </g>

      {/* lower open black steel base — no white column */}
      <path d="M387 835 L353 966 M613 835 L647 966" stroke="#1b292d" strokeWidth="11" strokeLinecap="round"/>
      <path d="M414 836 L393 966 M586 836 L607 966" stroke="#26373a" strokeWidth="6.5" strokeLinecap="round"/>
      <path d="M387 835 L607 966 M613 835 L393 966" stroke="#243538" strokeWidth="6" opacity=".95"/>
      <path d="M374 873 H626 M366 915 H634 M355 959 H645" stroke="#293b3e" strokeWidth="5.5"/>
      <path d="M398 841 L374 873 L414 915 L366 959 M602 841 L626 873 L586 915 L634 959" stroke="#536164" strokeWidth="3.5" opacity=".88"/>

      {/* side dock and service frame from real photo */}
      <path d="M319 931 H445" stroke="#1d2d31" strokeWidth="8" strokeLinecap="round"/>
      <path d="M329 916 H434" stroke="#58676a" strokeWidth="5"/>
      <path d="M330 931 L316 967 M430 931 L442 967" stroke="#26383b" strokeWidth="6"/>
      <path d="M340 918 L420 918" stroke="#9f5b43" strokeWidth="3.5" opacity=".55"/>

      {/* reef footprint */}
      <ellipse cx="500" cy="989" rx="138" ry="24" fill="#e4e3aa" opacity=".55"/>
      <ellipse cx="500" cy="991" rx="82" ry="11" fill="#86c9ad" opacity=".44"/>
    </g>

    {/* boats clustered around base, still subordinate */}
    <g>
      <ReefBoat x={409} y={983} s={.42} canopy="#2b4b50"/>
      <ReefBoat x={555} y={990} s={.47} flip canopy="#31584e" accent="#e9d5a9"/>
      <ReefBoat x={698} y={1003} s={.58} canopy="#31584e" accent="#ead6ac"/>
      <ReefBoat x={274} y={997} s={.36} flip/>
    </g>

    {/* swimmers */}
    <g fill="#153e4e" opacity=".82">
      <circle cx="318" cy="1009" r="3.5"/><circle cx="341" cy="1014" r="3.2"/><circle cx="377" cy="1007" r="3.5"/>
      <circle cx="625" cy="1012" r="3.5"/><circle cx="655" cy="1008" r="3.2"/>
    </g>
    <g fill="none" stroke="#f4ffff" strokeWidth="2" opacity=".32">
      <ellipse cx="318" cy="1016" rx="12" ry="2.7"/><ellipse cx="377" cy="1014" rx="13" ry="2.7"/><ellipse cx="625" cy="1019" rx="12" ry="2.6"/>
    </g>

    {/* digital-world texture and foreground shimmer */}
    <rect width="1000" height="1600" fill="transparent" filter="url(#v7Texture)" opacity=".44"/>
    <g fill="#fff" opacity=".24">
      <ellipse cx="142" cy="1122" rx="69" ry="3.2"/>
      <ellipse cx="806" cy="1090" rx="79" ry="3.5"/>
      <ellipse cx="513" cy="1250" rx="56" ry="2.8"/>
      <ellipse cx="876" cy="1430" rx="68" ry="3.2"/>
      <ellipse cx="229" cy="1490" rx="50" ry="2.8"/>
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

  return <main className="splash splashV7">
    <div className="splashV7Scene">
      <AlligatorReefWorld/>
      <div className="splashV7Hero">
        <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="splashV7Logo"/>
        <div className="splashV7Tag">Build your fleet. Rule the islands.</div>
        <div className="splashV7Buttons">
          <button className="soundPrompt" onClick={toggleSound}>{soundPlaying?'■ Stop theme':'♫ Tap for theme'}</button>
          <button className="enterGame" onClick={enter}>ENTER THE ISLANDS</button>
        </div>
      </div>
      <small className="splashV7Build">Version 1.0 © 2026</small>
    </div>
  </main>;
}
