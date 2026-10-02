import { useEffect, useRef, useState } from 'react';
import BoatArt from './BoatArt';

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
    <div className="reefFloor" aria-hidden="true">
      <i className="reefPatch reefA"/><i className="reefPatch reefB"/><i className="reefPatch reefC"/>
      <i className="reefPatch reefD"/><i className="reefPatch reefE"/>
    </div>
    <div className="waterCaustics" aria-hidden="true"/>

    <img src="/branding/splash-sun.png" alt="" aria-hidden="true" className="splashSunArt"/>

    <img src="/branding/splash-cloud.png" alt="" aria-hidden="true" className="splashCloudArt cloudOne"/>
    <img src="/branding/splash-cloud.png" alt="" aria-hidden="true" className="splashCloudArt cloudTwo"/>
    <img src="/branding/splash-cloud.png" alt="" aria-hidden="true" className="splashCloudArt cloudThree"/>

    <div className="waterShimmer shimmerOne"/><div className="waterShimmer shimmerTwo"/>
    <div className="waterShimmer shimmerThree"/><div className="waterShimmer shimmerFour"/>

    <div className="splashDolphin dolphinOne">🐬</div>
    <div className="splashDolphin dolphinTwo">🐬</div>

    <img src="/images/island-map-3d.svg" alt="" aria-hidden="true" className="splashIslandArt"/>

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
