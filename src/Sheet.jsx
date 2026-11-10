import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree, useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {character} from './char.js';

const CAST = [
  ['soldier', 'helmet', 'calm', 'fringe', 'none', 'CALM'], ['soldier2', 'helmet', 'scared', 'side', 'none', 'SCARED'], ['officer', 'none', 'furious', 'bald', 'moustache', 'FURIOUS'],
  ['red', 'beret', 'surprised', 'side', 'moustache', 'SURPRISED'], ['mustard', 'cap', 'wink', 'fringe', 'none', 'WINK'], ['navy', 'none', 'smile', 'side', 'moustache', 'HAPPY'],
];
const S = () => {
  const {scene, camera} = useThree();
  useMemo(() => {
    scene.background = new THREE.Color('#e9dcc0');
    CAST.forEach(([pal, hat, face, hair, beard], i) => {
      const c = character({palette: pal, hat, face, hair, beard, seed: 11 + i * 7});
      c.position.set((i % 3 - 1) * 1.15, i < 3 ? 2.35 : 0, 0); scene.add(c); c.userData.update(0.6 + i, new THREE.Vector3(0, 0, 10));
    });
  }, []);
  useFrame(() => { camera.position.set(0, 2.05, 12.5); camera.fov = 30; camera.updateProjectionMatrix(); camera.lookAt(0, 2.05, 0); });
  return null;
};
export const Sheet = () => (
  <AbsoluteFill>
    <ThreeCanvas width={720} height={1280} linear={false} flat gl={{antialias: true, preserveDrawingBuffer: true}}><S /></ThreeCanvas>
    {CAST.map((c, i) => <div key={i} style={{position: 'absolute', left: `${(i % 3) * 33.3}%`, width: '33.3%', top: i < 3 ? '47.5%' : '82%', textAlign: 'center', font: '900 26px Arial', color: '#3a2216'}}>{c[5]}</div>)}
    <div style={{position: 'absolute', top: 40, width: '100%', textAlign: 'center', font: '900 40px Arial', color: '#3a2216'}}>GHOST ARMY · CAST</div>
  </AbsoluteFill>
);
