import { useId } from 'react';
import type { BoatClass } from '../game/types/models';

export default function BoatArt({kind='deck',className=''}:{kind?:BoatClass;className?:string}){
  const type:'deck'|'pontoon'|'center-console'=kind==='pontoon'?'pontoon':kind==='center-console'?'center-console':'deck';
  const uid=useId().replace(/:/g,'');
  const hull=`hull-${uid}`, hullDark=`hullDark-${uid}`, glass=`glass-${uid}`, deck=`deck-${uid}`, metal=`metal-${uid}`, shade=`shade-${uid}`, glow=`glow-${uid}`, shadow=`shadow-${uid}`;

  const defs=<defs>
    <linearGradient id={hull} x1="0" y1="0" x2=".85" y2="1"><stop stopColor="#fffdf2"/><stop offset=".34" stopColor="#f2e7cd"/><stop offset=".7" stopColor="#c9c4b5"/><stop offset="1" stopColor="#6e7a7d"/></linearGradient>
    <linearGradient id={hullDark} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7b8789"/><stop offset="1" stopColor="#273a46"/></linearGradient>
    <linearGradient id={glass} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a9f2ff"/><stop offset=".3" stopColor="#53cbe9"/><stop offset=".72" stopColor="#19769f"/><stop offset="1" stopColor="#0b4166"/></linearGradient>
    <linearGradient id={deck} x1="0" y1="0" x2="1" y2=".35"><stop stopColor="#f0d59c"/><stop offset=".48" stopColor="#d8ae6a"/><stop offset="1" stopColor="#b77c3f"/></linearGradient>
    <linearGradient id={metal} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#4f5d62"/><stop offset=".45" stopColor="#d8e0df"/><stop offset=".7" stopColor="#808b8d"/><stop offset="1" stopColor="#3d484b"/></linearGradient>
    <radialGradient id={shade} cx=".26" cy=".18" r=".9"><stop stopColor="#fff" stopOpacity=".92"/><stop offset=".38" stopColor="#fff" stopOpacity=".15"/><stop offset="1" stopColor="#17324d" stopOpacity=".22"/></radialGradient>
    <linearGradient id={glow} x1="0" x2="1"><stop stopColor="#fff" stopOpacity=".95"/><stop offset=".6" stopColor="#d7ffff" stopOpacity=".35"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
    <filter id={shadow} x="-30%" y="-30%" width="170%" height="190%"><feDropShadow dx="0" dy="9" stdDeviation="6" floodColor="#17324d" floodOpacity=".28"/></filter>
  </defs>;

  if(type==='pontoon')return <svg className={`boatArt ${className}`} viewBox="0 0 300 200" aria-hidden="true">
    {defs}
    <g filter={`url(#${shadow})`}>
      <ellipse cx="154" cy="169" rx="108" ry="18" fill="#0a4a59" opacity=".18"/>
      <path d="M44 138 C48 153 59 163 76 166 L225 158 C244 157 256 147 260 132 L251 125 L55 130 Z" fill={`url(#${hullDark})`}/>
      <path d="M38 127 C43 141 54 150 71 153 L229 146 C247 145 260 135 263 120 L255 112 L49 118 Z" fill={`url(#${hull})`} stroke="#8f9998" strokeWidth="2.5"/>
      <path d="M54 113 L246 108 L229 136 L73 143 Z" fill={`url(#${deck})`}/>
      <path d="M61 116 L76 137 M84 114 L95 136 M108 113 L117 135 M133 112 L140 134 M159 111 L163 133 M185 110 L185 132 M210 109 L208 131" stroke="#9f6e3e" strokeWidth="2" opacity=".55"/>
      <path d="M65 73 C92 60 132 55 191 57 C214 59 232 72 239 93 L242 109 L58 114 L58 93 C58 83 60 77 65 73Z" fill="#f6edd6" stroke="#b5ad99" strokeWidth="3"/>
      <path d="M80 72 C117 61 164 60 202 65 L219 91 L73 97 Z" fill={`url(#${glass})`} stroke="#386c83" strokeWidth="3"/>
      <path d="M96 68 L87 93 M157 62 L154 94" stroke="#e9fcff" strokeWidth="3" opacity=".55"/>
      <path d="M91 58 Q100 32 117 28 M217 61 Q207 34 190 27 M116 28 Q154 18 190 27" fill="none" stroke={`url(#${metal})`} strokeWidth="9" strokeLinecap="round"/>
      <path d="M104 32 Q151 20 185 29" fill="none" stroke="#fff" strokeWidth="2" opacity=".55"/>
      <path d="M250 77 C267 74 276 83 274 99 L269 137 C268 149 259 154 247 149 L239 143 L243 87Z" fill="#353f44" stroke="#20282c" strokeWidth="3"/>
      <path d="M247 82 Q260 78 267 88" fill="none" stroke="#879196" strokeWidth="4" opacity=".65"/>
      <path d="M53 122 C94 112 178 106 244 111" fill="none" stroke={`url(#${glow})`} strokeWidth="7" strokeLinecap="round" opacity=".8"/>
      <ellipse cx="127" cy="82" rx="48" ry="13" fill="#fff" opacity=".12"/>
    </g>
  </svg>;

  if(type==='center-console')return <svg className={`boatArt ${className}`} viewBox="0 0 300 200" aria-hidden="true">
    {defs}
    <g filter={`url(#${shadow})`}>
      <ellipse cx="151" cy="169" rx="110" ry="18" fill="#0a4a59" opacity=".18"/>
      <path d="M31 128 C52 111 92 99 147 94 C199 89 234 91 264 101 C262 124 248 143 222 153 C177 161 111 162 64 153 C48 149 37 141 31 128Z" fill={`url(#${hull})`} stroke="#8e999a" strokeWidth="3"/>
      <path d="M42 130 C65 141 117 148 178 145 C218 143 242 136 257 119 C249 145 231 158 204 163 L79 162 C55 157 43 147 42 130Z" fill={`url(#${hullDark})`} opacity=".78"/>
      <path d="M51 119 C89 102 133 96 210 96 L236 108 L214 129 C157 136 101 137 59 129 Z" fill={`url(#${deck})`}/>
      <path d="M80 115 C105 107 129 103 150 102 M72 123 C109 117 151 113 195 112" fill="none" stroke="#9c6d3f" strokeWidth="2" opacity=".5"/>
      <path d="M131 67 L186 67 L197 104 L121 108 Z" fill="#f6edd7" stroke="#afa793" strokeWidth="3"/>
      <path d="M139 72 H181 L189 94 L130 99 Z" fill={`url(#${glass})`} stroke="#356c83" strokeWidth="2.5"/>
      <path d="M126 67 Q130 37 143 31 M192 68 Q188 38 176 31 M143 31 H176" fill="none" stroke={`url(#${metal})`} strokeWidth="8" strokeLinecap="round"/>
      <path d="M137 29 H181 L192 38 H126 Z" fill="#f4eddc" stroke="#747f83" strokeWidth="3"/>
      <path d="M150 76 Q163 71 177 75" fill="none" stroke="#c9f7ff" strokeWidth="4" strokeLinecap="round" opacity=".6"/>
      <path d="M254 78 C272 74 281 84 278 102 L273 142 C271 152 262 157 251 151 L243 146 L247 87Z" fill="#343e44" stroke="#20282d" strokeWidth="3"/>
      <path d="M40 126 Q91 107 238 103" fill="none" stroke={`url(#${glow})`} strokeWidth="7" strokeLinecap="round" opacity=".8"/>
      <path d="M59 136 Q127 150 221 139" fill="none" stroke="#fff" strokeWidth="3" opacity=".5"/>
    </g>
  </svg>;

  return <svg className={`boatArt ${className}`} viewBox="0 0 300 200" aria-hidden="true">
    {defs}
    <g filter={`url(#${shadow})`}>
      <ellipse cx="150" cy="170" rx="112" ry="18" fill="#0a4a59" opacity=".18"/>
      <path d="M30 129 C45 110 81 96 128 89 C177 82 220 87 262 104 C261 126 245 145 218 155 C169 164 105 164 59 154 C45 150 35 141 30 129Z" fill={`url(#${hull})`} stroke="#8e999a" strokeWidth="3"/>
      <path d="M36 132 C68 146 119 150 178 147 C220 145 245 136 258 119 C250 146 230 160 202 165 L80 164 C56 160 42 149 36 132Z" fill={`url(#${hullDark})`} opacity=".78"/>
      <path d="M48 119 C84 100 126 91 211 94 L239 107 L213 130 C151 137 98 136 57 129 Z" fill={`url(#${deck})`}/>
      <path d="M70 116 C110 105 154 101 214 102 M66 125 C111 117 158 114 205 115" fill="none" stroke="#9f6f40" strokeWidth="2" opacity=".5"/>
      <path d="M101 64 C128 54 164 52 196 59 C208 62 216 71 221 84 L224 102 L88 109 L91 82 C92 73 95 68 101 64Z" fill="#f5ecd7" stroke="#ada693" strokeWidth="3"/>
      <path d="M110 64 C137 57 167 57 192 62 C201 65 208 72 211 82 L215 94 L98 101 L101 79 C102 71 105 67 110 64Z" fill={`url(#${glass})`} stroke="#356d83" strokeWidth="2.5"/>
      <path d="M126 61 L120 98 M173 58 L174 96" stroke="#e4fbff" strokeWidth="3" opacity=".55"/>
      <path d="M108 61 Q113 36 126 31 M207 62 Q199 37 185 30 M126 31 Q155 21 185 30" fill="none" stroke={`url(#${metal})`} strokeWidth="9" strokeLinecap="round"/>
      <path d="M119 35 Q151 24 181 31" fill="none" stroke="#fff" strokeWidth="2" opacity=".55"/>
      <path d="M251 78 C270 74 280 84 277 102 L272 142 C271 153 261 158 250 151 L242 145 L246 87Z" fill="#353f44" stroke="#20282c" strokeWidth="3"/>
      <path d="M42 125 Q89 105 237 101" fill="none" stroke={`url(#${glow})`} strokeWidth="7" strokeLinecap="round" opacity=".82"/>
      <path d="M55 136 Q124 151 221 138" fill="none" stroke="#fff" strokeWidth="3" opacity=".55"/>
      <ellipse cx="150" cy="79" rx="47" ry="13" fill="#fff" opacity=".12"/>
    </g>
  </svg>;
}
