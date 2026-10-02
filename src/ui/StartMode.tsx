import { useEffect, useState } from 'react';
import { loadCompany, login, me, register, type Player } from './api';
import type { CompanyState } from '../game/types/models';

export type GameMode='demo'|'owner'|'registered';

export default function StartMode({onStart}:{onStart:(mode:GameMode,player?:Player,state?:CompanyState|null)=>void}){
  const [view,setView]=useState<'choose'|'account'>('choose');
  const [kind,setKind]=useState<'login'|'register'>('register');
  const [email,setEmail]=useState('');
  const [displayName,setDisplayName]=useState('');
  const [password,setPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [marketing,setMarketing]=useState(false);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{ me().then(async r=>{ if(r.player){ const c=await loadCompany().catch(()=>({state:null})); onStart('registered',r.player,c.state); }}).catch(()=>{}); },[]);

  const submit=async()=>{
    setBusy(true); setError('');
    try{
      const r=kind==='register'
        ? await register({email,displayName,password,marketingOptIn:marketing})
        : await login({email,password});
      const c=await loadCompany().catch(()=>({state:null}));
      onStart('registered',r.player,c.state);
    }catch(e){setError((e as Error).message)} finally{setBusy(false)}
  };

  if(view==='account') return <main className="modeShell"><section className="modeCard accountCard">
    <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="modeLogo"/>
    <span className="eyebrow">PLAY & COMPETE</span><h2>{kind==='register'?'Create your owner account':'Welcome back, Captain'}</h2>
    {kind==='register'&&<label>Owner display name<input value={displayName} maxLength={30} onChange={e=>setDisplayName(e.target.value)} placeholder="Captain Jim"/></label>}
    <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
    <label>Password<div className="passwordWrap"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="10+ characters" autoComplete={kind==='register'?'new-password':'current-password'}/><button type="button" className="showPasswordBtn" onClick={()=>setShowPassword(v=>!v)} aria-pressed={showPassword}>{showPassword?'Hide':'Show'}</button></div></label>
    {kind==='register'&&<label className="checkRow"><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)}/><span>Send me occasional Island Adventures news, offers and real-world charter updates. Optional.</span></label>}
    {error&&<p className="formError">{error}</p>}
    <button className="primary big" disabled={busy||!email||!password||(kind==='register'&&!displayName)} onClick={submit}>{busy?'Connecting…':kind==='register'?'Create Account & Play':'Sign In'}</button>
    <button className="textBtn" onClick={()=>setKind(kind==='register'?'login':'register')}>{kind==='register'?'Already have an account? Sign in':'Need an account? Create one'}</button>
    <button className="textBtn" onClick={()=>setView('choose')}>← Back</button>
  </section></main>;

  return <main className="modeShell"><section className="modeCard">
    <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="modeLogo"/>
    <h2>How do you want to play?</h2>
    <button className="modeChoice primary" onClick={()=>setView('account')}><b>🏆 Play & Compete</b><span>Create an account, save in the cloud and chase the leaderboards.</span></button>
    <button className="modeChoice" onClick={()=>onStart('demo')}><b>🎮 Try One Week</b><span>No account. Play all 7 days of Captain School and learn the core game.</span></button>
    <button className="modeChoice devChoice" onClick={()=>onStart('owner')}><b>🧪 Development Test</b><span>Full local testing with no login. Never enters public rankings.</span></button>
    <p className="fine">Account email is used for your game account. Marketing email is optional and requires the separate checkbox above. <a href="https://www.goislandadventures.com/privacy-policy-2/" target="_blank" rel="noreferrer">Privacy Policy</a></p>
  </section></main>;
}
