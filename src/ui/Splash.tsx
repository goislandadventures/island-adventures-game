import { useEffect,useRef,useState } from 'react';

type Point={x:number;y:number};

function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n))}
function seeded(n:number){
  const x=Math.sin(n*12.9898+78.233)*43758.5453;
  return x-Math.floor(x);
}

function drawPalm(ctx:CanvasRenderingContext2D,x:number,y:number,scale:number,lean:number,t:number){
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(scale,scale);
  ctx.rotate(lean+Math.sin(t*.55+x*.01)*.012);

  const trunk=ctx.createLinearGradient(-8,0,8,0);
  trunk.addColorStop(0,'#4b2f20');
  trunk.addColorStop(.45,'#9b6a3e');
  trunk.addColorStop(.7,'#d19a59');
  trunk.addColorStop(1,'#4b2f20');
  ctx.strokeStyle=trunk;
  ctx.lineWidth=10;
  ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.bezierCurveTo(7,-38,10,-78,1,-122);
  ctx.stroke();

  ctx.translate(1,-122);
  for(let i=0;i<9;i++){
    const a=-Math.PI*.92+i*(Math.PI*1.84/8)+Math.sin(t*.7+i)*.015;
    const len=58+(i%3)*8;
    ctx.save();
    ctx.rotate(a);
    const leaf=ctx.createLinearGradient(0,0,len,0);
    leaf.addColorStop(0,'#1f7e4c');
    leaf.addColorStop(.55,'#38a65d');
    leaf.addColorStop(1,'#145c3d');
    ctx.fillStyle=leaf;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(len*.25,-9,len*.72,-10,len,0);
    ctx.bezierCurveTo(len*.72,9,len*.25,9,0,0);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle='#5d3823';
  ctx.beginPath();
  ctx.arc(-4,2,6,0,Math.PI*2);
  ctx.arc(5,3,5,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawLighthouse(ctx:CanvasRenderingContext2D,x:number,y:number,scale:number,t:number){
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(scale,scale);

  ctx.strokeStyle='rgba(24,50,61,.95)';
  ctx.lineWidth=4;
  ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(-14,72);ctx.lineTo(-5,8);
  ctx.moveTo(14,72);ctx.lineTo(5,8);
  ctx.stroke();
  ctx.lineWidth=2;
  for(let yy=18;yy<68;yy+=14){
    const w=4+(yy/72)*13;
    ctx.beginPath();
    ctx.moveTo(-w,yy);ctx.lineTo(w,yy+9);
    ctx.moveTo(w,yy);ctx.lineTo(-w,yy+9);
    ctx.stroke();
  }

  ctx.fillStyle='#263f49';
  ctx.fillRect(-13,2,26,7);
  const room=ctx.createLinearGradient(-9,0,9,0);
  room.addColorStop(0,'#d9fbff');room.addColorStop(.5,'#86dbea');room.addColorStop(1,'#d9fbff');
  ctx.fillStyle=room;
  ctx.fillRect(-9,-11,18,13);
  ctx.strokeStyle='#263f49';
  ctx.lineWidth=2.5;
  ctx.strokeRect(-9,-11,18,13);
  ctx.fillStyle='#263f49';
  ctx.beginPath();ctx.moveTo(-12,-11);ctx.lineTo(0,-18);ctx.lineTo(12,-11);ctx.closePath();ctx.fill();

  const sweep=(Math.sin(t*.55)+1)/2;
  ctx.save();
  ctx.translate(0,-7);
  ctx.rotate(-.45+sweep*.9);
  const beam=ctx.createLinearGradient(0,0,170,0);
  beam.addColorStop(0,'rgba(255,247,176,.42)');
  beam.addColorStop(.45,'rgba(255,247,176,.12)');
  beam.addColorStop(1,'rgba(255,247,176,0)');
  ctx.fillStyle=beam;
  ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(180,-20);ctx.lineTo(180,20);ctx.lineTo(0,2);ctx.closePath();ctx.fill();
  ctx.restore();

  ctx.fillStyle='#314d56';
  ctx.beginPath();ctx.ellipse(0,74,20,5,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawBoat(ctx:CanvasRenderingContext2D,x:number,y:number,scale:number,t:number){
  ctx.save();
  ctx.translate(x,y+Math.sin(t*1.5)*1.6);
  ctx.scale(scale,scale);
  ctx.rotate(Math.sin(t*.9)*.004);

  ctx.fillStyle='rgba(0,53,75,.14)';
  ctx.beginPath();ctx.ellipse(3,28,75,12,0,0,Math.PI*2);ctx.fill();

  const hull=ctx.createLinearGradient(0,-8,0,28);
  hull.addColorStop(0,'#fffdf3');hull.addColorStop(.55,'#e8e2d5');hull.addColorStop(1,'#63747a');
  ctx.fillStyle=hull;
  ctx.strokeStyle='rgba(32,65,76,.65)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(-70,0);ctx.quadraticCurveTo(-42,-18,18,-18);ctx.quadraticCurveTo(55,-18,76,-7);
  ctx.quadraticCurveTo(63,16,35,23);ctx.lineTo(-38,23);ctx.quadraticCurveTo(-58,18,-70,0);ctx.fill();ctx.stroke();

  const deck=ctx.createLinearGradient(-20,-20,38,-2);
  deck.addColorStop(0,'#e8c886');deck.addColorStop(.55,'#c9954d');deck.addColorStop(1,'#936331');
  ctx.fillStyle=deck;
  ctx.beginPath();ctx.moveTo(-51,-3);ctx.quadraticCurveTo(-5,-19,55,-10);ctx.lineTo(37,6);ctx.lineTo(-45,9);ctx.closePath();ctx.fill();

  const glass=ctx.createLinearGradient(0,-41,0,-13);
  glass.addColorStop(0,'#b5f4ff');glass.addColorStop(.35,'#49c5e5');glass.addColorStop(1,'#0d5f87');
  ctx.fillStyle=glass;
  ctx.strokeStyle='rgba(239,251,248,.85)';
  ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-20,-37);ctx.lineTo(24,-37);ctx.lineTo(39,-14);ctx.lineTo(-32,-14);ctx.closePath();ctx.fill();ctx.stroke();

  ctx.strokeStyle='#364d56';ctx.lineWidth=5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-24,-39);ctx.quadraticCurveTo(-17,-66,3,-67);ctx.quadraticCurveTo(24,-66,31,-39);ctx.stroke();

  ctx.fillStyle='#29383f';
  ctx.beginPath();ctx.roundRect(66,-13,19,45,8);ctx.fill();

  ctx.strokeStyle='rgba(255,255,255,.65)';
  ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-52,4);ctx.quadraticCurveTo(-8,-4,54,-4);ctx.stroke();

  ctx.restore();
}

function CinematicIslandCanvas(){
  const ref=useRef<HTMLCanvasElement|null>(null);
  const pointer=useRef<Point>({x:0,y:0});
  const target=useRef<Point>({x:0,y:0});

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas)return;
    const ctx=canvas.getContext('2d',{alpha:false});
    if(!ctx)return;

    let frame=0;
    let width=0,height=0,dpr=1;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      width=Math.max(1,rect.width);
      height=Math.max(1,rect.height);
      dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(width*dpr);
      canvas.height=Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();
    const ro=new ResizeObserver(resize);
    ro.observe(canvas);

    const onPointer=(e:PointerEvent)=>{
      target.current.x=clamp((e.clientX/window.innerWidth-.5)*2,-1,1);
      target.current.y=clamp((e.clientY/window.innerHeight-.5)*2,-1,1);
    };
    const reset=()=>{target.current={x:0,y:0}};
    window.addEventListener('pointermove',onPointer,{passive:true});
    window.addEventListener('pointerleave',reset);

    const render=(now:number)=>{
      const t=reduced?0:now/1000;
      pointer.current.x+=(target.current.x-pointer.current.x)*.035;
      pointer.current.y+=(target.current.y-pointer.current.y)*.035;
      const px=pointer.current.x,py=pointer.current.y;
      const horizon=height*.625;

      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,width,height);

      const sky=ctx.createLinearGradient(0,0,0,horizon);
      sky.addColorStop(0,'#035eaa');
      sky.addColorStop(.36,'#049bd7');
      sky.addColorStop(.68,'#39cce8');
      sky.addColorStop(1,'#b6f1ec');
      ctx.fillStyle=sky;ctx.fillRect(0,0,width,horizon);

      const sunX=width*(.79-px*.012),sunY=height*(.22-py*.006);
      const glow=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,width*.23);
      glow.addColorStop(0,'rgba(255,248,187,.9)');
      glow.addColorStop(.11,'rgba(255,225,104,.58)');
      glow.addColorStop(.38,'rgba(255,234,157,.14)');
      glow.addColorStop(1,'rgba(255,244,202,0)');
      ctx.fillStyle=glow;ctx.fillRect(0,0,width,horizon);
      ctx.fillStyle='#ffe17a';ctx.beginPath();ctx.arc(sunX,sunY,Math.max(24,width*.04),0,Math.PI*2);ctx.fill();

      ctx.save();
      ctx.globalAlpha=.11;
      ctx.strokeStyle='#d7f7ff';
      ctx.lineWidth=.7;
      const vanishX=width*.5;
      for(let i=-6;i<=6;i++){
        ctx.beginPath();ctx.moveTo(vanishX+i*width*.12,0);ctx.lineTo(vanishX+i*width*.035,horizon);ctx.stroke();
      }
      for(let y=height*.08;y<horizon;y+=height*.085){
        ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y+Math.sin(y*.02)*2);ctx.stroke();
      }
      ctx.restore();

      for(let c=0;c<13;c++){
        const seed=seeded(c+4);
        const drift=(t*(2.4+seed*2.2)+c*91)%(width*1.35)-width*.18;
        const cy=height*(.12+seeded(c+20)*.33);
        const cw=width*(.08+seeded(c+40)*.09);
        const ch=cw*.18;
        ctx.save();
        ctx.globalAlpha=.07+seeded(c+60)*.08;
        ctx.fillStyle='#fff';
        ctx.filter='blur(14px)';
        ctx.beginPath();ctx.ellipse(drift,cy,cw,ch,0,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
      ctx.filter='none';

      const water=ctx.createLinearGradient(0,horizon,0,height);
      water.addColorStop(0,'#2bd2d7');
      water.addColorStop(.22,'#0bb8cc');
      water.addColorStop(.63,'#078fae');
      water.addColorStop(1,'#046d93');
      ctx.fillStyle=water;ctx.fillRect(0,horizon,width,height-horizon);

      const islandX=width*(.51-px*.01);
      const islandY=horizon-height*.016-py*2;
      const islandW=Math.min(width*.86,940);
      const islandH=Math.max(68,height*.102);

      ctx.save();
      ctx.fillStyle='rgba(0,78,94,.2)';
      ctx.filter='blur(12px)';
      ctx.beginPath();ctx.ellipse(islandX,islandY+islandH*.65,islandW*.53,islandH*.3,0,0,Math.PI*2);ctx.fill();
      ctx.restore();ctx.filter='none';

      const sand=ctx.createLinearGradient(0,islandY-islandH*.2,0,islandY+islandH);
      sand.addColorStop(0,'#fff0ad');sand.addColorStop(.52,'#e9c26d');sand.addColorStop(1,'#b98749');
      ctx.fillStyle=sand;
      ctx.beginPath();
      ctx.moveTo(islandX-islandW*.51,islandY+islandH*.45);
      ctx.bezierCurveTo(islandX-islandW*.32,islandY-islandH*.18,islandX+islandW*.22,islandY-islandH*.18,islandX+islandW*.5,islandY+islandH*.38);
      ctx.bezierCurveTo(islandX+islandW*.33,islandY+islandH*.78,islandX-islandW*.34,islandY+islandH*.8,islandX-islandW*.51,islandY+islandH*.45);
      ctx.fill();

      const ridge=ctx.createLinearGradient(islandX,islandY-islandH, islandX,islandY);
      ridge.addColorStop(0,'#304d5e');ridge.addColorStop(.5,'#416877');ridge.addColorStop(1,'#213d4e');
      ctx.fillStyle=ridge;
      ctx.beginPath();
      ctx.moveTo(islandX-islandW*.22,islandY+islandH*.05);
      ctx.lineTo(islandX-islandW*.13,islandY-islandH*.42);
      ctx.lineTo(islandX-islandW*.03,islandY-islandH*.32);
      ctx.lineTo(islandX+islandW*.06,islandY-islandH*.63);
      ctx.lineTo(islandX+islandW*.18,islandY-islandH*.53);
      ctx.lineTo(islandX+islandW*.29,islandY+islandH*.04);
      ctx.closePath();ctx.fill();

      ctx.fillStyle='#2d7b54';
      ctx.beginPath();
      ctx.moveTo(islandX-islandW*.34,islandY+islandH*.05);
      ctx.bezierCurveTo(islandX-islandW*.2,islandY-islandH*.22,islandX-islandW*.06,islandY-islandH*.08,islandX,islandY-islandH*.15);
      ctx.bezierCurveTo(islandX+islandW*.15,islandY-islandH*.22,islandX+islandW*.25,islandY-islandH*.04,islandX+islandW*.37,islandY+islandH*.08);
      ctx.lineTo(islandX+islandW*.36,islandY+islandH*.25);
      ctx.lineTo(islandX-islandW*.36,islandY+islandH*.25);
      ctx.closePath();ctx.fill();

      ctx.strokeStyle='rgba(255,255,255,.62)';ctx.lineWidth=1.7;
      ctx.beginPath();
      ctx.moveTo(islandX-islandW*.48,islandY+islandH*.4);
      ctx.bezierCurveTo(islandX-islandW*.15,islandY+islandH*.62,islandX+islandW*.22,islandY+islandH*.58,islandX+islandW*.46,islandY+islandH*.35);
      ctx.stroke();

      drawPalm(ctx,islandX-islandW*.28,islandY+islandH*.18,Math.max(.42,width/950*.72),-.08,t);
      drawPalm(ctx,islandX-islandW*.19,islandY+islandH*.11,Math.max(.5,width/900*.82),.035,t);
      drawPalm(ctx,islandX+islandW*.31,islandY+islandH*.2,Math.max(.4,width/1050*.64),.08,t);

      drawLighthouse(ctx,width*.88-px*3,horizon-height*.09,Math.max(.58,width/1050),t);
      drawBoat(ctx,width*.14-px*5,horizon+height*.055,Math.max(.52,width/820),t);

      ctx.save();
      ctx.globalCompositeOperation='screen';
      for(let i=0;i<46;i++){
        const p=(i+1)/46;
        const y=horizon+Math.pow(p,1.6)*(height-horizon);
        const amp=4+p*18;
        const speed=t*(.6+p*1.9);
        const alpha=.025+p*.075;
        ctx.strokeStyle=`rgba(235,255,255,${alpha})`;
        ctx.lineWidth=.7+p*1.15;
        ctx.beginPath();
        for(let x=-20;x<=width+20;x+=14){
          const yy=y+Math.sin(x*.022+speed+i*.37)*amp*.22+Math.sin(x*.009-speed*.7)*amp*.12;
          if(x===-20)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
        }
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.globalAlpha=.16;
      ctx.strokeStyle='#d8ffff';ctx.lineWidth=.65;
      const vanish={x:width*.5,y:horizon};
      for(let i=-9;i<=9;i++){
        ctx.beginPath();ctx.moveTo(vanish.x+i*8,vanish.y);ctx.lineTo(vanish.x+i*width*.13,height);ctx.stroke();
      }
      for(let j=1;j<=15;j++){
        const p=j/15;
        const yy=horizon+Math.pow(p,1.9)*(height-horizon);
        ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(width,yy);ctx.stroke();
      }
      ctx.restore();

      for(let i=0;i<40;i++){
        const sx=(seeded(i+100)*width+t*(4+seeded(i+300)*7))%(width+20)-10;
        const sy=horizon+seeded(i+200)*(height-horizon);
        const a=.08+seeded(i+400)*.18;
        ctx.fillStyle=`rgba(255,255,255,${a})`;
        ctx.fillRect(sx,sy,1+seeded(i+500)*1.6,1+seeded(i+600)*1.6);
      }

      const horizonGlow=ctx.createLinearGradient(0,horizon-height*.025,0,horizon+height*.05);
      horizonGlow.addColorStop(0,'rgba(255,255,255,0)');
      horizonGlow.addColorStop(.48,'rgba(233,255,249,.44)');
      horizonGlow.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=horizonGlow;ctx.fillRect(0,horizon-height*.03,width,height*.085);

      const vignette=ctx.createRadialGradient(width*.5,height*.42,width*.16,width*.5,height*.5,width*.78);
      vignette.addColorStop(.62,'rgba(0,0,0,0)');
      vignette.addColorStop(1,'rgba(0,30,55,.28)');
      ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);

      if(!reduced)frame=requestAnimationFrame(render);
    };

    frame=requestAnimationFrame(render);
    return()=>{
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('pointermove',onPointer);
      window.removeEventListener('pointerleave',reset);
    };
  },[]);

  return <canvas ref={ref} className="cinematicSplashCanvas" aria-hidden="true"/>;
}

