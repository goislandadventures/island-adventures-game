import { useEffect,useRef,useState } from 'react';

function Palm({x,y,s=1,lean=0}:{x:number;y:number;s?:number;lean?:number}){
  return <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
    <path d="M0 0 C8 -34 13 -72 8 -118 C5 -139 2 -157 0 -176" fill="none" stroke="#8f5d35" strokeWidth="14" strokeLinecap="round"/>
    <path d="M0 0 C7 -31 10 -69 6 -113" fill="none" stroke="#c88953" strokeWidth="5" strokeLinecap="round" opacity=".72"/>
    <g transform="translate(0 -178)">
      <path d="M0 3 C-35 -9 -64 -21 -94 -13 C-67 -5 -44 8 -14 21Z" fill="#1d7c55"/>
      <path d="M1 1 C-23 -36 -48 -57 -74 -64 C-56 -39 -34 -17 -9 14Z" fill="#2b955f"/>
      <path d="M0 0 C-2 -43 -11 -75 -28 -96 C-21 -64 -14 -31 -5 13Z" fill="#35a768"/>
      <path d="M1 1 C27 -41 49 -61 78 -67 C59 -42 36 -17 10 14Z" fill="#2e9b61"/>
      <path d="M2 4 C42 -15 76 -17 105 -4 C77 0 48 11 15 23Z" fill="#207e55"/>
      <path d="M1 4 C28 13 51 32 69 59 C43 44 22 30 7 17Z" fill="#319a61"/>
      <circle cx="-10" cy="8" r="7" fill="#7a4d27"/>
      <circle cx="4" cy="10" r="7" fill="#8c572b"/>
      <circle cx="16" cy="7" r="6" fill="#6d4525"/>
    </g>
  </g>;
}

