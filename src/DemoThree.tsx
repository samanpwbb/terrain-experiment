import React, { useCallback, useRef, useState } from 'react';
import { generateExpandedGround } from './generateData';
import {
  setIsoCssVars,
  updateBaseX,
  BASE_X,
  BASE_Z,
  updateBaseZ,
} from './perspective-utils';
import { useWindowSize } from './useWindowSize';
import { LandScape } from './LandScape';

/* next
 * - [x] rotate with mouse:
     - left/right to rotate on z axis
      - up/down to rotate on y axis
   - [ ] Pan to load more tiles.
 * - [ ] Release as a react component.
 * - [ ] Allow more than 10 levels.
 * - [ ] Generate from center rather that top left so we can expand in all directions.
 *
 * Maybe:
 * - [ ] Click to raise / shift+click to lower.
 * - [ ] Water level overlay
 * - [ ] Jitter the vertexes ?
 *
 *
 * Done:
 * - [x] Pass in data.
 * - [x] Pass in color ramp.
 * - [x] Clean up code...
 * - [x] Handle strokes on diagonal tiles. Svg?
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

const tiles = 120;
const levels = 10;
const baseTileSize = 60;
const perimeter = 8;

setIsoCssVars();

const gen = () => generateExpandedGround(levels, undefined, tiles);
const terrains = [] as number[][][];
// pregenerate some terrain
const count = 50;
for (let i = 0; i < count; i++) {
  terrains.push(gen());
}

function clamp(min: number, val: number, max: number) {
  return Math.min(Math.max(min, val), max);
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
  const [active, setActive] = useState(0);
  const x = useRef(BASE_X);
  const z = useRef(BASE_Z);
  const [pixelate, setPixelate] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const startDragging = () => setIsDragging(true);
  const stopDragging = () => setIsDragging(false);

  const windowSize = useWindowSize();
  const tileSize = Math.round(baseTileSize + windowSize[0] * 0.0125);

  // drag left/right to update baseX
  // drag up/down to update baseZ
  const updateCamera = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const newX = clamp(0, x.current - e.movementY * 0.25, 90);
      updateBaseX(newX);
      x.current = newX;

      const newZ = clamp(0, z.current - e.movementX * 0.25, 90);
      updateBaseZ(newZ);
      z.current = newZ;
      e.preventDefault();
    },
    [isDragging],
  );

  if (windowSize[0] === 0) return null;

  return (
    <>
      <div
        className="fixed inset-0 flex touch-none items-center justify-center text-white"
        onPointerDown={startDragging}
        onPointerMove={updateCamera}
        onPointerUp={stopDragging}
      >
        <div className="fixed bottom-5 left-5 z-10 select-none items-center justify-center rounded-lg bg-slate-500 p-2">
          By{' '}
          <a
            className="underline decoration-slate-200 underline-offset-2	"
            href="https://trashmoon.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Saman Bemel Benrud ↗
          </a>
        </div>
        <div className="fixed top-5 left-5 z-10 flex select-none items-center justify-center rounded-lg bg-slate-500 p-2">
          <div
            className="mr-1 cursor-pointer rounded-md bg-white bg-slate-600 px-2 py-1"
            onClick={() => setActive((v) => (v > 0 ? v - 1 : count - 1))}
          >
            ←
          </div>
          <div
            className="cursor-pointer	rounded-md bg-white bg-slate-600 px-2 py-1"
            onClick={() => setActive((v) => (v < count - 1 ? v + 1 : 0))}
          >
            →
          </div>
          <span className="ml-2 mr-2 w-8 border-r border-solid border-black pr-2">
            {active}
          </span>
          <div className="ml-2 cursor-pointer py-1 text-gray-300">
            Click and drag to rotate.
          </div>
          <div
            className="ml-2	 cursor-pointer rounded-md bg-white bg-slate-600 px-2 py-1"
            onClick={() => {
              updateBaseX(BASE_X);
              updateBaseZ(BASE_Z);
              x.current = BASE_X;
              z.current = BASE_Z;
            }}
          >
            Reset position
          </div>
          <div
            className="w-30 ml-2 cursor-pointer	rounded-md bg-white bg-slate-600 px-2 py-1"
            onClick={() => setPixelate((v) => !v)}
          >
            Pixelate: {pixelate ? 'ON' : 'OFF'}
          </div>
        </div>
        <LandScape
          colors={colorsNatural}
          perimeter={perimeter}
          pixelate={pixelate}
          terrainData={terrains[active]}
          tileSize={tileSize}
        />
      </div>
    </>
  );
}
