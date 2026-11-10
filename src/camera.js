import * as THREE from 'three';
import timing from './timing.json';

// monotone cubic time warp: beat times per path key -> path position 0..1 (ease in/out)
export function warpU(T, t) {
  const n = T.length; if (t <= T[0]) return 0; if (t >= T[n - 1]) return 1;
  const sec = []; for (let i = 0; i < n - 1; i++) sec.push((1 / (n - 1)) / (T[i + 1] - T[i]));
  const m = [0]; for (let i = 1; i < n - 1; i++) m.push(2 * sec[i - 1] * sec[i] / (sec[i - 1] + sec[i])); m.push(0);
  let i = 0; while (t > T[i + 1]) i++;
  const h = T[i + 1] - T[i], x = (t - T[i]) / h, x2 = x * x, x3 = x2 * x;
  return (2 * x3 - 3 * x2 + 1) * (i / (n - 1)) + (x3 - 2 * x2 + x) * h * m[i] + (-2 * x3 + 3 * x2) * ((i + 1) / (n - 1)) + (x3 - x2) * h * m[i + 1];
}

const S = Object.fromEntries(timing.shots.map((s) => [s.key, s]));
const keys = timing.shots.map((s) => s.key);
// cut = midway between the end of one sentence and the start of the next
export const CUTS = keys.map((k, i) => (i === 0 ? 0 : (timing.shots[i - 1].end + timing.shots[i].start) / 2));
export const END = timing.duration;
// word time: proportional position of word index (0-based) inside a sentence
export const wordT = (key, idx) => S[key].start + (S[key].end - S[key].start) * idx / S[key].words;

// light presets
export const LIGHTS = {
  night: {light: 'campnight', anchor: [60, 0, 0], keys: [{p: [57.6, 1.1, 3.8], l: [59.6, 1.2, 0]}, {p: [61.8, 1.2, 3.6], l: [63.6, 1.4, -0.6]}, {p: [65.0, 1.25, 2.6], l: [66.9, 1.5, -0.6]}], beats: 'words:night:0,7,14'},
  day: {sun: '#fff0cf', si: 2.6, sky: '#a9d8ff', gnd: '#d9a878', hi: 1.15, fog: '#cfe7f7', near: 160, far: 650, sunOff: [-50, 90, 60], shadow: 80, top: '#3d8fe0', hor: '#cde9f8', pt: null},
  storm: {sun: '#cdd3de', si: 1.1, sky: '#8a95a6', gnd: '#4a4f58', hi: 1.0, fog: '#66738a', near: 45, far: 260, sunOff: [-40, 80, 40], shadow: 80, top: '#3c4454', hor: '#7d889a', pt: null},
  office: {sun: '#fff4e4', si: 1.6, sky: '#f4fbff', gnd: '#b48a62', hi: 1.05, fog: '#efe2cb', near: 30, far: 90, sunOff: [-6, 9, 7], shadow: 10, top: '#7fb7e6', hor: '#d6ecf6', pt: {c: '#ffc77a', i: 7, p: [-2.5, 3.6, 0.5], d: 14}},
  yard: {sun: '#ffe7bd', si: 2.5, sky: '#b5dcff', gnd: '#d1ad7c', hi: 1.15, fog: '#e2e3d4', near: 70, far: 260, sunOff: [-14, 22, 14], shadow: 20, top: '#3d8fe0', hor: '#d9ecf5', pt: null},
  joint: {sun: '#ffe0b0', si: 2.3, sky: '#c4c8dc', gnd: '#5a5662', hi: 1.3, fog: '#4a4a58', near: 30, far: 80, sunOff: [-7, 12, 9], shadow: 12, top: '#222', hor: '#333', pt: {c: '#ffb066', i: 16, p: [-3.2, 4.6, -1.5], d: 12}},
  weather: {sun: '#eef2ff', si: 1.4, sky: '#eef3f6', gnd: '#8f7b66', hi: 1.1, fog: '#e3e7e1', near: 30, far: 90, sunOff: [-6, 9, 7], shadow: 10, top: '#56606e', hor: '#9aa4b0', pt: {c: '#ffd58a', i: 5, p: [0, 3.8, 0], d: 14}},
  campnight: {sun: '#b9c6ff', si: 1.6, sky: '#7a84d0', gnd: '#3a3048', hi: 1.6, fog: '#2a3060', near: 60, far: 300, sunOff: [-30, 60, 40], shadow: 40, top: '#0e1638', hor: '#4a4c96', pt: {c: '#ffb45e', i: 16, p: [1, 3.8, 2.5], d: 16}},
  golden: {sun: '#ffc285', si: 2.3, sky: '#c4b8f0', gnd: '#9a7a5a', hi: 1.45, fog: '#d9a9a0', near: 90, far: 420, sunOff: [-45, 40, 75], shadow: 80, top: '#3f4796', hor: '#f7a582', pt: null},
  lamp: {sun: '#ffe2b8', si: 1.1, sky: '#cfd6f0', gnd: '#8a6a4a', hi: 1.35, fog: '#4a3a40', near: 30, far: 90, sunOff: [-6, 9, 7], shadow: 10, top: '#2a2f5a', hor: '#4a4c86', pt: {c: '#ffcf8a', i: 9, p: [0.5, 3.6, 1.0], d: 14}},
  morning: {sun: '#ffbf7a', si: 2.5, sky: '#ffe0bd', gnd: '#c08a5a', hi: 1.0, fog: '#f6d9b8', near: 160, far: 650, sunOff: [-60, 40, 50], shadow: 80, top: '#6fa6dd', hor: '#ffd3a1', pt: null},
};

