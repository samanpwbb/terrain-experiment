import { scale, RADIAN_TO_ANGLE } from './perspective-utils';
import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
import { memo, CSSProperties } from 'react';
extend([mixPlugin]);

const bgColor = '#1E293B';
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
  const data = {
    // primary plane
    transform: '',
    extraZOffset: 0,
    clipPath: '',
    anchor: '',
    fill: '',

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
    data.extraZOffset = 1;
    return data;
  }

  // split ramps
  if (splitRamps.has(s)) {
    const adjacent = SQ2 * tileSize * 0.5;
    const opposite = zTile;
    const singleCornerAngle = Math.atan(opposite / adjacent) * RADIAN_TO_ANGLE;
    const squareDiagonal = SQ2 * tileSize;
    const desiredLength = Math.hypot(zTile, squareDiagonal / 2);
    const lengthScale = desiredLength / (tileSize / 2);

    data.xyPlaneShow = true;
    data.xyPlaneOffset = 0.5;

    const z = zStep * tileSize;

    // bottom
    if (s === 0b1010) {
      data.clipPath = 'polygon(0% 0, 100% 50%, 0% 100%)';
      data.xyPlaneClipPath = 'polygon(100% 0, 0% 50%, 100% 100%)';
      data.xyPlaneTransform = `
      translateZ(${z / 2}px)
      rotateZ(45deg)
      rotateY(-${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${lengthScale / 2})
      translateX(-50%)`;

      data.transform = `
      translateZ(${z}px)
      rotateZ(45deg)
      rotateY(${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${lengthScale / 2})
      translateX(50%)`;
    }

    if (s === 0b0101) {
      data.clipPath = 'polygon(0 100%, 50% 0, 100% 100%)';
      data.transform = `
      translateZ(${z}px)
      rotateZ(45deg)
      rotateX(${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${lengthScale / 2})
      translateY(-50%)`;

      data.xyPlaneClipPath = 'polygon(0 0%, 50% 100%, 100% 0%)';
      data.xyPlaneTransform = `
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
    data.xyPlaneShow = true;
    // up
    if (s === 0b0100) {
      data.clipPath = 'polygon(100% 0, 0 50%, 100% 100%)';
      data.xyPlaneClipPath = 'polygon(100% 0%, 100% 100%, 0% 100%)';
      data.transform = `
      rotateZ(45deg)
      rotateY(${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${xScale / 2})
      translateX(-50%)`;
    }

    // down
    if (s === 0b0001) {
      data.clipPath = 'polygon(0% 0, 100% 50%, 0% 100%)';
      data.xyPlaneClipPath = 'polygon(100% 0%, 0% 0%, 0% 100%)';
      data.transform = `
      rotateZ(45deg)
      rotateY(-${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${xScale / 2})
      translateX(50%)`;
    }

    // left
    if (s === 0b1000) {
      data.xyPlaneClipPath = 'polygon(100% 0%, 0% 0%, 100% 100%)';
      data.clipPath = 'polygon(0 0%, 50% 100%, 100% 0%)';
      data.transform = `
      rotateZ(45deg)
      rotateX(${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${xScale / 2})
      translateY(50%)`;
    }

    // right
    if (s === 0b0010) {
      data.xyPlaneShow = true;
      data.clipPath = 'polygon(0 100%, 50% 0%, 100% 100%)';
      data.xyPlaneClipPath = 'polygon(100% 100%, 0% 100%, 0% 0%)';

      data.transform = `
      rotateZ(45deg)
      rotateX(-${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${xScale / 2})
      translateY(-50%)`;
    }

    return data;
  }

  // two-up ramps
  if (twoUpRamps.has(s)) {
    const hypot = Math.hypot(tileSize, zTile);
    const scale = hypot / tileSize;
    const angle = Math.asin(zTile / hypot) * RADIAN_TO_ANGLE;

    if (s === 0b1100) {
      data.transform = `rotateY(${angle}deg) scaleX(${scale})`;
      data.anchor = 'right';
    }
    if (s === 0b0110) {
      data.transform = `rotateX(-${angle}deg) scaleY(${scale})`;
      data.anchor = 'bottom';
    }
    if (s === 0b1001) {
      data.transform = `rotateX(${angle}deg) scaleY(${scale})`;
      data.anchor = 'top';
    }
    if (s === 0b0011) {
      data.transform = `rotateY(-${angle}deg) scaleX(${scale})`;
      data.anchor = 'left';
    }
    return data;
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

    data.xyPlaneShow = true;
    data.xyPlaneOffset = 1;

    // bottom
    if (s === 0b1110) {
      data.xyPlaneClipPath = 'polygon(100% 0%, 0% 100%, 0% 0%)';
      data.clipPath = 'polygon(0% 0, 100% 50%, 0% 100%)';
      data.transform = `
      translateZ(${z}px)
      rotateZ(${rotateZ}deg)
      rotateY(${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${lengthScale / 2})
      translateX(50%)`;
    }

    // top
    if (s === 0b1011) {
      data.xyPlaneClipPath = 'polygon(100% 0, 0 100%, 100% 100%)';
      data.clipPath = 'polygon(100% 0, 0% 50%, 100% 100%)';
      data.transform = `
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
      data.xyPlaneClipPath = 'polygon(0% 100%, 100% 100%, 0% 0%)';
      data.clipPath = 'polygon(0 100%, 50% 0, 100% 100%)';
      data.transform = `
      translateZ(${z}px)
      rotateZ(${rotateZ}deg)
      rotateX(${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${lengthScale / 2})
      translateY(-50%)`;
    }

    // right
    if (s === 0b0111) {
      data.xyPlaneClipPath = 'polygon(100% 100%, 0 0, 100% 0)';
      data.clipPath = 'polygon(0 0%, 50% 100%, 100% 0%)';
      data.transform = `
      translateZ(${z}px)
      rotateZ(${rotateZ}deg)
      rotateX(-${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${lengthScale / 2})
      translateY(50%)`;
    }

    return data;
  }

  return data;
}

function Face({
  z,
  color,
  tileSize,
  style,
  debug,
}: {
  z: number;
  tileSize: number;
  style: CSSProperties;
  debug?: string;
  color: string;
}) {
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
        backgroundColor: color,
        border: `4px solid ${bgColor}99`,
        ...style,
      }}
    >
      {debug}
    </div>
  );
}

interface RampEdgeData {
  transform: string;
  clip: string;
  anchor: string;
  fill?: string;
  zMod: number;
}

function getZMod(s: number) {
  if (oneUpRamps.has(s)) return 0.5;
  if (twoUpRamps.has(s)) return 0.5;
  if (threeUpRamps.has(s)) return 0.5;
  return 0;
}

function getRampEdgeData(
  s: number,
  diffs: number[],
  scale: number,
  isLimitBottom: boolean,
  isLimitRight: boolean,
): [RampEdgeData | null, RampEdgeData | null] {
  const result = [null, null] as [RampEdgeData | null, RampEdgeData | null];

  // bottom
  const bottomIsVisible = isLimitBottom || diffs[3] < 0;
  if (
    bottomIsVisible &&
    (s === 0b1100 || s === 0b1010 || s === 0b1110 || s === 0b1000)
  ) {
    result[0] = {
      transform: `rotateX(90deg) scaleY(${scale}) translateY(100%)`,
      anchor: 'bottom',
      clip: 'polygon(0 0, 100% 0, 0 100%)',
      zMod: getZMod(s),
      fill: isLimitBottom ? bgColor : undefined,
    };
  }

  // bottom
  if (
    bottomIsVisible &&
    (s === 0b1011 ||
      s === 0b0011 ||
      s === 0b0111 ||
      s === 0b0001 ||
      s === 0b0101)
  ) {
    result[0] = {
      transform: `rotateX(90deg) scaleY(${scale}) translateY(100%)`,
      anchor: 'bottom',
      clip: s === 0b1011 ? '' : 'polygon(0 0, 100% 0, 100% 100%)',
      zMod: getZMod(s),
      fill: isLimitBottom ? bgColor : undefined,
    };
  }

  // right
  const rightIsVisible = isLimitRight || diffs[2] < 0;
  if (
    rightIsVisible &&
    (s === 0b0111 ||
      s === 0b0110 ||
      s === 0b1110 ||
      s === 0b1010 ||
      s === 0b0010)
  ) {
    result[1] = {
      transform: `rotateY(90deg) scaleX(${scale})`,
      anchor: 'right',
      clip: s === 0b0111 ? '' : 'polygon(0 0, 100% 0, 100% 100%)',
      zMod: getZMod(s),
      fill: isLimitRight ? bgColor : undefined,
    };
  }

  // right
  if (
    rightIsVisible &&
    (s === 0b1011 ||
      s === 0b0011 ||
      s === 0b1001 ||
      s === 0b1101 ||
      s === 0b0001 ||
      s === 0b0101)
  ) {
    result[1] = {
      transform: `rotateY(90deg) scaleX(${scale})`,
      anchor: 'right',
      clip:
        s === 0b1011 || s === 0b0011
          ? ''
          : 'polygon(0 100%, 100% 0, 100% 100%)',
      zMod: getZMod(s),
      fill: isLimitRight ? bgColor : undefined,
    };
  }

  return result;
}

function getRampPaneBackground(
  rampEdgeData: RampEdgeData | null,
  z: number,
  getColorFromZ: (z: number, offset: number) => string,
  tint: 'bottom' | 'right' | null,
) {
  if (!rampEdgeData) return '';

  if (rampEdgeData.fill) return rampEdgeData.fill;

  if (tint === 'bottom') {
    return colord(getColorFromZ(z, rampEdgeData.zMod))
      .mix(bgColor, 0.25)
      .toHex();
  }

  if (tint === 'right') {
    return colord(getColorFromZ(z, rampEdgeData?.zMod))
      .mix(bgColor, 0.66)
      .toHex();
  }

  return getColorFromZ(z, rampEdgeData?.zMod);
}

export function Tile({
  x,
  y,
  z,
  tileSize,
  signature,
  diffs,
  getColorFromZ,
}: {
  tileSize: number;
  x: number;
  y: number;
  z: number;
  signature: number;
  // [0, 1, 2, 3] = [left, up, right, down]
  diffs: number[];
  getColorFromZ: (z: number, offset: number) => string;
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
    transform,
    extraZOffset,
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

  const translate3d = toTranslate3d(extraZOffset);

  const isLimitBottom = isNaN(diffs[3]);
  const isLimitRight = isNaN(diffs[2]);
  const showBottomPane = diffs[3] < -1 || isLimitBottom;
  const showRightPane = diffs[2] < -1 || isLimitRight;
  const sideIdxBottom = isLimitBottom ? z : -diffs[3];
  const sideIdxRight = isLimitRight ? z : -diffs[2];

  const edges = getRampEdgeData(
    signature,
    diffs,
    zStep,
    isLimitBottom,
    isLimitRight,
  );

  return (
    <>
      {/* duplicate x and y panes to fill gaps created by  ramp panes */}
      {edges.map((rampEdgeData, i) => (
        <Face
          color={getRampPaneBackground(
            rampEdgeData,
            z,
            getColorFromZ,
            rampEdgeData?.anchor as 'bottom' | 'right',
          )}
          key={i}
          style={{
            opacity: rampEdgeData ? 1 : 0,
            transform: `${translate3d} ${rampEdgeData?.transform}`,
            transformOrigin: rampEdgeData?.anchor,
            clipPath: rampEdgeData?.clip,
          }}
          tileSize={tileSize}
          z={z}
        />
      ))}

      {/* z facing pane */}
      <Face
        // debug={printNumberAsBase2(signature)}
        color={fill || getColorFromZ(z, extraZOffset + (transform ? 0.5 : 0))}
        style={{
          transform: `${translate3d} ${transform}`,
          clipPath,
          transformOrigin: anchor,
        }}
        tileSize={tileSize}
        z={z}
      />

      {/* duplicate z facing plane used by masked 1-up and 3-up triangles */}
      <Face
        color={getColorFromZ(z, xyPlaneOffset)}
        style={{
          transform: `${toTranslate3d(xyPlaneOffset)} ${xyPlaneTransform}`,
          opacity: xyPlaneShow ? 1 : 0,
          transformOrigin: anchor,
          clipPath: xyPlaneClipPath,
        }}
        tileSize={tileSize}
        z={z}
      />

      {/* y facing plane */}
      <Face
        color={
          isLimitBottom
            ? bgColor
            : colord(getColorFromZ(z, xyPlaneOffset)).mix(bgColor, 0.25).toHex()
        }
        style={{
          opacity: showBottomPane ? 1 : 0,
          transform: `${translate3d} rotateX(90deg) scaleY(${
            sideIdxBottom * zStep
          })`,
          transformOrigin: 'bottom',
        }}
        tileSize={tileSize}
        z={z}
      />

      {/* x facing plane */}
      <Face
        color={
          isLimitRight
            ? bgColor
            : colord(getColorFromZ(z, xyPlaneOffset)).mix(bgColor, 0.66).toHex()
        }
        style={{
          opacity: showRightPane ? 1 : 0,
          transform: `${translate3d} rotateY(90deg) scaleX(${
            sideIdxRight * zStep
          }) translateX(100%)`,
          transformOrigin: 'right',
        }}
        tileSize={tileSize}
        z={z}
      />
    </>
  );
}

export const MemoizedTile = memo(Tile);
