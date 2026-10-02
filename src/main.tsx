import { useLayoutEffect,useState } from 'react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './ui/App';
import Splash from './ui/Splash';
import StartMode,{type GameMode} from './ui/StartMode';
import type { Player } from './ui/api';
import type { CompanyState } from './game/types/models';
import './ui/styles.css';

function Root(){
  const [entered,setEntered]=useState(false);
  const [mode,setMode]=useState<GameMode|null>(null);
  const [player,setPlayer]=useState<Player|undefined>();
  const [initialState,setInitialState]=useState<CompanyState|null|undefined>();

  useLayoutEffect(()=>{
    if('scrollRestoration' in window.history) window.history.scrollRestoration='manual';
    const reset=()=>{
      window.scrollTo(0,0);
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
    };
    reset();
    const frame=window.requestAnimationFrame(reset);
    return()=>window.cancelAnimationFrame(frame);
  },[entered,mode]);

  const returnToTitle=()=>{
    setMode(null);
    setPlayer(undefined);
    setInitialState(undefined);
    setEntered(false);
  };
  const switchMode=()=>{
    setMode(null);
    setPlayer(undefined);
    setInitialState(undefined);
    setEntered(true);
  };

  if(!entered)return <Splash onEnter={()=>setEntered(true)}/>;
  if(!mode)return <StartMode onStart={(nextMode,nextPlayer,nextState)=>{setMode(nextMode);setPlayer(nextPlayer);setInitialState(nextState);}}/>;
  return <App
    mode={mode}
    player={player}
    initialState={initialState??undefined}
    onUpgrade={switchMode}
    onReturnTitle={returnToTitle}
    onSwitchMode={switchMode}
  />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
