import { useState } from 'react';
import { generateExpandedGround } from './generateData';
import { setIsoCssVars, updateBaseX } from './perspective-utils';
import { useWindowSize } from './useWindowSize';
import { LandScape } from './LandScape';

/* next
 * - [ ] Handle strokes on diagonal tiles. Svg?
 * - [ ] Rotate controls: left/right and up/down.
 * - [ ] Clean up code...
 * - [ ] Design interface so it can be used as a component.
 * - [ ] Pass in data.
 * - [ ] Pass in color ramp.
 * - [ ] Allow more than 10 levels.
 * - [ ] start generating from center rather that top left so we can expand in all directions.
 *
 * Maybe:
 * - [ ] Pan to explore.
 * - [ ] Click to raise / shift+click to lower.
 * - [ ] Water level overlay
 * - [ ] Jitter the vertexes ?
 *
 *
 * Done:
 * - [x] No ramp if diagonals are 1 z away but cardinals are more than 1.
 * - [?] If both L and U are not ramps, then the tile is flat even if LU is a ramp.
 * - [x] Fix coloring on 0101 and 1010.
 * - [x] Only draw cliffs where there are cliffs, make sure cliffs cover angles.
 * - [x] Camera controls (perspective, perspective origin).
 * - [x] Nice animations by giving everything a clip (so we transition the clips).
 * - [x] Handle 1010, 0101
 * - [x] Fix the math.
 * - [x] Don't use rotation.
 * - [x] Add more ramp styles.
 *       - no holes!
 * - [x] adjust ramp colors.
 *        - use a interpolation function and treat ramps as half-steps.
 * - [x] Handle case where adjacent tiles are lower but across tile is higher. These should be flat.
 * - [x] If a tile is raised up to the next level (1111), re-run the algorithm with the new value.
 * - [x] Water transition
 * - [x] Do all coloring with interpolation
 * - [x] If ramp is down, lighten ramp, if right, darken ramp as a way to do lighting.
 * - [x] Rework terrain generator so there is less small variation.
 * - [x] Handle cases where ground tiles are neighbors to ramps. We need to look at diagonal neighbors.
 *
 * Maybe:
 * - [ ] Use a format that allows more than 10 levels.
 * - [ ] Add support for transitions from lower elevation to higher elevation.
 * - [ ] Allow ramps to angle up to two tiles not just one.
 */

const tiles = 3;
const levels = 10;
const baseTileSize = 50;

setIsoCssVars();

const gen = () => generateExpandedGround(levels, undefined, tiles);
const terrains = [] as string[];
// pregenerate some terrain
const count = 50;
for (let i = 0; i < count; i++) {
  terrains.push(gen());
}

export const colorsNatural = [
  'hsla(330 100% 80%)',
  'hsla(280 100% 90%)',
  'hsla(250 10% 100%)',
  'hsla(170 60% 40%)',
  'hsla(110 45% 60%)',
  'hsla(90 65% 70%)',
  'hsla(60 75% 75%)',
  'hsla(200 80% 65%)',
  '#008fb0',
  '#0c4278',
].reverse();

export function DemoThree() {
  const [active, setActive] = useState(18);

  const windowSize = useWindowSize();
  const tileSize = Math.round(baseTileSize + windowSize[0] * 0.0125);

  if (windowSize[0] === 0) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="padding-5 fixed bottom-5 left-5 z-10 flex items-center justify-center bg-white">
          <div
            className="cursor-pointer bg-white px-2 py-1"
            onClick={() => setActive((v) => (v > 0 ? v - 1 : count - 1))}
          >
            ←
          </div>
          <span className="opacity-50">{active}</span>
          <div
            className="cursor-pointer bg-white px-2 py-1"
            onClick={() => setActive((v) => (v < count - 1 ? v + 1 : 0))}
          >
            →
          </div>
          <div
            className="ml-2 cursor-pointer bg-white px-2 py-1"
            onClick={() => updateBaseX(0)}
          >
            0°
          </div>
          <div
            className="ml-2 cursor-pointer bg-white px-2 py-1"
            onClick={() => updateBaseX(30)}
          >
            30°
          </div>
          <div
            className="ml-2 cursor-pointer bg-white px-2 py-1"
            onClick={() => updateBaseX(45)}
          >
            45°
          </div>
          <div
            className="ml-2 cursor-pointer bg-white px-2 py-1"
            onClick={() => updateBaseX(57.2958)}
          >
            57.2958°
          </div>
        </div>
        <LandScape
          colors={colorsNatural}
          terrainData={terrains[active]}
          tileSize={tileSize}
        />
      </div>
    </>
  );
}