const v = (a) => new THREE.Vector3(...a);
// camera plan: per shot, location light, anchor (for the light), path keys {p, l}, optional beat times
export const PLAN = {
  lift: {light: 'golden', anchor: [0, 0, 0], keys: [{p: [-3.2, 0.7, 5.6], l: [-2.6, 1.6, 1.6]}, {p: [-0.4, 0.75, 5.9], l: [0, 1.6, 1.6]}, {p: [2.4, 0.8, 5.6], l: [3.0, 1.5, 1.6]}]},
  cyclists: {light: 'golden', anchor: [0, 0, 0], keys: [{p: [5.8, 1.4, 11.4], l: [6.4, 1.45, 8.0]}, {p: [6.6, 1.35, 11.2], l: [6.8, 1.4, 8.1]}, {p: [7.4, 1.3, 11.0], l: [7.1, 1.4, 8.1]}]},
  rubber: {light: 'golden', anchor: [0, 0, 0], keys: [{p: [13.2, 1.0, 2.8], l: [10.6, 1.7, -1.4]}, {p: [12.6, 1.2, 2.3], l: [10.6, 1.9, -1.2]}, {p: [12.2, 1.1, 1.8], l: [10.6, 1.6, -1.0]}], beats: 'words:rubber:0,6,13'},
  unit: {light: 'golden', anchor: [300, 0, 0], keys: [{p: [300.8, 1.0, 4.0], l: [299.7, 1.75, 1.4]}, {p: [302.2, 1.1, 4.4], l: [303.6, 2.4, 1.0]}, {p: [297.6, 1.1, 4.6], l: [296.0, 2.4, 1.0]}], beats: 'words:unit:0,6,11'},
  artists: {light: 'lamp', anchor: [600, 0, 0], keys: [{p: [596.6, 1.45, 1.9], l: [596.7, 1.55, -1.0]}, {p: [599.7, 1.5, 1.7], l: [600.2, 1.55, -1.0]}, {p: [603.2, 1.45, 1.8], l: [604.0, 1.6, -1.0]}], beats: 'words:artists:0,3,6'},
  job: {light: 'lamp', anchor: [700, 0, 0], keys: [{p: [699.8, 1.5, 3.4], l: [699.4, 2.2, -5]}, {p: [700.4, 1.9, 2.4], l: [700.1, 2.8, -5]}, {p: [700.3, 2.4, 1.3], l: [700.0, 2.9, -5]}]},
  night: {light: 'campnight', anchor: [60, 0, 0], keys: [{p: [57.4, 1.7, 4.6], l: [59.6, 1.1, 0]}, {p: [61.6, 1.8, 4.4], l: [63.6, 1.3, -0.6]}, {p: [64.6, 1.7, 3.4], l: [66.9, 1.45, -0.6]}], beats: 'words:night:0,7,14'},
  speakers: {light: 'campnight', anchor: [108, 0, 7], keys: [{p: [106.2, 2.2, 13.2], l: [108.4, 2.4, 9.4]}, {p: [104.0, 3.4, 14.5], l: [100, 3.0, 5]}, {p: [102.0, 5.5, 16.0], l: [84, 4.0, -6]}]},
  radio: {light: 'lamp', anchor: [800, 0, 0], keys: [{p: [798.0, 1.35, 1.4], l: [799.0, 1.6, -2.5]}, {p: [800.0, 1.5, 1.0], l: [800.1, 1.8, -3]}, {p: [801.6, 1.7, 1.2], l: [802.0, 2.4, -3]}]},
  close: {light: 'golden', anchor: [0, 0, 0], keys: [{p: [13.8, 1.3, 3.0], l: [11.4, 1.35, -0.9]}, {p: [12.8, 1.25, 1.8], l: [11.2, 1.3, -0.9]}, {p: [12.0, 1.2, 1.1], l: [11.1, 1.3, -0.9]}]},
  shapes: {light: 'golden', anchor: [0, 0, 0], keys: [{p: [9, 40, 24], l: [11, 0, -6]}, {p: [17, 12, -8], l: [22, 2, -30]}, {p: [21.8, 1.5, -25.6], l: [21.3, 1.6, -30]}], beats: 'words:shapes:0,10,26'},
  rhine: {light: 'lamp', anchor: [700, 0, 0], keys: [{p: [699.4, 1.6, 3.0], l: [698.8, 2.6, -5]}, {p: [700.2, 2.0, 2.0], l: [699.6, 2.9, -5]}, {p: [701.4, 2.2, 1.4], l: [700.9, 2.8, -5]}], beats: 'words:rhine:0,14,28'},
  secret: {light: 'lamp', anchor: [900, 0, 0], keys: [{p: [898.6, 1.5, 2.2], l: [900.2, 1.5, -2.2]}, {p: [900.2, 1.7, 1.4], l: [901.6, 1.8, -4.5]}, {p: [901.8, 2.1, 1.2], l: [903.4, 3.0, -5]}], beats: 'words:secret:0,5,16'},
};

