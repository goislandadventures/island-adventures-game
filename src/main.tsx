import { useLayoutEffect,useState } from 'react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './ui/App';
import Splash from './ui/Splash';
import StartMode,{type GameMode} from './ui/StartMode';
import type { Player } from './ui/api';
import type { CompanyState } from './game/types/models';
import './ui/styles.css';
import { installButtonSounds } from './ui/sound';

installButtonSounds();

const BUILD_ID=import.meta.env.VITE_BUILD_ID||'';
let refreshingForBuild=false;
async function ensureFreshBuild(){
  if(!BUILD_ID||refreshingForBuild)return;
  try{
    const res=await fetch('/api/build-id?ts='+Date.now(),{cache:'no-store'});
    if(!res.ok)return;
    const remote=(await res.text()).trim();
    if(remote&&remote!==BUILD_ID){
      refreshingForBuild=true;
      const url=new URL(window.location.href);
      url.searchParams.set('_build',remote.slice(0,12));
      window.location.replace(url.toString());
    }
  }catch{}
}
window.addEventListener('pageshow',()=>{void ensureFreshBuild()});
window.addEventListener('focus',()=>{void ensureFreshBuild()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void ensureFreshBuild()});
window.setInterval(()=>void ensureFreshBuild(),60000);
void ensureFreshBuild();


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
