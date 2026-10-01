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

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const startSound = async () => {
    try {
      await audioRef.current?.play();
      setSoundBlocked(false);
    } catch {
      setSoundBlocked(true);
    }
  };

  const enter = () => {
    const audio = audioRef.current;
    if (!audio) return onEnter();

    const fade = window.setInterval(() => {
      audio.volume = Math.max(0, audio.volume - 0.12);
      if (audio.volume <= 0.01) {
        window.clearInterval(fade);
        audio.pause();
        audio.currentTime = 0;
        onEnter();
      }
    }, 70);
  };

  return <main className="splash">
    <div className="splashOcean">
      <div className="splashSun" />
      <div className="splashIsland one">🌴</div>
      <div className="splashIsland two">🌴</div>
      <div className="splashBoat">🚤<i /></div>
      <div className="splashLogo">ISLAND<br/><strong>ADVENTURES</strong></div>
      <div className="splashTag">Build your fleet. Rule the islands.</div>
      {soundBlocked && <button className="soundPrompt" onClick={startSound}>♫ Tap for theme</button>}
      <button className="enterGame" onClick={enter}>ENTER THE ISLANDS</button>
      <small className="devThemeNote">Development theme</small>
    </div>
  </main>;
}