// precompute curves + beat times
const CURVES = {};
keys.forEach((k, i) => {
  const P = PLAN[k];
  const a = CUTS[i], b = i + 1 < keys.length ? CUTS[i + 1] : END;
  let T;
  if (P.beats && P.beats.startsWith('words:')) {
    const [, key, idx] = P.beats.split(':');
    T = idx.split(',').map(Number).map((n) => wordT(key, n));
    T[0] = a; T[T.length - 1] = b;
  } else T = P.keys.map((_, j) => a + (b - a) * j / (P.keys.length - 1));
  CURVES[k] = {
    p: new THREE.CatmullRomCurve3(P.keys.map((q) => v(q.p)), false, 'centripetal'),
    l: new THREE.CatmullRomCurve3(P.keys.map((q) => v(q.l)), false, 'centripetal'),
    T, a, b,
  };
});

export function shotAt(t) {
  let i = 0; while (i + 1 < CUTS.length && t >= CUTS[i + 1]) i++;
  return keys[i];
}
export function cameraAt(t) {
  const k = shotAt(t); const C = CURVES[k];
  const u = warpU(C.T, t);
  return {key: k, pos: C.p.getPointAt(u), look: C.l.getPointAt(u), plan: PLAN[k], a: C.a, b: C.b};
}
// dip-to-cream opacity around location changes (0.4 s total)
const CONT = new Set([]); // these shots continue the previous camera move
export function dipAt(t) {
  let o = 0;
  keys.forEach((k, i) => {
    if (i === 0 || CONT.has(k)) return;
    const c = CUTS[i]; const d = Math.abs(t - c);
    if (d < 0.2) o = Math.max(o, 1 - d / 0.2);
  });
  return o;
}
