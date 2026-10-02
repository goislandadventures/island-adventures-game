import { useEffect,useRef,useState } from 'react';

const HERO_IMAGE='https://images.unsplash.com/photo-1757785716163-c3181d737347?auto=format&fit=crop&fm=jpg&q=88&w=2400';

export default function Splash({onEnter}:{onEnter:()=>void}){
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const [soundPlaying,setSoundPlaying]=useState(false);
  const [heroFailed,setHeroFailed]=useState(false);

  useEffect(()=>{
    const audio=new Audio('/audio/splash-theme.mp3');
    audio.preload='metadata';
    audio.loop=true;
    audio.volume=.68;
    audioRef.current=audio;

    const onPlay=()=>setSoundPlaying(true);
    const onPause=()=>setSoundPlaying(false);
    audio.addEventListener('play',onPlay);
    audio.addEventListener('pause',onPause);

    return()=>{
      audio.pause();
      audio.currentTime=0;
      audio.removeEventListener('play',onPlay);
      audio.removeEventListener('pause',onPause);
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

  const enter=()=>{
    const audio=audioRef.current;
    if(audio){
      try{
        audio.pause();
        audio.currentTime=0;
      }catch{}
    }
    onEnter();
  };

  return <main className="splash splashFortniteReset">
    <section className="splashFortniteScene">
      {!heroFailed && <img
        className="splashFortnitePhoto"
        src={HERO_IMAGE}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        onError={()=>setHeroFailed(true)}
      />}
      {heroFailed && <div className="splashFortniteFallback" aria-hidden="true"/>}

      <div className="splashFortniteColorGrade" aria-hidden="true"/>
      <div className="splashFortniteWaterGlow" aria-hidden="true"/>
      <div className="splashFortniteVignette" aria-hidden="true"/>

      <header className="splashFortniteBrand">
        <img
          className="splashFortniteLogo"
          src="/branding/island-adventures-logo-mobile.png"
          alt="Island Adventures"
        />
        <div className="splashFortniteSubtitle">THE PRIVATE CHARTER BUSINESS GAME</div>
        <div className="splashFortniteTagline">Build your fleet. Master the weather. Rule the islands.</div>
      </header>

      <div className="splashFortniteActions">
        <button className="splashFortniteEnter" onClick={enter}>
          <strong>ENTER THE ISLANDS</strong>
          <span>Start / Sign In / Demo</span>
        </button>
        <button
          className={`splashFortniteTheme ${soundPlaying?'playing':''}`}
          onClick={toggleSound}
          aria-pressed={soundPlaying}
          aria-label={soundPlaying?'Stop theme music':'Play theme music'}
        >
          <b>{soundPlaying?'■':'♫'}</b>
          <span>{soundPlaying?'THEME ON':'PLAY THEME'}</span>
        </button>
      </div>

      <footer className="splashFortniteFooter">
        <div className="splashFortniteFooterLeft">
          <strong>ISLAND ADVENTURES</strong>
          <span>THE FLORIDA KEYS</span>
        </div>
        <div className="splashFortniteFooterRight">VERSION 1.0 · © 2026</div>
      </footer>
    </section>
  </main>;
}
