import { useEffect, useState } from 'react';
import { loadCompany, login, logout, me, register, type Player } from './api';
import type { CompanyState } from '../game/types/models';

export type GameMode='demo'|'registered';

export default function StartMode({onStart}:{onStart:(mode:GameMode,player?:Player,state?:CompanyState|null)=>void}){
  const [view,setView]=useState<'choose'|'account'>('choose');
  const [kind,setKind]=useState<'login'|'register'>('register');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [marketing,setMarketing]=useState(false);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [signedInPlayer,setSignedInPlayer]=useState<Player|undefined>();
  const [signedInState,setSignedInState]=useState<CompanyState|null>(null);
  const [checkingSession,setCheckingSession]=useState(true);

  useEffect(()=>{
    let alive=true;
    const refreshSession=async()=>{
      setCheckingSession(true);
      try{
        const r=await me();
        if(!alive)return;
        if(!r.player){
          setSignedInPlayer(undefined);
          setSignedInState(null);
          return;
        }
        const company=await loadCompany().catch(()=>({state:null}));
        if(!alive)return;
        setSignedInPlayer(r.player);
        setSignedInState(company.state);
      }catch{
        if(!alive)return;
        setSignedInPlayer(undefined);
        setSignedInState(null);
      }finally{
        if(alive)setCheckingSession(false);
      }
    };
    void refreshSession();
    const sessionTimer=window.setInterval(()=>void refreshSession(),5000);
    const onFocus=()=>void refreshSession();
    const onPageShow=()=>void refreshSession();
    const onVisibility=()=>{if(document.visibilityState==='visible')void refreshSession()};
    window.addEventListener('focus',onFocus);
    window.addEventListener('pageshow',onPageShow);
    document.addEventListener('visibilitychange',onVisibility);
    return()=>{
      alive=false;
      window.removeEventListener('focus',onFocus);
      window.removeEventListener('pageshow',onPageShow);
      document.removeEventListener('visibilitychange',onVisibility);
      window.clearInterval(sessionTimer);
    };
  },[]);

  const chooseRegistered=async()=>{
    if(checkingSession)return;
    setCheckingSession(true);
    try{
      const r=await me();
      if(r.player){
        const company=await loadCompany().catch(()=>({state:null}));
        setSignedInPlayer(r.player);
        setSignedInState(company.state);
        onStart('registered',r.player,company.state);
        return;
      }
      setSignedInPlayer(undefined);
      setSignedInState(null);
      setError('');
      setKind('register');
      setView('account');
    }catch{
      setSignedInPlayer(undefined);
      setSignedInState(null);
      setError('');
      setKind('register');
      setView('account');
    }finally{
      setCheckingSession(false);
    }
  };

  const signOut=async()=>{
    setBusy(true);
    try{await logout().catch(()=>({ok:false}));}finally{
      setSignedInPlayer(undefined);
      setSignedInState(null);
      setView('choose');
      setKind('register');
      setError('');
      setBusy(false);
    }
  };

  const submit=async()=>{
    setBusy(true);setError('');
    try{
      const r=kind==='register'
        ? await register({email,password,marketingOptIn:marketing})
        : await login({email,password});
      const company=await loadCompany().catch(()=>({state:null}));
      onStart('registered',r.player,company.state);
    }catch(e){setError((e as Error).message)}finally{setBusy(false)}
  };

  const switchKind=()=>{
    setError('');
    setPassword('');
    setShowPassword(false);
    setKind(kind==='register'?'login':'register');
  };

  if(view==='account') return <main className="modeShell"><section className="modeCard accountCard">
    <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="modeLogo"/>
    <span className="eyebrow">PLAY & COMPETE</span><h2>{kind==='register'?'Create your owner account':'Welcome back, Captain'}</h2>
    <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" autoCapitalize="none" spellCheck={false}/></label>
    <label>Password<div className="passwordWrap"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="10+ characters" autoComplete={kind==='register'?'new-password':'current-password'}/><button type="button" className="showPasswordBtn" onClick={()=>setShowPassword(v=>!v)} aria-pressed={showPassword}>{showPassword?'Hide':'Show'}</button></div></label>
    {kind==='register'&&<label className="checkRow"><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)}/><span>Send me occasional Island Adventures news, offers and real-world charter updates. Optional.</span></label>}
    {error&&<p className="formError">{error}</p>}
    <button className="primary big" disabled={busy||!email||password.length<10} onClick={submit}>{busy?'Connecting…':kind==='register'?'Create Account & Play':'Sign In'}</button>
    <button className="textBtn" onClick={switchKind}>{kind==='register'?'Already have an account? Sign in':'Need an account? Create one'}</button>
    <button className="textBtn" onClick={()=>{setError('');setView('choose')}}>← Back</button>
  </section></main>;

  return <main className="modeShell"><section className="modeCard">
    <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="modeLogo"/>
    <h2>How do you want to play?</h2>
    <button className="modeChoice primary" disabled={checkingSession} onClick={chooseRegistered}><b>🏆 Play & Compete</b><span>{checkingSession?'Checking your account…':signedInPlayer?`Continue as ${signedInState?.captainName||signedInPlayer.displayName||signedInPlayer.display_name||signedInPlayer.email}. Cloud save and leaderboards.`:'Create an account, save in the cloud and chase the leaderboards.'}</span></button>
    <button className="modeChoice" onClick={()=>onStart('demo')}><b>🎮 Try One Week</b><span>No account. Play all 7 days of Captain School and learn the core game.</span></button>
    {signedInPlayer&&<>
      <p className="fine signedInNote">Signed in account detected. You can still choose the Demo without affecting your online company.</p>
      <button className="textBtn" type="button" disabled={busy} onClick={signOut}>Sign Out</button>
    </>}
    <p className="fine">Account email is used for your game account. Marketing email is optional and requires the separate checkbox above. <a href="https://www.goislandadventures.com/privacy-policy-2/" target="_blank" rel="noreferrer">Privacy Policy</a></p>
  </section></main>;
}
