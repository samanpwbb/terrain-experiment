import React, { useCallback, useRef, useState } from 'react';
import {
  setIsoCssVars,
  updateBaseX,
  BASE_X,
  BASE_Z,
  updateBaseZ,
} from './utils/perspectiveUtils';
import { useWindowSize } from './hooks/useWindowSize';
import { Landscape } from './components/Landscape';
import { generateNaturalGround } from './terrain-gen/generateNaturalData';
import { clamp } from './utils/mathUtils';
import {
  baseTileSize,
  colorsNatural,
  levels,
  mapSize,
  perimeter,
} from './constants';

setIsoCssVars();

const gen = () => generateNaturalGround(levels, mapSize, 2);
const terrains = [] as number[][][];
// pregenerate some terrain
const count = 10;
for (let i = 0; i < count; i++) {
  terrains.push(gen());
}

export function App() {
  const [terrainKey, setTerrainKey] = useState(0);
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
        <div className="fixed top-5 left-5 z-10 flex select-none items-center justify-center gap-2 rounded-lg p-2">
          <span>Move with arrow keys</span>
          <Button
            onPress={() => {
              updateBaseX(BASE_X);
              updateBaseZ(BASE_Z);
              x.current = BASE_X;
              z.current = BASE_Z;
            }}
          >
            Reset camera
          </Button>
          <Button onPress={() => setPixelate((v) => !v)}>
            Pixelate: {pixelate ? 'ON' : 'OFF'}
          </Button>
          <Button onPress={() => setTerrainKey((v) => (v + 1) % count)}>
            Regenerate
          </Button>
        </div>
        <Landscape
          bgColor="rgba(0, 20, 140, 1)"
          bufferSize={1.5}
          colors={colorsNatural}
          fade={true}
          perimeter={perimeter}
          pixelate={pixelate}
          terrainData={terrains[terrainKey]}
          tileSize={tileSize}
        />
      </div>
    </>
  );
}

function Button(props: { children: React.ReactNode; onPress: () => void }) {
  return (
    <button
      className="w-30 cursor-pointer	rounded-md bg-black/25 px-2 py-1"
      onClick={props.onPress}
    >
      {props.children}
    </button>
  );
}
