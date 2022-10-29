import { useState } from 'react';
import { colorsNatural } from './colors';
import { generateGround, groundToData } from './ground';
import { scale, setIsoCssVars } from './perspective-utils';
import { useWindowSize } from './useWindowSize';
import { useAnimateOnInterval } from './useAnimateOnInterval';
// import { colord } from 'colord';

// this is not very smart but it works for now.

// next:
// - side-panes.
// - slopes.
//    - calculate the scale and anchor points.
// - load on move, fade out edges.
// - move calculations to web worker using comlink.
const tiles = 5;
const levels = 9;
const baseTileSize = 30;
const floorHeight = 0;

const stepSize = 0.5;

setIsoCssVars();

function getTransformFromNeighbors(n: string, z: number) {
  const nData = { nTransform: '', anchor: '', angle: 0, zAdjustment: 0 };
  if (z < 3) return nData;

  if (n === '1000' || (n === '1100' && !(z % 2))) {
    // Make these hard coded values (35, 1.25) dynamic.
    // Right now, requires BASE_X to be 45. There is a way to derive this with a
    // bit of trig.
    nData.angle = 35;
    nData.nTransform = `rotateY(${nData.angle}deg) scaleX(1.25)`;
    nData.zAdjustment = 0;
    nData.anchor = 'right';
  }
  if (n === '0100' || (n === '1100' && z % 2)) {
    nData.angle = -35;
    // 35, 1.25
    nData.nTransform = `rotateX(${nData.angle}deg) scaleY(1.25)`;
    nData.zAdjustment = 0;
    nData.anchor = 'bottom';
  }

  // if (n === '0010') {
  //   nData.angle = -45;
  //   nData.nTransform = `rotateY(${nData.angle}deg)`;
  //   nData.zAdjustment = 10;
  // }
  // if (n === '0001') {
  //   nData.angle = 45;
  //   nData.nTransform = `rotateX(${nData.angle}deg)`;
  //   nData.zAdjustment = 10;
  // }

  return nData;
}

function Tile({
  x,
  y,
  z,
  tileSize,
  neighbors,
}: {
  tileSize: number;
  x: number;
  y: number;
  z: number;
  neighbors: string;
}) {
  // scale z by half, _every other_ int is a full step.
  const zBase = floorHeight + z * scale * stepSize;
  const zOffset = zBase * tileSize;
  const xOffset = x * tileSize;
  const yOffset = y * tileSize;
  const transition = `${250 + Math.abs(floorHeight + z) * 250}ms`;
  const { anchor, nTransform, zAdjustment } = getTransformFromNeighbors(
    neighbors,
    z,
  );

  return (
    <>
      <div
        className={`absolute transition-all`}
        style={{
          transform: `
            translate3d(
              ${xOffset}px,
              ${yOffset}px,
              ${zOffset + zAdjustment}px
            ) ${nTransform}`,
          height: `${tileSize}px`,
          width: `${tileSize}px`,
          transformOrigin: anchor,
          backgroundColor: colorsNatural[z],
          willChange: 'transform',
          transitionDuration: transition,
        }}
      />
      <div
        className={`absolute transition-all`}
        style={{
          height: `${tileSize}px`,
          width: `${tileSize}px`,
          transform: `translate3d(
            ${xOffset}px,
            ${yOffset}px,
            ${zOffset}px
          ) rotateX(90deg) scaleY(${zBase})`,
          transformOrigin: 'bottom',
          willChange: 'transform',
          background: '#0E172A',
          // background: colord(colorsNatural[z])
          //   .rotate(-20)
          //   .desaturate(0.2)
          //   .darken(0.2)
          //   .toHex(),
          // opacity: 0,
          transitionDuration: transition,
        }}
      />
      <div
        className={`absolute transition-all`}
        style={{
          height: `${tileSize}px`,
          width: `${tileSize}px`,
          // opacity: 0,
          transform: `translate3d(
            ${xOffset}px,
            ${yOffset}px,
            ${zOffset}px
          ) rotateY(90deg) scaleX(${zBase}) translateX(100%)`,
          transformOrigin: 'right',
          willChange: 'transform',
          // background: colord(colorsNatural[z]).rotate(20).lighten(0.2).toHex(),
          background: '#0E172A',
          transitionDuration: transition,
        }}
      />
    </>
  );
}

generateGround(levels, undefined, tiles);
const start = groundToData(generateGround(levels, undefined, tiles));

export function DemoThree() {
  const [ground, setGround] = useState(start);

  const windowSize = useWindowSize();
  const tileSize = baseTileSize + windowSize[0] * 0.0125;

  useAnimateOnInterval(setGround, levels, tiles, 2500, 1);

  if (windowSize[0] === 0) return null;

  return (
    <div className="parent fixed inset-0 flex items-center justify-center bg-slate-900">
      <div
        className="isometric"
        style={{
          height: `${60}vmin`,
          width: `${60}vmin`,
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
  );
}
