import React from 'react';
import {AbsoluteFill} from 'remotion';
const INK = '#2b1d16', SW = 5;
const US = ({x, y, w = 34}) => { const h = w * 0.53, s = h / 13; return (<g transform={`translate(${x},${y})`}>
  {[...Array(13)].map((_, i) => <rect key={i} x={0} y={i * s} width={w} height={s + 0.3} fill={i % 2 ? '#fff' : '#c8202f'} />)}
  <rect width={w * 0.4} height={s * 7} fill="#2b3a85" />{[...Array(12)].map((_, i) => <circle key={i} cx={w * 0.05 + (i % 4) * w * 0.1} cy={s + Math.floor(i / 4) * s * 2.2} r={w * 0.018} fill="#fff" />)}
  <rect width={w} height={h} fill="none" stroke={INK} strokeWidth={2} /></g>); };
const FR = ({x, y, w = 34}) => (<g transform={`translate(${x},${y})`}>{['#1f3f9a', '#fff', '#d8232f'].map((c, i) => <rect key={i} x={i * w / 3} width={w / 3 + 0.3} height={w * 0.6} fill={c} />)}<rect width={w} height={w * 0.6} fill="none" stroke={INK} strokeWidth={2} /></g>);
const Flag = ({x, y, h = 160, c = 'us', w = 90}) => (<g transform={`translate(${x},${y})`}><line x1={0} y1={0} x2={0} y2={-h} stroke={INK} strokeWidth={6} /><line x1={0} y1={0} x2={0} y2={-h} stroke="#e8e0d0" strokeWidth={3} /><circle cy={-h} r={6} fill="#e0b04a" stroke={INK} strokeWidth={2.5} />
  <g transform={`translate(2,${-h + 4}) skewY(4)`}>{c === 'us' ? <US x={0} y={0} w={w} /> : <FR x={0} y={0} w={w} />}</g></g>);

