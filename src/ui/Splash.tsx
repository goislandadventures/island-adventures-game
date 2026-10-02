// @ts-nocheck
import { useEffect,useRef,useState } from 'react';
import * as THREE from 'three';

function palm(){
  const g=new THREE.Group();
  const trunk=new THREE.Mesh(
    new THREE.CylinderGeometry(.08,.12,1.65,8),
    new THREE.MeshStandardMaterial({color:0x9a6737,roughness:.9})
  );
  trunk.position.y=.82;
  g.add(trunk);

  const leafMat=new THREE.MeshStandardMaterial({
    color:0x2fa653,roughness:.8,side:THREE.DoubleSide
  });
  for(let i=0;i<9;i++){
    const leaf=new THREE.Mesh(new THREE.PlaneGeometry(1.05,.2,5,1),leafMat);
    leaf.position.y=1.7;
    leaf.rotation.y=i/9*Math.PI*2;
    leaf.rotation.x=-.42;
    leaf.translateX(.48);
    g.add(leaf);
  }
  return g;
}

function lighthouse(){
  const g=new THREE.Group();
  const steel=new THREE.MeshStandardMaterial({color:0x233d49,roughness:.6,metalness:.18});
  const glass=new THREE.MeshPhysicalMaterial({
    color:0xd8fbff,roughness:.14,transparent:true,opacity:.78,transmission:.1
  });
  const tower=new THREE.Mesh(new THREE.CylinderGeometry(.08,.18,2.1,6),steel);
  tower.position.y=1.05;
  g.add(tower);
  const deck=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.08,10),steel);
  deck.position.y=2.12;
  g.add(deck);
  const room=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.3,8),glass);
  room.position.y=2.31;
  g.add(room);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(.26,.18,8),steel);
  roof.position.y=2.55;
  g.add(roof);
  const light=new THREE.PointLight(0xffe58c,2.7,10,1.7);
  light.position.y=2.32;
  g.add(light);
  return g;
}

function boat(){
  const g=new THREE.Group();
  const white=new THREE.MeshStandardMaterial({color:0xf4f0e5,roughness:.42});
  const tan=new THREE.MeshStandardMaterial({color:0xc38b44,roughness:.55});
  const dark=new THREE.MeshStandardMaterial({color:0x27373f,roughness:.48});
  const glass=new THREE.MeshPhysicalMaterial({
    color:0x37bfe0,roughness:.1,transparent:true,opacity:.72,transmission:.08
  });

  const hull=new THREE.Mesh(new THREE.BoxGeometry(1.55,.32,.66),white);
  hull.position.y=.16;
  hull.scale.z=.82;
  g.add(hull);

  const deck=new THREE.Mesh(new THREE.BoxGeometry(1.15,.14,.52),tan);
  deck.position.y=.39;
  g.add(deck);

  const windscreen=new THREE.Mesh(new THREE.BoxGeometry(.72,.34,.48),glass);
  windscreen.position.set(.05,.66,0);
  g.add(windscreen);

  const motor=new THREE.Mesh(new THREE.BoxGeometry(.22,.58,.35),dark);
  motor.position.set(.9,.22,0);
  g.add(motor);

  const rail=new THREE.Mesh(new THREE.TorusGeometry(.44,.025,8,20,Math.PI),dark);
  rail.position.set(.06,.9,0);
  rail.rotation.x=Math.PI/2;
  g.add(rail);
  return g;
}

