import { useEffect,useRef,useState } from 'react';
import BoatArt from './BoatArt';

function SunArt(){
  return <svg className="splashV3Sun" viewBox="0 0 180 180" aria-hidden="true">
    <defs>
      <radialGradient id="v3SunFace" cx=".35" cy=".25"><stop stopColor="#fff894"/><stop offset=".52" stopColor="#ffd82f"/><stop offset="1" stopColor="#f6a900"/></radialGradient>
      <linearGradient id="v3SunGlass" x1="0" x2="1"><stop stopColor="#2e526c"/><stop offset=".5" stopColor="#101d2c"/><stop offset="1" stopColor="#315d77"/></linearGradient>
      <filter id="v3SunShadow"><feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#d29000" floodOpacity=".22"/></filter>
    </defs>
    <g filter="url(#v3SunShadow)">
      {[0,45,90,135,180,225,270,315].map(a=><path key={a} d="M90 4 L104 28 L76 28 Z" fill="#ffc42d" transform={`rotate(${a} 90 90)`}/>)}
      <circle cx="90" cy="90" r="58" fill="url(#v3SunFace)" stroke="#e8a500" strokeWidth="3"/>
      <path d="M48 69 Q65 59 84 66 L81 91 Q61 99 47 83Z" fill="url(#v3SunGlass)" stroke="#17324d" strokeWidth="5"/>
      <path d="M96 66 Q115 59 133 69 L133 83 Q119 99 99 91Z" fill="url(#v3SunGlass)" stroke="#17324d" strokeWidth="5"/>
      <path d="M83 71 Q90 67 97 71" fill="none" stroke="#17324d" strokeWidth="5" strokeLinecap="round"/>
      <path d="M61 108 Q90 132 121 107 Q115 137 90 140 Q66 136 61 108Z" fill="#fff" stroke="#d79b00" strokeWidth="3"/>
    </g>
  </svg>;
}

function CloudArt({className}:{className:string}){
  return <svg className={`splashV3Cloud ${className}`} viewBox="0 0 250 130" aria-hidden="true">
    <defs>
      <radialGradient id={`v3Cloud-${className}`} cx=".35" cy=".16"><stop stopColor="#fff"/><stop offset=".56" stopColor="#f2f8ff"/><stop offset="1" stopColor="#b8d9f6"/></radialGradient>
      <filter id={`v3CloudShadow-${className}`}><feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#2f7fa7" floodOpacity=".16"/></filter>
    </defs>
    <g filter={`url(#v3CloudShadow-${className})`}>
      <ellipse cx="124" cy="91" rx="92" ry="25" fill={`url(#v3Cloud-${className})`}/>
      <circle cx="66" cy="76" r="35" fill={`url(#v3Cloud-${className})`}/>
      <circle cx="111" cy="56" r="48" fill={`url(#v3Cloud-${className})`}/>
      <circle cx="157" cy="64" r="41" fill={`url(#v3Cloud-${className})`}/>
      <circle cx="196" cy="80" r="30" fill={`url(#v3Cloud-${className})`}/>
      <ellipse cx="104" cy="43" rx="31" ry="12" fill="#fff" opacity=".7"/>
    </g>
  </svg>;
}

function Lighthouse(){
  return <svg className="splashV3Lighthouse" viewBox="0 0 170 250" aria-hidden="true">
    <defs>
      <linearGradient id="v3Tower" x1="0" x2="1"><stop stopColor="#f8f6ef"/><stop offset=".45" stopColor="#bcc6c7"/><stop offset="1" stopColor="#718086"/></linearGradient>
      <linearGradient id="v3Rust" x1="0" x2="1"><stop stopColor="#7f3a29"/><stop offset=".5" stopColor="#c77949"/><stop offset="1" stopColor="#743128"/></linearGradient>
      <filter id="v3TowerShadow"><feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0c6572" floodOpacity=".24"/></filter>
    </defs>
    <g filter="url(#v3TowerShadow)">
      <ellipse cx="85" cy="222" rx="70" ry="22" fill="#e8e0a9" opacity=".88"/>
      <ellipse cx="85" cy="225" rx="42" ry="14" fill="#8abf9c" opacity=".72"/>
      <path d="M54 211 L73 52 M116 211 L97 52 M54 211 H116 M60 169 H110 M65 128 H105 M69 88 H101" stroke="url(#v3Tower)" strokeWidth="9" fill="none"/>
      <path d="M54 211 L97 52 M116 211 L73 52 M60 169 L105 128 M110 169 L65 128 M65 128 L101 88 M105 128 L69 88" stroke="#718087" strokeWidth="4" opacity=".85"/>
      <rect x="60" y="40" width="50" height="20" rx="4" fill="url(#v3Rust)"/>
      <rect x="65" y="15" width="40" height="28" rx="5" fill="#243f4c"/>
      <rect x="72" y="20" width="26" height="17" rx="2" fill="#8bd7e5"/>
      <path d="M58 15 L85 -2 L112 15 Z" fill="#263943"/>
      <circle cx="85" cy="8" r="4" fill="#ffe17a"/>
    </g>
  </svg>;
}

