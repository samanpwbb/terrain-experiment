import { getColorFromZ } from './colors';
import { scale, RADIAN_TO_ANGLE } from './perspective-utils';
import { colord } from 'colord';

const floorHeight = 0;
const stepSize = 0.25;
const SQ2 = 1.41421356237;

const oneUpRamps = new Set([0b1000, 0b0010, 0b0100, 0b0001]);
const twoUpRamps = new Set([0b1100, 0b0110, 0b1001, 0b0011]);
const threeUpRamps = new Set([0b1110, 0b1101, 0b1011, 0b0111]);
const splitRamps = new Set([0b1010, 0b0101]);

function getRamp({
  s,
  tileSize,
  zStep,
}: {
  s: number;
  tileSize: number;
  zStep: number;
}) {
  const nData = {
    // primary plane
    nTransform: '',
    clipPath: '',
    anchor: '',
    fill: '',
    nOffset: 0,

    // secondary plane, only used for ramps that use half a tile.
    xyPlaneShow: false,
    xyPlaneOffset: 0,
    xyPlaneClipPath: '',
    xyPlaneTransform: '',
  };

  //        |\
  //  ztile | \  scale
  //        |  \
  //        |___\
  //        xtile
  //
  const zTile = zStep * tileSize;

  if (s === 0b1111) {
    nData.nOffset = 1;
    return nData;
  }

  // split ramps
  if (splitRamps.has(s)) {
    const adjacent = 1.41421356237 * tileSize * 0.5;
    const opposite = zTile;
    const singleCornerAngle = Math.atan(opposite / adjacent) * RADIAN_TO_ANGLE;
    const squareDiagonal = 1.41421356237 * tileSize;
    const desiredLength = Math.hypot(zTile, squareDiagonal / 2);
    const lengthScale = desiredLength / (tileSize / 2);

    nData.xyPlaneShow = true;
    nData.xyPlaneOffset = 0.5;

    const z = zStep * tileSize;

    // bottom
    if (s === 0b1010) {
      nData.clipPath = 'polygon(0% 0, 100% 50%, 0% 100%)';
      nData.xyPlaneClipPath = 'polygon(100% 0, 0% 50%, 100% 100%)';
      nData.xyPlaneTransform = `
      translateZ(${z / 2}px)
      rotateZ(45deg)
      rotateY(-${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${lengthScale / 2})
      translateX(-50%)`;

      nData.nTransform = `
      translateZ(${z}px)
      rotateZ(45deg)
      rotateY(${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${lengthScale / 2})
      translateX(50%)`;
    }

    if (s === 0b0101) {
      nData.clipPath = 'polygon(0 100%, 50% 0, 100% 100%)';
      nData.nTransform = `
      translateZ(${z}px)
      rotateZ(45deg)
      rotateX(${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${lengthScale / 2})
      translateY(-50%)`;

      nData.xyPlaneClipPath = 'polygon(0 0%, 50% 100%, 100% 0%)';
      nData.xyPlaneTransform = `
      translateZ(${z / 2}px)
      rotateZ(45deg)
      rotateX(-${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${lengthScale / 2})
      translateY(50%)`;
    }
  }

  // one-up ramps
  if (oneUpRamps.has(s)) {
    const adjacent = SQ2 * tileSize * 0.5;
    const opposite = zTile;
    const singleCornerAngle = Math.atan(opposite / adjacent) * RADIAN_TO_ANGLE;
    const squareDiagonal = SQ2 * tileSize;
    const desiredLength = Math.hypot(zTile, squareDiagonal / 2);
    const xScale = desiredLength / (tileSize / 2);
    nData.xyPlaneShow = true;
    // up
    if (s === 0b0100) {
      nData.clipPath = 'polygon(100% 0, 0 50%, 100% 100%)';
      nData.xyPlaneClipPath = 'polygon(100% 0%, 100% 100%, 0% 100%)';
      nData.nTransform = `
      rotateZ(45deg)
      rotateY(${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${xScale / 2})
      translateX(-50%)`;
    }

    // down
    if (s === 0b0001) {
      nData.clipPath = 'polygon(0% 0, 100% 50%, 0% 100%)';
      nData.xyPlaneClipPath = 'polygon(100% 0%, 0% 0%, 0% 100%)';
      nData.nTransform = `
      rotateZ(45deg)
      rotateY(-${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${xScale / 2})
      translateX(50%)`;
    }

    // left
    if (s === 0b1000) {
      nData.xyPlaneClipPath = 'polygon(100% 0%, 0% 0%, 100% 100%)';
      nData.clipPath = 'polygon(0 0%, 50% 100%, 100% 0%)';
      nData.nTransform = `
      rotateZ(45deg)
      rotateX(${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${xScale / 2})
      translateY(50%)`;
    }

    // right
    if (s === 0b0010) {
      nData.xyPlaneShow = true;
      nData.clipPath = 'polygon(0 100%, 50% 0%, 100% 100%)';
      nData.xyPlaneClipPath = 'polygon(100% 100%, 0% 100%, 0% 0%)';

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
  if (twoUpRamps.has(s)) {
    const hypot = Math.hypot(tileSize, zTile);
    const scale = hypot / tileSize;
    const angle = Math.asin(zTile / hypot) * RADIAN_TO_ANGLE;

    if (s === 0b1100) {
      nData.nTransform = `rotateY(${angle}deg) scaleX(${scale})`;
      nData.anchor = 'right';
    }
    if (s === 0b0110) {
      nData.nTransform = `rotateX(-${angle}deg) scaleY(${scale})`;
      nData.anchor = 'bottom';
    }
    if (s === 0b1001) {
      nData.nTransform = `rotateX(${angle}deg) scaleY(${scale})`;
      nData.anchor = 'top';
    }
    if (s === 0b0011) {
      nData.nTransform = `rotateY(-${angle}deg) scaleX(${scale})`;
      nData.anchor = 'left';
    }
    return nData;
  }

  // three-up ramps
  if (threeUpRamps.has(s)) {
    const adjacent = 1.41421356237 * tileSize * 0.5;
    const opposite = zTile;
    const singleCornerAngle = Math.atan(opposite / adjacent) * RADIAN_TO_ANGLE;
    const squareDiagonal = 1.41421356237 * tileSize;
    const desiredLength = Math.hypot(zTile, squareDiagonal / 2);
    const lengthScale = desiredLength / (tileSize / 2);
    const z = zStep * tileSize;
    const rotateZ = 45;

    nData.xyPlaneShow = true;
    nData.xyPlaneOffset = 1;

    // bottom
    if (s === 0b1110) {
      nData.xyPlaneClipPath = 'polygon(100% 0%, 0% 100%, 0% 0%)';
      nData.clipPath = 'polygon(0% 0, 100% 50%, 0% 100%)';
      nData.nTransform = `
      translateZ(${z}px)
      rotateZ(${rotateZ}deg)
      rotateY(${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${lengthScale / 2})
      translateX(50%)`;
    }

    // top
    if (s === 0b1011) {
      nData.xyPlaneClipPath = 'polygon(100% 0, 0 100%, 100% 100%)';
      nData.clipPath = 'polygon(100% 0, 0% 50%, 100% 100%)';
      nData.nTransform = `
      translateZ(${z}px)
      rotateZ(${rotateZ}deg)
      rotateY(-${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${lengthScale / 2})
      translateX(-50%)
      `;
    }

    // left
    if (s === 0b1101) {
      nData.xyPlaneClipPath = 'polygon(0% 100%, 100% 100%, 0% 0%)';
      nData.clipPath = 'polygon(0 100%, 50% 0, 100% 100%)';
      nData.nTransform = `
      translateZ(${z}px)
      rotateZ(${rotateZ}deg)
      rotateX(${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${lengthScale / 2})
      translateY(-50%)`;
    }

    // right
    if (s === 0b0111) {
      nData.xyPlaneClipPath = 'polygon(100% 100%, 0 0, 100% 0)';
      nData.clipPath = 'polygon(0 0%, 50% 100%, 100% 0%)';
      nData.nTransform = `
      translateZ(${z}px)
      rotateZ(${rotateZ}deg)
      rotateX(-${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${lengthScale / 2})
      translateY(50%)`;
    }

    return nData;
  }

  return nData;
}

function Face({ z, tileSize, style, debug }: any) {
  return (
    <div
      className={`absolute`}
      style={{
        height: `${tileSize}px`,
        width: `${tileSize}px`,
        transition: `all ${
          100 + Math.abs(floorHeight + z) * 50
        }ms, clip-path 0ms`,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        fontSize: 8,
        ...style,
      }}
    >
      {debug}
    </div>
  );
}

function printNumberAsBase2(n: number) {
  return (n >>> 0).toString(2).padStart(4, '0');
}

interface RampEdgeData {
  transform: string;
  clip: string;
  anchor: string;
  fill?: string;
  zMod: number;
}

function getZMod(s: number) {
  if (oneUpRamps.has(s)) return 0;
  if (twoUpRamps.has(s)) return 0.5;
  if (threeUpRamps.has(s)) return 0.5;
  return 0;
}

function getRampEdgeData(
  s: number,
  diffs: number[],
  scale: number,
): [RampEdgeData | null, RampEdgeData | null] {
  // bottom
  const result = [null, null] as [RampEdgeData | null, RampEdgeData | null];

  if (diffs[3] < 0 && (s === 0b1100 || s === 0b1110 || s === 0b1000)) {
    result[0] = {
      transform: `rotateX(90deg) scaleY(${scale}) translateY(100%)`,
      anchor: 'bottom',
      clip: 'polygon(0 0, 100% 0, 0 100%)',
      zMod: getZMod(s),
    };
  }

  // bottom
  if (diffs[3] < 0 && (s === 0b0011 || s === 0b0111 || s === 0b0001)) {
    result[0] = {
      transform: `rotateX(90deg) scaleY(${scale}) translateY(100%)`,
      anchor: 'bottom',
      clip: 'polygon(0 0, 100% 0, 100% 100%)',
      zMod: getZMod(s),
    };
  }

  // right
  if (
    diffs[2] < 0 &&
    (s === 0b0110 || s === 0b1110 || s === 0b1010 || s === 0b0010)
  ) {
    result[1] = {
      transform: `rotateY(90deg) scaleX(${scale})`,
      anchor: 'right',
      clip: 'polygon(0 0, 100% 0, 100% 100%)',
      zMod: getZMod(s),
    };
  }

  // right
  if (
    diffs[2] < 0 &&
    (s === 0b1001 || s === 0b1101 || s === 0b0001 || s === 0b0101)
  ) {
    result[1] = {
      transform: `rotateY(90deg) scaleX(${scale})`,
      anchor: 'right',
      clip: 'polygon(0 100%, 100% 0, 100% 100%)',
      zMod: getZMod(s),
    };
  }

  return result;
}

const baseColor = '#1C2A3B';
export function Tile({
  x,
  y,
  z,
  tileSize,
  signature,
  diffs,
}: {
  tileSize: number;
  x: number;
  y: number;
  z: number;
  signature: number;
  // [0, 1, 2, 3] = [left, up, right, down]
  diffs: number[];
}) {
  const zStep = scale * stepSize;
  const zBase = floorHeight + z * zStep;
  const zOffset = zBase * tileSize;
  const xOffset = x * tileSize;
  const yOffset = y * tileSize;

  const {
    xyPlaneShow,
    xyPlaneClipPath,
    xyPlaneOffset,
    xyPlaneTransform,
    anchor,
    nTransform,
    nOffset,
    clipPath,
    fill,
  } = getRamp({
    tileSize,
    zStep,
    s: signature,
  });

  const toTranslate3d = (offset = 0) => `translate3d(
    ${xOffset}px,
    ${yOffset}px,
    ${zOffset + offset * (zStep * tileSize)}px
  )`;

  const translate3d = toTranslate3d(nOffset);
  const showBottomPane = diffs[3] < -1 && !isNaN(diffs[3]);
  const showRightPane = diffs[2] < -1 && !isNaN(diffs[2]);
  const edges = getRampEdgeData(signature, diffs, zStep);

  return (
    <>
      {/* right ramp pane */}
      {edges.map((rampEdgeData, i) => (
        <Face
          key={i}
          style={{
            opacity: rampEdgeData ? 1 : 0,
            transform: `${translate3d} ${
              rampEdgeData ? rampEdgeData.transform : ''
            }`,
            transformOrigin: rampEdgeData ? rampEdgeData.anchor : '',
            clipPath: rampEdgeData ? rampEdgeData.clip : '',
            background:
              rampEdgeData?.fill || rampEdgeData?.anchor === 'bottom'
                ? colord(getColorFromZ(z, rampEdgeData?.zMod))
                    .lighten(0.05)
                    .desaturate(0.1)
                    .toHex()
                : rampEdgeData
                ? colord(getColorFromZ(z, rampEdgeData?.zMod))
                    .darken(0.05)
                    .desaturate(0.1)
                    .toHex()
                : '',
          }}
          tileSize={tileSize}
          z={z}
        />
      ))}

      {/* ground */}
      <Face
        // debug={`${printNumberAsBase2(signature)}`}
        style={{
          boxShadow: `inset 0 0 0 1px ${baseColor}33`,
          backgroundColor:
            fill || getColorFromZ(z, nOffset + (nTransform ? 0.5 : 0)),
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
          boxShadow: `inset 0 0 0 1px ${baseColor}33`,
          transform: `${toTranslate3d(xyPlaneOffset)} ${xyPlaneTransform}`,
          opacity: xyPlaneShow ? 1 : 0,
          transformOrigin: anchor,
          backgroundColor: getColorFromZ(z, xyPlaneOffset),
          clipPath: xyPlaneClipPath,
        }}
        tileSize={tileSize}
        z={z}
      />

      {/* bottom side plane */}
      <Face
        style={{
          opacity: showBottomPane ? 1 : 0,
          boxShadow: `inset 0 0 0 1px ${baseColor}33`,
          transform: `${translate3d} rotateX(90deg) scaleY(${
            -diffs[3] * zStep
          })`,
          transformOrigin: 'bottom',
          background: colord(getColorFromZ(z, xyPlaneOffset))
            .lighten(0.05)
            .desaturate(0.1)
            .toHslString(),
        }}
        tileSize={tileSize}
        z={z}
      />
      {/* right side plane */}
      <Face
        style={{
          opacity: showRightPane ? 1 : 0,
          boxShadow: `inset 0 0 0 1px ${baseColor}33`,
          transform: `${translate3d} rotateY(90deg) scaleX(${
            -diffs[2] * zStep
          }) translateX(100%)`,
          transformOrigin: 'right',
          background: colord(getColorFromZ(z, xyPlaneOffset))
            .darken(0.05)
            .desaturate(0.1)
            .toHslString(),
        }}
        tileSize={tileSize}
        z={z}
      />
    </>
  );
}