function IslandWorld(){
  return <svg className="splashV8World" viewBox="0 0 1000 1600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="v8Sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0a68b8"/>
        <stop offset=".46" stopColor="#2aa4dc"/>
        <stop offset="1" stopColor="#8ee0ee"/>
      </linearGradient>
      <linearGradient id="v8Sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1bb8d0"/>
        <stop offset=".38" stopColor="#2fced2"/>
        <stop offset="1" stopColor="#73e4da"/>
      </linearGradient>
      <linearGradient id="v8Sand" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#ffe6a7"/>
        <stop offset=".58" stopColor="#efca79"/>
        <stop offset="1" stopColor="#dba85d"/>
      </linearGradient>
      <linearGradient id="v8Hill" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#6ab96d"/>
        <stop offset=".45" stopColor="#4d9f5c"/>
        <stop offset="1" stopColor="#2f7447"/>
      </linearGradient>
      <linearGradient id="v8Rock" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#64757b"/>
        <stop offset=".55" stopColor="#42535b"/>
        <stop offset="1" stopColor="#263740"/>
      </linearGradient>
      <radialGradient id="v8Shallow">
        <stop stopColor="#eff5bd" stopOpacity=".56"/>
        <stop offset=".48" stopColor="#bfe8c2" stopOpacity=".36"/>
        <stop offset="1" stopColor="#7bd8cb" stopOpacity="0"/>
      </radialGradient>
      <filter id="v8Blur18"><feGaussianBlur stdDeviation="18"/></filter>
      <filter id="v8Blur7"><feGaussianBlur stdDeviation="7"/></filter>
      <filter id="v8IslandShadow" x="-30%" y="-40%" width="160%" height="220%">
        <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#065f71" floodOpacity=".24"/>
      </filter>
      <linearGradient id="v8Reflection" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#ffffff" stopOpacity=".20"/>
        <stop offset="1" stopColor="#ffffff" stopOpacity="0"/>
      </linearGradient>
    </defs>

    {/* expansive sky */}
    <rect width="1000" height="930" fill="url(#v8Sky)"/>
    <ellipse cx="820" cy="140" rx="180" ry="110" fill="#ffffff" opacity=".08" filter="url(#v8Blur18)"/>
    <path d="M-40 685 C120 630 246 675 365 646 C474 620 590 644 706 616 C810 591 914 598 1040 564" fill="none" stroke="#ffffff" strokeWidth="22" opacity=".10" filter="url(#v8Blur18)"/>
    <path d="M52 742 C172 710 282 735 387 710 C497 685 606 703 711 678 C813 654 909 660 1000 637" fill="none" stroke="#ffffff" strokeWidth="5" opacity=".24" filter="url(#v8Blur7)"/>

    {/* sea */}
    <rect y="930" width="1000" height="670" fill="url(#v8Sea)"/>
    <ellipse cx="500" cy="1115" rx="455" ry="190" fill="url(#v8Shallow)"/>
    <path d="M0 930 H1000" stroke="#dffcff" strokeWidth="4" opacity=".84"/>
    <path d="M0 939 H1000" stroke="#0e8aa2" strokeWidth="2" opacity=".28"/>

    {/* distant specks */}
    <g fill="#1f5260" opacity=".52">
      <ellipse cx="99" cy="921" rx="27" ry="3"/>
      <ellipse cx="869" cy="925" rx="38" ry="3"/>
      <ellipse cx="914" cy="919" rx="14" ry="2"/>
    </g>

    {/* single hero island */}
    <g filter="url(#v8IslandShadow)">
      <ellipse cx="500" cy="1017" rx="330" ry="56" fill="#0e8ca0" opacity=".18"/>
      <path d="M208 957 C284 916 386 908 493 914 C615 907 713 919 794 957 C739 1001 641 1024 500 1026 C360 1024 261 1002 208 957Z" fill="url(#v8Sand)"/>

      {/* island green mass */}
      <path d="M326 922 C369 860 422 824 481 828 C531 785 612 796 649 847 C690 854 727 881 747 929 C659 946 568 952 485 951 C426 951 369 943 326 922Z" fill="url(#v8Hill)"/>

      {/* faceted terrain */}
      <path d="M325 922 L412 847 L471 829 L440 925Z" fill="#65b06a" opacity=".95"/>
      <path d="M440 925 L471 829 L549 804 L528 935Z" fill="#4b985b"/>
      <path d="M528 935 L549 804 L624 823 L654 932Z" fill="#397f4f"/>
      <path d="M654 932 L624 823 L708 889 L747 929Z" fill="#2c7047"/>
      <path d="M411 847 L455 825 L436 877Z" fill="#76c278" opacity=".85"/>

      {/* rocky ridge inspired by low-poly Fortnite terrain */}
      <path d="M417 859 L456 799 L501 817 L532 770 L601 790 L640 845 L608 877 L543 864 L485 883Z" fill="url(#v8Rock)"/>
      <path d="M456 799 L501 817 L484 852 L438 850Z" fill="#78888d"/>
      <path d="M501 817 L532 770 L553 833 L484 852Z" fill="#53646a"/>
      <path d="M532 770 L601 790 L575 838 L553 833Z" fill="#34464d"/>
      <path d="M601 790 L640 845 L575 838Z" fill="#2a3b42"/>

      {/* dock */}
      <path d="M653 944 L787 953 L780 971 L646 962Z" fill="#a36d3f"/>
      <path d="M663 935 L793 944 L787 953 L653 944Z" fill="#d69b5e"/>
      <path d="M679 956 L674 997 M745 960 L741 1001" stroke="#70472d" strokeWidth="7"/>

      {/* palms */}
      <Palm x={387} y={944} s={.72} lean={-6}/>
      <Palm x={472} y={930} s={.92} lean={4}/>
      <Palm x={573} y={940} s={.80} lean={2}/>
      <Palm x={651} y={946} s={.60} lean={8}/>
      <Palm x={315} y={946} s={.54} lean={-10}/>

      {/* simple branded beach hut */}
      <path d="M510 903 H606 V954 H510Z" fill="#b97a45" stroke="#6f482d" strokeWidth="4"/>
      <path d="M495 904 L558 867 L620 904Z" fill="#6f4b31" stroke="#4d3425" strokeWidth="4"/>
      <path d="M522 915 H548 V946 H522Z" fill="#f4d59a" opacity=".88"/>
      <path d="M561 914 H592 V936 H561Z" fill="#76c2d3" stroke="#426b73" strokeWidth="3"/>

      {/* one tasteful charter boat */}
      <g transform="translate(806 956) scale(.86)">
        <ellipse cx="0" cy="28" rx="84" ry="10" fill="#075a6d" opacity=".18"/>
        <path d="M-78 0 Q-48 -15 7 -15 Q50 -15 81 -3 Q66 22 38 29 H-41 Q-66 22 -78 0Z" fill="#fffdf5" stroke="#5a747d" strokeWidth="4"/>
        <path d="M-62 6 Q-7 19 65 7 Q56 23 35 27 H-39 Q-55 21 -62 6Z" fill="#a4b1b0" opacity=".52"/>
        <path d="M-44 -3 Q0 -14 49 -7 L60 1 Q4 1 -44 7Z" fill="#dfc382"/>
        <path d="M-8 -26 H32 L45 -8 H-23Z" fill="#6dc4d7" stroke="#356a7a" strokeWidth="4"/>
        <path d="M0 -30 Q5 -53 20 -55 Q37 -54 42 -30 M-5 -54 H45" fill="none" stroke="#304b52" strokeWidth="7" strokeLinecap="round"/>
        <path d="M79 -7 Q95 -4 91 15 L88 39 Q85 50 74 46 L65 39 L68 1Z" fill="#29373d" stroke="#152025" strokeWidth="4"/>
      </g>
    </g>

    {/* water reflection of island */}
    <g transform="translate(0 2040) scale(1 -1)" opacity=".16" filter="url(#v8Blur7)">
      <path d="M208 957 C284 916 386 908 493 914 C615 907 713 919 794 957 C739 1001 641 1024 500 1026 C360 1024 261 1002 208 957Z" fill="#f6dda0"/>
      <path d="M326 922 C369 860 422 824 481 828 C531 785 612 796 649 847 C690 854 727 881 747 929 C659 946 568 952 485 951 C426 951 369 943 326 922Z" fill="#477d55"/>
    </g>

    {/* calm water lines */}
    <g fill="none" stroke="#efffff" strokeLinecap="round">
      <path d="M-30 1060 C133 1034 287 1052 447 1021 C612 990 802 1003 1030 965" strokeWidth="4" opacity=".16"/>
      <path d="M-24 1114 C153 1084 318 1108 482 1074 C654 1039 821 1053 1030 1017" strokeWidth="2.5" opacity=".13"/>
      <path d="M-10 1290 C168 1259 323 1280 494 1247 C659 1215 814 1225 1020 1191" strokeWidth="4" opacity=".14"/>
      <path d="M-10 1414 C173 1384 329 1405 495 1374 C657 1343 824 1354 1020 1320" strokeWidth="2.8" opacity=".11"/>
    </g>

    {/* subtle underwater depth */}
    <g fill="#0f7583" opacity=".08">
      <ellipse cx="172" cy="1378" rx="115" ry="42"/>
      <ellipse cx="817" cy="1438" rx="150" ry="55"/>
      <ellipse cx="500" cy="1525" rx="190" ry="62"/>
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

  const enter=()=>{
    const audio=audioRef.current;
    onEnter();
    if(audio){try{audio.pause();audio.currentTime=0}catch{}}
  };

  return <main className="splash splashV8">
    <div className="splashV8Scene">
      <IslandWorld/>
      <div className="splashV8Hero">
        <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="splashV8Logo"/>
        <div className="splashV8Tag">Build your fleet. Rule the islands.</div>
        <div className="splashV8Buttons">
          <button className="soundPrompt" onClick={toggleSound}>{soundPlaying?'■ Stop theme':'♫ Tap for theme'}</button>
          <button className="enterGame" onClick={enter}>ENTER THE ISLANDS</button>
        </div>
      </div>
      <small className="splashV8Build">Version 1.0 © 2026</small>
    </div>
  </main>;
}
