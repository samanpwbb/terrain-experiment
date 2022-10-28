import { useState } from 'react';
import { colorsNatural } from './colors';
import { generateGround, groundToData } from './ground';
import { scale, setIsoCssVars } from './perspective-utils';
import { useWindowSize } from './useWindowSize';
import { colord } from 'colord';
import { useAnimateOnInterval } from './useAnimateOnInterval';

// next:
// - slopes.
// - load on move, fade out edges.

const tiles = 7;
const levels = 9;
const baseTileSize = 15;
const floorHeight = 0;

const stepSize = 0.25;

setIsoCssVars();

function Tile({
  x,
  y,
  z,
  tileSize,
}: {
  tileSize: number;
  x: number;
  y: number;
  z: number;
}) {
  // scale z by half, _every other_ int is a full step.
  const zBase = floorHeight + z * scale * stepSize;
  const zOffset = zBase * tileSize;
  const xOffset = x * tileSize;
  const yOffset = y * tileSize;
  const transition = `${250 + Math.abs(floorHeight + z) * 250}ms`;

  return (
    <>
      <div
        className={`absolute transition-all`}
        style={{
          transform: `
            translate3d(
              ${xOffset}px,
              ${yOffset}px,
              ${zOffset}px
            )`,
          height: `${tileSize}px`,
          width: `${tileSize}px`,
          transformStyle: 'preserve-3d',
          backgroundColor: colorsNatural[z],
          willChange: 'transform',
          transitionDuration: transition,
        }}
      >
        <div
          className={`absolute inset-0 transition-all`}
          style={{
            transform: `rotateX(90deg) scaleY(${zBase})`,
            transformOrigin: 'bottom',
            willChange: 'transform',
            background: colord(colorsNatural[z])
              .lighten(0.1)
              .rotate(10)
              .toHex(),
            transitionDuration: transition,
          }}
        />
        <div
          className={`absolute inset-0 transition-all`}
          style={{
            transform: `rotateY(90deg) scaleX(${zBase}) translateX(100%)`,
            transformOrigin: 'right',
            willChange: 'transform',
            background: colord(colorsNatural[z])
              .darken(0.1)
              .rotate(-10)
              .toHex(),
            transitionDuration: transition,
          }}
        />
      </div>
    </>
  );
}

const start = groundToData(generateGround(levels, undefined, tiles));
export function DemoThree() {
  const [ground, setGround] = useState(start);

  const windowSize = useWindowSize();
  const tileSize = baseTileSize + windowSize[0] * 0.0125;

  useAnimateOnInterval(setGround, levels, tiles, start, 3000, 1);

  if (windowSize[0] === 0) return null;

  return (
    <div className="parent fixed inset-0 flex items-center justify-center bg-slate-900">
      <div
        className="isometric"
        style={{
          height: `${90}vmin`,
          width: `${90}vmin`,
        }}
      >
        {ground.map(([x, y, z]) => {
          return (
            <Tile key={x + ',' + y} tileSize={tileSize} x={x} y={y} z={z} />
          );
        })}
      </div>
    </div>
  );
}
