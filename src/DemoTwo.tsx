import { useState } from 'react';
import { colors } from './colors';
import { generateGround, groundToData } from './ground';
import { scale, setIsoCssVars } from './perspective-utils';
import { useWindowSize } from './useWindowSize';
import { colord } from 'colord';
import { useAnimateOnInterval } from './useAnimateOnInterval';

// next:
// - fix rendering artifacts.
// - beveled edges.
// - slope if two neighbors are 1 step away.

const tiles = 12;
const levels = 10;
const baseTileSize = 10;
const mid = 0;
const floorHeight = 1;

const stepSize = 0.5;

const allMidGround = groundToData(
  generateGround(levels, undefined, tiles, mid),
);

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
          // border: '1px solid black',
          transformStyle: 'preserve-3d',
          backgroundColor: colors[z],
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
            background: `linear-gradient(0deg, ${colord(colors[z])
              .darken(0.1)
              .rotate(-10)
              .toHex()} 0px, #0F172A 100%)`,
            transitionDuration: transition,
          }}
        />
        <div
          className={`absolute inset-0 transition-all`}
          style={{
            transform: `rotateY(90deg) scaleX(${zBase}) translateX(100%)`,
            transformOrigin: 'right',
            willChange: 'transform',
            background: `linear-gradient(90deg, ${colord(colors[z])
              .lighten(0.1)
              .rotate(10)
              .toHex()} 0px, #0F172A 100%)`,
            transitionDuration: transition,
          }}
        />
      </div>
    </>
  );
}

export function DemoTwo() {
  const [ground, setGround] = useState(
    groundToData(generateGround(levels, undefined, tiles)),
  );

  const windowSize = useWindowSize();
  const tileSize = baseTileSize + windowSize[0] * 0.0125;

  useAnimateOnInterval(setGround, levels, tiles, allMidGround, 1000);

  if (windowSize[0] === 0) return null;

  return (
    <div className="parent fixed inset-0 flex items-center justify-center bg-slate-900">
      <div
        className="isometric"
        style={{
          height: `${50}vmin`,
          width: `${50}vmin`,
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
