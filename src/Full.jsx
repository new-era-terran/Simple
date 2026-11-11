import React, {useMemo, useRef, useEffect} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree, useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import timing from './timing.json';
import {buildWorld} from './worlds.js';
import {cameraAt3 as cameraAt, dipAt, LIGHTS, CUTS, SUBS, wordT} from './camera.js';
import {MapAnim} from './MapAnim.jsx';

const USE_BOKEH = false;

const Vignette = {
  uniforms: {tDiffuse: {value: null}, amount: {value: 0.5}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform sampler2D tDiffuse; uniform float amount; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - 0.5; float v = 1.0 - amount * smoothstep(0.25, 0.75, length(d * vec2(1.0, 0.8))); gl_FragColor = vec4(c.rgb * v, c.a); }',
};

const Grade = {
  uniforms: {tDiffuse: {value: null}, sat: {value: 1.12}, con: {value: 1.14}, warm: {value: 0.05}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float sat; uniform float con; uniform float warm; varying vec2 vUv;
  void main(){ vec4 c = texture2D(tDiffuse, vUv); vec3 col = c.rgb; float l = dot(col, vec3(0.299,0.587,0.114));
  col = mix(vec3(l), col, sat); col = (col - 0.5) * con + 0.5;
  col += vec3(warm, warm*0.4, -warm) * smoothstep(0.35, 1.0, l); col += vec3(-0.01, 0.0, 0.03) * (1.0 - smoothstep(0.0, 0.45, l));
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), c.a); }`,
};

function makeSky() {
  const mat = new THREE.ShaderMaterial({
    uniforms: {top: {value: new THREE.Color('#3d8fe0')}, hor: {value: new THREE.Color('#cde9f8')}, sunDir: {value: new THREE.Vector3(-0.5, 0.6, 0.6).normalize()}, sunCol: {value: new THREE.Color('#fff2c8')}, sunOn: {value: 1}},
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize((modelMatrix * vec4(position,1.0)).xyz - cameraPosition); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 hor; uniform vec3 sunDir; uniform vec3 sunCol; uniform float sunOn; varying vec3 vDir;
    void main(){ float h = clamp(vDir.y, 0.0, 1.0); vec3 c = mix(hor, top, pow(h, 0.55)); float s = max(dot(normalize(vDir), sunDir), 0.0);
    c += sunCol * (pow(s, 600.0) * 1.2 + pow(s, 12.0) * 0.25) * sunOn; gl_FragColor = vec4(c, 1.0); }`,
    side: THREE.BackSide, depthWrite: false, fog: false,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(800, 32, 16), mat); m.renderOrder = -1; m.frustumCulled = false;
  return m;
}

