import { getColorFromZ } from './colors';
import { scale, RADIAN_TO_ANGLE } from './perspective-utils';

const floorHeight = 1;
const stepSize = 0.25;
const SQ2 = 1.41421356237;

const oneUpRamps = new Set(['1000', '0010', '0100', '0001']);
const twoUpRamps = new Set(['1100', '0110', '1001', '0011']);
const threeUpRamps = new Set(['1110', '1101', '1011', '0111']);

function getRamp({
  n,
  tileSize,
  zStep,
}: {
  n: string;
  tileSize: number;
  zStep: number;
}) {
  const nData = {
    nTransform: '',
    clipPath: '',
    anchor: '',
    fill: '',
    nOffset: 0,
    showSurface: false,
    surfaceOffset: 0,
    surfaceClipPath: '',
  };

  //        |\
  //  ztile | \  scale
  //        |  \
  //        |___\
  //        xtile
  //
  const zTile = zStep * tileSize;

  if (n === '1111') {
    nData.nOffset = 1;
    return nData;
  }

  // one-up ramps
  if (oneUpRamps.has(n)) {
    const adjacent = SQ2 * tileSize * 0.5;
    const opposite = zTile;
    const singleCornerAngle = Math.atan(opposite / adjacent) * RADIAN_TO_ANGLE;
    const squareDiagonal = SQ2 * tileSize;
    const desiredLength = Math.hypot(zTile, squareDiagonal / 2);
    const xScale = desiredLength / (tileSize / 2);
    // up
    if (n === '0100') {
      nData.showSurface = true;
      nData.clipPath = 'polygon(100% 0, 0 50%, 100% 100%)';
      nData.nTransform = `
      rotateZ(45deg)
      rotateY(${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${xScale / 2})
      translateX(-50%)`;
    }

    // down
    if (n === '0001') {
      nData.showSurface = true;
      nData.clipPath = 'polygon(0% 0, 100% 50%, 0% 100%)';
      nData.nTransform = `
      rotateZ(45deg)
      rotateY(-${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${xScale / 2})
      translateX(50%)`;
    }

    // left
    if (n === '1000') {
      nData.showSurface = true;
      nData.clipPath = 'polygon(0 0%, 50% 100%, 100% 0%)';
      nData.nTransform = `
      rotateZ(45deg)
      rotateX(${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${xScale / 2})
      translateY(50%)`;
    }

    // right
    if (n === '0010') {
      nData.showSurface = true;
      nData.clipPath = 'polygon(0 100%, 50% 0%, 100% 100%)';
      nData.nTransform = `
      rotateZ(45deg)
      rotateX(-${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${xScale / 2})
      translateY(-50%)`;
    }

    return nData;
  }

  // two-up ramps
  if (twoUpRamps.has(n)) {
    const hypot = Math.hypot(tileSize, zTile);
    const scale = hypot / tileSize;
    const angle = Math.asin(zTile / hypot) * RADIAN_TO_ANGLE;

    if (n === '1100') {
      nData.nTransform = `rotateY(${angle}deg) scaleX(${scale})`;
      nData.anchor = 'right';
    }
    if (n === '0110') {
      nData.nTransform = `rotateX(-${angle}deg) scaleY(${scale})`;
      nData.anchor = 'bottom';
    }
    if (n === '1001') {
      nData.nTransform = `rotateX(${angle}deg) scaleY(${scale})`;
      nData.anchor = 'top';
    }
    if (n === '0011') {
      nData.nTransform = `rotateY(-${angle}deg) scaleX(${scale})`;
      nData.anchor = 'left';
    }
    return nData;
  }

  // three-up ramps
  if (threeUpRamps.has(n)) {
    const adjacent = 1.41421356237 * tileSize * 0.5;
    const opposite = zTile;
    const singleCornerAngle = Math.atan(opposite / adjacent) * RADIAN_TO_ANGLE;
    const squareDiagonal = 1.41421356237 * tileSize;
    const desiredLength = Math.hypot(zTile, squareDiagonal / 2);
    const lengthScale = desiredLength / (tileSize / 2);

    nData.showSurface = true;
    nData.surfaceOffset = 1;

    const z = zStep * tileSize;

    // bottom
    if (n === '1110') {
      nData.surfaceClipPath = 'polygon(100% 0%, 0% 100%, 0% 0%)';
      nData.clipPath = 'polygon(0% 0, 100% 50%, 0% 100%)';
      nData.nTransform = `
      translateZ(${z}px)
      rotateZ(45deg)
      rotateY(${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${lengthScale / 2})
      translateX(50%)`;
    }

    // top
    if (n === '1011') {
      nData.surfaceClipPath = 'polygon(100% 0, 0 100%, 100% 100%)';
      nData.clipPath = 'polygon(100% 0, 0% 50%, 100% 100%)';
      nData.nTransform = `
      translateZ(${z}px)
      rotateZ(45deg)
      rotateY(-${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${lengthScale / 2})
      translateX(-50%)
      `;
    }

    // left
    if (n === '1101') {
      nData.surfaceClipPath = 'polygon(0% 100%, 100% 100%, 0% 0%)';
      nData.clipPath = 'polygon(0 100%, 50% 0, 100% 100%)';
      nData.nTransform = `
      translateZ(${z}px)
      rotateZ(45deg)
      rotateX(${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${lengthScale / 2})
      translateY(-50%)`;
    }

    // right
    if (n === '0111') {
      nData.surfaceClipPath = 'polygon(100% 100%, 0 0, 100% 0)';
      nData.clipPath = 'polygon(0 0%, 50% 100%, 100% 0%)';
      nData.nTransform = `
      translateZ(${z}px)
      rotateZ(45deg)
      rotateX(-${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${lengthScale / 2})
      translateY(50%)`;
    }

    return nData;
  }

  // 1100, 0011 which are not done yet
  return nData;
}

