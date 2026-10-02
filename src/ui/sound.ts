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
  master.gain.value=.26;
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
  const start=c.currentTime+Math.max(0,when);
  const osc=c.createOscillator();
  const amp=c.createGain();
  osc.type=type;
  osc.frequency.setValueAtTime(Math.max(40,frequency),start);
  if(endFrequency)osc.frequency.exponentialRampToValueAtTime(Math.max(40,endFrequency),start+duration);
  amp.gain.setValueAtTime(.0001,start);
  amp.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),start+.01);
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
  const start=c.currentTime+Math.max(0,when);
  amp.gain.setValueAtTime(.0001,start);
  amp.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),start+.018);
  amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
  src.connect(hp);hp.connect(lp);lp.connect(amp);amp.connect(master);
  src.start(start);src.stop(start+duration+.03);
}

function canPlay(name:GameSound){
  const now=performance.now();
  const min=name==='click'?55:160;
  if(now-(lastPlayed[name]??0)<min)return false;
  lastPlayed[name]=now;
  return true;
}

/**
 * All important gameplay sounds are synthesized and scheduled directly on the
 * Web Audio clock from the player's tap. This is much more reliable on iOS than
 * setTimeout-driven audio, and the important frequencies are kept above ~140 Hz
 * so they survive an iPhone speaker.
 */
export function playGameSound(name:GameSound,delaySeconds=0){
  if(!canPlay(name))return;
  const c=unlock(); if(!c)return;
  const d=Math.max(0,delaySeconds);

  switch(name){
    case 'click':
      tone(620,.04,d,.11,'square',390);
      break;

    case 'cash':
      // Drawer clack + bright two-part "ka-ching".
      noise(.075,d,.15,420,5200);
      tone(980,.07,d+.035,.17,'square',760);
      tone(1480,.13,d+.09,.22,'triangle',1860);
      tone(1980,.18,d+.17,.20,'triangle',2380);
      tone(2480,.20,d+.24,.12,'sine',2140);
      break;

    case 'yay':
      // Bright arcade celebration that reads clearly as a win on a phone.
      tone(660,.13,d,.19,'triangle',760);
      tone(830,.13,d+.09,.20,'triangle',940);
      tone(1040,.14,d+.18,.21,'triangle',1180);
      tone(1320,.30,d+.28,.24,'triangle',1540);
      tone(1760,.22,d+.34,.10,'sine',1980);
      noise(.28,d+.29,.035,900,6500);
      break;

    case 'hmm':
      tone(330,.20,d,.17,'triangle',285);
      tone(247,.30,d+.16,.16,'triangle',210);
      break;

    case 'awww':
      tone(440,.62,d,.16,'sawtooth',220);
      tone(330,.64,d+.04,.09,'triangle',165);
      break;

    case 'motor':
      // Outboard start, catch and rev. Mid harmonics keep it audible on mobile.
      noise(.13,d,.13,180,2400);
      tone(185,.10,d,.18,'square',145);
      tone(150,.82,d+.08,.20,'sawtooth',315);
      tone(300,.80,d+.09,.10,'triangle',620);
      for(let i=0;i<7;i++){
        const t=d+.12+i*.105;
        tone(235+i*18,.072,t,.065,'square',300+i*26);
      }
      noise(.76,d+.09,.075,130,1900);
      tone(420,.22,d+.76,.10,'sawtooth',610);
      break;

    case 'service':
      // Short electric drill / ratchet sequence.
      for(let i=0;i<5;i++){
        tone(760+i*55,.105,d+i*.105,.10,'square',1120+i*65);
        noise(.09,d+i*.105,.045,850,7200);
      }
      for(let i=0;i<3;i++)tone(1850,.026,d+.58+i*.065,.075,'square',1050);
      break;

    case 'weather':
      // Wind/rain wash plus a phone-audible thunder crack.
      noise(1.05,d,.12,160,1850);
      noise(.16,d+.26,.17,220,4200);
      tone(230,.40,d+.27,.17,'sawtooth',115);
      tone(345,.22,d+.31,.09,'triangle',170);
      break;

    case 'splash':
      noise(.40,d,.15,600,7600);
      tone(520,.30,d,.08,'sine',165);
      tone(240,.20,d+.08,.06,'sine',120);
      break;

    case 'giggle':
      tone(760,.085,d,.12,'triangle',940);
      tone(960,.075,d+.09,.11,'triangle',810);
      tone(850,.075,d+.18,.12,'triangle',1060);
      tone(1080,.11,d+.27,.11,'triangle',880);
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
  // Schedule the entire result sequence now, while the Run/Close button's
  // user gesture owns the unlocked AudioContext. No JavaScript timers.
  let at=result.tripsRun>0?.95:.10;

  if(result.revenue+result.tips>0){
    playGameSound('cash',at);
    at+=.58;
  }

  if(hasWeatherIncident(result)){
    playGameSound('weather',at);
    at+=1.12;
  }else if(result.maintenanceEvent){
    playGameSound('service',at);
    at+=.82;
  }else if(result.wildlifeEvent){
    playGameSound('splash',at);
    playGameSound('giggle',at+.34);
    at+=.78;
  }

  const stars=reviewStars(result);
  if(stars){
    playGameSound(stars>=5?'yay':stars===4?'hmm':'awww',at+.08);
  }

  return ()=>{};
}
