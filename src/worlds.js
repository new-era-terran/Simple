import * as THREE from 'three';
import {INK, rng, toon, box, cyl, sign, signTex, facade, crate, ground, cloud, paintTex, ink, lampPost, woodTex, brickTex, cobbleTex, grassTex, wallTex} from './kit.js';
import {character} from './char.js';
import {wordT} from './camera.js';
import * as P from './props.js';

export const LOC = {field: 0, night: 60, speak: 110, camp: 300, art: 600, cmd: 700, radio: 800, archive: 900};

// smooth 0..1 between a and b (seconds)
export const ease = (t, a, b) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
const pop = (t, a) => Math.max(0.001, ease(t, a, a + 0.35) * (1 + 0.15 * Math.sin(Math.min(1, Math.max(0, (t - a) / 0.5)) * Math.PI)));

function room(ox, {w = 14, h = 5, d = 10, wall = '#3f6e78', floor = '#b08050', seed = 4} = {}) {
  const g = new THREE.Group();
  const wt = wallTex(wall, {seed, repeat: [w / 6, 1]});
  const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon('#ffffff', wt, {side: THREE.BackSide}));
  walls.position.set(ox, h / 2, 0); walls.receiveShadow = true; g.add(walls);
  const fl = new THREE.Mesh(new THREE.BoxGeometry(w - 0.02, 0.1, d - 0.02), toon('#ffffff', woodTex(floor, {seed: seed + 1, planks: 8, repeat: [w / 5, d / 5]}))); fl.position.set(ox, 0.0, 0); fl.receiveShadow = true; g.add(fl);
  // wood wainscot on back + side walls, with a trim rail
  const wt2 = woodTex('#7a4a2e', {seed: seed + 2, planks: 3, repeat: [w / 3, 1]});
  const pb = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, 1.3, 0.08), toon('#ffffff', wt2)); pb.position.set(ox, 0.65, -d / 2 + 0.06); ink(pb, 0.01, true); g.add(pb);
  for (const sx of [-1, 1]) { const ps = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, d - 0.1), toon('#ffffff', wt2)); ps.position.set(ox + sx * (w / 2 - 0.06), 0.65, 0); g.add(ps); }
  g.add(box(w - 0.1, 0.1, 0.16, '#4a2c1c', {x: ox, y: 1.32, z: -d / 2 + 0.1, thick: 0.01}));
  g.add(box(w - 0.1, 0.18, 0.12, '#4a2c1c', {x: ox, y: h - 0.1, z: -d / 2 + 0.08, thick: 0.01}));
  // ceiling beams
  for (let i = -1; i <= 1; i++) g.add(box(0.3, 0.3, d, '#4a2c1c', {x: ox + i * w / 3, y: h - 0.15, thick: 0.015}));
  return g;
}
const hang = (W, x, z, y = 5.1, c = '#2f5d62') => { W.add(cyl(0.02, 0.02, 0.8, '#2b2b2e', {x, y, z})); W.add(cyl(0.15, 0.45, 0.35, c, {x, y: y - 0.5, z, seg: 14})); const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshBasicMaterial({color: '#fff1c0'})); b.position.set(x, y - 0.65, z); W.add(b); };
const HAIRS = ['fringe', 'side', 'bald', 'fringe'], BEARDS = ['none', 'moustache', 'none', 'full', 'none'];
const person = (W, chars, x, z, pal = 'soldier', hat = 'helmet', seed = 1, y = 0.05, glasses = false, opt = {}) => { const sd = Math.abs(Math.round(seed)); const c = character({palette: pal, hat, seed, glasses, hair: HAIRS[sd % 4], beard: BEARDS[sd % 5], ...opt}); c.position.set(x, y, z); W.add(c); chars.push(c); return c; };
const SOL = ['soldier', 'soldier2', 'officer'];

