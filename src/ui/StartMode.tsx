import { useEffect, useState } from 'react';
import { changePassword, loadCompany, login, me, recover, register, type Player } from './api';
import type { CompanyState } from '../game/types/models';

export type GameMode='demo'|'registered';

export default function StartMode({onStart}:{onStart:(mode:GameMode,player?:Player,state?:CompanyState|null)=>void}){
  const [view,setView]=useState<'choose'|'account'|'change'|'recover'>('choose');
  const [kind,setKind]=useState<'login'|'register'>('register');
  const [email,setEmail]=useState('');
  const [displayName,setDisplayName]=useState('');
  const [password,setPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [marketing,setMarketing]=useState(false);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [signedInPlayer,setSignedInPlayer]=useState<Player|undefined>();
  const [signedInState,setSignedInState]=useState<CompanyState|null>(null);
  const [checkingSession,setCheckingSession]=useState(true);
  const [pendingPlayer,setPendingPlayer]=useState<Player|undefined>();
  const [newPassword,setNewPassword]=useState('');
  const [showNewPassword,setShowNewPassword]=useState(false);
  const [recoveryCode,setRecoveryCode]=useState('');

  useEffect(()=>{
    let alive=true;
    me().then(async r=>{
      if(!alive)return;
      if(r.player){
        const company=await loadCompany().catch(()=>({state:null}));
        if(!alive)return;
        setSignedInPlayer(r.player);
        setSignedInState(company.state);
      }
    }).catch(()=>{}).finally(()=>{if(alive)setCheckingSession(false)});
    return()=>{alive=false};
  },[]);

  const chooseRegistered=()=>{
    if(checkingSession)return;
    if(signedInPlayer){
      if(signedInPlayer.mustChangePassword||signedInPlayer.force_password_change){
        setPendingPlayer(signedInPlayer);
        setView('change');
        return;
      }
      onStart('registered',signedInPlayer,signedInState);
      return;
    }
    setView('account');
  };

  const submit=async()=>{
    setBusy(true); setError('');
    try{
      const r=kind==='register'
        ? await register({email,displayName,password,marketingOptIn:marketing})
        : await login({email,password});
      if(r.player.mustChangePassword||r.player.force_password_change){
        setPendingPlayer(r.player);
        setView('change');
        return;
      }
      const c=await loadCompany().catch(()=>({state:null}));
      onStart('registered',r.player,c.state);
    }catch(e){setError((e as Error).message)} finally{setBusy(false)}
  };

  const submitRecovery=async()=>{
    setBusy(true);setError('');
    try{
      const r=await recover({email,recoveryCode});
      setPendingPlayer(r.player);
      setNewPassword('');
      setView('change');
    }catch(e){setError((e as Error).message)}finally{setBusy(false)}
  };

  const submitPasswordChange=async()=>{
    setBusy(true);setError('');
    try{
      const r=await changePassword(newPassword);
      const company=await loadCompany().catch(()=>({state:null}));
      onStart('registered',r.player||pendingPlayer,company.state);
    }catch(e){setError((e as Error).message)}finally{setBusy(false)}
  };

  if(view==='recover') return <main className="modeShell"><section className="modeCard accountCard">
    <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="modeLogo"/>
    <span className="eyebrow">ACCOUNT RECOVERY</span><h2>Recover your owner account</h2>
    <p>Enter the one-time recovery code for this account. It expires permanently as soon as it works.</p>
    <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
    <label>Recovery code<input value={recoveryCode} onChange={e=>setRecoveryCode(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="One-time recovery code"/></label>
    {error&&<p className="formError">{error}</p>}
    <button className="primary big" disabled={busy||!email||!recoveryCode} onClick={submitRecovery}>{busy?'Recovering…':'Recover Account'}</button>
    <button className="textBtn" onClick={()=>{setError('');setView('account');setKind('login')}}>← Back to sign in</button>
  </section></main>;

  if(view==='change') return <main className="modeShell"><section className="modeCard accountCard">
    <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="modeLogo"/>
    <span className="eyebrow">ACCOUNT RECOVERY</span><h2>Set a new password</h2>
    <p>Your account and company were recovered. Choose a new password before continuing.</p>
    <label>New password<div className="passwordWrap"><input type={showNewPassword?'text':'password'} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="10+ characters" autoComplete="new-password"/><button type="button" className="showPasswordBtn" onClick={()=>setShowNewPassword(v=>!v)}>{showNewPassword?'Hide':'Show'}</button></div></label>
    {error&&<p className="formError">{error}</p>}
    <button className="primary big" disabled={busy||newPassword.length<10} onClick={submitPasswordChange}>{busy?'Saving…':'Save New Password & Continue'}</button>
  </section></main>;

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
    {kind==='login'&&<button className="textBtn" onClick={()=>{setError('');setRecoveryCode('');setView('recover')}}>Recover account</button>}
    <button className="textBtn" onClick={()=>setView('choose')}>← Back</button>
  </section></main>;

  return <main className="modeShell"><section className="modeCard">
    <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="modeLogo"/>
    <h2>How do you want to play?</h2>
    <button className="modeChoice primary" disabled={checkingSession} onClick={chooseRegistered}><b>🏆 Play & Compete</b><span>{checkingSession?'Checking your account…':signedInPlayer?`Continue as ${signedInPlayer.displayName||signedInPlayer.display_name||signedInPlayer.email}. Cloud save and leaderboards.`:'Create an account, save in the cloud and chase the leaderboards.'}</span></button>
    <button className="modeChoice" onClick={()=>onStart('demo')}><b>🎮 Try One Week</b><span>No account. Play all 7 days of Captain School and learn the core game.</span></button>
    {signedInPlayer&&<p className="fine signedInNote">Signed in account detected. You can still choose the Demo without affecting your online company.</p>}
    <p className="fine">Account email is used for your game account. Marketing email is optional and requires the separate checkbox above. <a href="https://www.goislandadventures.com/privacy-policy-2/" target="_blank" rel="noreferrer">Privacy Policy</a></p>
  </section></main>;
}