// ---------- 2D character (round head, pear body, stick limbs) ----------
const FACES = {
  calm: <><ellipse cx={-17} cy={4} rx={7} ry={9} fill="#fff" stroke={INK} strokeWidth={3} /><ellipse cx={17} cy={4} rx={7} ry={9} fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={-15} cy={6} r={4} fill={INK} /><circle cx={15} cy={6} r={4} fill={INK} /><path d="M-24 -1 Q-17 -5 -10 -1 M10 -1 Q17 -5 24 -1" stroke={INK} strokeWidth={3} fill="none" /><path d="M-9 26 Q0 31 9 26" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" /></>,
  smug: <><path d="M-26 2 L-8 2 M8 2 L26 2" stroke={INK} strokeWidth={4} strokeLinecap="round" /><circle cx={-14} cy={6} r={3.5} fill={INK} /><circle cx={20} cy={6} r={3.5} fill={INK} /><path d="M-26 -10 L-8 -6 M8 -6 L26 -12" stroke={INK} strokeWidth={4} strokeLinecap="round" /><path d="M-6 27 Q8 30 16 22" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" /></>,
  shock: <><circle cx={-17} cy={2} r={12} fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={17} cy={2} r={12} fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={-17} cy={3} r={3} fill={INK} /><circle cx={17} cy={3} r={3} fill={INK} /><path d="M-28 -18 L-8 -14 M8 -14 L28 -18" stroke={INK} strokeWidth={4} strokeLinecap="round" /><ellipse cx={0} cy={32} rx={8} ry={10} fill="#5a1a1e" stroke={INK} strokeWidth={3} /><path d="M38 -8 q5 8 0 12 q-5 -4 0 -12z" fill="#8fd3ff" stroke={INK} strokeWidth={2} /></>,
  angry: <><path d="M-34 -20 Q0 -36 34 -20 L34 10 L-34 10Z" fill="#e2413a" opacity={0.55} /><circle cx={-16} cy={4} r={4} fill={INK} /><circle cx={16} cy={4} r={4} fill={INK} /><path d="M-28 -10 L-6 -2 M6 -2 L28 -10" stroke={INK} strokeWidth={5} strokeLinecap="round" /><rect x={-14} y={20} width={28} height={12} rx={3} fill="#fff" stroke={INK} strokeWidth={3} /><path d="M-14 26 H14 M-5 20 V32 M5 20 V32" stroke={INK} strokeWidth={2} /></>,
  happy: <><path d="M-24 4 Q-17 -4 -10 4 M10 4 Q17 -4 24 4" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" /><path d="M-14 20 Q0 40 14 20Z" fill="#5a1a1e" stroke={INK} strokeWidth={3} strokeLinejoin="round" /><ellipse cx={-28} cy={16} rx={7} ry={4} fill="#f2a7a0" opacity={0.7} /><ellipse cx={28} cy={16} rx={7} ry={4} fill="#f2a7a0" opacity={0.7} /></>,
  worried: <><ellipse cx={-17} cy={5} rx={7} ry={9} fill="#fff" stroke={INK} strokeWidth={3} /><ellipse cx={17} cy={5} rx={7} ry={9} fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={-17} cy={8} r={3.5} fill={INK} /><circle cx={17} cy={8} r={3.5} fill={INK} /><path d="M-26 -8 L-8 -14 M8 -14 L26 -8" stroke={INK} strokeWidth={4} strokeLinecap="round" /><path d="M-10 28 q5 -5 10 0 q5 5 10 0" stroke={INK} strokeWidth={3.5} fill="none" /></>,
};
const HATS = {
  helmet: (c) => <><path d="M-54 -14 Q-50 -76 0 -78 Q50 -76 54 -14Z" fill={c} stroke={INK} strokeWidth={SW} strokeLinejoin="round" /><path d="M-66 -14 H66" stroke={INK} strokeWidth={10} strokeLinecap="round" /><path d="M-64 -14 H64" stroke={c} strokeWidth={4} strokeLinecap="round" /></>,
  beret: (c) => <><ellipse cx={-6} cy={-46} rx={56} ry={22} fill={c} stroke={INK} strokeWidth={SW} /><circle cx={-6} cy={-70} r={5} fill={c} stroke={INK} strokeWidth={3} /></>,
  cap: (c) => <><path d="M-50 -24 Q-46 -72 0 -72 Q46 -72 50 -24Z" fill={c} stroke={INK} strokeWidth={SW} /><rect x={-56} y={-30} width={112} height={12} rx={5} fill="#2a2a2a" stroke={INK} strokeWidth={4} /><circle cy={-48} r={9} fill="#e0b04a" stroke={INK} strokeWidth={3} /></>,
  stahl: (c) => <path d="M-50 -10 Q-52 -78 0 -80 Q52 -78 50 -10 L66 2 L40 -2 L-40 -2 L-66 2Z" fill={c} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />,
  bald: () => <path d="M-48 -30 Q-56 -4 -50 10 M48 -30 Q56 -4 50 10" stroke="#8a8078" strokeWidth={10} fill="none" strokeLinecap="round" />,
  hair: (c) => <path d="M-54 -10 Q-58 -66 0 -68 Q50 -68 56 -20 Q20 -40 -20 -26 Q-40 -20 -54 -10Z" fill={c} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />,
};
export const Guy = ({x, y, s = 1, coat = '#6b7a3f', coat2 = '#55622f', hat = 'helmet', hatC = '#56632f', face = 'calm', flag = null, tie = '#3f4a2a', moustache = false, arms = 'down', flip = 1, head = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s * flip},${s})`}>
    <ellipse cy={6} rx={46} ry={9} fill="#000" opacity={0.18} />
    <path d="M-16 -60 L-18 0 M16 -60 L18 0" stroke={INK} strokeWidth={8} strokeLinecap="round" />
    <ellipse cx={-22} cy={2} rx={14} ry={7} fill={INK} /><ellipse cx={22} cy={2} rx={14} ry={7} fill={INK} />
    <path d="M-44 -60 Q-50 -130 0 -140 Q50 -130 44 -60 Q0 -48 -44 -60Z" fill={coat} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M-44 -62 Q0 -50 44 -62 Q46 -78 40 -84 Q0 -72 -40 -84 Q-46 -78 -44 -62Z" fill={coat2} />
    <path d="M0 -138 L-8 -126 L0 -96 L8 -126Z" fill={tie} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <circle cx={-14} cy={-106} r={3} fill={INK} /><circle cx={-14} cy={-92} r={3} fill={INK} />
    {flag === 'us' && <US x={10} y={-120} w={26} />}{flag === 'fr' && <FR x={10} y={-120} w={24} />}
    {arms === 'up' ? <path d="M-42 -124 L-60 -190 M42 -124 L60 -190" stroke={INK} strokeWidth={8} strokeLinecap="round" /> : arms === 'wave' ? <path d="M-42 -120 L-58 -66 M42 -124 L74 -176" stroke={INK} strokeWidth={8} strokeLinecap="round" /> : <path d="M-42 -120 L-58 -66 M42 -120 L58 -66" stroke={INK} strokeWidth={8} strokeLinecap="round" />}
    {arms === 'up' ? <><circle cx={-60} cy={-192} r={9} fill={INK} /><circle cx={60} cy={-192} r={9} fill={INK} /></> : arms === 'wave' ? <><circle cx={-58} cy={-62} r={9} fill={INK} /><circle cx={74} cy={-178} r={9} fill={INK} /></> : <><circle cx={-58} cy={-62} r={9} fill={INK} /><circle cx={58} cy={-62} r={9} fill={INK} /></>}
    <g transform={`translate(0,-198) scale(${head})`}>
      <circle r={62} fill="#f6efe2" stroke={INK} strokeWidth={SW} />
      <path d="M-40 40 Q0 66 40 40 Q20 58 0 60 Q-20 58 -40 40Z" fill="#e6dccb" opacity={0.7} />
      <g transform="translate(0,4)">{FACES[face]}</g>
      {moustache && <path d="M-22 18 Q-10 10 0 16 Q10 10 22 18 Q12 24 0 20 Q-12 24 -22 18Z" fill="#4a3328" stroke={INK} strokeWidth={2.5} />}
      {HATS[hat] && HATS[hat](hatC)}
    </g>
  </g>);

// ---------- props & scenery ----------
const Tank = ({x, y, s = 1, c = '#6b7a3f', squash = 0}) => (<g transform={`translate(${x},${y}) scale(${s},${s * (1 - squash)})`}>
  <rect x={-150} y={-60} width={300} height={60} rx={30} fill="#3d3f33" stroke={INK} strokeWidth={SW} />
  {[-110, -55, 0, 55, 110].map((wx) => <circle key={wx} cx={wx} cy={-30} r={20} fill="#6d6f60" stroke={INK} strokeWidth={4} />)}
  <path d="M-160 -60 L-140 -110 L140 -110 L165 -60Z" fill={c} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
  <path d="M-80 -110 Q-76 -170 0 -172 Q76 -170 80 -110Z" fill={c} stroke={INK} strokeWidth={SW} />
  <rect x={70} y={-152} width={150} height={18} rx={8} fill={c} stroke={INK} strokeWidth={SW} />
  <path d="M-100 -96 l8 14 l-16 0z M-100 -78 l8 -14 l-16 0z" fill="#fff" />
  <circle cx={-100} cy={-87} r={16} fill="none" stroke="#fff" strokeWidth={4} /></g>);
const Tree = ({x, y, s = 1, c1 = '#4f9a3a', c2 = '#7cbf4a'}) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  <path d="M-10 0 L-8 -90 M10 0 L8 -90" stroke={INK} strokeWidth={4} /><rect x={-9} y={-95} width={18} height={95} fill="#7a4e2e" />
  <path d="M-70 -110 Q-90 -170 -40 -190 Q-30 -250 20 -240 Q70 -250 80 -190 Q110 -160 80 -110 Q40 -80 0 -100 Q-40 -80 -70 -110Z" fill={c1} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
  <path d="M-40 -170 Q-20 -210 20 -205 M30 -140 Q60 -150 60 -180" stroke={c2} strokeWidth={14} fill="none" strokeLinecap="round" /></g>);
const House = ({x, y, w = 200, h = 230, wall = '#f4e3c4', roof = '#c9573c', sh = '#3f7fb8', sign: label}) => (<g transform={`translate(${x},${y})`}>
  <rect x={-w / 2} y={-h} width={w} height={h} fill={wall} stroke={INK} strokeWidth={SW} />
  <path d={`M${-w / 2 - 18} ${-h} L0 ${-h - 90} L${w / 2 + 18} ${-h}Z`} fill={roof} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
  {[...Array(5)].map((_, i) => <path key={i} d={`M${-w / 2 + i * w / 4} ${-h} L${-w / 2 + 30 + i * w / 4 - 30} ${-h - 10}`} stroke="#9c3f2c" strokeWidth={3} />)}
  {[-w / 4, w / 4].map((wx) => <g key={wx}><rect x={wx - 22} y={-h + 40} width={44} height={56} fill="#2b3a55" stroke={INK} strokeWidth={4} /><rect x={wx - 46} y={-h + 38} width={20} height={60} fill={sh} stroke={INK} strokeWidth={3} /><rect x={wx + 26} y={-h + 38} width={20} height={60} fill={sh} stroke={INK} strokeWidth={3} /><rect x={wx - 28} y={-h + 96} width={56} height={10} fill="#8a5a3b" stroke={INK} strokeWidth={3} />{[0, 1, 2, 3].map((k) => <circle key={k} cx={wx - 20 + k * 13} cy={-h + 92} r={6} fill={['#e0533d', '#f2c12e', '#e86aa0', '#fff'][k]} stroke={INK} strokeWidth={1.5} />)}</g>)}
  <rect x={-w / 2 + 14} y={-110} width={w - 28} height={100} fill="#a6d4e8" stroke={INK} strokeWidth={4} />
  <path d={`M${-w / 2 + 6} -118 H${w / 2 - 6}`} stroke="#d8232f" strokeWidth={14} /><path d={`M${-w / 2 + 6} -118 H${w / 2 - 6}`} stroke="#fff" strokeWidth={14} strokeDasharray="20 20" />
  {label && <><rect x={-60} y={-160} width={120} height={30} fill="#f2e6cc" stroke={INK} strokeWidth={3} /><text x={0} y={-138} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={900} fontSize={20} fill={INK}>{label}</text></>}
</g>);
const Cloud = ({x, y, s = 1}) => (<path transform={`translate(${x},${y}) scale(${s})`} d="M-80 0 Q-100 -30 -60 -40 Q-50 -80 0 -70 Q40 -100 70 -60 Q110 -60 100 -20 Q120 10 80 10 L-60 10 Q-100 10 -80 0Z" fill="#fff" stroke="#c9d8e8" strokeWidth={4} />);
const Hills = ({y, c, amp = 60, seed = 1}) => { let d = `M0 1280 L0 ${y}`; for (let x = 0; x <= 720; x += 60) d += ` Q${x + 30} ${y - amp * (0.5 + 0.5 * Math.sin(x * 0.013 + seed))} ${x + 60} ${y - amp * 0.3 * Math.cos(x * 0.02 + seed)}`; return <path d={d + ' L720 1280Z'} fill={c} stroke={INK} strokeWidth={4} />; };
const Grass = ({y0, y1, n = 60, seed = 3}) => <g>{[...Array(n)].map((_, i) => { const x = (i * 97 + seed * 31) % 720, y = y0 + ((i * 53) % (y1 - y0)); return <path key={i} d={`M${x} ${y} l-5 -14 M${x} ${y} l0 -18 M${x} ${y} l6 -13`} stroke="#3f7f2f" strokeWidth={3} strokeLinecap="round" />; })}</g>;
const Caption = ({w}) => <text x={360} y={900} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={900} fontWeight={900} fontSize={56} fill="#fff" stroke={INK} strokeWidth={12} paintOrder="stroke">{w}</text>;
const Paper = ({children}) => <svg width={720} height={1280} viewBox="0 0 720 1280">{children}</svg>;

// ---------- scenes ----------
const Field = () => (<Paper>
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a9be8" /><stop offset="1" stopColor="#cdeeff" /></linearGradient></defs>
  <rect width={720} height={1280} fill="url(#sky)" /><circle cx={600} cy={130} r={46} fill="#fff4c8" opacity={0.9} />
  <Cloud x={160} y={150} s={1.1} /><Cloud x={520} y={260} s={0.8} />
  <Hills y={560} c="#8fc6a0" amp={70} seed={2} />
  <House x={150} y={600} w={170} h={190} wall="#f4d6b0" sign="BAKERY" /><House x={380} y={600} w={180} h={210} wall="#f1e3c4" sh="#4f9a6a" sign="CAFE" /><House x={600} y={600} w={170} h={180} wall="#f6c9b4" roof="#b8473a" />
  <Flag x={270} y={600} h={230} c="fr" w={70} />
  <Hills y={640} c="#7cbf4a" amp={30} seed={5} /><rect y={640} width={720} height={640} fill="#7cbf4a" />
  <Tree x={40} y={690} s={0.9} /><Tree x={690} y={700} s={1.0} c1="#3f8a3a" />
  <path d="M0 760 Q360 730 720 770 L720 830 Q360 790 0 820Z" fill="#d9c49a" stroke={INK} strokeWidth={4} />
  <Grass y0={840} y1={1270} n={70} />
  <Tank x={370} y={835} s={1.15} />
  <Guy x={160} y={1060} s={0.95} face="happy" arms="up" flag="us" />
  <Guy x={300} y={1080} s={0.95} face="smug" arms="up" flag="us" />
  <Guy x={450} y={1080} s={0.95} face="calm" arms="up" flag="us" hatC="#5d6a35" />
  <Guy x={580} y={1060} s={0.95} face="happy" arms="up" flag="us" moustache />
  <Flag x={660} y={1180} h={300} c="us" w={110} />
  <Caption w="RUBBER" />
</Paper>);
const Cyclist = () => (<Paper>
  <defs><linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a9be8" /><stop offset="1" stopColor="#cdeeff" /></linearGradient></defs>
  <rect width={720} height={1280} fill="url(#sky2)" /><Cloud x={500} y={170} s={1.2} />
  <Hills y={520} c="#8fc6a0" amp={50} /><rect y={520} width={720} height={760} fill="#7cbf4a" />
  <House x={600} y={560} w={220} h={240} wall="#f1e3c4" sign="PHOTO" />
  <Tree x={110} y={600} s={1.1} />
  <Guy x={360} y={1220} s={2.6} coat="#3d6fb8" coat2="#2c4f88" hat="beret" hatC="#24345e" tie="#d8232f" face="shock" moustache flag="fr" />
  <Caption w="WATCHED" />
</Paper>);
const Map = () => (<Paper>
  <rect width={720} height={1280} fill="#7a4e2e" />{[...Array(9)].map((_, i) => <path key={i} d={`M0 ${i * 150 + 40} H720`} stroke="#5e3a22" strokeWidth={6} />)}
  <g transform="translate(360,560) rotate(-3)"><rect x={-310} y={-380} width={620} height={760} fill="#f2e3bf" stroke={INK} strokeWidth={6} />
    {[[-220, -300], [-120, -330], [160, -320], [240, -250]].map(([mx, my], i) => <path key={i} d={`M${mx - 50} ${my + 30} L${mx} ${my - 30} L${mx + 50} ${my + 30}Z`} fill="#d9c08a" stroke={INK} strokeWidth={3} />)}
    <path d="M60 -380 Q20 -200 80 -40 Q130 100 60 220 Q20 300 50 380" stroke="#3f86c8" strokeWidth={34} fill="none" /><text x={110} y={-200} fontFamily="Arial, sans-serif" fontWeight={900} fontSize={34} fill="#2f5d8a" transform="rotate(75 110 -200)">RHINE</text>
    <rect x={-290} y={-370} width={230} height={44} fill="#fff" stroke={INK} strokeWidth={3} /><text x={-175} y={-338} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={900} fontSize={26} fill={INK}>MARCH 1945</text>
    {[...Array(8)].map((_, i) => <g key={i} transform={`translate(${-200 + (i % 4) * 46},${-120 + Math.floor(i / 4) * 54})`}><line y2={-40} stroke={INK} strokeWidth={3} /><g transform="translate(1,-40)"><US x={0} y={0} w={34} /></g></g>)}
    <rect x={-250} y={-10} width={170} height={40} fill="#fff" stroke="#4f7a3a" strokeWidth={4} /><text x={-165} y={20} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={900} fontSize={24} fill="#4f7a3a">FAKE ARMY</text>
    <path d="M260 -150 Q170 -140 120 -110" stroke="#7a7f87" strokeWidth={14} fill="none" strokeLinecap="round" /><path d="M110 -104 l26 -26 l6 30z" fill="#7a7f87" />
    <path d="M-220 300 Q0 260 240 200" stroke="#2f6db3" strokeWidth={16} fill="none" strokeLinecap="round" strokeDasharray="0" /><path d="M252 196 l-36 -18 l8 34z" fill="#2f6db3" />
    <rect x={60} y={250} width={190} height={40} fill="#fff" stroke="#2f6db3" strokeWidth={4} /><text x={155} y={280} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={900} fontSize={24} fill="#2f6db3">REAL ARMY</text>
  </g>
  <Caption w="RHINE" />
</Paper>);
const Night = () => (<Paper>
  <defs><linearGradient id="ns" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1a4a" /><stop offset="1" stopColor="#3d64b8" /></linearGradient></defs>
  <rect width={720} height={1280} fill="url(#ns)" />{[...Array(40)].map((_, i) => <circle key={i} cx={(i * 137) % 720} cy={(i * 71) % 500} r={2 + (i % 3)} fill="#fff" opacity={0.8} />)}
  <circle cx={560} cy={170} r={50} fill="#fff6d0" />
  <Hills y={640} c="#2c4a5a" amp={60} /><rect y={640} width={720} height={640} fill="#3c6a3a" />
  {[0, 1, 2].map((i) => <path key={i} d={`M${330 - i * 90} ${720 - i * 60} A${120 + i * 110} ${120 + i * 110} 0 0 0 ${330 - i * 90} ${1000 + i * 60}`} stroke="#f2e6a8" strokeWidth={10 - i * 2} fill="none" opacity={0.9 - i * 0.25} transform="scale(-1,1) translate(-720,0)" />)}
  <g transform="translate(250,1020)"><rect x={-180} y={-140} width={260} height={120} fill="#55622f" stroke={INK} strokeWidth={SW} /><rect x={80} y={-120} width={110} height={100} rx={10} fill="#6b7a3f" stroke={INK} strokeWidth={SW} /><rect x={100} y={-108} width={60} height={40} fill="#a6d4e8" stroke={INK} strokeWidth={3} />
    <circle cx={-110} cy={-10} r={34} fill="#2a2a2a" stroke={INK} strokeWidth={4} /><circle cx={120} cy={-10} r={34} fill="#2a2a2a" stroke={INK} strokeWidth={4} />
    <path d="M-60 -140 L-90 -250 L60 -250 L30 -140Z" fill="#3d3f33" stroke={INK} strokeWidth={SW} /><ellipse cx={-15} cy={-250} rx={75} ry={20} fill="#1b1b1b" stroke={INK} strokeWidth={SW} /></g>
  <Guy x={560} y={1150} s={1.3} face="shock" flag="us" />
  <rect x={0} y={0} width={720} height={1280} fill="#0b1a4a" opacity={0.15} />
  <Caption w="SPEAKERS" />
</Paper>);
const Cast = () => (<Paper>
  <rect width={720} height={1280} fill="#f3ead8" /><text x={360} y={80} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={900} fontSize={40} fill={INK}>2D CAST · GHOST ARMY</text>
  {[[130, 500, {face: 'calm', flag: 'us'}, 'US SOLDIER'], [360, 500, {face: 'angry', coat: '#7d6a4a', coat2: '#6a593d', hat: 'bald', moustache: true, flag: 'us'}, 'US OFFICER'], [590, 500, {face: 'shock', flag: 'us', hatC: '#5d6a35'}, 'US SOLDIER'],
    [130, 1020, {face: 'worried', coat: '#3d6fb8', coat2: '#2c4f88', hat: 'beret', hatC: '#24345e', tie: '#d8232f', moustache: true, flag: 'fr'}, 'FRENCH MAN'], [360, 1020, {face: 'smug', coat: '#e8dcc0', coat2: '#6b4a36', hat: 'cap', hatC: '#6b4a36', tie: '#1f3f9a', arms: 'wave'}, 'ARTIST'], [590, 1020, {face: 'worried', coat: '#7b8276', coat2: '#646a60', hat: 'stahl', hatC: '#646a60', tie: '#4c5148'}, 'GERMAN SOLDIER']]
    .map(([x, y, o, l], i) => <g key={i}><Guy x={x} y={y} s={1.12} {...o} /><text x={x} y={y + 56} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={900} fontSize={22} fill={INK}>{l}</text></g>)}
</Paper>);
const Scope = () => (<Paper>
  <defs><clipPath id="lens"><circle cx={360} cy={560} r={300} /></clipPath><linearGradient id="sk3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5aa8e8" /><stop offset="1" stopColor="#d6f0ff" /></linearGradient></defs>
  <rect width={720} height={1280} fill="#0d1018" />
  <g clipPath="url(#lens)"><rect width={720} height={1280} fill="url(#sk3)" /><Cloud x={250} y={330} s={0.9} />
    <Hills y={560} c="#8fc6a0" amp={40} /><rect y={560} width={720} height={500} fill="#86c45a" />
    {[[210, 690, 0.55], [430, 680, 0.5], [320, 760, 0.62], [540, 760, 0.55], [150, 800, 0.6]].map(([x, y, sc], i) => <Tank key={i} x={x} y={y} s={sc} />)}
    {[[260, 820], [470, 830], [380, 700]].map(([x, y], i) => <Guy key={i} x={x} y={y} s={0.35} face="calm" />)}
    <path d="M60 560 H660 M360 260 V860" stroke={INK} strokeWidth={3} opacity={0.7} />{[-200, -100, 100, 200].map((d) => <path key={d} d={`M${360 + d} 548 V572 M348 ${560 + d} H372`} stroke={INK} strokeWidth={3} opacity={0.7} />)}
    <circle cx={360} cy={560} r={300} fill="none" stroke="#000" strokeWidth={60} opacity={0.35} /></g>
  <circle cx={360} cy={560} r={300} fill="none" stroke="#2a2f3a" strokeWidth={14} />
  <text x={360} y={940} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={900} fontSize={30} fill="#d9b45a">SPY PLANE VIEW</text>
  <Caption w="SHAPES" />
</Paper>);
const SC = [Cast, Field, Cyclist, Map, Night, Scope];
export const TwoD = ({scene = 0}) => { const S = SC[scene]; return <AbsoluteFill><S /></AbsoluteFill>; };
