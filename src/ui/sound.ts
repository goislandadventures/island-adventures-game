import type { DayResult } from '../game/types/models';

export type GameSound =
  | 'click'
  | 'cash'
  | 'yay'
  | 'hmm'
  | 'awww'
  | 'motor'
  | 'service'
  | 'weather'
  | 'splash'
  | 'giggle';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let installed=false;
const lastPlayed:Partial<Record<GameSound,number>>={};
const buffers:Partial<Record<GameSound,AudioBuffer>>={};
const loading:Partial<Record<GameSound,Promise<AudioBuffer|null>>>={};

const samplePaths:Partial<Record<GameSound,string>>={
  cash:'/sfx/cash.flac',
  yay:'/sfx/yay.wav',
  hmm:'/sfx/hmm.wav',
  awww:'/sfx/aww.wav',
  motor:'/sfx/engine.wav',
  service:'/sfx/service.flac',
  weather:'/sfx/thunder.flac',
  splash:'/sfx/splash.wav',
  giggle:'/sfx/giggle.wav'
};

function audioContext(){
  if(ctx)return ctx;
  const Ctx=(window.AudioContext||(window as any).webkitAudioContext) as typeof AudioContext|undefined;
  if(!Ctx)return null;
  ctx=new Ctx();
  master=ctx.createGain();
  master.gain.value=.72;
  master.connect(ctx.destination);
  return ctx;
}

function unlock(){
  const c=audioContext();
  if(c?.state==='suspended')void c.resume();
  return c;
}

function clickTone(){
  const c=unlock(); if(!c||!master)return;
  const start=c.currentTime;
  const osc=c.createOscillator();
  const amp=c.createGain();
  osc.type='square';
  osc.frequency.setValueAtTime(620,start);
  osc.frequency.exponentialRampToValueAtTime(390,start+.04);
  amp.gain.setValueAtTime(.0001,start);
  amp.gain.exponentialRampToValueAtTime(.11,start+.008);
  amp.gain.exponentialRampToValueAtTime(.0001,start+.045);
  osc.connect(amp);amp.connect(master);
  osc.start(start);osc.stop(start+.06);
}

async function loadSample(name:GameSound){
  if(buffers[name])return buffers[name]!;
  const path=samplePaths[name];
  if(!path)return null;
  if(!loading[name]){
    loading[name]=(async()=>{
      try{
        const c=audioContext(); if(!c)return null;
        const res=await fetch(path,{cache:'force-cache'});
        if(!res.ok)return null;
        const decoded=await c.decodeAudioData(await res.arrayBuffer());
        buffers[name]=decoded;
        return decoded;
      }catch{return null}
    })();
  }
  return loading[name]!;
}

function scheduleBuffer(name:GameSound,buffer:AudioBuffer,start:number){
  const c=unlock(); if(!c||!master)return;
  const src=c.createBufferSource();
  const amp=c.createGain();
  src.buffer=buffer;
  const level=name==='motor'?.88:name==='yay'?.95:name==='cash'?.82:.78;
  amp.gain.setValueAtTime(level,start);

  if(name==='motor'){
    src.loop=true;
    src.playbackRate.setValueAtTime(.78,start);
    src.playbackRate.exponentialRampToValueAtTime(1.36,start+.92);
    amp.gain.setValueAtTime(.82,start);
    amp.gain.setValueAtTime(.88,start+.72);
    amp.gain.exponentialRampToValueAtTime(.0001,start+1.28);
    src.connect(amp);amp.connect(master);
    src.start(start);src.stop(start+1.32);
    return;
  }

  src.connect(amp);amp.connect(master);
  src.start(start);
}

function canPlay(name:GameSound){
  const now=performance.now();
  const min=name==='click'?55:120;
  if(now-(lastPlayed[name]??0)<min)return false;
  lastPlayed[name]=now;
  return true;
}

export function preloadGameSounds(){
  (Object.keys(samplePaths) as GameSound[]).forEach(name=>{void loadSample(name)});
}

export function playGameSound(name:GameSound,delaySeconds=0){
  if(!canPlay(name))return;
  const c=unlock(); if(!c)return;
  if(name==='click'){clickTone();return}

  const target=c.currentTime+Math.max(0,delaySeconds);
  const ready=buffers[name];
  if(ready){scheduleBuffer(name,ready,target);return}

  void loadSample(name).then(buffer=>{
    if(!buffer)return;
    scheduleBuffer(name,buffer,Math.max(target,c.currentTime+.015));
  });
}

export function installButtonSounds(){
  if(installed)return;
  installed=true;
  let preloaded=false;
  document.addEventListener('click',event=>{
    const target=event.target;
    if(!(target instanceof Element))return;
    const button=target.closest('button');
    if(!button||button.hasAttribute('disabled'))return;
    unlock();
    if(!preloaded){preloaded=true;preloadGameSounds()}
    if(button.dataset.sound!=='none')playGameSound('click');
  },true);
}

function hasWeatherIncident(result:DayResult){
  if(result.hurricaneSummary)return true;
  if(result.reviews.some(review=>review.reasons.some(reason=>/storm|wind|rain|rough|weather|lightning/i.test(reason))))return true;
  return result.tripOutcomes.some(outcome=>{
    if(outcome.decision!=='run')return false;
    if(result.weather.stormRisk>.23||result.weather.windKts>=18)return true;
    return outcome.tripType==='snorkel'&&result.weather.windKts>=15;
  });
}

function reviewStars(result:DayResult){
  if(!result.reviews.length)return 0;
  return Math.min(...result.reviews.map(review=>review.stars));
}

export function playDayResultSounds(result:DayResult,_dayNumber:number){
  let at=result.tripsRun>0?1.35:.25;

  if(hasWeatherIncident(result)){
    playGameSound('weather',at);
    at+=1.55;
  }else if(result.maintenanceEvent){
    playGameSound('service',at);
    at+=1.15;
  }else if(result.wildlifeEvent){
    playGameSound('splash',at);
    playGameSound('giggle',at+.42);
    at+=1.45;
  }

  if(result.revenue+result.tips>0){
    playGameSound('cash',at);
    at+=1.05;
  }

  const stars=reviewStars(result);
  if(stars){
    playGameSound(stars>=5?'yay':stars===4?'hmm':'awww',at+.18);
  }

  return ()=>{};
}
