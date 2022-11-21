import { useState } from 'react';
import { generateExpandedGround, Ground, groundToData } from './ground';
import { setIsoCssVars, updateBaseX } from './perspective-utils';
import { useWindowSize } from './useWindowSize';
import { Tile } from './Tile';

/* next
 * - [ ] Handle 1010, 0101
 * - [ ] Only draw cliffs where there are cliffs.
 * - [ ] Click to raise / shift+click to lower.
 * - [ ] If both L and U are not ramps, then the tile is flat even if LU is a ramp.
 * - [ ] Water level overlay
 * - [ ] Camera controls (perspective, perspective origin).
 * - [ ] Nice animations by giving everything a clip (so we transition the clips).
 * - [ ] Jitter the vertexes.
 *
 * Done:
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

const tiles = 6;
const levels = 10;
const baseTileSize = 20;

setIsoCssVars();

const gen = () =>
  groundToData(generateExpandedGround(levels, undefined, tiles));

const terrains = [] as Ground[];

// generate 30 terrains
const count = 30;
for (let i = 0; i < count; i++) {
  terrains.push(gen());
}

export function DemoThree() {
  const [active, setActive] = useState(6);

  const windowSize = useWindowSize();
  const tileSize = baseTileSize + windowSize[0] * 0.0125;

  if (windowSize[0] === 0) return null;

  return (
    <>
      <div className="parent fixed inset-0 flex items-center justify-center bg-slate-800">
        <div className="padding-5 fixed bottom-10 left-10 flex items-center justify-center bg-white">
          <div
            className="cursor-pointer bg-white px-2 py-1"
            onClick={() => setActive((v) => (v > 0 ? v - 1 : count - 1))}
          >
            Prev
          </div>
          <span className="opacity-50">{active}</span>
          <div
            className="cursor-pointer bg-white px-2 py-1"
            onClick={() => setActive((v) => (v < count - 1 ? v + 1 : 0))}
          >
            Next
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
        <div className="filter">
          <div
            className="isometric"
            style={{
              height: `${55}vmin`,
              width: `${55}vmin`,
            }}
          >
            {terrains[active].map(([x, y, z, n]) => {
              return (
                <Tile
                  key={x + ',' + y}
                  neighbors={n}
                  tileSize={tileSize}
                  x={x}
                  y={y}
                  z={z}
                />
              );
            })}
          </div>
        </div>
      </div>
      <svg display="none">
        <defs>
          <filter id="turb">
            <feTurbulence baseFrequency="0.15" numOctaves="4" />
            <feDisplacementMap in="SourceGraphic" scale="4" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
