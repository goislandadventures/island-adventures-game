import { useEffect, useRef, useState } from 'react';
import BoatArt from './BoatArt';

function SunArt(){
  return <svg className="splashSunSvg" viewBox="0 0 180 180" aria-hidden="true">
    <defs>
      <radialGradient id="sunFace" cx=".35" cy=".25"><stop stopColor="#fff47a"/><stop offset=".55" stopColor="#ffd92c"/><stop offset="1" stopColor="#f5a900"/></radialGradient>
      <linearGradient id="sunGlass" x1="0" x2="1"><stop stopColor="#223b54"/><stop offset=".55" stopColor="#0f1c2c"/><stop offset="1" stopColor="#345d74"/></linearGradient>
      <filter id="sunShadow"><feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity=".25"/></filter>
    </defs>
    <g filter="url(#sunShadow)">
      {[0,45,90,135,180,225,270,315].map(a=><path key={a} d="M90 5 L103 27 L77 27 Z" fill="#ffc324" transform={`rotate(${a} 90 90)`}/>)}
      <circle cx="90" cy="90" r="57" fill="url(#sunFace)" stroke="#e9a500" strokeWidth="3"/>
      <path d="M48 68 Q65 59 84 66 L80 91 Q60 98 47 82 Z" fill="url(#sunGlass)" stroke="#17324d" strokeWidth="5"/>
      <path d="M96 66 Q115 59 132 68 L133 82 Q120 98 100 91 Z" fill="url(#sunGlass)" stroke="#17324d" strokeWidth="5"/>
      <path d="M83 70 Q90 66 97 70" fill="none" stroke="#17324d" strokeWidth="5" strokeLinecap="round"/>
      <path d="M61 107 Q90 132 121 106 Q115 136 90 140 Q66 136 61 107Z" fill="#fff" stroke="#d79b00" strokeWidth="3"/>
      <path d="M58 76 Q66 69 75 69" fill="none" stroke="#8fe9ff" strokeWidth="5" strokeLinecap="round" opacity=".75"/>
      <path d="M106 70 Q115 67 123 72" fill="none" stroke="#8fe9ff" strokeWidth="5" strokeLinecap="round" opacity=".7"/>
    </g>
  </svg>;
}

function CloudArt({className}:{className:string}){
  return <svg className={`splashCloudSvg ${className}`} viewBox="0 0 240 120" aria-hidden="true">
    <defs>
      <radialGradient id={`cloudGlow-${className}`} cx=".35" cy=".18"><stop stopColor="#fff"/><stop offset=".6" stopColor="#eef6ff"/><stop offset="1" stopColor="#b8d8f6"/></radialGradient>
      <filter id={`cloudShadow-${className}`}><feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#397aa4" floodOpacity=".18"/></filter>
    </defs>
    <g filter={`url(#cloudShadow-${className})`}>
      <ellipse cx="119" cy="86" rx="89" ry="25" fill={`url(#cloudGlow-${className})`}/>
      <circle cx="64" cy="72" r="34" fill={`url(#cloudGlow-${className})`}/>
      <circle cx="108" cy="54" r="47" fill={`url(#cloudGlow-${className})`}/>
      <circle cx="153" cy="61" r="40" fill={`url(#cloudGlow-${className})`}/>
      <circle cx="190" cy="77" r="29" fill={`url(#cloudGlow-${className})`}/>
      <ellipse cx="103" cy="43" rx="28" ry="12" fill="#fff" opacity=".62"/>
    </g>
  </svg>;
}

