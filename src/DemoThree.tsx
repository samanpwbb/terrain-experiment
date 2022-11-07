import { useState } from 'react';
import { generateExpandedGround, groundToData } from './ground';
import { setIsoCssVars } from './perspective-utils';
import { useWindowSize } from './useWindowSize';
import { useAnimateOnInterval } from './useAnimateOnInterval';
import { Tile } from './Tile';

/* next
 * - [ ] Fix the math
 * - [ ] Fix edge case tiles.
 * - [ ] Fix triangular gaps on cliffs.
 * - [ ] Handle case where adjacent tiles are lower but across tile is higher. These should be flat.
 * - [ ] Add rear panels to hide the colors peeking through.
 *       - could do this with a shape mask, or with another panel.
 * - [x] adjust ramp colors.
 *        - use a interpolation function and treat ramps as half-steps.
 * - [ ] Figure out math for scaling.
 * - [ ] Water level overlay
 * - [ ] Add more ramp styles.
 *       - no holes!
 * - [ ] Camera controls (perspective, perspective origin).
 * - [ ] Use a format that allows more than 10 levels.
 * - [ ] Nice animations.
 * - [x] Water transition
 * - [x] Do all coloring with interpolation
 * - [x] If ramp is down, lighten ramp, if right, darken ramp as a way to do lighting.
 * - [ ] Rework terrain generator so there is less small variation.
 * - [x] Handle cases where ground tiles are neighbors to ramps. We need to look at diagonal neighbors.
 *
 * Maybe:
 * - [?] Allow ramps to angle up to two tiles not just one.
 */

const tiles = 6;
const levels = 10;
const baseTileSize = 20;

setIsoCssVars();

generateExpandedGround(levels, undefined, tiles);
const start = groundToData(generateExpandedGround(levels, undefined, tiles));
export function DemoThree() {
  const [ground, setGround] = useState(start);

  const windowSize = useWindowSize();
  const tileSize = baseTileSize + windowSize[0] * 0.0125;

  useAnimateOnInterval(setGround, levels, tiles, 2500, 1);

  if (windowSize[0] === 0) return null;

  return (
    <>
      <div className="parent fixed inset-0 flex items-center justify-center bg-slate-800 filter">
        <div
          className="isometric"
          style={{
            height: `${55}vmin`,
            width: `${55}vmin`,
          }}
        >
          {ground.map(([x, y, z, n]) => {
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