const Scene = ({frame, fps, ov}) => {
  const {gl, scene, camera, size} = useThree();
  const t = ov && ov.t != null ? ov.t : frame / fps;
  const world = useMemo(() => buildWorld(), []);
  const lights = useMemo(() => {
    const sun = new THREE.DirectionalLight('#ffffff', 1.5);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
    const hemi = new THREE.HemisphereLight('#ffffff', '#888888', 0.8);
    const pt = new THREE.PointLight('#ffc77a', 0, 14, 1.6);
    const sky = makeSky();
    scene.add(sun, sun.target, hemi, pt, sky);
    scene.add(world.group);
    scene.fog = new THREE.Fog('#cfe4f2', 70, 330);
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    return {sun, hemi, pt, sky};
  }, []);
  const comp = useMemo(() => {
    const c = new EffectComposer(gl);
    c.setSize(size.width, size.height);
    c.addPass(new RenderPass(scene, camera));
    const bokeh = new BokehPass(scene, camera, {focus: 5, aperture: 0.0025, maxblur: 0.006});
    if (USE_BOKEH) c.addPass(bokeh); // depth blur off: ~3x faster render
    c.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.2, 0.4, 0.92));
    const gp = new ShaderPass(Grade), vp = new ShaderPass(Vignette); c.addPass(gp); c.addPass(vp);
    c.addPass(new OutputPass());
    return {c, bokeh, gp, vp};
  }, [gl, scene, camera, size.width, size.height]);

  const tRef = useRef(t); tRef.current = t;
  useFrame(() => {
    const tt = tRef.current;
    const cam = cameraAt(tt);
    if (ov && ov.pos) { cam.pos = new THREE.Vector3(...ov.pos); cam.look = new THREE.Vector3(...ov.look); }
    camera.fov = (ov && ov.fov) || cam.fov || 80; camera.near = 0.05; camera.far = 900; camera.updateProjectionMatrix();
    camera.position.copy(cam.pos);
    if (cam.roll) { camera.position.x += Math.sin(tt * 9) * 0.006 + Math.sin(tt * 15) * 0.003; camera.position.y += Math.sin(tt * 11) * 0.005; } // handheld shake on tense shots
    camera.lookAt(cam.look); const rl = ov && ov.roll != null ? ov.roll : cam.roll; if (rl) camera.rotateZ(rl);
    const soft = !(ov && ov.style === 'hard');
    const L = soft ? LIGHTS[cam.plan.light === 'campnight' ? 'campnight' : cam.plan.light === 'lamp' ? 'softroom' : 'soft'] : LIGHTS[cam.plan.light];
    if (soft) { comp.gp.uniforms.sat.value = 0.98; comp.gp.uniforms.con.value = 0.97; comp.gp.uniforms.warm.value = 0.0; comp.vp.uniforms.amount.value = 0.18; }
    const A = cam.plan.anchor;
    lights.sun.color.set(L.sun); lights.sun.intensity = L.si;
    lights.sun.position.set(A[0] + L.sunOff[0], A[1] + L.sunOff[1], A[2] + L.sunOff[2]);
    lights.sun.target.position.set(A[0], A[1], A[2]); lights.sun.target.updateMatrixWorld();
    const sc = lights.sun.shadow.camera; sc.left = -L.shadow; sc.right = L.shadow; sc.top = L.shadow; sc.bottom = -L.shadow; sc.near = 1; sc.far = 400; sc.updateProjectionMatrix();
    lights.hemi.color.set(L.sky); lights.hemi.groundColor.set(L.gnd); lights.hemi.intensity = L.hi;
    scene.fog.color.set(L.fog); scene.fog.near = L.near; scene.fog.far = L.far;
    scene.background = null;
    lights.sky.position.copy(cam.pos);
    const su = lights.sky.material.uniforms; su.top.value.set(L.top); su.hor.value.set(L.hor);
    su.sunDir.value.set(L.sunOff[0], L.sunOff[1], L.sunOff[2]).normalize(); su.sunOn.value = (['day', 'morning', 'yard', 'golden'].includes(cam.plan.light)) ? 1 : 0; su.sunCol.value.set(L.sun);
    if (L.pt) { lights.pt.color.set(L.pt.c); lights.pt.intensity = L.pt.i; lights.pt.distance = L.pt.d; lights.pt.position.set(A[0] + L.pt.p[0], A[1] + L.pt.p[1], A[2] + L.pt.p[2]); } else lights.pt.intensity = 0;
    world.update(tt, camera, cam.key);
    if (ov && ov.faces) for (const [g, f] of ov.faces) for (const c of world.groups[g]) c.userData.setFace(f);
    comp.bokeh.uniforms.focus.value = cam.pos.distanceTo(cam.look);
  }, 0);
  useFrame(() => { comp.c.render(); }, 1);
  return null;
};

// word-by-word captions (Rick style): word times weighted by word length inside each sentence
const WORDS = [];
for (const s of timing.shots) {
  const ws = s.text.split(/\s+/); const wt = ws.map((w) => w.replace(/[^A-Za-z0-9']/g, '').length + 2); const tot = wt.reduce((a, b) => a + b, 0);
  let acc = 0; ws.forEach((w, i) => { const a = s.start + (s.end - s.start) * acc / tot; acc += wt[i]; WORDS.push({w, a, b: s.start + (s.end - s.start) * acc / tot}); });
}
const Caption = ({t}) => {
  let cur = null; for (const x of WORDS) { if (t >= x.a - 0.03 && t < x.b + 0.12) cur = x; }
  if (!cur) return null;
  const k = Math.min(1, (t - cur.a + 0.03) / 0.08); const sc = 0.82 + 0.18 * k;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: cameraAt(t).key === 'secret' ? '82%' : '67%', textAlign: 'center', transform: `scale(${sc})`}}>
      <span style={{fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif', fontWeight: 900, fontSize: 54, color: '#ffffff', letterSpacing: 0.5,
        WebkitTextStroke: '9px #1a1414', paintOrder: 'stroke fill', textShadow: '0 4px 0 rgba(0,0,0,0.35)'}}>{cur.w}</span>
    </div>
  );
};