function KeysWater(){
  return <svg className="splashV3Water" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="v3Sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#179fb9"/><stop offset=".28" stopColor="#25b9c9"/><stop offset=".62" stopColor="#42d3d7"/><stop offset="1" stopColor="#68e5df"/></linearGradient>
      <radialGradient id="v3Sand" cx=".5" cy=".5"><stop stopColor="#dff7db" stopOpacity=".88"/><stop offset=".5" stopColor="#bcebd8" stopOpacity=".56"/><stop offset="1" stopColor="#8edbce" stopOpacity="0"/></radialGradient>
      <filter id="v3Soft"><feGaussianBlur stdDeviation="7"/></filter>
    </defs>
    <rect width="1000" height="1000" fill="url(#v3Sea)"/>
    <ellipse cx="535" cy="500" rx="410" ry="245" fill="url(#v3Sand)"/>
    <g fill="#116c78" opacity=".055" filter="url(#v3Soft)">
      <path d="M62 330 C130 286 205 293 260 337 C302 372 294 424 238 451 C175 480 105 456 72 405 C51 373 49 350 62 330Z"/>
      <path d="M700 302 C767 267 845 283 885 326 C918 361 899 403 844 424 C784 448 726 428 694 387 C675 362 678 325 700 302Z"/>
      <path d="M114 687 C184 642 262 653 312 696 C349 728 338 775 281 802 C218 831 151 807 120 760 C99 729 98 705 114 687Z"/>
      <path d="M690 712 C762 667 847 680 895 724 C930 756 914 802 854 828 C789 857 721 829 689 781 C669 751 672 727 690 712Z"/>
      <path d="M420 820 C468 790 526 799 557 827 C581 850 571 884 531 903 C486 924 441 907 418 873 C404 852 406 832 420 820Z"/>
    </g>
    <g fill="#397b70" opacity=".045">
      <path d="M265 560 C318 526 372 535 403 567 C427 591 418 626 379 643 C335 663 290 648 268 616 C255 597 254 576 265 560Z"/>
      <path d="M608 576 C655 545 706 552 736 581 C758 603 750 633 714 650 C674 669 632 655 611 625 C598 606 597 590 608 576Z"/>
    </g>
    <g fill="none" stroke="#efffff" strokeOpacity=".22" strokeWidth="4">
      <path d="M0 414 C160 386 275 406 405 381 C560 351 687 358 1000 314"/>
      <path d="M0 443 C161 418 283 438 416 412 C579 380 716 387 1000 349"/>
      <path d="M0 742 C178 708 298 727 434 695 C610 653 759 672 1000 632"/>
      <path d="M0 775 C177 742 310 759 450 727 C619 688 768 701 1000 665"/>
    </g>
    <g fill="#fff" opacity=".28">
      <ellipse cx="176" cy="523" rx="54" ry="4"/><ellipse cx="826" cy="514" rx="72" ry="4"/><ellipse cx="486" cy="731" rx="44" ry="3"/><ellipse cx="718" cy="865" rx="62" ry="3"/>
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
    if(!audio.paused){
      audio.pause();
      audio.currentTime=0;
      return;
    }
    try{
      await audio.play();
    }catch{
      setSoundPlaying(false);
    }
  };
  const enter=()=>{const audio=audioRef.current;onEnter();if(audio){try{audio.pause();audio.currentTime=0}catch{}}};

  return <main className="splash splashV4"><div className="splashV4Scene">
    <div className="splashV4Sky">
      <CloudArt className="v3CloudLeft"/>
      <CloudArt className="v3CloudMid"/>
      <SunArt/>
    </div>
    <div className="splashV4Horizon"/>
    <div className="splashV4Sea"><KeysWater/></div>
    <div className="splashV4Tower"><Lighthouse/></div>
    <div className="splashV4Boat splashV4BoatDeck"><BoatArt kind="deck"/></div>
    <div className="splashV4Boat splashV4BoatPontoon"><BoatArt kind="pontoon"/></div>
    <div className="splashV4Boat splashV4BoatCenter"><BoatArt kind="center-console"/></div>
    <div className="splashV4Hero">
      <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="splashV4Logo"/>
      <div className="splashV4Tag">Build your fleet. Rule the islands.</div>
      <div className="splashV4Buttons">
        <button className="soundPrompt" onClick={toggleSound}>{soundPlaying?'■ Stop theme':'♫ Tap for theme'}</button>
        <button className="enterGame" onClick={enter}>ENTER THE ISLANDS</button>
      </div>
    </div>
    <small className="splashV4Build">Version 1.0 © 2026</small>
  </div></main>;
}