export function buildWorld() {
  const W = new THREE.Group();
  const chars = [];
  const faceEv = []; // [char, default, [[shot, wordIdx, face], ...]]
  const fe = (c, def, ev = []) => { faceEv.push([c, def, ev]); c.userData.setFace(def); return c; };
  const r = rng(5);

  // ================= FRENCH FIELD (day) + night area + speaker road =================
  const gr = new THREE.Mesh(new THREE.BoxGeometry(420, 0.4, 170), toon('#ffffff', grassTex('#6fa64a', {repeat: [60, 24]}))); gr.position.set(60, -0.2, -20); gr.receiveShadow = true; W.add(gr);
  const road = new THREE.Mesh(new THREE.BoxGeometry(420, 0.06, 3.6), toon('#ffffff', cobbleTex('#c0a88a', {repeat: [320, 3]})));
  road.position.set(60, 0.03, 9.4); road.receiveShadow = true; W.add(road);
  // hedges + trees along the far side of the road, scattered hedges on the near side (gaps for cameras)
  for (let x = -60; x < 180; x += 3.2) { if (x > 84 && x < 130) continue; W.add(P.at(P.bush(1.1, 100 + x), x, 0, 12.4)); }
  for (let x = -60; x < 180; x += 9) { if (x > 80 && x < 130) continue; W.add(P.at(P.tree(1.3, 200 + x), x + 2, 0, 14.5)); }
  for (const x of [-30, -22, -14, 16, 26, 36, 46]) W.add(P.at(P.bush(1.0, 300 + x), x, 0, 6.6));
  // back rows of trees + farm buildings + village
  for (let i = 0; i < 22; i++) W.add(P.at(P.tree(1.4 + r() * 0.5, 400 + i), -60 + i * 11 + r() * 4, 0, -38 - r() * 10));
  const farm = facade({w: 9, h: 7, color: '#d9c39a', cols: 3, rows: 2, seed: 41}); farm.position.set(-24, 0, -26); W.add(farm);
  W.add(box(9, 7, 7, '#c9b38a', {x: -24, y: 3.5, z: -29.6, thick: 0.04}));
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry((() => { const s = new THREE.Shape(); s.moveTo(-5, 0); s.lineTo(5, 0); s.lineTo(0, 3); s.closePath(); return s; })(), {depth: 8, bevelEnabled: false}), toon('#b8573f')); roof.position.set(-24, 7, -33.3); ink(roof, 0.04, true); W.add(roof);
  const VZ = -30; // village row facing the field
  [['BAKERY', 14.5, '#d1a47a'], ['PHOTO', 22, '#c98f6b'], ['CAFE', 29.5, '#b8775e'], ['TAILOR', 37, '#c4a27c']].forEach(([n, x, c], i) => {
    const s = P.shopFront(n, c, i + 3); s.position.set(x, 0, VZ); W.add(s);
    const f = facade({w: 7.4, h: 9, color: c, cols: 2, rows: 2, door: false, seed: 50 + i}); f.position.set(x, 0, VZ - 0.5); W.add(f);
    W.add(box(7.4, 9, 6, '#8f6c5e', {x, y: 4.5, z: VZ - 3.6, thick: 0.04}));
  });
  for (const x of [11, 33]) W.add(lampPost(x, VZ + 2.2, 4.6));
  // the cardboard cutout soldier in the PHOTO shop window
  const cut = fe(person(W, chars, 21.1, VZ + 0.75, 'soldier', 'helmet', 77, 0.25), 'smile');
  W.add(box(0.9, 0.25, 0.4, '#b98a52', {x: 21.1, y: 0.12, z: VZ + 0.75, thick: 0.01}));
  const lifeSize = sign('LIFE SIZE!', 1.2, 0.45, {bg: '#f2c12e', w: 400, h: 150, font: 'bold 70px Arial'}); lifeSize.position.set(22.6, 1.0, VZ + 0.5); lifeSize.rotation.y = -0.2; W.add(lifeSize);
  for (const [x, pal, hat] of [[17, 'red', 'beret'], [26.5, 'teal', 'none'], [31.5, 'pink', 'none']]) person(W, chars, x, VZ + 2.6, pal, hat, 700 + x);
  for (let i = 0; i < 9; i++) W.add(cloud(-60 + i * 25, 115 + (i % 3) * 10, -170, 6));

  // field dressing: tents, trucks, jeeps, hay, fences, crates, soldiers
  for (let i = 0; i < 5; i++) W.add(P.at(P.tent(4, 5, 2.6), -14 + i * 6.5, 0, -18 - (i % 2) * 2));
  W.add(P.at(P.armyTruck(), -11, 0, -6, 0.5), P.at(P.armyTruck(), 30, 0, -4, -0.3), P.at(P.jeep(), -7, 0, 2.5, 0.2), P.at(P.jeep(), 21, 0, 2.0, -0.6));
  for (const [x, z] of [[-17, 1], [-15.6, 1.3], [33, -9], [34.4, -9.4], [-4, -14], [40, 1.5]]) W.add(P.at(P.haybale(), x, 0, z, r()));
  for (const [x, z] of [[6, -6], [7.3, -6.2], [6.6, -4.9], [26, -10], [27.2, -10.1]]) W.add(crate('SUPPLY', {x, y: 0.6, z, ry: r() * 0.4, color: '#9a8a5a'}));
  W.add(P.at(P.fence(14), -36, 0.05, -4, Math.PI / 2), P.at(P.fence(14), 48, 0.05, -4, Math.PI / 2));
  const tanks = [];
  const T2 = P.rubberTank({seed: 2}); T2.position.set(10, 0, -2); W.add(T2); tanks.push(T2);
  for (const [x, z, ry] of [[18, -8, 0.3], [2, -10, -0.2], [25, -15, 0.1], [-6, -8, 0.6], [38, -6, -0.4]]) { const t = P.rubberTank({seed: x}); t.position.set(x, 0, z); t.rotation.y = ry; W.add(t); }
  [[8, -4.4], [15, -5], [27, -6], [-3, -5], [4, -13], [33, -12], [-9, -12], [13.5, -11]].forEach(([x, z], i) => person(W, chars, x, z, SOL[i % 3], i % 3 === 2 ? 'cap' : 'helmet', 520 + i));
  W.add(P.at(P.haybale(0.6), -7.4, 0, 4.4, 0.3), crate('SUPPLY', {x: -6.4, y: 0.6, z: 3.2, ry: 0.4, color: '#9a8a5a'}));
  // carried tank + four carriers
  const T1 = P.rubberTank({seed: 1}); W.add(T1);
  const carriers = [[-1.25, 1.35, 'soldier'], [1.25, 1.4, 'soldier2'], [-2.75, 0.4, 'soldier2'], [2.9, -0.1, 'soldier']].map(([dx, dz, pal], i) => ({c: fe(person(W, chars, 0, 0, pal, 'helmet', 610 + i), i % 2 ? 'smug' : 'smile', i === 0 ? [['cyclists', 9, 'wink']] : []), dx, dz}));
  // cyclists on the road
  const cyc = [];
  for (const [x, pal, hat, bc] of [[6.0, 'red', 'beret', '#2f6db3'], [7.5, 'mustard', 'cap', '#c43d32']]) { const c = fe(person(W, chars, x, 8.3, pal, hat, 650 + x * 3, 0.05, false, {beard: x < 7 ? 'moustache' : 'none', hair: 'side'}), 'calm', [['cyclists', 3, 'scared']]); const b = P.bicycle(bc); b.position.set(x + 0.2, 0.05, 8.75); b.rotation.y = 0.15; W.add(b); cyc.push(c); }
  // "93 LB" tag and the poking soldier at tank T2
  const lb = sign('93 LB', 1.3, 0.62, {bg: '#f2c12e', w: 420, h: 200, font: 'bold 120px Arial'}); lb.position.set(10.7, 2.75, -0.7); W.add(lb);
  const poker = fe(person(W, chars, 8.6, -0.1, 'soldier2', 'helmet', 640), 'calm', [['rubber', 13, 'smug']]);
  const pumpSign = sign('AIR', 0.6, 0.3, {bg: '#f2f0e6', w: 200, h: 100, font: 'bold 70px Arial'}); pumpSign.position.set(13.6, 0.85, -1.6); W.add(pumpSign);
  W.add(P.at(P.compressor(), 13.6, 0.05, -2.2, -0.3));
  const worrier = fe(person(W, chars, 12.5, -0.75, 'soldier', 'helmet', 645), 'calm', [['close', 0, 'worried'], ['close', 7, 'scared']]);

  // ---------- night area: inflating + painting ----------
  const N = LOC.night;
  const T5 = P.rubberTank({seed: 5}); T5.position.set(N, 0, 0); W.add(T5);
  W.add(P.at(P.compressor(), N - 2.3, 0.05, 1.7, 0.3));
  const hose = cyl(0.04, 0.04, 1.6, '#2b2b2e', {x: N - 1.5, y: 0.25, z: 1.3, seg: 6, thick: 0.004}); hose.rotation.z = Math.PI / 2; hose.rotation.y = 0.5; W.add(hose);
  for (const [x, z] of [[N - 2.8, 2.6], [N + 2.4, 1.9], [N + 5.6, 1.4], [N - 6, -2]]) W.add(P.at(P.lantern(), x, 0.05, z));
  fe(person(W, chars, N - 3.2, 1.0, 'soldier', 'helmet', 801), 'smile'); person(W, chars, N + 2.2, 1.6, 'soldier2', 'cap', 802); person(W, chars, N - 0.8, -2.4, 'soldier', 'helmet', 803);
  const truckN = P.armyTruck(); truckN.position.set(N + 5.2, 0, -1.6); W.add(truckN);
  const mark = sign('6TH ARMD', 1.25, 0.5, {bg: '#5b6935', fg: '#f2f0e6', w: 400, h: 160, font: 'bold 90px Arial', border: false}); mark.position.set(N + 7.2, 1.55, -0.52); W.add(mark);
  const painter = fe(person(W, chars, N + 6.0, 0.15, 'soldier2', 'cap', 804), 'smug', [['night', 9, 'wink']]);
  const brush = box(0.04, 0.35, 0.04, '#b98a52', {y: -0.55, x: 0.1, thick: 0.004}); painter.userData.armR.add(brush);
  W.add(P.at(P.paintPots(3), N + 4.7, 0.05, 0.6));
  for (const [x, z, ry] of [[N - 8, -7, 0.4], [N + 12, -8, -0.3], [N - 2, -12, 0]]) { const t = P.rubberTank({seed: x}); t.position.set(x, 0, z); t.rotation.y = ry; W.add(t); }
  for (let i = 0; i < 4; i++) W.add(P.at(P.tent(4, 5, 2.6), N - 10 + i * 7, 0, -18));
  const moon = new THREE.Mesh(new THREE.CircleGeometry(5, 32), new THREE.MeshBasicMaterial({color: '#f6ecc8', fog: false})); moon.position.set(N + 40, 70, -140); W.add(moon);

  // ---------- speaker road (night) ----------
  const SP = LOC.speak;
  const spk = P.speakerTruck(); spk.position.set(SP, 0, 9.4); W.add(spk);
  spk.userData.speaker.rotation.y = -Math.PI / 2; spk.userData.speaker.position.set(-1.9, 2.05, 0);
  fe(person(W, chars, SP + 1.8, 7.0, 'soldier', 'helmet', 901), 'smile'); person(W, chars, SP - 3.6, 7.2, 'soldier2', 'cap', 902);
  W.add(P.at(P.lantern(), SP - 2.6, 0.05, 7.4), P.at(P.lantern(), SP + 3, 0.05, 7.1));
  W.add(P.hills(SP - 70, -60, 1.4, '#3f6a3a'));
  for (const [x, z, ry] of [[SP - 14, 2, 0.2], [SP - 22, -3, -0.3], [SP - 30, 1, 0.1], [SP - 18, -9, 0.5]]) { const t = P.rubberTank({seed: x}); t.position.set(x, 0, z); t.rotation.y = ry; W.add(t); }
  const rings = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 40), new THREE.MeshBasicMaterial({color: '#ffe6a8', transparent: true, depthWrite: false})); m.rotation.y = Math.PI / 2; W.add(m); rings.push(m); }

  // ================= ARMY CAMP (yard light) =================
  const C = LOC.camp;
  W.add(ground(80, 60, '#b39a72', {x: C, z: -5, seed: 14, repeat: 8}));
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) W.add(P.at(P.tent(4, 5, 2.6), C - 15 + i * 6, 0, -14 - j * 7));
  for (let row = 0; row < 4; row++) for (let i = 0; i < 7; i++) person(W, chars, C - 5.4 + i * 1.8 + (row % 2) * 0.6, -1.5 - row * 1.5, SOL[(i + row) % 2], 'helmet', 3000 + row * 10 + i);
  const officer = fe(person(W, chars, C - 0.4, 1.6, 'officer', 'cap', 3100, 0.05, false, {beard: 'moustache'}), 'shout');
  W.add(cyl(0.07, 0.07, 9, '#cfcfcf', {x: C + 9, y: 4.5, z: -7}));
  const fl = box(2.0, 1.2, 0.03, '#2e3f6b', {x: C + 10, y: 8.2, z: -7, thick: 0.01}); W.add(fl);
  for (let k = 0; k < 4; k++) W.add(box(2.0, 0.15, 0.035, '#c43d32', {x: C + 10, y: 7.75 + k * 0.3, z: -6.99, thick: 0.002, edges: false}));
  const b44 = sign('1944', 3.2, 1.1, {bg: '#f2e6cc', w: 600, h: 200, font: 'bold 130px Arial'}); b44.position.set(C - 1.2, 4.6, -9); W.add(b44);
  W.add(cyl(0.1, 0.1, 5, '#5a3a26', {x: C - 2.9, y: 2.5, z: -9}), cyl(0.1, 0.1, 5, '#5a3a26', {x: C + 0.5, y: 2.5, z: -9}));
  const s1100 = sign('1,100 MEN', 2.6, 1.0, {bg: '#e6d39a', w: 600, h: 230, font: 'bold 110px Arial'}); s1100.position.set(C - 4.1, 2.9, 1.0); W.add(s1100);
  W.add(cyl(0.06, 0.06, 2.4, '#5a3a26', {x: C - 4.1, y: 1.2, z: 0.95}));
  const secret = sign('TOP SECRET', 2.6, 0.9, {bg: '#f4ead4', fg: '#b3261e', w: 640, h: 220, font: 'bold 110px Arial'}); secret.position.set(C + 3.8, 2.8, 1.0); secret.rotation.z = 0.12; W.add(secret);
  W.add(cyl(0.06, 0.06, 2.3, '#5a3a26', {x: C + 3.8, y: 1.15, z: 0.95}));
  W.add(P.at(P.armyTruck(), C + 13, 0, -1, -0.4), P.at(P.jeep(), C - 12, 0, 0, 0.5), P.at(P.barrel('#5b6935'), C + 7, 0.05, 2), P.at(P.barrel('#5b6935'), C + 7.8, 0.05, 2.4));
  for (let i = 0; i < 5; i++) W.add(P.at(P.tree(1.4, 3200 + i), C - 24 + i * 12, 0, -28));
  for (let i = 0; i < 5; i++) W.add(cloud(C - 50 + i * 25, 110 + (i % 2) * 8, -160, 6));

  // ================= ART STUDIO (office light) =================
  const A = LOC.art;
  W.add(room(A, {w: 16, h: 5.5, d: 11, wall: '#4f9a96', seed: 8}));
  W.add(P.at(P.rug(8, 4, '#a8433a', '#e0b04a'), A, 0, -0.5));
  W.add(P.at(P.easel('', '#f4ead4', 1), A - 4.2, 0.05, -1.6, 0.25), P.at(P.easel('', '#f4ead4', 2), A - 6.2, 0.05, -2.8, 0.4));
  const painter2 = fe(person(W, chars, A - 3.3, -1.0, 'soldier', 'none', 6001, 0.05, false, {hair: 'side'}), 'smile');
  const pb = box(0.04, 0.35, 0.04, '#b98a52', {y: -0.55, x: 0.1, thick: 0.004}); painter2.userData.armR.add(pb);
  const tbl = P.desk(2.2, '#8a5a3b'); tbl.position.set(A - 5.0, 0.05, 0.9); W.add(tbl);
  W.add(P.at(P.paintPots(2), A - 5.3, 1.05, 0.9));
  const dt = P.desk(2.4, '#7a4f33'); dt.position.set(A + 0.3, 0.05, -2.1); W.add(dt);
  W.add(P.at(P.papers(7, 4), A + 0.1, 1.05, -2.0), P.at(P.deskLamp(), A + 1.2, 1.05, -2.4));
  const model = P.rubberTank(); model.scale.setScalar(0.12); model.position.set(A - 0.6, 1.05, -2.0); W.add(model);
  const designer = fe(person(W, chars, A + 0.2, -1.0, 'soldier2', 'none', 6002, 0.05, true, {hair: 'bald', beard: 'none'}), 'smug');
  W.add(P.at(P.costumeRack(), A + 4.6, 0.05, -3.2));
  const mirror = sign('', 0.9, 1.7, {bg: '#cfe8f2', border: true}); mirror.position.set(A + 6.8, 1.3, -2.2); mirror.rotation.y = -0.6; W.add(mirror);
  const actor = fe(person(W, chars, A + 4.0, -1.0, 'officer', 'top', 6003, 0.05, false, {beard: 'moustache'}), 'calm', [['artists', 8, 'shout']]);
  W.add(P.at(P.bookshelf(7), A - 6.6, 0.05, -5.15), P.at(P.bookshelf(9, 2.0, 2.4), A + 1.9, 0.05, -5.15));
  const pc = P.poster('CAMO', 1.1, 1.5, '#e6d39a'); P.at(pc, A - 2.4, 3.4, -5.45); W.add(pc);
  const pd = P.poster('DRAW', 1.1, 1.5, '#cfe3f0'); P.at(pd, A + 4.4, 3.5, -5.45); W.add(pd);
  for (let i = 0; i < 6; i++) W.add(box(0.5, 0.65, 0.02, ['#f7f0de', '#fff1b8', '#cfe3f0'][i % 3], {x: A - 0.8 + (i % 3) * 0.65, y: 3.1 + Math.floor(i / 3) * 0.75, z: -5.42, thick: 0.004, edges: false}));
  W.add(P.at(P.wallClock(), A + 6.6, 4.4, -5.4));
  W.add(crate('PAINT', {x: A + 6.5, y: 0.65, z: 0.4, ry: -0.3}), crate('PAINT', {x: A + 6.2, y: 1.85, z: 0.3, ry: -0.2}));
  const plant = new THREE.Group(); plant.add(cyl(0.35, 0.28, 0.7, '#b35a3a', {y: 0.35})); for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), toon('#4f8a4a')); l.position.set(Math.cos(i) * 0.3, 0.9 + (i % 3) * 0.25, Math.sin(i) * 0.3); ink(l, 0.02, false); plant.add(l); }
  plant.position.set(A - 7.0, 0.05, 2.8); W.add(plant);
  hang(W, A - 3, -1); hang(W, A + 3, -1);

  // ================= COMMAND ROOM: map (weather light) =================
  const M = LOC.cmd;
  W.add(room(M, {w: 16, h: 5.5, d: 11, wall: '#5f86b8', floor: '#b08050', seed: 27}));
  const mapC = document.createElement('canvas'); mapC.width = 800; mapC.height = 520; const mg = mapC.getContext('2d');
  const mapTex = new THREE.CanvasTexture(mapC); mapTex.colorSpace = THREE.SRGBColorSpace; mapTex.anisotropy = 8;
  const mapBoard = box(6.2, 4.0, 0.12, '#ffffff', {thick: 0.03});
  mapBoard.material = [toon('#4a3a2e'), toon('#4a3a2e'), toon('#4a3a2e'), toon('#4a3a2e'), new THREE.MeshBasicMaterial({map: mapTex}), toon('#4a3a2e')];
  mapBoard.position.set(M, 2.9, -5.35); W.add(mapBoard);
  const tankIcon = (x, y, s = 1, col = '#4f7a3a') => { mg.save(); mg.translate(x, y); mg.scale(s, s); mg.fillStyle = col; mg.strokeStyle = INK; mg.lineWidth = 3; mg.fillRect(-16, -6, 32, 14); mg.strokeRect(-16, -6, 32, 14); mg.beginPath(); mg.arc(-2, -8, 7, Math.PI, 0); mg.fill(); mg.stroke(); mg.fillRect(4, -11, 16, 3); mg.restore(); };
  const arrowC = (x0, y0, x1, y1, col, p) => { if (p <= 0.001) return; const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p; mg.strokeStyle = col; mg.lineWidth = 16; mg.lineCap = 'round'; mg.beginPath(); mg.moveTo(x0, y0); mg.lineTo(x, y); mg.stroke(); const a = Math.atan2(y1 - y0, x1 - x0); mg.fillStyle = col; mg.strokeStyle = INK; mg.lineWidth = 4; mg.beginPath(); mg.moveTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); mg.lineTo(x + Math.cos(a + 2.4) * 30, y + Math.sin(a + 2.4) * 30); mg.lineTo(x + Math.cos(a - 2.4) * 30, y + Math.sin(a - 2.4) * 30); mg.closePath(); mg.fill(); mg.stroke(); };
  const land = () => { mg.fillStyle = '#e8dcb8'; mg.fillRect(0, 0, 800, 520); const rr = rng(9); for (let i = 0; i < 14; i++) { mg.fillStyle = 'rgba(106,168,79,0.35)'; mg.beginPath(); mg.ellipse(rr() * 800, rr() * 520, 30 + rr() * 60, 20 + rr() * 30, rr() * 3, 0, 7); mg.fill(); } mg.strokeStyle = INK; mg.lineWidth = 10; mg.strokeRect(5, 5, 790, 510); };
  const label = (txt, x, y, size = 34, col = INK) => { mg.font = `bold ${size}px Arial, sans-serif`; mg.textAlign = 'center'; const w = mg.measureText(txt).width; mg.fillStyle = '#f7f0de'; mg.fillRect(x - w / 2 - 8, y - size + 4, w + 16, size + 10); mg.strokeStyle = INK; mg.lineWidth = 3; mg.strokeRect(x - w / 2 - 8, y - size + 4, w + 16, size + 10); mg.fillStyle = col; mg.fillText(txt, x, y); };
  const drawMap = (mode, t) => {
    land();
    if (mode === 'job') {
      const a = ease(t, wordT('job', 5), wordT('job', 5) + 0.4), g = ease(t, wordT('job', 10), wordT('job', 13));
      label(g > 0.6 ? 'DIVISION' : 'THE MISSION', 400, 62, 40, g > 0.6 ? '#2f6db3' : INK);
      if (g > 0.01) { mg.globalAlpha = g; mg.fillStyle = 'rgba(47,109,179,0.25)'; mg.strokeStyle = '#2f6db3'; mg.lineWidth = 6; mg.beginPath(); mg.ellipse(400, 290, 60 + 260 * g, 40 + 150 * g, 0, 0, 7); mg.fill(); mg.stroke(); const n = Math.floor(g * 26); for (let i = 0; i < n; i++) tankIcon(400 + Math.cos(i * 2.4) * (40 + (i % 5) * 45) * g, 290 + Math.sin(i * 2.4) * (30 + (i % 5) * 24) * g, 1.1); mg.globalAlpha = 1; }
      if (a > 0.01) { mg.save(); mg.translate(400, 290); mg.scale(a, a); mg.fillStyle = '#2f6db3'; mg.strokeStyle = INK; mg.lineWidth = 5; mg.beginPath(); mg.arc(0, 0, 54, 0, 7); mg.fill(); mg.stroke(); mg.fillStyle = '#fff'; mg.font = 'bold 30px Arial'; mg.textAlign = 'center'; mg.fillText('1,100', 0, 11); mg.restore(); }
    } else {
      // river Rhine down the middle
      mg.strokeStyle = '#4f86b8'; mg.lineWidth = 42; mg.lineCap = 'round'; mg.beginPath(); for (let y = -10; y <= 530; y += 10) { const x = 430 + Math.sin(y / 70) * 28; y < 0 ? mg.moveTo(x, y) : mg.lineTo(x, y); } mg.stroke();
      mg.save(); mg.translate(470, 120); mg.rotate(1.35); mg.fillStyle = '#2f5d8a'; mg.font = 'bold 30px Arial'; mg.textAlign = 'center'; mg.fillText('RHINE', 0, 0); mg.restore();
      label('MARCH 1945', 160, 60, 34);
      const f = ease(t, wordT('rhine', 10), wordT('rhine', 10) + 0.5);
      if (f > 0.01) { for (let i = 0; i < 8; i++) tankIcon(270 + (i % 4) * 34, 150 + Math.floor(i / 4) * 36, f); if (f > 0.5) label('FAKE ARMY', 320, 260, 30, '#4f7a3a'); }
      arrowC(720, 120, 520, 175, '#7a7f87', ease(t, wordT('rhine', 15), wordT('rhine', 20)));
      arrowC(250, 430, 610, 410, '#2f6db3', ease(t, wordT('rhine', 22), wordT('rhine', 27)));
      if (t > wordT('rhine', 24)) label('REAL ARMY', 630, 480, 30, '#2f6db3');
    }
    mapTex.needsUpdate = true;
  };
  drawMap('rhine', 0);
  const mt = P.desk(3.2, '#8a5a3b'); mt.position.set(M - 0.2, 0.05, -1.6); W.add(mt);
  W.add(P.at(P.papers(8, 11), M - 0.6, 1.05, -1.6), P.at(P.phone(), M + 0.9, 1.05, -1.4), P.at(P.mug('#2f6db3'), M - 1.5, 1.05, -1.3), P.at(P.deskLamp(), M + 1.2, 1.05, -1.9));
  const roll = cyl(0.06, 0.06, 0.9, '#cfe3f0', {seg: 10, thick: 0.006}); roll.rotation.z = Math.PI / 2; roll.position.set(M + 0.2, 1.12, -1.2); W.add(roll);
  fe(person(W, chars, M - 3.4, -2.6, 'officer', 'cap', 7001), 'smug');
  const boss = fe(person(W, chars, M - 0.45, 1.25, 'officer', 'none', 7010, 0.05, false, {hair: 'bald', beard: 'full'}), 'smug', [['rhine', 15, 'furious'], ['rhine', 22, 'smile']]); person(W, chars, M + 3.3, -2.4, 'soldier', 'none', 7002, 0.05, true); person(W, chars, M + 5.4, -0.6, 'soldier2', 'cap', 7003);
  W.add(P.at(P.filingCabinet(), M - 7.2, 0.05, -4.9), P.at(P.filingCabinet('#8f7d6a'), M - 6.4, 0.05, -4.9), P.at(P.bookshelf(12), M + 6.2, 0.05, -5.15));
  W.add(P.at(P.radio(), M - 6.4, 1.55, -4.9));
  W.add(P.at(P.wallClock(), M + 4.4, 4.5, -5.4));
  const pa = P.poster('SECRET', 1.0, 1.3, '#f2c12e'); P.at(pa, M - 4.4, 3.3, -5.45); W.add(pa);
  W.add(P.at(P.flag('#2e3f6b'), M + 4.2, 0.05, -4.6));
  const fd = P.desk(2.2, '#6b4430'); fd.position.set(M - 4.6, 0.05, 2.2); fd.rotation.y = 0.25; W.add(fd);
  W.add(P.at(P.papers(6, 31), M - 4.8, 1.0, 2.2), P.at(P.radio(), M - 4.0, 1.0, 2.0));
  hang(W, M - 3, -1); hang(W, M + 3, -1);

  // ================= RADIO TENT (weather light) =================
  const R = LOC.radio;
  W.add(room(R, {w: 16, h: 5.5, d: 11, wall: '#6f9a7e', floor: '#a8784a', seed: 33}));
  const rdesk = P.desk(5.2, '#8a5a3b'); rdesk.position.set(R, 0.05, -2.6); W.add(rdesk);
  for (const x of [-1.8, 0, 1.8]) { const rd = P.radio(); rd.scale.setScalar(1.8); rd.position.set(R + x, 1.05, -2.8); W.add(rd); }
  const ops = [[-1.8, 'soldier'], [0.1, 'soldier2'], [1.9, 'soldier']].map(([x, pal], i) => fe(person(W, chars, R + x, -1.6, pal, 'none', 8000 + i), ['smug', 'shout', 'surprised'][i], i === 1 ? [['radio', 4, 'furious']] : []));
  for (const o of ops) { const hs = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 6, 20, Math.PI), toon('#2b2b2e')); hs.position.set(0, 1.62, 0.06); o.children[0].add(hs); }
  W.add(cyl(0.04, 0.04, 2.6, '#7d8a8f', {x: R + 4.0, y: 2.35, z: -3.0}));
  const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({color: '#ff6a4a'})); antTip.position.set(R + 4.0, 3.7, -3.0); W.add(antTip);
  const aRings = []; for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 32), new THREE.MeshBasicMaterial({color: '#ff9a6a', transparent: true, depthWrite: false})); m.position.set(R + 4.0, 3.7, -3.0); W.add(m); aRings.push(m); }
  const board = sign('MESSAGES', 2.6, 1.6, {bg: '#c49a62', w: 520, h: 320, font: 'bold 56px Arial'}); board.position.set(R - 4.0, 3.1, -5.45); W.add(board);
  for (let i = 0; i < 6; i++) W.add(box(0.35, 0.45, 0.02, ['#f7f0de', '#fff1b8', '#cfe3f0'][i % 3], {x: R - 4.8 + (i % 3) * 0.75, y: 2.75 + Math.floor(i / 3) * 0.5, z: -5.38, thick: 0.004, edges: false}));
  W.add(P.at(P.wallClock(), R + 1.5, 4.4, -5.4), P.at(P.filingCabinet(), R + 6.6, 0.05, -4.9), P.at(P.bookshelf(14), R - 6.6, 0.05, -5.15));
  W.add(crate('SIGNAL', {x: R + 6.4, y: 0.65, z: 0.6, ry: -0.3}), crate('SIGNAL', {x: R - 6.4, y: 0.65, z: 0.4, ry: 0.3}));
  const flyers = []; for (let i = 0; i < 14; i++) { const p = box(0.32, 0.01, 0.42, '#f7f0de', {thick: 0.004, edges: false}); W.add(p); flyers.push(p); }
  hang(W, R - 2, -1); hang(W, R + 2, -1);

  // ================= ARCHIVE (office light) =================
  const V = LOC.archive;
  W.add(room(V, {w: 16, h: 5.5, d: 11, wall: '#6f8aa6', floor: '#b08050', seed: 41}));
  const shelf = (x, z, ry = 0) => { const s = new THREE.Group(); s.add(box(3.0, 3.2, 0.08, '#6b5a4a', {y: 1.6, z: -0.26}), box(0.08, 3.2, 0.6, '#6b5a4a', {x: -1.5, y: 1.6}), box(0.08, 3.2, 0.6, '#6b5a4a', {x: 1.5, y: 1.6})); for (let k = 0; k < 4; k++) { s.add(box(2.9, 0.05, 0.56, '#4a3a2e', {y: 0.3 + k * 0.8, z: 0.02, thick: 0.004, edges: false})); for (let j = 0; j < 4; j++) s.add(box(0.6, 0.5, 0.45, ['#b98a52', '#a07a4a', '#c9a06a'][(j + k) % 3], {x: -1.05 + j * 0.7, y: 0.58 + k * 0.8, z: 0.05, thick: 0.008})); } s.position.set(x, 0.05, z); s.rotation.y = ry; return s; };
  W.add(shelf(V - 5.5, -5.0), shelf(V - 2.2, -5.0), shelf(V + 6.0, -5.0), shelf(V - 7.6, -1.5, Math.PI / 2));
  // gap slot on the middle shelf where the box goes
  const slotShelf = new THREE.Group(); slotShelf.add(box(3.0, 3.2, 0.08, '#6b5a4a', {y: 1.6, z: -0.26}), box(0.08, 3.2, 0.6, '#6b5a4a', {x: -1.5, y: 1.6}), box(0.08, 3.2, 0.6, '#6b5a4a', {x: 1.5, y: 1.6})); for (let k = 0; k < 4; k++) { slotShelf.add(box(2.9, 0.05, 0.56, '#4a3a2e', {y: 0.3 + k * 0.8, z: 0.02, thick: 0.004, edges: false})); for (let j = 0; j < 4; j++) { if (k === 1 && j === 2) continue; slotShelf.add(box(0.6, 0.5, 0.45, ['#b98a52', '#a07a4a', '#c9a06a'][(j + k) % 3], {x: -1.05 + j * 0.7, y: 0.58 + k * 0.8, z: 0.05, thick: 0.008})); } }
  slotShelf.position.set(V + 1.6, 0.05, -5.0); W.add(slotShelf);
  const fileBox = crate('1945', {x: 0, y: 0, z: 0, color: '#c9a06a', s: 0.6, stamp: 'SECRET'}); W.add(fileBox);
  const adesk = P.desk(2.6, '#7a4f33'); adesk.position.set(V + 1.0, 0.05, -1.4); W.add(adesk);
  W.add(P.at(P.deskLamp(), V + 0.3, 1.05, -1.8), P.at(P.papers(6, 51), V + 1.4, 1.05, -1.2));
  const mini = P.rubberTank(); mini.scale.setScalar(0.1); mini.position.set(V - 0.4, 1.05, -1.2); mini.rotation.y = 0.5; W.add(mini);
  const yrC = document.createElement('canvas'); yrC.width = 420; yrC.height = 260; const yg = yrC.getContext('2d'); const yrTex = new THREE.CanvasTexture(yrC); yrTex.colorSpace = THREE.SRGBColorSpace;
  let lastYr = -1;
  const drawYear = (y, done) => { yg.fillStyle = '#f4ead4'; yg.fillRect(0, 0, 420, 260); yg.strokeStyle = INK; yg.lineWidth = 12; yg.strokeRect(6, 6, 408, 248); yg.fillStyle = INK; yg.font = 'bold 130px Arial'; yg.textAlign = 'center'; yg.fillText(String(y), 210, 150); yg.font = 'bold 38px Arial'; yg.fillStyle = done ? '#3f8a45' : '#b3261e'; yg.fillText(done ? 'DECLASSIFIED' : 'CLASSIFIED', 210, 215); yrTex.needsUpdate = true; };
  drawYear(1945, false);
  const yb = box(2.6, 1.6, 0.08, '#fff', {thick: 0.02}); yb.material = [toon('#ddd'), toon('#ddd'), toon('#ddd'), toon('#ddd'), new THREE.MeshBasicMaterial({map: yrTex}), toon('#ddd')]; yb.position.set(V + 4.2, 3.9, -5.3); W.add(yb);
  const clerk = fe(person(W, chars, V + 2.7, -2.4, 'officer', 'none', 9001, 0.05, true, {hair: 'bald', beard: 'moustache'}), 'calm', [['secret', 11, 'wink']]);
  W.add(P.at(P.filingCabinet(), V + 6.8, 0.05, -1.0, -Math.PI / 2), P.at(P.chair(), V + 1.0, 0.05, -0.3, Math.PI));
  hang(W, V - 2, -1, 5.1, '#5a3a26'); hang(W, V + 3, -1, 5.1, '#5a3a26');

  // ================= per-frame update =================
  const S = (k) => [wordT(k, 0), null];
  const update = (t, cam, shot) => {
    for (const c of chars) c.userData.update(t, cam.position);
    for (const [c, def, ev] of faceEv) { let f = def; for (const [k, i, fc] of ev) if (t >= wordT(k, i)) f = fc; c.userData.setFace(f); }
    // carried tank crosses the field during the hook
    const lx = -3.5 + 6.5 * ease(t, wordT('lift', 0) - 0.3, wordT('cyclists', 0));
    T1.position.set(lx, 1.15 + Math.sin(t * 5) * 0.05, 1.6); T1.rotation.z = Math.sin(t * 2.6) * 0.02;
    for (const q of carriers) { q.c.position.set(lx + q.dx, 0.05 + Math.abs(Math.sin(t * 5 + q.dx)) * 0.05, 1.6 + q.dz); q.c.userData.armL.rotation.z = -2.3; q.c.userData.armR.rotation.z = 2.3; }
    for (const c of cyc) c.userData.armR.rotation.z = shot === 'cyclists' ? 0.6 + Math.sin(t * 7) * 0.1 : 0;
    // 93 LB tag + poke wobble + sag on "over"
    lb.scale.setScalar(shot === 'rubber' ? pop(t, wordT('rubber', 8)) : 0.001);
    const poke = ease(t, wordT('rubber', 12), wordT('rubber', 13));
    poker.userData.armR.rotation.z = 1.4 * poke;
    const wob = Math.exp(-Math.max(0, t - wordT('rubber', 13)) * 3) * (t > wordT('rubber', 13) ? 1 : 0);
    const sag = 0.08 * ease(t, wordT('close', 9), wordT('close', 9) + 0.5);
    T2.userData.body.scale.set(1 + Math.sin(t * 18) * 0.02 * wob, 1 - sag + Math.sin(t * 18 + 1) * 0.03 * wob, 1 + Math.sin(t * 18) * 0.02 * wob);
    // night: inflate, then paint the fake marking
    const inf = 0.12 + 0.88 * ease(t, wordT('night', 3), wordT('night', 6));
    T5.userData.body.scale.set(0.9 + 0.1 * inf, inf, 0.9 + 0.1 * inf);
    mark.scale.set(Math.max(0.001, ease(t, wordT('night', 8), wordT('night', 10))), 1, 1); mark.position.x = N + 7.2 - 0.62 * (1 - mark.scale.x);
    painter.userData.armR.rotation.z = 1.6 + Math.sin(t * 9) * 0.25;
    // speaker sound rings
    const spOn = shot === 'speakers';
    rings.forEach((m, i) => { m.visible = spOn; if (!spOn) return; const ph = ((t - wordT('speakers', 0)) * 0.45 + i / rings.length) % 1; m.position.set(SP - 2.5 - ph * 45, 2.05 + ph * 3, 9.4 - ph * 12); m.scale.setScalar(0.8 + ph * 9); m.material.opacity = 0.9 * (1 - ph); });
    // camp signs
    s1100.scale.setScalar(pop(t, wordT('unit', 6))); secret.scale.setScalar(pop(t, wordT('unit', 13)));
    officer.userData.armR.rotation.z = shot === 'unit' ? 2.2 : 0;
    // studio
    painter2.userData.armR.rotation.z = 1.5 + Math.sin(t * 8) * 0.3;
    actor.userData.armL.rotation.z = shot === 'artists' ? -2.3 + Math.sin(t * 5) * 0.2 : 0;
    // map
    if (shot === 'job' || shot === 'rhine') drawMap(shot, t);
    // radio: antenna pulses + flying message slips
    const rOn = shot === 'radio';
    aRings.forEach((m, i) => { m.visible = rOn; const ph = ((t * 0.9) + i / 4) % 1; m.scale.setScalar(0.2 + ph * 2.5); m.material.opacity = 1 - ph; });
    const fs = ease(t, wordT('radio', 2), wordT('radio', 4));
    flyers.forEach((p, i) => { p.visible = rOn && fs > 0.01; const ph = ((t - wordT('radio', 2)) * 0.35 + i / flyers.length) % 1; const x0 = R - 1.8 + (i % 3) * 1.8; p.position.set(x0 + Math.sin(i * 1.7 + ph * 4) * 1.5 + ph * (i % 2 ? 2 : -2), 1.2 + ph * 3.6, -2.6 + ph * 3.2); p.rotation.set(ph * 6 + i, ph * 4, ph * 3); p.scale.setScalar(fs); });
    ops.forEach((o, i) => { o.userData.armR.rotation.z = rOn ? 1.2 + Math.sin(t * 6 + i) * 0.15 : 0; });
    // archive: box slides into the shelf, years tick by
    const sl = ease(t, wordT('secret', 5), wordT('secret', 7));
    fileBox.position.set(V + 0.4 + (V + 1.6 + 0.35 - (V + 0.4)) * sl, 1.33 + (0.05 + 0.58 + 0.8 - 1.33) * sl + Math.sin(sl * Math.PI) * 0.6, -1.4 + (-4.95 + 1.4) * sl);
    fileBox.rotation.y = (1 - sl) * 0.4;
    const yr = Math.round(1945 + 51 * ease(t, wordT('secret', 13), wordT('secret', 15)));
    if (shot === 'secret' && yr !== lastYr) { drawYear(yr, yr >= 1996); lastYr = yr; }
    clerk.userData.armR.rotation.z = shot === 'secret' ? 1.0 * (1 - sl) + 0.2 : 0;
  };

  return {group: W, update, groups: {cyc, carriers: carriers.map((q) => q.c), boss: [boss], all: chars}};
}