const Word = ({w}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: '67%', textAlign: 'center'}}>
    <span style={{fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 54, color: '#fff', WebkitTextStroke: '9px #1a1414', paintOrder: 'stroke fill', textShadow: '0 4px 0 rgba(0,0,0,0.35)'}}>{w}</span>
  </div>);
const LABELS = [['rubber', 8, 13.9, ['THE TRICK', 'RUBBER TANK', '93 lb · four men can lift it']], ['unit', 6, 17.9, ['THE UNIT', '1,100 MEN', 'made to look like 30,000']], ['speakers', 5, 8.9, ['SOUND TRICK', '15 MILES', 'how far the fake tanks were heard']], ['secret', 9, 12.9, ['SWORN TO SECRECY', 'TOP SECRET', 'until 1996']]];
const Badge = ({l}) => (<div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center'}}><div style={{display: 'inline-block', background: '#1d2a44', border: '5px solid #d9b45a', borderRadius: 12, padding: '8px 28px 10px', boxShadow: '0 7px 0 rgba(0,0,0,0.3)'}}><div style={{font: '900 20px Arial', color: '#d9b45a', letterSpacing: 2}}>{l[0]}</div><div style={{font: '900 52px Arial', color: '#fff', lineHeight: 1.05}}>{l[1]}</div><div style={{font: '700 20px Arial', color: '#cfd8e8'}}>{l[2]}</div></div></div>);
export const Full = ({ov = null}) => {
  const frame0 = useCurrentFrame();
  const frame = ov && ov.t != null ? Math.round(ov.t * 30) : frame0;
  const {width, height, fps} = useVideoConfig();
  const t0 = frame / fps;
  const dip = dipAt(t0) * 0.35;
  // whip: short sideways blur across every location cut
  let wk = 0, wd = 1; CUTS.forEach((c, i) => { if (i === 0) return; const d = t0 - c; if (d > -0.1 && d < 0.13) { wk = 1 - Math.abs(d) / (d < 0 ? 0.1 : 0.13); wd = d < 0 ? -1 : 1; } });
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{filter: wk > 0 ? `blur(${(wk * 9).toFixed(1)}px)` : 'none', transform: wk > 0 ? `translateX(${(wd * wk * 70).toFixed(0)}px) scale(${1 + 0.06 * wk})` : 'none'}}>
      <ThreeCanvas width={width} height={height} linear={false} flat shadows
        gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 80, near: 0.1, far: 900, position: [0, 5, 20]}}>
        <Scene frame={frame} fps={fps} ov={ov} />
      </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: '#f6ecd6', opacity: dip}} />
      {(() => { const c = cameraAt(ov && ov.t != null ? ov.t : t0); const x = SUBS[c.sub]; return x.key === 'rhine' && (x.j === 1 || x.j === 3) ? <MapAnim t={ov && ov.t != null ? ov.t : t0} push={Math.min(1, ((ov && ov.t != null ? ov.t : t0) - x.a) / (x.b - x.a))} /> : null; })()}
      {(() => { const tt = ov && ov.t != null ? ov.t : t0; const L = LABELS.find(([k, a, b]) => tt >= wordT(k, a) && tt < wordT(k, b)); return L ? <Badge l={L[3]} /> : null; })()}
      {ov && ov.label && <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center'}}><div style={{display: 'inline-block', background: '#1d2a44', border: '4px solid #d9b45a', borderRadius: 10, padding: '6px 22px 8px', boxShadow: '0 6px 0 rgba(0,0,0,0.3)'}}><div style={{font: '900 15px Arial', color: '#d9b45a', letterSpacing: 2}}>{ov.label[0]}</div><div style={{font: '900 40px Arial', color: '#fff'}}>{ov.label[1]}</div>{ov.label[2] && <div style={{font: '700 15px Arial', color: '#cfd8e8'}}>{ov.label[2]}</div>}</div></div>}
      {ov && ov.word ? <Word w={ov.word} /> : <Caption t={frame / fps} />}
    </AbsoluteFill>
  );
};
