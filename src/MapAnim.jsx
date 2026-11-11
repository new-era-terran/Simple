import React from 'react';
import {wordT} from './camera.js';
const INK = '#2b1d16';
const cl = (x) => Math.max(0, Math.min(1, x));
const ez = (t, a, b) => { const u = cl((t - a) / (b - a)); return u * u * (3 - 2 * u); };
const pop = (t, a) => { const u = cl((t - a) / 0.35); return u < 1 ? 1.18 * Math.sin(u * Math.PI / 2) - 0.18 * Math.sin(u * Math.PI) : 1; };
const US = ({w = 34}) => { const h = w * 0.53, s = h / 13; return (<g>{[...Array(13)].map((_, i) => <rect key={i} y={i * s} width={w} height={s + 0.3} fill={i % 2 ? '#fff' : '#c8202f'} />)}<rect width={w * 0.4} height={s * 7} fill="#2b3a85" /><rect width={w} height={h} fill="none" stroke={INK} strokeWidth={2} /></g>); };
const Arrow = ({d, len, p, c, w = 16, head}) => (<g><path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />{p > 0.97 && <path d={head} fill={c} stroke={INK} strokeWidth={2} />}</g>);
const Tag = ({x, y, text, c, s}) => (<g transform={`translate(${x},${y}) scale(${s})`}><rect x={-95} y={-24} width={190} height={46} rx={6} fill="#fff" stroke={c} strokeWidth={5} /><text y={10} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={900} fontSize={26} fill={c}>{text}</text></g>);
// 2D animated map of the Rhine crossing, drawn over the 3D scene
export const MapAnim = ({t, push = 0}) => {
  const fake = (i) => pop(t, wordT('rhine', 10) + i * 0.07);
  const ger = ez(t, wordT('rhine', 15), wordT('rhine', 20));
  const real = ez(t, wordT('rhine', 21), wordT('rhine', 26));
  return (<svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0}}>
    <rect width={720} height={1280} fill="#7a4e2e" />{[...Array(10)].map((_, i) => <path key={i} d={`M0 ${i * 140 + 30} H720`} stroke="#5e3a22" strokeWidth={6} />)}
    <g transform={`translate(360,600) scale(${1 + push * 0.06}) rotate(-2)`}>
      <rect x={-320} y={-470} width={640} height={940} fill="#f2e3bf" stroke={INK} strokeWidth={6} />
      {[[-230, -380], [-130, -410], [170, -400], [250, -320], [-250, 330]].map(([mx, my], i) => <path key={i} d={`M${mx - 50} ${my + 30} L${mx} ${my - 30} L${mx + 50} ${my + 30}Z`} fill="#d9c08a" stroke={INK} strokeWidth={3} />)}
      {[[-200, -150, 60], [-60, 250, 80], [200, 120, 70], [210, -150, 50]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill="#b9d49a" opacity={0.7} />)}
      <path d="M60 -470 Q20 -260 80 -60 Q130 120 60 260 Q20 360 50 470" stroke="#3f86c8" strokeWidth={38} fill="none" />
      <text x={120} y={-260} fontFamily="Arial, sans-serif" fontWeight={900} fontSize={36} fill="#2f5d8a" transform="rotate(75 120 -260)">RHINE</text>
      <rect x={-300} y={-458} width={240} height={46} fill="#fff" stroke={INK} strokeWidth={3} /><text x={-180} y={-424} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={900} fontSize={28} fill={INK}>MARCH 1945</text>
      {[...Array(8)].map((_, i) => <g key={i} transform={`translate(${-210 + (i % 4) * 48},${-130 + Math.floor(i / 4) * 58}) scale(${fake(i)})`}><line y2={-44} stroke={INK} strokeWidth={3} /><g transform="translate(1,-44)"><US w={36} /></g></g>)}
      {fake(7) > 0.5 && <Tag x={-140} y={20} text="FAKE ARMY" c="#4f7a3a" s={fake(7)} />}
      <Arrow d="M290 -180 Q200 -170 150 -140" len={160} p={ger} c="#7a7f87" head="M138 -132 l30 -26 l8 34z" />
      {ger > 0.97 && <Tag x={220} y={-240} text="GERMANS" c="#5a5f66" s={1} />}
      <Arrow d="M-230 360 Q0 320 250 230" len={520} p={real} c="#2f6db3" w={18} head="M262 224 l-40 -18 l10 38z" />
      {real > 0.97 && <Tag x={150} y={320} text="REAL ARMY" c="#2f6db3" s={1} />}
    </g></svg>);
};
