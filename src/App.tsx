import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  bgColor,
  colorsNatural,
  levels,
  mapSize,
  perimeter,
} from './constants';
import { Button } from './components/Button';

const isChrome =
  /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

setIsoCssVars();

const gen = () => generateNaturalGround(levels, mapSize, 2);
const terrains = [] as number[][][];
// pregenerate some terrain
const count = 10;
for (let i = 0; i < count; i++) {
  terrains.push(gen());
}

const moves = {
  up: (c: [number, number]) => [c[0], c[1] - 1],
  down: (c: [number, number]) => [c[0], c[1] + 1],
  left: (c: [number, number]) => [c[0] - 1, c[1]],
  right: (c: [number, number]) => [c[0] + 1, c[1]],
} as {
  [key: string]: (c: [number, number]) => [number, number];
};

const keysToMoves = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
} as {
  [key: string]: keyof typeof moves;
};

export function App() {
  const x = useRef(BASE_X);
  const z = useRef(BASE_Z);
  const [terrainKey, setTerrainKey] = useState(0);
  const [center, setCenter] = useState<[number, number]>([0, 0]);

  // if chrome, pixelate, because it's the only browser that supports SVG filters
  // performantly.
  const [pixelate, setPixelate] = useState(isChrome);

  /*
   * Events
   ****************************************************************************/
  const dragState = useRef<'' | 'started' | 'dragging'>('');
  const startDragging = () => (dragState.current = 'started');
  const stopDragging = (e: React.PointerEvent) => {
    const prevDragState = dragState.current;
    dragState.current = '';

    // if we were dragging, do not move
    if (prevDragState === 'dragging') {
      return;
    }

    // click to move, one step at a time
    // top left quadrant moves left
    // top right quadrant moves up
    // bottom left quadrant moves down
    // bottom right quadrant moves right
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const half = [rect.width / 2, rect.height / 2];
    let move: keyof typeof moves = 'up';
    if (x < half[0] && y < half[1]) {
      move = 'left';
    } else if (x >= half[0] && y >= half[1]) {
      move = 'right';
    } else if (x < half[0]) {
      move = 'down';
    }
    setCenter(moves[move]);
  };

  const updateCamera = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    if (Math.abs(e.movementY) + Math.abs(e.movementX) > 5) {
      dragState.current = 'dragging';
    }
    if (dragState.current !== 'dragging') return;

    // drag left/right to update baseX
    // drag up/down to update baseZ
    const newX = clamp(0, x.current - e.movementY * 0.25, 90);
    updateBaseX(newX);
    x.current = newX;

    const newZ = clamp(0, z.current - e.movementX * 0.25, 90);
    updateBaseZ(newZ);
    z.current = newZ;
    e.preventDefault();
  }, []);

  // use arrow keys to update center
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const move = keysToMoves[e.key as keyof typeof keysToMoves];
    if (!move) return;
    setCenter(moves[move]);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /*
   * Rendering
   ****************************************************************************/
  const windowSize = useWindowSize();
  const tileSize = Math.round(baseTileSize + windowSize[0] * 0.01);

  if (windowSize[0] === 0) return null;

  return (
    <>
      <div className="fixed top-5 left-5 z-10 flex select-none items-center justify-center gap-2 rounded-lg p-2 text-white">
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
      <div
        className="fixed inset-0 flex touch-none items-center justify-center"
        onPointerDown={startDragging}
        onPointerMove={updateCamera}
        onPointerUp={stopDragging}
      >
        <Landscape
          bgColor={bgColor}
          center={center}
          colors={colorsNatural}
          perimeter={perimeter}
          pixelate={pixelate}
          terrainData={terrains[terrainKey]}
          tileSize={tileSize}
        />
      </div>
    </>
  );
}