function Face({ z, tileSize, style, debug }: any) {
  return (
    <div
      className={`absolute transition-all`}
      style={{
        height: `${tileSize}px`,
        width: `${tileSize}px`,
        transitionDuration: `${100 + Math.abs(floorHeight + z) * 50}ms`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        ...style,
      }}
    >
      {debug}
    </div>
  );
}

const baseColor = '#1C2A3B';
export function Tile({
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

  const {
    showSurface,
    surfaceClipPath,
    surfaceOffset,
    anchor,
    nTransform,
    nOffset,
    clipPath,
    fill,
  } = getRamp({
    tileSize,
    zStep,
    n: neighbors,
  });

  const toTranslate3d = (offset = 0) => `translate3d(
    ${xOffset}px,
    ${yOffset}px,
    ${zOffset + offset * (zStep * tileSize)}px
  )`;
  const translate3d = toTranslate3d(nOffset);

  return (
    <>
      {/* ground */}
      <Face
        // debug={`${z}${neighbors}`}
        style={{
          backgroundColor:
            fill || getColorFromZ(z, nOffset + (nTransform ? 0.5 : 0)),
          boxShadow: `inset 0 0 0 1px ${baseColor}`,
          transform: `${translate3d} ${nTransform}`,
          clipPath,
          transformOrigin: anchor,
        }}
        tileSize={tileSize}
        z={z}
      />
      {/* duplicate ground plane used by masked 1-up and 3-up triangles */}
      <Face
        style={{
          boxShadow: `inset 0 0 0 1px ${baseColor}`,
          transform: `${toTranslate3d(surfaceOffset)}`,
          opacity: showSurface ? 1 : 0,
          transformOrigin: anchor,
          backgroundColor: getColorFromZ(z, surfaceOffset),
          clipPath: surfaceClipPath,
        }}
        tileSize={tileSize}
        z={z}
      />
      {/* bottom side plane */}
      <Face
        style={{
          transform: `${translate3d} rotateX(90deg) scaleY(${zBase})`,
          transformOrigin: 'bottom',
          background: baseColor,
        }}
        tileSize={tileSize}
        z={z}
      />
      {/* right side plane */}
      <Face
        style={{
          transform: `${translate3d} rotateY(90deg) scaleX(${zBase}) translateX(100%)`,
          transformOrigin: 'right',
          background: baseColor,
        }}
        tileSize={tileSize}
        z={z}
      />
    </>
  );
}
