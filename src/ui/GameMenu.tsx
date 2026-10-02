import { useState } from 'react';

export default function GameMenu({
  onClose,onReturnTitle,onSwitchMode,onRestartDemo,onHelp
}:{
  onClose:()=>void;
  onReturnTitle:()=>void;
  onSwitchMode:()=>void;
  onRestartDemo:()=>void;
  onHelp:()=>void;
}){
  const [confirming,setConfirming]=useState(false);

  return <div className="gameMenuOverlay" role="dialog" aria-modal="true" aria-label="Game menu">
    <div className="gameMenuSheet">
      <header className="gameMenuHeader">
        <div><span>DEMO</span><h2>Game Menu</h2></div>
        <button type="button" className="gameMenuClose" onClick={onClose} aria-label="Close menu">×</button>
      </header>

      {confirming?<div className="gameMenuConfirm">
        <h3>Restart Demo?</h3>
        <p>Start the seven-day demo over from Day 1? Your current demo progress will be cleared.</p>
        <div className="gameMenuConfirmActions">
          <button type="button" onClick={()=>setConfirming(false)}>Cancel</button>
          <button type="button" className="dangerBtn" onClick={onRestartDemo}>Yes, start over</button>
        </div>
      </div>:<>
        <button type="button" className="gameMenuChoice primary" onClick={onReturnTitle}><b>🏝️ Return to Title</b><span>Go back to the splash screen.</span></button>
        <button type="button" className="gameMenuChoice" onClick={onSwitchMode}><b>🎮 Switch Game Mode</b><span>Choose Demo or Play & Compete.</span></button>
        <button type="button" className="gameMenuChoice" onClick={onHelp}><b>❓ Help</b><span>Open the Captain School handbook.</span></button>
        <button type="button" className="gameMenuChoice dangerChoice" onClick={()=>setConfirming(true)}><b>↻ Restart Demo</b><span>Start the seven-day demo again from Day 1.</span></button>
      </>}
    </div>
  </div>;
}