export default function Splash({onEnter}:{onEnter:()=>void}){
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const [soundPlaying,setSoundPlaying]=useState(false);

  useEffect(()=>{
    const audio=new Audio('/audio/splash-theme.mp3');
    audio.preload='metadata';
    audio.loop=true;
    audio.volume=.68;
    audioRef.current=audio;
    const onPlay=()=>setSoundPlaying(true);
    const onPause=()=>setSoundPlaying(false);
    audio.addEventListener('play',onPlay);
    audio.addEventListener('pause',onPause);
    return()=>{
      audio.pause();
      audio.removeEventListener('play',onPlay);
      audio.removeEventListener('pause',onPause);
    };
  },[]);

  const toggleSound=async()=>{
    const audio=audioRef.current;
    if(!audio)return;
    if(!audio.paused){audio.pause();audio.currentTime=0;return}
    try{await audio.play()}catch{setSoundPlaying(false)}
  };

  const enter=()=>{
    const audio=audioRef.current;
    if(audio){try{audio.pause();audio.currentTime=0}catch{}}
    onEnter();
  };

  return <main className="splash cinematicSplash">
    <section className="cinematicSplashScene">
      <CinematicIslandCanvas/>
      <div className="cinematicSplashAtmosphere" aria-hidden="true"/>

      <header className="cinematicSplashTitle">
        <div className="cinematicSplashEyebrow">THE PRIVATE CHARTER BUSINESS GAME</div>
        <h1 className="cinematicGameLogo" aria-label="Island Adventures">
          <span>ISLAND</span>
          <span>ADVENTURES</span>
        </h1>
        <p>Build your fleet. Master the weather. Rule the islands.</p>
      </header>

      <div className="cinematicSplashControls">
        <button className="cinematicEnter" onClick={enter}>
          <strong>ENTER THE ISLANDS</strong>
          <span>Start / Sign In / Demo</span>
        </button>
        <button className={`cinematicTheme ${soundPlaying?'playing':''}`} onClick={toggleSound} aria-pressed={soundPlaying}>
          <b>{soundPlaying?'■':'♫'}</b>
          <span>{soundPlaying?'THEME ON':'PLAY THEME'}</span>
        </button>
      </div>

      <footer className="cinematicSplashFooter">
        <div>
          <strong>ISLAND ADVENTURES</strong>
          <span>THE FLORIDA KEYS</span>
        </div>
        <span>VERSION 1.0 · © 2026</span>
      </footer>
    </section>
  </main>;
}