function KeysWater(){
  return <svg className="keysWaterArt" viewBox="0 0 1000 1400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="keysSea" x1="0" y1="0" x2=".25" y2="1">
        <stop offset="0" stopColor="#79e5ed"/>
        <stop offset=".34" stopColor="#38cdd8"/>
        <stop offset=".72" stopColor="#23b9c8"/>
        <stop offset="1" stopColor="#159baa"/>
      </linearGradient>
      <radialGradient id="sandShelf" cx=".45" cy=".4">
        <stop offset="0" stopColor="#b9f3e8" stopOpacity=".88"/>
        <stop offset=".6" stopColor="#7de0d6" stopOpacity=".46"/>
        <stop offset="1" stopColor="#43c6c5" stopOpacity="0"/>
      </radialGradient>
      <filter id="reefBlur"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="softBlur"><feGaussianBlur stdDeviation="18"/></filter>
      <linearGradient id="towerMetal" x1="0" x2="1"><stop stopColor="#f6f0e6"/><stop offset=".5" stopColor="#b8c2c5"/><stop offset="1" stopColor="#5d7077"/></linearGradient>
      <linearGradient id="rust" x1="0" x2="1"><stop stopColor="#81402d"/><stop offset=".5" stopColor="#c57b4c"/><stop offset="1" stopColor="#6d3328"/></linearGradient>
    </defs>
    <rect width="1000" height="1400" fill="url(#keysSea)"/>
    <ellipse cx="540" cy="810" rx="570" ry="360" fill="url(#sandShelf)"/>
    <g filter="url(#softBlur)" fill="#0b6970" opacity=".34">
      <path d="M-80 760 C90 670 190 710 290 640 C390 570 500 620 590 585 C730 530 860 600 1080 470 L1080 650 C840 720 720 700 580 760 C410 830 250 780 70 880 Z"/>
      <path d="M-70 1070 C170 940 330 990 440 930 C570 860 670 870 790 820 C900 775 980 790 1070 755 L1070 1010 C930 1030 790 1080 650 1120 C430 1185 235 1145 50 1220 Z"/>
      <path d="M20 340 C180 300 270 350 390 320 C560 280 650 170 840 180 C920 185 980 205 1040 220 L1040 410 C850 390 745 445 590 450 C405 455 250 420 40 500 Z"/>
    </g>
    <g fill="#0a5962" opacity=".48" filter="url(#reefBlur)">
      <path d="M105 710 C190 642 278 665 330 719 C370 760 357 826 289 854 C214 887 133 842 105 784 C91 756 91 733 105 710Z"/>
      <path d="M642 950 C736 877 835 892 900 951 C945 991 928 1061 847 1098 C760 1137 677 1100 636 1034 C617 1002 619 974 642 950Z"/>
      <path d="M660 532 C731 472 832 480 890 540 C928 580 911 630 848 662 C766 703 689 680 644 620 C618 585 627 552 660 532Z"/>
      <path d="M373 1030 C421 985 493 993 536 1035 C569 1068 558 1119 509 1146 C451 1178 394 1152 364 1107 C344 1078 350 1053 373 1030Z"/>
      <path d="M245 455 C300 414 372 421 415 458 C449 487 441 531 397 558 C349 587 292 568 259 526 C240 502 232 476 245 455Z"/>
    </g>
    <g fill="none" stroke="#d8fff8" strokeOpacity=".28" strokeWidth="5">
      <path d="M0 860 C160 820 280 860 400 825 C565 776 655 795 790 750 C860 727 932 715 1000 716"/>
      <path d="M0 890 C160 850 280 890 400 855 C565 806 655 825 790 780 C860 757 932 745 1000 746"/>
      <path d="M65 565 C190 535 305 553 435 520 C585 482 690 497 835 470"/>
    </g>
    <g transform="translate(550 765)">
      <ellipse cx="0" cy="124" rx="145" ry="47" fill="#164f59" opacity=".16"/>
      <ellipse cx="0" cy="106" rx="70" ry="33" fill="#d6ecbd" opacity=".72"/>
      <ellipse cx="0" cy="108" rx="45" ry="20" fill="#5d7d67" opacity=".6"/>
      <g>
        <path d="M-29 103 L-10 -88 M29 103 L10 -88 M-29 103 L29 103 M-23 60 L23 60 M-18 20 L18 20 M-13 -20 L13 -20 M-8 -60 L8 -60" stroke="url(#towerMetal)" strokeWidth="8" fill="none"/>
        <path d="M-29 103 L10 -88 M29 103 L-10 -88 M-24 63 L24 20 M24 63 L-24 20 M-17 22 L17 -21 M17 22 L-17 -21" stroke="#7b8a8c" strokeWidth="4" opacity=".85"/>
        <rect x="-23" y="-103" width="46" height="18" rx="4" fill="url(#rust)"/>
        <rect x="-19" y="-126" width="38" height="26" rx="5" fill="#243f4c"/>
        <rect x="-13" y="-121" width="26" height="17" rx="2" fill="#8bd7e5"/>
        <path d="M-25 -127 L0 -145 L25 -127 Z" fill="#263943"/>
        <circle cx="0" cy="-134" r="4" fill="#f7d95e"/>
      </g>
    </g>
  </svg>;
}

export default function Splash({ onEnter }: { onEnter: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundBlocked, setSoundBlocked] = useState(false);

  useEffect(() => {
    const audio = new Audio('/audio/splash-theme.mp3');
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.7;
    audioRef.current = audio;
    audio.play().then(() => setSoundBlocked(false)).catch(() => setSoundBlocked(true));
    return () => { audio.pause(); audio.currentTime = 0; };
  }, []);

  const startSound = async () => {
    try { await audioRef.current?.play(); setSoundBlocked(false); }
    catch { setSoundBlocked(true); }
  };

  const enter = () => {
    const audio = audioRef.current;
    onEnter();
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch {}
    }
  };

  return <main className="splash"><div className="splashOcean">
    <KeysWater/>

    <div className="skyArt">
      <CloudArt className="cloudOne"/>
      <CloudArt className="cloudTwo"/>
      <CloudArt className="cloudThree"/>
      <SunArt/>
    </div>

    <div className="waterGlint glintOne"/><div className="waterGlint glintTwo"/>
    <div className="waterGlint glintThree"/><div className="waterGlint glintFour"/>

    <div className="splashBoat boatOne"><BoatArt kind="deck"/></div>
    <div className="splashBoat boatTwo"><BoatArt kind="pontoon"/></div>
    <div className="splashBoat boatThree"><BoatArt kind="center-console"/></div>

    <div className="splashHero">
      <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="splashLogoImage"/>
      <div className="splashTag">Build your fleet. Rule the islands.</div>
      <div className="splashButtons">
        {soundBlocked && <button className="soundPrompt" onClick={startSound}>♫ Tap for theme</button>}
        <button className="enterGame" onClick={enter}>ENTER THE ISLANDS</button>
      </div>
    </div>
    <small className="devThemeNote">Development build</small>
  </div></main>;
}
