import { memo, ReactNode } from 'react';
import { BASE_SCALE } from './perspective-utils';

export function Positioner({
  stepSize = 0.25,
  tileSize,
  children,
  floorHeight = 0,
  x,
  y,
  z,
}: {
  x: number;
  y: number;
  z: number;
  floorHeight: number;
  stepSize: number;
  tileSize: number;
  children: ReactNode;
}) {
  const zStep = BASE_SCALE * stepSize;
  const zBase = floorHeight + z * zStep;
  const zOffset = zBase * tileSize;
  const xOffset = x * tileSize;
  const yOffset = y * tileSize;

  // Main function for positioning elements iin 3d space.
  // Every tile face transform starts with this.
  const translate3d = `translate3d(
    ${xOffset}px,
    ${yOffset}px,
    ${zOffset}px
  )`;

  return (
    <div
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        transformStyle: 'preserve-3d',
        height: `${tileSize}px`,
        width: `${tileSize}px`,
        transform: translate3d,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        overflow: 'visible',
      }}
    >
      {children}
    </div>
  );
}

export const MemoizedPositioner = memo(Positioner);
