import * as THREE from 'three';
import {INK, rng} from './kit.js';

const inkMat = new THREE.MeshBasicMaterial({color: INK, side: THREE.DoubleSide});
const fillCache = new Map();
function fillMat(c) {
  if (!fillCache.has(c)) fillCache.set(c, new THREE.MeshBasicMaterial({color: c, side: THREE.DoubleSide}));
  return fillCache.get(c);
}

// polygon points -> flat fill + wobbly ink band behind it
function flat(pts, color, z, band = 0.022, seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const fill = new THREE.Mesh(new THREE.ShapeGeometry(shape), fillMat(color));
  fill.position.z = z;
  // ink band: offset along vertex normals with slight wobble
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i], a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    const w = band * (0.8 + r() * 0.45);
    out.push(new THREE.Vector2(p[0] + ty * w, p[1] - tx * w));
  }
  // make sure ink is outside: test orientation
  const area = pts.reduce((s, p, i) => s + p[0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * p[1], 0);
  let inkPts = out;
  if (area < 0) {
    inkPts = pts.map((p, i) => { const o = out[i]; return new THREE.Vector2(2 * p[0] - o.x, 2 * p[1] - o.y); });
  }
  const inkM = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(inkPts)), inkMat);
  inkM.position.z = z - 0.004;
  g.add(inkM, fill);
  return g;
}
function circlePts(cx, cy, rx, ry = rx, n = 28, a0 = 0, a1 = Math.PI * 2) {
  const p = []; for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * i / (n - (a1 - a0 >= 6.28 ? 0 : 1)); p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return p;
}
function stick(x0, y0, x1, y1, w0, w1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const s = new THREE.Shape([
    new THREE.Vector2(x0 + nx * w0, y0 + ny * w0), new THREE.Vector2(x1 + nx * w1, y1 + ny * w1),
    new THREE.Vector2(x1 - nx * w1, y1 - ny * w1), new THREE.Vector2(x0 - nx * w0, y0 - ny * w0)]);
  return new THREE.Mesh(new THREE.ShapeGeometry(s), inkMat);
}

export const PALETTES = {
  engineer: {jacket: '#3e5a7a', jacket2: '#334c68', tie: '#b3392f', hair: '#4a3328'},
  student: {jacket: '#c4793d', jacket2: '#a9652f', tie: '#2f5d62', hair: '#2b1d17'},
  welder: {jacket: '#5f7d4f', jacket2: '#4f6a41', tie: '#d9a441', hair: '#5a3a26'},
  clerk: {jacket: '#7a4f73', jacket2: '#67425f', tie: '#e0b04a', hair: '#3b2a22'},
  official: {jacket: '#5a5f66', jacket2: '#4b4f55', tie: '#2f6db3', hair: '#8b8178'},
  red: {jacket: '#c8463a', jacket2: '#a93a30', tie: '#f2d36b', hair: '#3b2a22'},
  teal: {jacket: '#2f8f8a', jacket2: '#277873', tie: '#f07a2b', hair: '#2b1d17'},
  mustard: {jacket: '#d9a441', jacket2: '#bf8f36', tie: '#3e5a7a', hair: '#5a3a26'},
  pink: {jacket: '#d77a9c', jacket2: '#bf6687', tie: '#2f5d62', hair: '#6b4430'},
  navy: {jacket: '#2e3f6b', jacket2: '#26355a', tie: '#e0533d', hair: '#1f1a18'},
  soldier: {jacket: '#6b7a3f', jacket2: '#5b6935', tie: '#4a5530', hair: '#4a3328'},
  soldier2: {jacket: '#74804a', jacket2: '#636e3e', tie: '#3f4a2a', hair: '#2b1d17'},
  officer: {jacket: '#7d6a4a', jacket2: '#6a593d', tie: '#5b6935', hair: '#5a3a26'},
};

