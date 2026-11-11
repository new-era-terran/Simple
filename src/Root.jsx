import React from 'react';
import {Composition, Still} from 'remotion';
import {Full} from './Full.jsx';
import {Sheet} from './Sheet.jsx';
import {TwoD} from './TwoD.jsx';
import timing from './timing.json';
export const Root = () => (<>
  <Composition id="Story" component={Full} width={720} height={1280} fps={30}
    durationInFrames={Math.round(timing.duration * 30)} />
  <Composition id="Shot" component={Full} width={720} height={1280} fps={30} durationInFrames={1} defaultProps={{ov: null}} />
  <Still id="TwoD" component={TwoD} width={720} height={1280} defaultProps={{scene: 0}} />
  <Still id="Sheet" component={Sheet} width={720} height={1280} />
</>);
