import { useEffect,useRef,useState } from 'react';

function FacetedPalm({x,y,s=1,lean=0}:{x:number;y:number;s?:number;lean?:number}){
  return <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
    <path d="M0 0 C6 -28 8 -63 2 -106 C0 -123 -3 -139 -6 -154" fill="none" stroke="#654328" strokeWidth="11" strokeLinecap="round"/>
    <path d="M-5 -154 L-78 -175 L-18 -145 Z" fill="#1e6947"/>
    <path d="M-5 -154 L-61 -208 L-7 -166 Z" fill="#248354"/>
    <path d="M-5 -154 L-19 -225 L4 -171 Z" fill="#2a965b"/>
    <path d="M-3 -154 L51 -211 L8 -165 Z" fill="#258650"/>
    <path d="M-1 -153 L78 -180 L13 -144 Z" fill="#1b6c46"/>
    <path d="M-1 -152 L51 -124 L10 -142 Z" fill="#26794b"/>
    <circle cx="-12" cy="-151" r="6" fill="#71441f"/>
    <circle cx="1" cy="-150" r="6" fill="#855126"/>
  </g>;
}

function UnrealIslandWorld(){
  return <svg className="splashV9World" viewBox="0 0 1000 1600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="v9Sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0759a8"/>
        <stop offset=".42" stopColor="#00aee4"/>
        <stop offset=".78" stopColor="#55d9ef"/>
        <stop offset="1" stopColor="#b8f2f3"/>
      </linearGradient>
      <linearGradient id="v9Sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#13bcd0"/>
        <stop offset=".34" stopColor="#16d1d0"/>
        <stop offset="1" stopColor="#68e8df"/>
      </linearGradient>
      <linearGradient id="v9Sand" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#ffe9a2"/>
        <stop offset=".52" stopColor="#f2cc72"/>
        <stop offset="1" stopColor="#c99a4f"/>
      </linearGradient>
      <linearGradient id="v9RockA" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#354f61"/>
        <stop offset=".5" stopColor="#253b4b"/>
        <stop offset="1" stopColor="#162a38"/>
      </linearGradient>
      <linearGradient id="v9RockB" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#678293"/>
        <stop offset=".46" stopColor="#415c6f"/>
        <stop offset="1" stopColor="#223746"/>
      </linearGradient>
      <linearGradient id="v9Grass" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#6bc272"/>
        <stop offset=".45" stopColor="#43995b"/>
        <stop offset="1" stopColor="#236849"/>
      </linearGradient>
      <radialGradient id="v9Shallow">
        <stop stopColor="#f6efb3" stopOpacity=".52"/>
        <stop offset=".46" stopColor="#c7e8bc" stopOpacity=".32"/>
        <stop offset="1" stopColor="#69d2c4" stopOpacity="0"/>
      </radialGradient>
      <filter id="v9Blur22"><feGaussianBlur stdDeviation="22"/></filter>
      <filter id="v9Blur7"><feGaussianBlur stdDeviation="7"/></filter>
      <filter id="v9IslandShadow" x="-30%" y="-40%" width="160%" height="220%">
        <feDropShadow dx="0" dy="18" stdDeviation="13" floodColor="#005a78" floodOpacity=".28"/>
      </filter>
      <pattern id="v9Grid" width="120" height="70" patternUnits="userSpaceOnUse">
        <path d="M0 70 L120 70 M60 0 L60 70 M0 0 L120 70 M120 0 L0 70" stroke="#d9ffff" strokeOpacity=".10" strokeWidth="1"/>
      </pattern>
    </defs>

    {/* saturated sky */}
    <rect width="1000" height="980" fill="url(#v9Sky)"/>
    <g className="v9Rays" opacity=".16">
      <path d="M510 0 L410 760 L535 760Z" fill="#ffffff"/>
      <path d="M510 0 L560 760 L690 760Z" fill="#ffffff"/>
      <path d="M510 0 L125 760 L360 760Z" fill="#7eeeff"/>
      <path d="M510 0 L735 760 L930 760Z" fill="#62e6ff"/>
    </g>
    <rect width="1000" height="980" fill="url(#v9Grid)" opacity=".42"/>
    <ellipse cx="500" cy="870" rx="690" ry="150" fill="#ffffff" opacity=".14" filter="url(#v9Blur22)"/>

    {/* streak clouds, not fluffy cartoon clouds */}
    <path d="M-80 720 C130 675 247 714 390 684 C560 650 732 675 1080 604" fill="none" stroke="#ffffff" strokeWidth="24" opacity=".13" filter="url(#v9Blur22)"/>
    <path d="M10 778 C189 748 315 765 466 738 C629 709 792 721 1010 674" fill="none" stroke="#ffffff" strokeWidth="6" opacity=".28" filter="url(#v9Blur7)"/>

    {/* low-camera water */}
    <rect y="945" width="1000" height="655" fill="url(#v9Sea)"/>
    <ellipse cx="510" cy="1090" rx="520" ry="170" fill="url(#v9Shallow)"/>
    <path d="M0 945 H1000" stroke="#f4ffff" strokeWidth="5" opacity=".82"/>
    <rect y="945" width="1000" height="655" fill="url(#v9Grid)" opacity=".28"/>

    {/* thin horizon silhouettes */}
    <path d="M0 935 C80 927 138 932 204 925 C262 919 310 922 360 920 L360 949 H0Z" fill="#0f7590" opacity=".40"/>
    <path d="M740 929 C800 920 860 925 1000 917 V948 H740Z" fill="#0c6b85" opacity=".34"/>

    {/* wide, low island */}
    <g filter="url(#v9IslandShadow)">
      <ellipse cx="500" cy="1011" rx="410" ry="58" fill="#047d92" opacity=".17"/>
      <path d="M70 967 C203 919 361 913 492 920 C655 911 805 925 930 965 C842 1005 694 1027 500 1031 C306 1028 161 1007 70 967Z" fill="url(#v9Sand)"/>

      {/* grassy land shelf */}
      <path d="M166 946 L255 889 L349 878 L428 903 L514 853 L615 872 L688 914 L782 902 L852 949 C716 969 595 973 486 970 C365 971 261 965 166 946Z" fill="url(#v9Grass)"/>

      {/* angular mountain/ridge mass */}
      <path d="M280 921 L365 826 L449 842 L523 768 L626 788 L722 897 L650 929 L534 914 L448 938Z" fill="url(#v9RockA)"/>
      <path d="M365 826 L449 842 L423 895 L318 902Z" fill="#547489"/>
      <path d="M449 842 L523 768 L553 861 L423 895Z" fill="url(#v9RockB)"/>
      <path d="M523 768 L626 788 L601 872 L553 861Z" fill="#314c5f"/>
      <path d="M626 788 L722 897 L601 872Z" fill="#1e3344"/>
      <path d="M318 902 L423 895 L448 938 L280 921Z" fill="#263e50"/>
      <path d="M553 861 L601 872 L650 929 L534 914Z" fill="#213849"/>

      {/* sparse palms: asymmetrical, more Fortnite-like */}
      <FacetedPalm x={242} y={954} s={.60} lean={-6}/>
      <FacetedPalm x={322} y={944} s={.74} lean={4}/>
      <FacetedPalm x={740} y={952} s={.56} lean={7}/>

      {/* tiny dock and hut */}
      <path d="M665 942 L808 949 L800 964 L657 958Z" fill="#7a563c"/>
      <path d="M675 936 L812 944 L807 951 L666 944Z" fill="#b78255"/>
      <path d="M691 958 L687 997 M755 961 L751 1000" stroke="#5b412f" strokeWidth="7"/>
      <path d="M573 913 H636 V950 H573Z" fill="#9d6d47" stroke="#5c402f" strokeWidth="3"/>
      <path d="M563 914 L604 888 L645 914Z" fill="#684933"/>
      <rect x="584" y="923" width="19" height="24" fill="#efd18f"/>
      <rect x="609" y="922" width="18" height="15" fill="#60b7d0"/>

      {/* single integrated boat, mostly silhouette scale */}
      <g transform="translate(862 964) scale(.63)">
        <ellipse cx="0" cy="25" rx="86" ry="9" fill="#005f73" opacity=".18"/>
        <path d="M-82 1 Q-48 -15 7 -15 Q52 -15 84 -4 Q68 22 39 29 H-44 Q-68 23 -82 1Z" fill="#f8fbf8" stroke="#415d6a" strokeWidth="4"/>
        <path d="M-57 -3 Q-5 -16 49 -8 L61 1 Q3 2 -57 8Z" fill="#d1b779"/>
        <path d="M-8 -27 H34 L47 -8 H-24Z" fill="#56b8d4" stroke="#2e6074" strokeWidth="4"/>
        <path d="M1 -31 Q7 -55 22 -57 Q38 -56 44 -31 M-5 -56 H47" fill="none" stroke="#283e49" strokeWidth="7" strokeLinecap="round"/>
        <path d="M82 -7 Q99 -3 95 16 L92 41 Q89 52 77 47 L67 40 L71 1Z" fill="#26343b" stroke="#111b20" strokeWidth="4"/>
      </g>
    </g>

    {/* aggressive mirrored/reflection treatment */}
    <g opacity=".18" filter="url(#v9Blur7)" transform="translate(0 1995) scale(1 -1)">
      <path d="M70 967 C203 919 361 913 492 920 C655 911 805 925 930 965 C842 1005 694 1027 500 1031 C306 1028 161 1007 70 967Z" fill="#f6d98a"/>
      <path d="M280 921 L365 826 L449 842 L523 768 L626 788 L722 897 L650 929 L534 914 L448 938Z" fill="#183b4c"/>
    </g>

    {/* water streaks and perspective lines */}
    <g fill="none" stroke="#f3ffff" strokeLinecap="round">
      <path d="M-40 1065 C150 1039 305 1054 481 1021 C656 989 819 1000 1040 960" strokeWidth="4" opacity=".22"/>
      <path d="M-22 1122 C148 1091 316 1114 490 1080 C661 1047 823 1058 1027 1022" strokeWidth="2.7" opacity=".18"/>
      <path d="M-14 1268 C158 1234 329 1258 497 1226 C672 1192 826 1204 1028 1168" strokeWidth="4" opacity=".17"/>
      <path d="M-20 1398 C157 1363 327 1388 500 1355 C664 1325 822 1334 1026 1300" strokeWidth="2.8" opacity=".13"/>
    </g>

    {/* subtle vignette */}
    <rect width="1000" height="1600" fill="none" stroke="#03568f" strokeWidth="34" opacity=".12"/>
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

  const enter=()=>{
    const audio=audioRef.current;
    onEnter();
    if(audio){try{audio.pause();audio.currentTime=0}catch{}}
  };

  return <main className="splash splashV9">
    <div className="splashV9Scene">
      <UnrealIslandWorld/>
      <div className="splashV9Hero">
        <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="splashV9Logo"/>
        <div className="splashV9Tag">Build your fleet. Rule the islands.</div>
        <div className="splashV9Buttons">
          <button className="soundPrompt" onClick={toggleSound}>{soundPlaying?'■ Stop theme':'♫ Tap for theme'}</button>
          <button className="enterGame" onClick={enter}>ENTER THE ISLANDS</button>
        </div>
      </div>
      <small className="splashV9Build">Version 1.0 © 2026</small>
    </div>
  </main>;
}
