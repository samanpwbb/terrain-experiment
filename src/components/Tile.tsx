import { BASE_SCALE, RADIAN_TO_ANGLE } from '../utils/perspectiveUtils';
import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
import { TILE, Tile as TileType } from '../utils/processData';
import { SQ2 } from '../utils/mathUtils';
import { TileFace } from './TileFace';

extend([mixPlugin]);

const oneUpRamps = new Set([0b1000, 0b0010, 0b0100, 0b0001]);
const twoUpRamps = new Set([0b1100, 0b0110, 0b1001, 0b0011]);
const threeUpRamps = new Set([0b1110, 0b1101, 0b1011, 0b0111]);
const splitRamps = new Set([0b1010, 0b0101]);

// s is a 4-bit signature of the tile's neighbors.
// 0b1000 = left
// 0b0100 = top
// 0b0010 = right
// 0b0001 = bottom
function getRamp({
  tileSize,
  zStep,
  tile,
}: {
  tileSize: number;
  zStep: number;
  tile: TileType;
}) {
  const s = tile[TILE.SIGNATURE];

  const data = {
    // primary z plane
    transform: '',
    clipPath: '',
    anchor: '',
    fill: '',

    // secondary z plane, used for ramps that use half a tile.
    showExtraZPlane: false,
    extraZPlaneOffset: 0,
    extraZPlaneClipPath: '',
    extraZPlaneTransform: '',
    extraZPlaneAnchor: '',
  };

  const zTile = zStep * tileSize;

  // This case wil never happen, we convert 0b1111 to 0b0000 on the next
  // z level up in processData.
  if (s === 0b1111) {
    return data;
  }

  // split ramps
  if (splitRamps.has(s)) {
    const squareDiagonal = SQ2 * tileSize;
    const adjacent = squareDiagonal * 0.5;
    const opposite = zTile;
    const singleCornerAngle = Math.atan(opposite / adjacent) * RADIAN_TO_ANGLE;
    const desiredLength = Math.hypot(zTile, squareDiagonal / 2);
    const lengthScale = desiredLength / (tileSize / 2);

    data.showExtraZPlane = true;
    data.extraZPlaneOffset = 0.5;

    // bottom
    if (s === 0b1010) {
      // |\.
      // | \
      // | /
      // |/.
      data.clipPath = 'polygon(0 0, 100% 50%, 0 100%)';
      data.anchor = 'bottom left';
      data.transform = `
      translateZ(${zTile}px)
      rotateZ(45deg)
      rotateY(${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${lengthScale / 2})`;

      // ./|
      // / |
      // \ |
      // .\|
      data.extraZPlaneClipPath = 'polygon(0 50%, 100% 0%, 100% 100%)';
      data.extraZPlaneTransform = `
      translateZ(${zTile}px)
      rotateZ(45deg)
      rotateY(-${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${lengthScale / 2})
      translateX(-100%)`;
    }

    if (s === 0b0101) {
      // ./\.
      // /  \
      // ----
      data.clipPath = 'polygon(50% 0, 100% 100%, -0% 100%)';
      data.anchor = 'bottom right';
      data.transform = `
      translateZ(${zTile}px)
      rotateZ(45deg)
      rotateX(${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${lengthScale / 2})`;

      // ----
      // \  /
      // .\/.
      data.extraZPlaneClipPath = 'polygon(0 0, 50% 100%, 100% 0)';
      data.extraZPlaneTransform = `
      translateZ(${zTile}px)
      rotateZ(45deg)
      rotateX(-${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${lengthScale / 2})
      translateY(100%)
      `;
    }
  }

  // one-up ramps
  if (oneUpRamps.has(s)) {
    const squareDiagonal = SQ2 * tileSize;
    const adjacent = squareDiagonal * 0.5;
    const opposite = zTile;
    const singleCornerAngle = Math.atan(opposite / adjacent) * RADIAN_TO_ANGLE;
    const desiredLength = Math.hypot(zTile, squareDiagonal / 2);
    const xScale = desiredLength / (tileSize / 2);
    data.showExtraZPlane = true;

    // up
    if (s === 0b0100) {
      // . /|
      //  / |
      // /  |
      // ----
      // this extra plane is rendered as a half-triangle, but we don't need to
      // bother clipping it because it is occluded by the primary z plane

      // ./|
      // / |
      // \ |
      // .\|
      data.clipPath = 'polygon(100% 0, 0 50%, 100% 100%)';
      data.anchor = 'top right';
      data.transform = `
      rotateZ(45deg)
      rotateY(${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${xScale / 2})`;
    }

    // down
    if (s === 0b0001) {
      // ----
      // |  /
      // | /
      // |/ .
      // this extra plane is rendered as a half-triangle, but we don't need to
      // bother clipping it because it is occluded by the primary z plane

      // |\.
      // | \
      // | /
      // |/.
      data.clipPath = 'polygon(0 0, 100% 50%, 0 100%)';
      data.anchor = 'bottom left';
      data.transform = `
      rotateZ(45deg)
      rotateY(-${singleCornerAngle}deg)
      scaleY(${SQ2})
      scaleX(${xScale / 2})`;
    }

    // left
    if (s === 0b1000) {
      // ----
      // \  |
      //  \ |
      // . \|
      // this extra plane is rendered as a half-triangle, but we don't need to
      // bother clipping it because it is occluded by the primary z plane

      // ----
      // \  /
      // .\/.
      data.clipPath = 'polygon(0 0, 50% 100%, 100% 0)';
      data.anchor = 'top left';
      data.transform = `
      rotateZ(45deg)
      rotateX(${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${xScale / 2})`;
    }

    // right
    if (s === 0b0010) {
      // |\ .
      // | \
      // |  \
      // ----
      // this extra plane is rendered as a half-triangle, but we don't need to
      // bother clipping it because it is occluded by the primary z plane

      // ./\.
      // /  \
      // ----
      data.clipPath = 'polygon(0 100%, 50% 0, 100% 100%)';
      data.anchor = 'bottom right';
      data.transform = `
      rotateZ(45deg)
      rotateX(-${singleCornerAngle}deg)
      scaleX(${SQ2})
      scaleY(${xScale / 2})`;
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
    const squareDiagonal = SQ2 * tileSize;
    const adjacent = squareDiagonal * 0.5;
    const opposite = zTile;
    const singleCornerAngle = Math.atan(opposite / adjacent) * RADIAN_TO_ANGLE;
    const desiredLength = Math.hypot(zTile, squareDiagonal / 2);
    const lengthScale = desiredLength / (tileSize / 2);
    const z = zStep * tileSize;
    const rotateZ = 45;

    data.showExtraZPlane = true;
    data.extraZPlaneOffset = 1;
    data.extraZPlaneTransform = `translateZ(${z}px)`;

    // bottom
    if (s === 0b1110) {
      // ----
      // |  /
      // | /
      // |/ .
      data.extraZPlaneClipPath = 'polygon(0 0, 100% 0, 0 100%)';

      if (tile[TILE.LU_NEIGHBOR] === 2) {
        // ./|
        // / |
        // \ |
        // .\|
        data.extraZPlaneClipPath = 'polygon(100% 0, 0 50%, 100% 100%)';
        data.extraZPlaneAnchor = 'top right';
        data.extraZPlaneOffset = 2;
        data.extraZPlaneTransform = `
        translateZ(${z}px)
        rotateZ(${rotateZ}deg)
        rotateY(${singleCornerAngle}deg)
        scaleY(${SQ2}) scaleX(${lengthScale / 2})`;
      }

      // |\.
      // | \
      // | /
      // |/.
      data.clipPath = 'polygon(0 0, 100% 50%, 0 100%)';
      data.anchor = 'bottom left';
      data.transform = `
      translateZ(${z}px)
      rotateZ(${rotateZ}deg)
      rotateY(${singleCornerAngle}deg)
      scaleY(${SQ2}) scaleX(${lengthScale / 2})`;
    }

    // top
    if (s === 0b1011) {
      // . /|
      //  / |
      // /  |
      // ----
      data.extraZPlaneClipPath = 'polygon(100% 0%, 100% 100%, 0% 100%)';

      if (tile[TILE.RD_NEIGHBOR] === 2) {
        // |\.
        // | \
        // | /
        // |/.
        data.extraZPlaneClipPath = 'polygon(0 0, 100% 50%, 0 100%)';
        data.extraZPlaneAnchor = 'bottom left';
        data.extraZPlaneOffset = 2;
        data.extraZPlaneTransform = `
        translateZ(${z}px)
        rotateZ(${rotateZ}deg)
        rotateY(-${singleCornerAngle}deg)
        scaleY(${SQ2}) scaleX(${lengthScale / 2})`;
      }

      // ./|
      // / |
      // \ |
      // .\|
      data.clipPath = 'polygon(100% 0, 0 50%, 100% 100%)';
      data.anchor = 'top right';
      data.transform = `
      translateZ(${z}px)
      rotateZ(${rotateZ}deg)
      rotateY(-${singleCornerAngle}deg)
      scaleY(${SQ2}) scaleX(${lengthScale / 2})`;
    }

    // left
    if (s === 0b1101) {
      // |\ .
      // | \
      // |  \
      // ----
      data.extraZPlaneClipPath = 'polygon(0 0%, 100% 100%, 0 100%)';

      if (tile[TILE.LD_NEIGHBOR] === 2) {
        data.extraZPlaneClipPath = 'polygon(0 0, 50% 100%, 100% 0)';
        data.extraZPlaneAnchor = 'top left';
        data.extraZPlaneOffset = 2;
        data.extraZPlaneTransform = `
      translateZ(${z}px)
      rotateZ(${rotateZ}deg)
      rotateX(${singleCornerAngle}deg)
      scaleX(${SQ2}) scaleY(${lengthScale / 2})`;
      }

      // ./\.
      // /  \
      // ----
      data.clipPath = 'polygon(0 100%, 50% 0, 100% 100%)';
      data.anchor = 'bottom right';
      data.transform = `
      translateZ(${z}px)
      rotateZ(${rotateZ}deg)
      rotateX(${singleCornerAngle}deg)
      scaleX(${SQ2}) scaleY(${lengthScale / 2})`;
    }

    // right
    if (s === 0b0111) {
      // ----
      // \  |
      //  \ |
      // . \|
      data.extraZPlaneClipPath = 'polygon(0% 0, 100% 0, 100% 100%)';

      if (tile[TILE.RU_NEIGHBOR] === 2) {
        // ./\.
        // /  \
        // ----
        data.extraZPlaneClipPath = 'polygon(50% 0, 100% 100%, -0% 100%)';
        data.extraZPlaneAnchor = 'bottom right';
        data.extraZPlaneOffset = 2;
        data.extraZPlaneTransform = `
        translateZ(${zTile}px)
        rotateZ(45deg)
        rotateX(-${singleCornerAngle}deg)
        scaleX(${SQ2})
        scaleY(${lengthScale / 2})`;
      }

      // ----
      // \  /
      // .\/.
      data.clipPath = 'polygon(0 0, 50% 100%, 100% 0)';
      data.anchor = 'top left';
      data.transform = `
      translateZ(${z}px)
      rotateZ(${rotateZ}deg)
      rotateX(-${singleCornerAngle}deg)
      scaleX(${SQ2}) scaleY(${lengthScale / 2})`;
    }

    return data;
  }

  return data;
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
  bgColor: string,
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
  bgColor: string,
) {
  if (!rampEdgeData) return '';

  if (rampEdgeData.fill) return rampEdgeData.fill;

  if (tint === 'bottom') {
    return colord(getColorFromZ(z, rampEdgeData.zMod))
      .mix(bgColor, 0.2)
      .toHex();
  }

  if (tint === 'right') {
    return colord(getColorFromZ(z, rampEdgeData?.zMod))
      .mix(bgColor, 0.3)
      .toHex();
  }

  return getColorFromZ(z, rampEdgeData?.zMod);
}

export function Tile({
  bgColor = 'rgb(51 65 85)',
  getColorFromZ,
  tileSize,
  stepSize = 0.25,
  tileProps,
}: {
  tileSize: number;
  getColorFromZ: (z: number, offset: number) => string;
  bgColor?: string;
  stepSize?: number;
  tileProps: TileType;
}) {
  const [, , z, signature, l, u, r, d, lu, ru, rd, ld, fade] = tileProps;

  const diffs = [l, u, r, d, lu, ru, rd, ld];
  const zStep = BASE_SCALE * stepSize;
  const {
    showExtraZPlane,
    extraZPlaneClipPath,
    extraZPlaneOffset,
    extraZPlaneTransform,
    extraZPlaneAnchor,
    anchor,
    transform,
    clipPath,
    fill,
  } = getRamp({
    tileSize,
    zStep,
    tile: tileProps,
  });

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
    bgColor,
  );

  return (
    <>
      {/* duplicate x and y panes to fill gaps created by  ramp panes */}
      {edges.map((rampEdgeData, i) => {
        if (!rampEdgeData) return null;

        return (
          <TileFace
            bgColor={bgColor}
            color={getRampPaneBackground(
              rampEdgeData,
              z,
              getColorFromZ,
              rampEdgeData?.anchor as 'bottom' | 'right',
              bgColor,
            )}
            fade={fade}
            key={i}
            style={{
              transform: `${rampEdgeData?.transform}`,
              transformOrigin: rampEdgeData?.anchor,
              clipPath: rampEdgeData?.clip,
              transition: 'none',
            }}
          />
        );
      })}
      {/* z facing pane */}
      <TileFace
        bgColor={bgColor}
        color={fill || getColorFromZ(z, transform ? 0.5 : 0)}
        fade={fade}
        style={{
          transform: `${transform}`,
          clipPath,
          transformOrigin: anchor,
          overflow: 'visible',
        }}
      />
      {/* duplicate z facing plane used by masked 1-up and 3-up triangles */}
      {showExtraZPlane && (
        <TileFace
          bgColor={bgColor}
          color={getColorFromZ(z, extraZPlaneOffset)}
          fade={fade}
          style={{
            transform: `${extraZPlaneTransform}`,
            transformOrigin: extraZPlaneAnchor || anchor,
            clipPath: extraZPlaneClipPath,
          }}
        />
      )}

      {/* y facing plane */}
      {showBottomPane && (
        <TileFace
          bgColor={bgColor}
          color={
            isLimitBottom
              ? bgColor
              : colord(getColorFromZ(z, extraZPlaneOffset))
                  .mix(bgColor, 0.2)
                  .toHex()
          }
          fade={fade}
          style={{
            transform: `rotateX(90deg) scaleY(${sideIdxBottom * zStep})`,
            transformOrigin: 'bottom',
          }}
        />
      )}
      {/* x facing plane */}
      {showRightPane && (
        <TileFace
          bgColor={bgColor}
          color={
            isLimitRight
              ? bgColor
              : colord(getColorFromZ(z, extraZPlaneOffset))
                  .mix(bgColor, 0.3)
                  .toHex()
          }
          fade={fade}
          style={{
            transform: `rotateY(90deg) scaleX(${
              sideIdxRight * zStep
            }) translateX(100%)`,
            transformOrigin: 'right',
          }}
        />
      )}
    </>
  );
}