function LiveWorld(){
  const ref=useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    const mount=ref.current;
    if(!mount)return;

    const scene=new THREE.Scene();
    scene.fog=new THREE.Fog(0x8de6ee,13,31);

    const camera=new THREE.PerspectiveCamera(50,1,.1,80);
    const renderer=new THREE.WebGLRenderer({
      antialias:true,
      alpha:true,
      powerPreference:'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.12;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xd9fbff,0x11655e,2.25));

    const sun=new THREE.DirectionalLight(0xffefb2,4.6);
    sun.position.set(-7,11,6);
    sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024);
    sun.shadow.camera.left=-10;
    sun.shadow.camera.right=10;
    sun.shadow.camera.top=10;
    sun.shadow.camera.bottom=-10;
    scene.add(sun);

    const rim=new THREE.DirectionalLight(0x51dfff,1.4);
    rim.position.set(7,4,-8);
    scene.add(rim);

    const waterGeo=new THREE.PlaneGeometry(38,38,54,54);
    waterGeo.rotateX(-Math.PI/2);
    const base=waterGeo.attributes.position.array.slice();
    const waterMat=new THREE.MeshPhysicalMaterial({
      color:0x08a9c4,
      roughness:.14,
      metalness:.08,
      clearcoat:.82,
      clearcoatRoughness:.08,
      reflectivity:.75
    });
    const water=new THREE.Mesh(waterGeo,waterMat);
    water.position.y=-.2;
    water.receiveShadow=true;
    scene.add(water);

    const sand=new THREE.Mesh(
      new THREE.CylinderGeometry(5.45,6.15,.62,64),
      new THREE.MeshStandardMaterial({color:0xf0cb77,roughness:.92})
    );
    sand.position.y=.08;
    sand.scale.z=.67;
    sand.castShadow=true;
    sand.receiveShadow=true;
    scene.add(sand);

    const green=new THREE.Mesh(
      new THREE.CylinderGeometry(3.8,4.45,.76,64),
      new THREE.MeshStandardMaterial({color:0x3e9a54,roughness:.96})
    );
    green.position.y=.58;
    green.scale.z=.64;
    green.castShadow=true;
    green.receiveShadow=true;
    scene.add(green);

    const rockMat=new THREE.MeshStandardMaterial({color:0x405961,roughness:.92});
    [
      [-.45,1.2,-.9,1.15],
      [.95,1.0,-.75,.82],
      [-1.45,.92,-.45,.7]
    ].forEach(([x,y,z,s])=>{
      const r=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),rockMat);
      r.position.set(x,y,z);
      r.scale.y=.62;
      r.castShadow=true;
      scene.add(r);
    });

    const palms=[];
    [
      [-2.45,.72,1.0,.05],
      [-1.42,.25,.82,.62],
      [2.05,.4,.93,1.25],
      [2.95,1.0,.72,1.9]
    ].forEach(([x,z,s,rot])=>{
      const p=palm();
      p.position.set(x,.92,z);
      p.scale.setScalar(s);
      p.rotation.y=rot;
      p.traverse(o=>{if(o.isMesh)o.castShadow=true});
      palms.push(p);
      scene.add(p);
    });

    const light=lighthouse();
    light.position.set(3.85,.63,-1.12);
    light.scale.setScalar(.9);
    scene.add(light);

    const heroBoat=boat();
    heroBoat.position.set(-3.65,-.02,2.55);
    heroBoat.rotation.y=-.11;
    heroBoat.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
    scene.add(heroBoat);

    const shoreline=new THREE.Mesh(
      new THREE.TorusGeometry(5.95,.045,8,110),
      new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.42})
    );
    shoreline.rotation.x=Math.PI/2;
    shoreline.scale.z=.67;
    shoreline.position.y=-.01;
    scene.add(shoreline);

    const resize=()=>{
      const r=mount.getBoundingClientRect();
      const w=Math.max(1,r.width),h=Math.max(1,r.height);
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      camera.fov=camera.aspect<.72?46:52;
      camera.updateProjectionMatrix();
    };

    resize();
    const ro=new ResizeObserver(resize);
    ro.observe(mount);

    const clock=new THREE.Clock();
    let raf=0;
    const animate=()=>{
      const t=clock.getElapsedTime();

      const pos=waterGeo.attributes.position;
      for(let i=0;i<pos.count;i++){
        const x=base[i*3],z=base[i*3+2];
        pos.setY(i,
          Math.sin(x*.72+t*1.08)*.105+
          Math.sin(z*.57-t*.82)*.082+
          Math.sin((x+z)*1.13+t*.48)*.042
        );
      }
      pos.needsUpdate=true;
      waterGeo.computeVertexNormals();

      const portrait=camera.aspect<.72;
      const radius=portrait?17.4:14.6;
      const yaw=Math.sin(t*.12)*.055;
      camera.position.set(Math.sin(yaw)*radius,portrait?5.4:4.55,Math.cos(yaw)*radius);
      camera.lookAt(0,.82,.1);

      heroBoat.position.y=-.02+Math.sin(t*1.5)*.04;
      heroBoat.rotation.z=Math.sin(t*1.1)*.012;

      palms.forEach((p,i)=>{
        p.rotation.z=Math.sin(t*.58+i*.8)*.011;
      });

      renderer.render(scene,camera);
      raf=requestAnimationFrame(animate);
    };
    animate();

    return()=>{
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);
    };
  },[]);

  return <div ref={ref} className="splashV13World" aria-hidden="true"/>;
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
      audio.currentTime=0;
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

  return <main className="splash splashV13">
    <section className="splashV13Stage">
      <div className="splashV13Sky" aria-hidden="true"/>
      <div className="splashV13Sun" aria-hidden="true"/>
      <LiveWorld/>
      <div className="splashV13Atmosphere" aria-hidden="true"/>

      <header className="splashV13Brand">
        <img src="/branding/island-adventures-logo-mobile.png" alt="Island Adventures" className="splashV13Logo"/>
        <div className="splashV13Subtitle">THE PRIVATE CHARTER BUSINESS GAME</div>
      </header>

      <div className="splashV13Controls">
        <button className="splashV13Enter" onClick={enter}>
          <strong>ENTER THE ISLANDS</strong>
          <span>Start / Sign In / Demo</span>
        </button>
        <button
          className={`splashV13Theme ${soundPlaying?'playing':''}`}
          onClick={toggleSound}
          aria-pressed={soundPlaying}
          aria-label={soundPlaying?'Stop theme music':'Play theme music'}
        >
          <b>{soundPlaying?'■':'♫'}</b>
          <span>{soundPlaying?'THEME ON':'PLAY THEME'}</span>
        </button>
      </div>

      <footer className="splashV13Footer">
        <span>ISLAND ADVENTURES · THE FLORIDA KEYS</span>
        <span>VERSION 1.0 · © 2026</span>
      </footer>
    </section>
  </main>;
}
