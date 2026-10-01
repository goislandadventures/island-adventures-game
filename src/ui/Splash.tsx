import { useEffect, useRef, useState } from 'react';

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
    // iOS Safari does not reliably support programmatic volume fades.
    // Enter the game immediately, then stop/reset the splash theme.
    onEnter();
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch {}
    }
  };

  return <main className="splash"><div className="splashOcean">
    <div className="splashSun" />

    <div className="splashCloud cloudOne" />
    <div className="splashCloud cloudTwo" />
    <div className="splashCloud cloudThree" />

    <div className="waterGlimmer glimmerOne" />
    <div className="waterGlimmer glimmerTwo" />
    <div className="waterGlimmer glimmerThree" />
    <div className="waterGlimmer glimmerFour" />
    <div className="waterGlimmer glimmerFive" />

    <div className="splashDolphin dolphinOne">🐬</div>
    <div className="splashDolphin dolphinTwo">🐬</div>

    <div className="splashIsland one">🌴</div>

    <div className="splashBoat boatOne">🚤</div>
    <div className="splashBoat boatTwo">🛥️</div>
    <div className="splashBoat boatThree">⛵</div>
    <div className="splashBoat boatFour">🛶</div>

    <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="splashLogoImage"/>
    <div className="splashTag">Build your fleet. Rule the islands.</div>
    {soundBlocked && <button className="soundPrompt" onClick={startSound}>♫ Tap for theme</button>}
    <button className="enterGame" onClick={enter}>ENTER THE ISLANDS</button>
    <small className="devThemeNote">Development build</small>
  </div></main>;
}
