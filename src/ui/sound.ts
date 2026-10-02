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

function audioContext(){
  if(ctx)return ctx;
  const Ctx=(window.AudioContext||(window as any).webkitAudioContext) as typeof AudioContext|undefined;
  if(!Ctx)return null;
  ctx=new Ctx();
  master=ctx.createGain();
  master.gain.value=.16;
  master.connect(ctx.destination);
  return ctx;
}

function unlock(){
  const c=audioContext();
  if(c?.state==='suspended')void c.resume();
  return c;
}

function tone(
  frequency:number,
  duration:number,
  when=0,
  gain=.18,
  type:OscillatorType='triangle',
  endFrequency?:number
){
  const c=unlock(); if(!c||!master)return;
  const start=c.currentTime+when;
  const osc=c.createOscillator();
  const amp=c.createGain();
  osc.type=type;
  osc.frequency.setValueAtTime(Math.max(30,frequency),start);
  if(endFrequency)osc.frequency.exponentialRampToValueAtTime(Math.max(30,endFrequency),start+duration);
  amp.gain.setValueAtTime(.0001,start);
  amp.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),start+.012);
  amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(amp);amp.connect(master);
  osc.start(start);osc.stop(start+duration+.03);
}

function noise(duration:number,when=0,gain=.11,low=250,high=5000){
  const c=unlock(); if(!c||!master)return;
  const frames=Math.max(1,Math.floor(c.sampleRate*duration));
  const buffer=c.createBuffer(1,frames,c.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<frames;i++)data[i]=Math.random()*2-1;
  const src=c.createBufferSource();src.buffer=buffer;
  const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=low;
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=high;
  const amp=c.createGain();
  const start=c.currentTime+when;
  amp.gain.setValueAtTime(.0001,start);
  amp.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),start+.025);
  amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
  src.connect(hp);hp.connect(lp);lp.connect(amp);amp.connect(master);
  src.start(start);src.stop(start+duration+.03);
}

function canPlay(name:GameSound){
  const now=performance.now();
  const min=name==='click'?55:180;
  if(now-(lastPlayed[name]??0)<min)return false;
  lastPlayed[name]=now;
  return true;
}

export function playGameSound(name:GameSound){
  if(!canPlay(name))return;
  const c=unlock(); if(!c)return;

  switch(name){
    case 'click':
      tone(520,.045,0,.08,'square',330);
      break;
    case 'cash':
      tone(880,.08,0,.13,'square',1040);
      tone(1320,.11,.08,.12,'square',1560);
      tone(1760,.07,.17,.08,'triangle');
      break;
    case 'yay':
      tone(523,.15,0,.16,'triangle');
      tone(659,.15,.11,.16,'triangle');
      tone(784,.16,.22,.17,'triangle');
      tone(1047,.32,.34,.20,'triangle');
      noise(.34,.32,.035,650,5200);
      break;
    case 'hmm':
      tone(247,.24,0,.13,'triangle',220);
      tone(196,.31,.18,.12,'triangle',174);
      break;
    case 'awww':
      tone(330,.72,0,.13,'sawtooth',165);
      tone(247,.70,.05,.07,'triangle',123);
      break;
    case 'motor':
      tone(72,1.05,0,.14,'sawtooth',112);
      tone(93,1.03,.02,.08,'square',145);
      noise(1.04,0,.055,55,700);
      tone(156,.28,.82,.07,'sawtooth',205);
      break;
    case 'service':
      for(let i=0;i<4;i++){
        tone(620+i*35,.11,i*.12,.08,'square',760+i*45);
        noise(.10,i*.12,.035,850,6500);
      }
      for(let i=0;i<3;i++)tone(1600,.025,.53+i*.065,.05,'square',900);
      break;
    case 'weather':
      noise(1.18,0,.09,80,1350);
      tone(82,.48,.30,.15,'sine',42);
      noise(.34,.31,.13,35,420);
      tone(58,.42,.42,.10,'triangle',38);
      break;
    case 'splash':
      noise(.42,0,.12,500,7000);
      tone(420,.34,0,.06,'sine',125);
      tone(190,.22,.08,.05,'sine',90);
      break;
    case 'giggle':
      tone(690,.09,0,.10,'triangle',820);
      tone(840,.08,.10,.09,'triangle',730);
      tone(760,.08,.20,.10,'triangle',910);
      tone(930,.12,.30,.09,'triangle',790);
      break;
  }
}

export function installButtonSounds(){
  if(installed)return;
  installed=true;
  document.addEventListener('click',event=>{
    const target=event.target;
    if(!(target instanceof Element))return;
    const button=target.closest('button');
    if(!button||button.hasAttribute('disabled')||button.dataset.sound==='none')return;
    playGameSound('click');
  },true);
}

function hasWeatherIncident(result:DayResult){
  if(result.hurricaneSummary)return true;
  return result.reviews.some(review=>
    review.reasons.some(reason=>/storm|wind|rain|rough|weather|lightning/i.test(reason))
  );
}

export function playDayResultSounds(result:DayResult,dayNumber:number){
  const timers:number[]=[];
  const later=(ms:number,sound:GameSound)=>timers.push(window.setTimeout(()=>playGameSound(sound),ms));

  if(result.revenue+result.tips>0)later(520,'cash');

  if(hasWeatherIncident(result))later(1050,'weather');
  else if(result.maintenanceEvent)later(1050,'service');
  else if(result.wildlifeEvent){
    later(1050,'splash');
    if(dayNumber%3===0)later(1370,'giggle');
  }

  if(result.reviews.length){
    const worst=Math.min(...result.reviews.map(r=>r.stars));
    later(1850,worst>=5?'yay':worst===4?'hmm':'awww');
  }

  return ()=>timers.forEach(window.clearTimeout);
}