export function character({palette = 'engineer', hat = 'none', glasses = false, seed = 1, scale = 1, face = 'calm', hair = 'fringe', beard = 'none', head: headScale = 1.14, skin = '#f4ecdc'} = {}) {
  const P = PALETTES[palette];
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  // legs (thin tapered sticks) + feet
  body.add(stick(-0.09, 0.72, -0.1, 0.05, 0.03, 0.022), stick(0.09, 0.72, 0.1, 0.05, 0.03, 0.022));
  body.add(flat(circlePts(-0.13, 0.04, 0.09, 0.045), INK, 0.0, 0.004, seed + 1), flat(circlePts(0.13, 0.04, 0.09, 0.045), INK, 0.0, 0.004, seed + 2));
  // pear torso, two-tone
  const torso = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; const a = Math.PI * 2 * t; const y = 0.98 + Math.sin(a) * 0.29; const wid = 0.2 + 0.07 * (1 - (y - 0.69) / 0.58); torso.push([Math.cos(a) * wid, y]); }
  body.add(flat(torso, P.jacket, 0.01, 0.022, seed + 3));
  const lower = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + Math.PI * i / 12; lower.push([Math.cos(a) * 0.255, 0.86 + Math.sin(a) * 0.17]); }
  body.add(flat(lower, P.jacket2, 0.015, 0.0, seed + 4));
  body.add(flat([[0.07, 0.98], [0.17, 0.98], [0.16, 0.9], [0.08, 0.9]], P.jacket2, 0.02, 0.008, seed + 5));
  body.add(flat([[-0.11, 1.25], [0, 1.15], [0.11, 1.25], [0.0, 1.28]], '#fbf7ee', 0.025, 0.01, seed + 6));
  body.add(flat([[-0.025, 1.17], [0.025, 1.17], [0.04, 0.98], [0, 0.93], [-0.04, 0.98]], P.tie, 0.03, 0.008, seed + 7));
  // buttons
  for (const y of [1.08, 0.98]) body.add(flat(circlePts(-0.09, y, 0.018), INK, 0.022, 0.0, seed + 30));
  // arms
  const armL = new THREE.Group(), armR = new THREE.Group();
  armL.position.set(-0.2, 1.17, 0.012); armR.position.set(0.2, 1.17, 0.012);
  armL.add(stick(0, 0, -0.08, -0.42, 0.026, 0.02)); armR.add(stick(0, 0, 0.08, -0.42, 0.026, 0.02));
  armL.add(flat(circlePts(-0.085, -0.45, 0.05), INK, 0.002, 0.0, seed + 8)); armR.add(flat(circlePts(0.085, -0.45, 0.05), INK, 0.002, 0.0, seed + 9));
  body.add(armL, armR);
  // head (bigger, like a bean)
  const head = new THREE.Group(); head.position.set(0, 1.56, 0.04); head.scale.setScalar(headScale); body.add(head);
  head.add(flat(circlePts(0, 0, 0.33, 0.31, 36), skin, 0, 0.026, seed + 10));
  // cheek blush
  for (const ex of [-0.2, 0.2]) { const c = new THREE.Mesh(new THREE.CircleGeometry(0.05, 14), new THREE.MeshBasicMaterial({color: '#f2a58e', transparent: true, opacity: 0.45, depthWrite: false})); c.position.set(ex, -0.09, 0.012); head.add(c); }
  if (hair === 'fringe') {
    const fringe = circlePts(0, 0, 0.335, 0.315, 18, 0.15, Math.PI - 0.15);
    fringe.push([-0.24, 0.17], [-0.1, 0.21], [0.04, 0.17], [0.18, 0.22], [0.3, 0.12]);
    head.add(flat(fringe.reverse(), P.hair, 0.01, 0.012, seed + 11));
  } else if (hair === 'side') {
    head.add(flat(circlePts(0, 0, 0.34, 0.32, 18, 0.32, Math.PI - 0.32).reverse().concat([[-0.29, 0.13], [0.05, 0.22], [0.3, 0.12]]), P.hair, 0.01, 0.012, seed + 11));
  } else if (hair === 'bald') {
    for (const sx of [-1, 1]) head.add(flat([[sx * 0.33, 0.05], [sx * 0.27, 0.1], [sx * 0.24, -0.06], [sx * 0.31, -0.1]], P.hair, 0.01, 0.008, seed + 31));
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.05, 12), new THREE.MeshBasicMaterial({color: '#ffffff', transparent: true, opacity: 0.6})); sh.scale.set(1.6, 0.6, 1); sh.position.set(-0.12, 0.22, 0.012); head.add(sh);
  }
  if (beard === 'full') {
    const bp = circlePts(0, -0.04, 0.33, 0.3, 20, Math.PI * 1.02, Math.PI * 1.98); bp.push([0.26, -0.05], [0.1, -0.08], [-0.1, -0.08], [-0.26, -0.05]);
    head.add(flat(bp, P.hair, 0.014, 0.012, seed + 32));
  }
  if (beard === 'full' || beard === 'moustache') {
    head.add(flat([[-0.13, -0.075], [-0.02, -0.055], [0, -0.07], [0.02, -0.055], [0.13, -0.075], [0.1, -0.11], [0, -0.09], [-0.1, -0.11]], P.hair, 0.032, 0.008, seed + 33));
  }
  // ---- faces: built once, switched by name ----
  const faces = {};
  const line = (g, pts, w = 0.009, z = 0.026) => { for (let i = 0; i < pts.length - 1; i++) { const s2 = stick(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w, w); s2.position.z = z; g.add(s2); } };
  // our own eye: tall white oval, ink rim, pupil looking slightly in, white glint
  const dots = (g, r = 0.035, y = 0.0, look = 0.012) => { for (const ex of [-0.11, 0.11]) {
    g.add(flat(circlePts(ex, y + 0.005, r * 1.75, r * 2.15, 20), '#ffffff', 0.02, 0.011, seed + 47));
    g.add(flat(circlePts(ex - Math.sign(ex) * look, y - 0.01, r * 0.95, r * 1.15, 14), INK, 0.024, 0.0, seed + 40));
    const gl = new THREE.Mesh(new THREE.CircleGeometry(r * 0.32, 10), fillMat('#ffffff')); gl.position.set(ex - Math.sign(ex) * look + r * 0.35, y + r * 0.35, 0.027); g.add(gl); } };
  const sweat = (g, pts) => { for (const [x, y, k] of pts) { const d = [[0, 0.05 * k], [0.028 * k, -0.005 * k], [0.022 * k, -0.03 * k], [0, -0.04 * k], [-0.022 * k, -0.03 * k], [-0.028 * k, -0.005 * k]].map(([a, b]) => [x + a, y + b]); g.add(flat(d, '#8fd3ff', 0.04, 0.008, seed + 48)); const h = new THREE.Mesh(new THREE.CircleGeometry(0.008 * k, 8), fillMat('#ffffff')); h.position.set(x - 0.008 * k, y - 0.01 * k, 0.045); g.add(h); } };
  const tint = (g, c, op = 0.55, y0 = -0.32) => { const m = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(circlePts(0, 0, 0.33, 0.31, 36).map(([x, y]) => new THREE.Vector2(x, Math.max(y, y0))))), new THREE.MeshBasicMaterial({color: c, transparent: true, opacity: op, depthWrite: false})); m.position.z = 0.013; g.add(m); };
  const steam = (g) => { for (const [x, s2] of [[-0.3, 1], [0.32, 0.85]]) for (let i = 0; i < 3; i++) g.add(flat(circlePts(x + (i - 1) * 0.05 * s2 * Math.sign(x), 0.3 + i * 0.07, 0.05 * s2 * (1 - i * 0.15), 0.045 * s2, 12), '#f4f1ea', 0.045, 0.01, seed + 49 + i)); };
  const mouthOpen = (g, w, h, y, tongue = true) => {
    g.add(flat(circlePts(0, y, w, h, 22), '#3a1418', 0.024, 0.01, seed + 41));
    if (tongue) g.add(flat(circlePts(0, y - h * 0.45, w * 0.55, h * 0.4, 14), '#e0655f', 0.027, 0.0, seed + 42));
    g.add(flat([[-w * 0.7, y + h * 0.75], [w * 0.7, y + h * 0.75], [w * 0.6, y + h * 0.45], [-w * 0.6, y + h * 0.45]], '#fbf7ee', 0.028, 0.0, seed + 43));
  };
  const brow = (g, x0, y0, x1, y1) => { const b2 = stick(x0, y0, x1, y1, 0.017, 0.017); b2.position.z = 0.03; g.add(b2); };
  // calm (original)
  faces.calm = new THREE.Group(); dots(faces.calm, 0.032, -0.01);
  for (const ex of [-0.11, 0.11]) { const lid = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(circlePts(ex, -0.005, 0.062, 0.074, 14, 0, Math.PI).map(([x, y]) => new THREE.Vector2(x, y)))), fillMat(skin)); lid.position.z = 0.028; lid.scale.y = 0.55; lid.position.y = 0.03; faces.calm.add(lid); const ln = stick(ex - 0.062, 0.03, ex + 0.062, 0.03, 0.01, 0.01); ln.position.z = 0.03; faces.calm.add(ln); }
  line(faces.calm, circlePts(0, -0.11, 0.06, 0.035, 10, Math.PI * 1.15, Math.PI * 1.85), 0.008);
  // smile: happy closed eyes + open grin
  faces.smile = new THREE.Group();
  for (const ex of [-0.11, 0.11]) line(faces.smile, circlePts(ex, -0.03, 0.055, 0.05, 9, 0.2, Math.PI - 0.2), 0.011);
  mouthOpen(faces.smile, 0.1, 0.06, -0.14); faces.smile.children.slice(-3).forEach((m, i) => { if (i === 0) m.scale.y = 1; });
  // shout: angry brows + big open mouth
  faces.shout = new THREE.Group(); dots(faces.shout, 0.035, 0.0);
  brow(faces.shout, -0.19, 0.11, -0.05, 0.05); brow(faces.shout, 0.19, 0.11, 0.05, 0.05);
  mouthOpen(faces.shout, 0.09, 0.085, -0.15);
  // angry: V brows + frown
  faces.angry = new THREE.Group(); dots(faces.angry, 0.032, -0.01);
  brow(faces.angry, -0.19, 0.1, -0.04, 0.04); brow(faces.angry, 0.19, 0.1, 0.04, 0.04);
  line(faces.angry, circlePts(0, -0.2, 0.07, 0.05, 10, Math.PI * 0.2, Math.PI * 0.8), 0.011);
  // surprised: big white eyes + raised brows + O mouth
  faces.surprised = new THREE.Group(); dots(faces.surprised, 0.042, 0.0, 0.0);
  brow(faces.surprised, -0.18, 0.15, -0.05, 0.17); brow(faces.surprised, 0.18, 0.15, 0.05, 0.17);
  mouthOpen(faces.surprised, 0.045, 0.06, -0.16, false);
  // worried: sad brows + wavy mouth
  faces.worried = new THREE.Group(); dots(faces.worried, 0.032, -0.01);
  brow(faces.worried, -0.18, 0.06, -0.05, 0.11); brow(faces.worried, 0.18, 0.06, 0.05, 0.11);
  line(faces.worried, [[-0.07, -0.14], [-0.035, -0.12], [0, -0.14], [0.035, -0.12], [0.07, -0.14]], 0.009);
  // smug: one raised brow + side smirk
  faces.smug = new THREE.Group();
  for (const ex of [-0.11, 0.11]) { faces.smug.add(flat(circlePts(ex, -0.01, 0.05, 0.045, 14, Math.PI, Math.PI * 2), INK, 0.02, 0.0, seed + 46)); const lid = stick(ex - 0.065, 0.01, ex + 0.065, 0.01, 0.009, 0.009); lid.position.z = 0.025; faces.smug.add(lid); }
  brow(faces.smug, -0.18, 0.1, -0.05, 0.1); brow(faces.smug, 0.05, 0.12, 0.18, 0.17);
  line(faces.smug, [[-0.05, -0.12], [0.03, -0.12], [0.09, -0.08]], 0.01);
  // scared: huge eyes, tiny pupils, cold forehead, sweat, wobbly mouth
  faces.scared = new THREE.Group(); tint(faces.scared, '#6f9be0', 0.5, -0.04);
  for (const ex of [-0.11, 0.11]) { faces.scared.add(flat(circlePts(ex, 0.01, 0.085, 0.1, 20), '#ffffff', 0.02, 0.012, seed + 50)); faces.scared.add(flat(circlePts(ex, 0.0, 0.018, 0.02, 10), INK, 0.026, 0.0, seed + 51)); }
  brow(faces.scared, -0.19, 0.13, -0.05, 0.19); brow(faces.scared, 0.19, 0.13, 0.05, 0.19);
  faces.scared.add(flat([[-0.08, -0.15], [-0.04, -0.12], [0, -0.15], [0.04, -0.12], [0.08, -0.15], [0.08, -0.2], [-0.08, -0.2]], '#3a1418', 0.024, 0.008, seed + 52));
  faces.scared.add(flat([[-0.07, -0.155], [0.07, -0.155], [0.07, -0.17], [-0.07, -0.17]], '#fbf7ee', 0.028, 0.0, seed + 53));
  sweat(faces.scared, [[0.3, 0.12, 1.2], [-0.31, 0.02, 0.9], [0.27, -0.06, 0.7]]);
  // furious: red face, steam, V brows, gritted teeth
  faces.furious = new THREE.Group(); tint(faces.furious, '#e2413a', 0.62); dots(faces.furious, 0.028, -0.02, 0.0);
  brow(faces.furious, -0.2, 0.11, -0.04, 0.03); brow(faces.furious, 0.2, 0.11, 0.04, 0.03);
  faces.furious.add(flat([[-0.1, -0.12], [0.1, -0.12], [0.09, -0.2], [-0.09, -0.2]], '#fbf7ee', 0.026, 0.012, seed + 54));
  line(faces.furious, [[-0.095, -0.16], [0.095, -0.16]], 0.006, 0.03); for (const x of [-0.05, 0, 0.05]) line(faces.furious, [[x, -0.12], [x, -0.2]], 0.005, 0.03);
  steam(faces.furious);
  // wink: one eye closed arc, one open, side grin
  faces.wink = new THREE.Group(); dots(faces.wink, 0.034, 0.0); faces.wink.children.slice(0, 3).forEach((m) => { m.visible = false; });
  line(faces.wink, circlePts(-0.11, -0.03, 0.055, 0.045, 9, 0.25, Math.PI - 0.25), 0.012);
  brow(faces.wink, 0.05, 0.12, 0.19, 0.15);
  faces.wink.add(flat(circlePts(0.02, -0.13, 0.08, 0.045, 16, Math.PI, Math.PI * 2), '#3a1418', 0.024, 0.01, seed + 55));
  for (const k in faces) { faces[k].visible = k === face; head.add(faces[k]); }
  let curFace = face;
  root.userData.setFace = (f) => { if (f === curFace || !faces[f]) return; faces[curFace].visible = false; faces[f].visible = true; curFace = f; };
  if (glasses) {
    for (const ex of [-0.11, 0.11]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.075, 0.095, 24), inkMat); ring.position.set(ex, -0.0, 0.03); head.add(ring);
    }
    const br = stick(-0.035, 0.0, 0.035, 0.0, 0.01, 0.01); br.position.z = 0.03; head.add(br);
  }
  if (hat === 'cap') {
    head.add(flat(circlePts(0, 0.17, 0.3, 0.13, 20, 0, Math.PI), P.jacket2, 0.035, 0.02, seed + 13));
    head.add(flat([[-0.05, 0.18], [0.42, 0.16], [0.42, 0.12], [-0.05, 0.13]], P.jacket2, 0.036, 0.02, seed + 14));
  } else if (hat === 'bowler') {
    head.add(flat(circlePts(0, 0.2, 0.24, 0.2, 20, 0, Math.PI), '#2e2a2b', 0.035, 0.02, seed + 15));
    head.add(flat([[-0.38, 0.2], [0.38, 0.2], [0.38, 0.15], [-0.38, 0.15]], '#2e2a2b', 0.036, 0.02, seed + 16));
  } else if (hat === 'helmet') {
    head.add(flat(circlePts(0, 0.13, 0.36, 0.3, 22, 0, Math.PI), P.jacket2, 0.035, 0.02, seed + 19));
    head.add(flat([[-0.42, 0.15], [0.42, 0.15], [0.42, 0.09], [-0.42, 0.09]], P.jacket2, 0.036, 0.02, seed + 20));
  } else if (hat === 'beret') {
    head.add(flat(circlePts(0.05, 0.24, 0.32, 0.12, 22), '#2e3f6b', 0.035, 0.02, seed + 21));
  } else if (hat === 'top') {
    head.add(flat([[-0.2, 0.2], [0.2, 0.2], [0.18, 0.62], [-0.18, 0.62]], '#2e2a2b', 0.035, 0.02, seed + 17));
    head.add(flat([[-0.36, 0.22], [0.36, 0.22], [0.36, 0.16], [-0.36, 0.16]], '#2e2a2b', 0.036, 0.02, seed + 18));
  }
  // soft contact shadow blob
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({color: '#000', transparent: true, opacity: 0.22, depthWrite: false}));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.01; blob.scale.y = 0.55;
  root.add(blob);
  root.scale.setScalar(scale);
  const phase = rng(seed)() * 6;
  root.userData.update = (t, camPos, baseYaw = 0) => {
    body.position.y = Math.abs(Math.sin(t * 2.2 + phase)) * 0.015;
    head.rotation.z = Math.sin(t * 1.3 + phase) * 0.05;
    head.position.y = 1.56 + Math.sin(t * 1.9 + phase) * 0.008;
    armL.rotation.z = Math.sin(t * 1.6 + phase) * 0.08;
    armR.rotation.z = -Math.sin(t * 1.4 + phase + 1) * 0.08;
    // turn toward camera, clamped yaw
    const wp = new THREE.Vector3(); root.getWorldPosition(wp);
    let yaw = Math.atan2(camPos.x - wp.x, camPos.z - wp.z) - baseYaw;
    yaw = Math.max(-0.7, Math.min(0.7, yaw));
    body.rotation.y = yaw + baseYaw - root.rotation.y;
  };
  root.userData.armR = armR; root.userData.armL = armL;
  return root;
}
