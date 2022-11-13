import { useState } from 'react';
import { generateExpandedGround, Ground, groundToData } from './ground';
import { setIsoCssVars } from './perspective-utils';
import { useWindowSize } from './useWindowSize';
import { Tile } from './Tile';

/* next
 * - [ ] Fix the math.
 * - [ ] Click to raise / shift+click to lower.
 * - [ ] Handle 1010, 0101
 * - [ ] If both L and U are not ramps, then the tile is flat even if LU is a ramp.
 * - [ ] Fix triangular gaps where there's no mask face.
 * - [ ] Water level overlay
 * - [ ] Camera controls (perspective, perspective origin).
 * - [ ] Nice animations.
 * - [ ] Jitter the vertexes.
 *
 * Done:
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

const tiles = 5;
const levels = 8;
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
  const [active, setActive] = useState(3);

  const windowSize = useWindowSize();
  const tileSize = baseTileSize + windowSize[0] * 0.0125;

  if (windowSize[0] === 0) return null;

  return (
    <>
      <div className="parent fixed inset-0 flex items-center justify-center bg-slate-800 filter">
        <div
          className="fixed left-20 bottom-10 cursor-pointer bg-white"
          onClick={() => setActive((v) => (v < count - 1 ? v + 1 : 0))}
        >
          Next {active}
        </div>
        <div
          className="fixed left-10 bottom-10 cursor-pointer bg-white"
          onClick={() => setActive((v) => (v > 0 ? v - 1 : count - 1))}
        >
          Prev
        </div>

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
      <svg display="none">
        <defs>
          <filter id="turb">
            <feTurbulence baseFrequency="0.2" numOctaves="5" />
            <feDisplacementMap in="SourceGraphic" scale="3" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
