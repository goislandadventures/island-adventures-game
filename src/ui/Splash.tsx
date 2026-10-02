import { useEffect,useRef,useState } from 'react';

export default function Splash({onEnter}:{onEnter:()=>void}){
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const [soundPlaying,setSoundPlaying]=useState(false);

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

  return <main className="splash splashV11">
    <section className="splashV11Stage">
      <img
        src="/branding/island-adventures-splash-4k.jpg"
        alt=""
        aria-hidden="true"
        className="splashV11Art"
        fetchPriority="high"
      />

      <div className="splashV11Depth" aria-hidden="true"/>
      <div className="splashV11Water" aria-hidden="true"/>
      <div className="splashV11Glow" aria-hidden="true"/>

      <div className="splashV11Controls">
        <button className="splashV11Enter" onClick={enter}>
          <strong>ENTER THE ISLANDS</strong>
          <span>Start / Sign In / Demo</span>
        </button>

        <button
          className={`splashV11Theme ${soundPlaying?'playing':''}`}
          onClick={toggleSound}
          aria-pressed={soundPlaying}
          aria-label={soundPlaying?'Stop theme music':'Play theme music'}
        >
          <b>{soundPlaying?'■':'♫'}</b>
          <span>{soundPlaying?'THEME ON':'PLAY THEME'}</span>
        </button>
      </div>

      <footer className="splashV11Footer">
        <span>ISLAND ADVENTURES</span>
        <span>VERSION 1.0 · © 2026</span>
      </footer>
    </section>
  </main>;
}
