import type { BoatClass } from '../game/types/models';

export default function BoatArt({kind='deck',className=''}:{kind?:BoatClass;className?:string}){
  const type: 'deck'|'pontoon'|'center-console' =
    kind==='pontoon'?'pontoon':kind==='center-console'?'center-console':'deck';

  if(type==='pontoon')return <svg className={`boatArt ${className}`} viewBox="0 0 240 150" aria-hidden="true">
    <defs>
      <linearGradient id="pontoonHull" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#f8f0d8"/><stop offset=".55" stopColor="#d8d2bf"/><stop offset="1" stopColor="#788794"/></linearGradient>
      <linearGradient id="pontoonDeck" x1="0" x2="1"><stop stopColor="#efd39b"/><stop offset="1" stopColor="#b98a4d"/></linearGradient>
      <linearGradient id="pontoonGlass" x1="0" x2="1"><stop stopColor="#79d8f0"/><stop offset="1" stopColor="#197eab"/></linearGradient>
      <filter id="pontoonShadow"><feDropShadow dx="0" dy="7" stdDeviation="5" floodOpacity=".28"/></filter>
    </defs>
    <g filter="url(#pontoonShadow)">
      <ellipse cx="120" cy="130" rx="92" ry="12" fill="#17405b" opacity=".2"/>
      <rect x="32" y="104" width="176" height="18" rx="9" fill="#647582"/>
      <rect x="25" y="94" width="190" height="20" rx="10" fill="url(#pontoonHull)"/>
      <path d="M42 88 L198 88 L213 104 L27 104 Z" fill="url(#pontoonDeck)"/>
      <rect x="48" y="54" width="144" height="36" rx="12" fill="#f4ecd3" stroke="#b8af9b" strokeWidth="4"/>
      <path d="M61 58 H177 L189 84 H49 Z" fill="url(#pontoonGlass)" opacity=".92"/>
      <rect x="93" y="34" width="54" height="28" rx="7" fill="#f5ebd1"/>
      <rect x="102" y="38" width="36" height="18" rx="5" fill="#d6e6e8"/>
      <rect x="194" y="46" width="24" height="50" rx="9" fill="#424c54"/>
      <path d="M28 94 Q20 104 29 112 H211 Q220 104 212 94 Z" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth="5"/>
    </g>
  </svg>;

  if(type==='center-console')return <svg className={`boatArt ${className}`} viewBox="0 0 240 150" aria-hidden="true">
    <defs>
      <linearGradient id="ccHull" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#fff9e9"/><stop offset=".62" stopColor="#dad7c9"/><stop offset="1" stopColor="#455969"/></linearGradient>
      <linearGradient id="ccGlass" x1="0" x2="1"><stop stopColor="#73d9f1"/><stop offset="1" stopColor="#1b729f"/></linearGradient>
      <linearGradient id="ccDeck" x1="0" x2="1"><stop stopColor="#eacb8d"/><stop offset="1" stopColor="#c18e52"/></linearGradient>
      <filter id="ccShadow"><feDropShadow dx="0" dy="7" stdDeviation="5" floodOpacity=".28"/></filter>
    </defs>
    <g filter="url(#ccShadow)">
      <ellipse cx="117" cy="130" rx="94" ry="11" fill="#17405b" opacity=".2"/>
      <path d="M18 98 Q66 78 214 90 Q212 118 181 124 H53 Q28 119 18 98 Z" fill="url(#ccHull)" stroke="#9da4a5" strokeWidth="3"/>
      <path d="M34 91 Q96 74 196 84 L182 99 H49 Z" fill="url(#ccDeck)"/>
      <path d="M92 51 H143 L155 87 H83 Z" fill="#f4edd9" stroke="#a8a18f" strokeWidth="3"/>
      <path d="M99 57 H137 L145 78 H92 Z" fill="url(#ccGlass)"/>
      <path d="M89 50 Q92 28 103 26 M146 50 Q143 28 132 26 M102 26 H133" fill="none" stroke="#596873" strokeWidth="7" strokeLinecap="round"/>
      <rect x="198" y="54" width="25" height="48" rx="9" fill="#3d4850"/>
      <path d="M23 100 Q55 109 192 108" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="5"/>
    </g>
  </svg>;

  return <svg className={`boatArt ${className}`} viewBox="0 0 240 150" aria-hidden="true">
    <defs>
      <linearGradient id="deckHull" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#fff9e7"/><stop offset=".58" stopColor="#ddd8c7"/><stop offset="1" stopColor="#495d6a"/></linearGradient>
      <linearGradient id="deckGlass" x1="0" x2="1"><stop stopColor="#7bdef2"/><stop offset="1" stopColor="#267fa5"/></linearGradient>
      <linearGradient id="deckFloor" x1="0" x2="1"><stop stopColor="#eed19a"/><stop offset="1" stopColor="#c18b4c"/></linearGradient>
      <filter id="deckShadow"><feDropShadow dx="0" dy="7" stdDeviation="5" floodOpacity=".28"/></filter>
    </defs>
    <g filter="url(#deckShadow)">
      <ellipse cx="116" cy="130" rx="92" ry="11" fill="#17405b" opacity=".2"/>
      <path d="M19 97 Q51 74 211 85 Q210 114 178 124 H57 Q30 120 19 97 Z" fill="url(#deckHull)" stroke="#9ca4a8" strokeWidth="3"/>
      <path d="M37 88 Q88 68 193 79 L180 100 H47 Z" fill="url(#deckFloor)"/>
      <path d="M77 50 H154 Q166 51 171 63 L178 87 H66 L70 62 Q72 51 77 50 Z" fill="#f4edda" stroke="#b4ac99" strokeWidth="3"/>
      <path d="M79 55 H151 L163 80 H72 Z" fill="url(#deckGlass)"/>
      <path d="M86 48 Q90 30 102 28 M155 48 Q151 30 139 28 M101 28 H140" fill="none" stroke="#5a6871" strokeWidth="7" strokeLinecap="round"/>
      <rect x="196" y="50" width="25" height="49" rx="9" fill="#3f4a52"/>
      <path d="M24 99 Q55 109 191 108" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="5"/>
    </g>
  </svg>;
}
