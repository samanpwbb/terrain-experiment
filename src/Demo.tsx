import React, { useCallback, useRef, useState } from 'react';
import {
  setIsoCssVars,
  updateBaseX,
  BASE_X,
  BASE_Z,
  updateBaseZ,
} from './perspective-utils';
import { useWindowSize } from './useWindowSize';
import { LandScape } from './LandScape';
import { generateNaturalGround } from './terrain-gen/generateNaturalData';

const mapSize = 120;
const levels = 7;
const baseTileSize = 70;
const perimeter = 12;

setIsoCssVars();

const gen = () => generateNaturalGround(levels, mapSize, 2);
const terrains = [] as number[][][];
// pregenerate some terrain
const count = 1;
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

export function Demo() {
  const [active] = useState(0);
  const x = useRef(BASE_X);
  const z = useRef(BASE_Z);
  const [pixelate, setPixelate] = useState(true);

  const isDragging = useRef(false);

  const startDragging = () => (isDragging.current = true);
  const stopDragging = () => (isDragging.current = false);

  const windowSize = useWindowSize();
  const tileSize = Math.round(baseTileSize + windowSize[0] * 0.0125);

  // drag left/right to update baseX
  // drag up/down to update baseZ
  const updateCamera = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const newX = clamp(0, x.current - e.movementY * 0.25, 90);
    updateBaseX(newX);
    x.current = newX;

    const newZ = clamp(0, z.current - e.movementX * 0.25, 90);
    updateBaseZ(newZ);
    z.current = newZ;
    e.preventDefault();
  }, []);

  if (windowSize[0] === 0) return null;

  return (
    <>
      <div
        className="fixed inset-0 flex touch-none items-center justify-center text-white"
        onPointerDown={startDragging}
        onPointerMove={updateCamera}
        onPointerUp={stopDragging}
      >
        <div className="fixed top-5 left-5 z-10 flex select-none items-center justify-center rounded-lg p-2">
          <span>Move with arrow keys</span>
          <div
            className="ml-2	 cursor-pointer rounded-md bg-black/25 px-2 py-1"
            onClick={() => {
              updateBaseX(BASE_X);
              updateBaseZ(BASE_Z);
              x.current = BASE_X;
              z.current = BASE_Z;
            }}
          >
            Reset camera
          </div>
          <div
            className="w-30 ml-2 cursor-pointer	rounded-md bg-black/25 px-2 py-1"
            onClick={() => setPixelate((v) => !v)}
          >
            Pixelate: {pixelate ? 'ON' : 'OFF'}
          </div>
        </div>
        <LandScape
          bgColor="rgba(0, 20, 140, 1)"
          bufferSize={1.5}
          colors={colorsNatural}
          fade={true}
          perimeter={perimeter}
          pixelate={pixelate}
          terrainData={terrains[active]}
          tileSize={tileSize}
        />
      </div>
    </>
  );
}
