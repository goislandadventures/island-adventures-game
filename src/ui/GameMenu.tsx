import { useState } from 'react';
import type { GameMode } from './StartMode';

export default function GameMenu({
  mode,onClose,onReturnTitle,onSwitchMode,onRestartDemo,onResetDevelopment,onHelp
}:{
  mode:Exclude<GameMode,'registered'>;
  onClose:()=>void;
  onReturnTitle:()=>void;
  onSwitchMode:()=>void;
  onRestartDemo:()=>void;
  onResetDevelopment:()=>void;
  onHelp:()=>void;
}){
  const [confirming,setConfirming]=useState<'demo'|'owner'|null>(null);
  const resetLabel=mode==='demo'?'Restart Demo':'Reset Development Game';
  const confirmText=mode==='demo'
    ? 'Start the seven-day demo over from Day 1? Your current demo progress will be cleared.'
    : 'Reset the Development Test save? This clears the local development company and starts over.';

  return <div className="gameMenuOverlay" role="dialog" aria-modal="true" aria-label="Game menu">
    <div className="gameMenuSheet">
      <header className="gameMenuHeader">
        <div><span>{mode==='demo'?'DEMO':'DEVELOPMENT TEST'}</span><h2>Game Menu</h2></div>
        <button type="button" className="gameMenuClose" onClick={onClose} aria-label="Close menu">×</button>
      </header>

      {confirming?<div className="gameMenuConfirm">
        <h3>{resetLabel}?</h3>
        <p>{confirmText}</p>
        <div className="gameMenuConfirmActions">
          <button type="button" onClick={()=>setConfirming(null)}>Cancel</button>
          <button type="button" className="dangerBtn" onClick={()=>confirming==='demo'?onRestartDemo():onResetDevelopment()}>Yes, start over</button>
        </div>
      </div>:<>
        <button type="button" className="gameMenuChoice primary" onClick={onReturnTitle}><b>🏝️ Return to Title</b><span>Go back to the splash screen.</span></button>
        <button type="button" className="gameMenuChoice" onClick={onSwitchMode}><b>🎮 Switch Game Mode</b><span>Choose Demo, Development Test, or Play & Compete.</span></button>
        <button type="button" className="gameMenuChoice" onClick={onHelp}><b>❓ Help</b><span>Open the Captain School handbook.</span></button>
        <button type="button" className="gameMenuChoice dangerChoice" onClick={()=>setConfirming(mode)}><b>{mode==='demo'?'↻ Restart Demo':'🧪 Reset Development Game'}</b><span>{mode==='demo'?'Start the seven-day demo again from Day 1.':'Clear the local test company and start over.'}</span></button>
      </>}
    </div>
  </div>;
}
