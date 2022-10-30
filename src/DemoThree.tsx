import { useState } from 'react';
import { colorsNatural } from './colors';
import { generateGround, groundToData } from './ground';
import { scale, setIsoCssVars, RADIAN_TO_ANGLE } from './perspective-utils';
import { useWindowSize } from './useWindowSize';
import { useAnimateOnInterval } from './useAnimateOnInterval';
import { colord } from 'colord';

/* next
 * - [ ] Add back panels to hide the colors peeking through.
 *       - could do this with a shape mask, or with another panel.
 * - [ ] adjust ramp colors.
 * - [ ] Add more ramp styles.
 */
const tiles = 5;
const levels = 9;
const baseTileSize = 20;
const floorHeight = 3;

const stepSize = 0.25;

setIsoCssVars();

function getTransformFromNeighbors({
  n,
  z,
  tileSize,
  zStep,
}: {
  n: string;
  z: number;
  tileSize: number;
  zStep: number;
}) {
  const nData = { nTransform: '', anchor: '', angle: 0, scale: 0 };
  if (z < 3) return nData;

  //        |\
  //  ztile | \  scale
  //        |  \
  //        |___\
  //        xtile
  //
  const zTile = zStep * tileSize;
  const hypot = Math.hypot(tileSize, zTile);
  const scale = hypot / tileSize;
  const angle = Math.asin(zTile / hypot) * RADIAN_TO_ANGLE;

  if (n === '1000') {
    nData.scale = scale;
    nData.angle = angle;
    nData.nTransform = `rotateY(${angle}deg) scaleX(${scale})`;
    nData.anchor = 'right';
  }
  if (n === '0100') {
    nData.scale = scale;
    nData.angle = -angle;
    nData.nTransform = `rotateX(-${angle}deg) scaleY(${scale})`;
    nData.anchor = 'bottom';
  }
  if (n === '0001') {
    nData.angle = angle;
    nData.nTransform = `rotateX(${angle}deg) scaleY(${scale})`;
    nData.anchor = 'top';
  }
  if (n === '0010') {
    nData.angle = -angle;
    nData.nTransform = `rotateY(-${angle}deg) scaleX(${scale})`;
    nData.anchor = 'left';
  }

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
  const zStep = scale * stepSize;
  const zBase = floorHeight + z * zStep;
  const zOffset = zBase * tileSize;
  const xOffset = x * tileSize;
  const yOffset = y * tileSize;
  // const transition = `${250 + Math.abs(floorHeight + z) * 100}ms`;
  const { anchor, nTransform } = getTransformFromNeighbors({
    tileSize,
    zStep,
    z,
    n: neighbors,
  });

  return (
    <>
      <div
        className={`absolute `}
        style={{
          transform: `
            translate3d(
              ${xOffset}px,
              ${yOffset}px,
              ${zOffset}px
            ) ${nTransform}`,
          height: `${tileSize}px`,
          width: `${tileSize}px`,
          transformOrigin: anchor,
          backgroundColor: colorsNatural[z],
          willChange: 'transform',
          boxShadow: 'inset 0 0 0 1px #0E172A',
        }}
      />
      {/* this is sort of like a mask, so tiles behind angled tiles don't show through*/}
      {nTransform && (
        <div
          className={`absolute `}
          style={{
            transform: `
            translate3d(
              ${xOffset}px,
              ${yOffset}px,
              ${zOffset}px
            )`,
            height: `${tileSize}px`,
            width: `${tileSize}px`,
            transformOrigin: anchor,
            // background: colorsNatural[z],
            background: '#0E172A',
            willChange: 'transform',
          }}
        />
      )}
      <div
        className={`absolute `}
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
        }}
      />
      <div
        className={`absolute `}
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
    <div className="parent fixed inset-0 flex items-center justify-center bg-slate-700">
      <div
        className="isometric"
        style={{
          height: `${40}vmin`,
          width: `${40}vmin`,
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
