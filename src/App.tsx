import { useEffect, useRef, useState } from 'react';
import { colors } from './colors';
import { generateGround, groundToData } from './ground';
import { scale, setIsoCssVars } from './perspective-utils';
import { useWindowSize } from './useWindowSize';
import { colord } from 'colord';

const tiles = 20;
const baseTileSize = 6;
const levels = 10;
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
          transformStyle: 'preserve-3d',
          backgroundColor: colors[z],
          transitionDuration: transition,
        }}
      >
        <div
          className={`absolute inset-0 transition-all`}
          style={{
            transform: `rotateX(90deg) scaleY(${zBase})`,
            transformOrigin: 'bottom',
            backgroundColor: colord(colors[z]).rotate(50).toHex(),
            transitionDuration: transition,
          }}
        />
        <div
          className={`absolute inset-0 transition-all`}
          style={{
            transform: `rotateY(90deg) scaleX(${zBase}) translateX(100%)`,
            transformOrigin: 'right',
            backgroundColor: colord(colors[z]).rotate(-50).toHex(),
            transitionDuration: transition,
          }}
        />
      </div>
    </>
  );
}

export default function App() {
  const [ground, setGround] = useState(allMidGround);

  const windowSize = useWindowSize();
  const tileSize = baseTileSize + windowSize[0] * 0.0125;

  const toggle = useRef(0);
  const interval = useRef<NodeJS.Timeout>();
  useEffect(() => {
    interval.current = setInterval(() => {
      if (toggle.current === 0) {
        setGround(groundToData(generateGround(levels, undefined, tiles)));
      }

      if (toggle.current >= 4) {
        setGround(allMidGround);
        toggle.current = 0;
        return;
      }

      if (toggle.current < 4) {
        toggle.current++;
        return;
      }
    }, 1000);
    return () => {
      clearInterval(interval.current!);
    };
  }, []);

  if (windowSize[0] === 0) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
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
