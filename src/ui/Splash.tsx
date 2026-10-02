import { useEffect,useRef,useState } from 'react';
import BoatArt from './BoatArt';

function Palm({className=''}:{className?:string}){
  return <div className={`v10Palm ${className}`} aria-hidden="true">
    <span className="v10PalmTrunk"/>
    <span className="v10PalmCrown">
      <i/><i/><i/><i/><i/><i/>
    </span>
  </div>;
}

function Bird({className=''}:{className?:string}){
  return <span className={`v10Bird ${className}`} aria-hidden="true"><i/><i/></span>;
}

function LiveIslandWorld(){
  return <div className="splashV10World" aria-hidden="true">
    <div className="v10Sky">
      <div className="v10SkyMesh"/>
      <div className="v10SunGlow"/>
      <div className="v10Sun"/>
      <div className="v10Ray v10RayA"/>
      <div className="v10Ray v10RayB"/>
      <div className="v10CloudBand v10CloudOne"/>
      <div className="v10CloudBand v10CloudTwo"/>
      <div className="v10CloudBand v10CloudThree"/>
      <Bird className="birdOne"/>
      <Bird className="birdTwo"/>
      <Bird className="birdThree"/>
    </div>

    <div className="v10HorizonGlow"/>

    <div className="v10Lighthouse">
      <span className="v10Beacon"/>
      <span className="v10LightCap"/>
      <span className="v10LightRoom"/>
      <span className="v10Tower">
        <i/><i/><i/><i/>
      </span>
      <span className="v10LighthouseBase"/>
    </div>

    <div className="v10IslandShadow"/>
    <div className="v10Island">
      <div className="v10IslandBack"/>
      <div className="v10IslandGreen"/>
      <div className="v10IslandSand"/>
      <div className="v10Mangroves">
        <i/><i/><i/><i/><i/><i/>
      </div>
      <Palm className="palmOne"/>
      <Palm className="palmTwo"/>
      <Palm className="palmThree"/>
      <div className="v10Dock"><i/><i/><i/></div>
    </div>

    <div className="v10Water">
      <div className="v10Reef v10ReefOne"/>
      <div className="v10Reef v10ReefTwo"/>
      <div className="v10Reef v10ReefThree"/>
      <span className="v10Fish fishOne"/>
      <span className="v10Fish fishTwo"/>
      <span className="v10Fish fishThree"/>
      <span className="v10Fish fishFour"/>
      <div className="v10WaterLight v10WaterLightA"/>
      <div className="v10WaterLight v10WaterLightB"/>
      <div className="v10WaveLayer v10WaveFar"/>
      <div className="v10WaveLayer v10WaveMid"/>
      <div className="v10WaveLayer v10WaveNear"/>
      <div className="v10Sparkles"/>
    </div>

    <div className="v10BoatWrap">
      <span className="v10BoatWake wakeOne"/>
      <span className="v10BoatWake wakeTwo"/>
      <span className="v10BoatWake wakeThree"/>
      <BoatArt kind="deck" className="v10HeroBoat"/>
    </div>

    <div className="v10SecondBoat">
      <BoatArt kind="deck" className="v10SupportBoat"/>
    </div>

    <div className="v10ForegroundGlass"/>
    <div className="v10Vignette"/>
  </div>;
}

export default function Splash({onEnter}:{onEnter:()=>void}){
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const sceneRef=useRef<HTMLDivElement|null>(null);
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

  const enter=()=>{
    const audio=audioRef.current;
    onEnter();
    if(audio){try{audio.pause();audio.currentTime=0}catch{}}
  };

  const parallax=(event:React.PointerEvent<HTMLDivElement>)=>{
    const scene=sceneRef.current;
    if(!scene)return;
    const rect=scene.getBoundingClientRect();
    const x=((event.clientX-rect.left)/rect.width-.5)*2;
    const y=((event.clientY-rect.top)/rect.height-.5)*2;
    scene.style.setProperty('--v10-x',x.toFixed(3));
    scene.style.setProperty('--v10-y',y.toFixed(3));
  };

  const resetParallax=()=>{
    const scene=sceneRef.current;
    if(!scene)return;
    scene.style.setProperty('--v10-x','0');
    scene.style.setProperty('--v10-y','0');
  };

  return <main className="splash splashV10">
    <div
      className="splashV10Scene"
      ref={sceneRef}
      onPointerMove={parallax}
      onPointerLeave={resetParallax}
    >
      <LiveIslandWorld/>

      <header className="splashV10Hero">
        <div className="splashV10Kicker">ISLAND ADVENTURES PRESENTS</div>
        <img
          src="/branding/island-adventures-logo-mobile.png"
          alt="Island Adventures"
          className="splashV10Logo"
        />
        <div className="splashV10Rule"><i/><span>THE PRIVATE CHARTER BUSINESS GAME</span><i/></div>
        <p className="splashV10Tag">Build your fleet. Master the weather. Rule the islands.</p>

        <div className="splashV10Buttons">
          <button className="enterGame v10Primary" onClick={enter}>
            <span>ENTER THE ISLANDS</span>
            <small>Start / Sign In / Demo</small>
          </button>
          <button
            className={`soundPrompt v10Sound ${soundPlaying?'active':''}`}
            onClick={toggleSound}
            aria-pressed={soundPlaying}
            aria-label={soundPlaying?'Stop theme music':'Play theme music'}
          >
            <span>{soundPlaying?'■':'♫'}</span>
            <small>{soundPlaying?'THEME ON':'PLAY THEME'}</small>
          </button>
        </div>
      </header>

      <div className="splashV10WorldLabel">
        <span className="liveDot"/>
        <span>THE FLORIDA KEYS</span>
        <b>•</b>
        <span>PRIVATE CHARTERS</span>
      </div>

      <footer className="splashV10Build">
        <strong>ISLAND ADVENTURES</strong>
        <span>VERSION 1.0</span>
        <span>© 2026</span>
      </footer>
    </div>
  </main>;
}
