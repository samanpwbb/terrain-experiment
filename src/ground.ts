import { makeNoise2D } from 'fast-simplex-noise';

function makeNumberGenerator(seed: number) {
  const generate = () => {
    const x = Math.sin(seed++) * 10000;
    const val = x - Math.floor(x);
    return val;
  };
  return generate;
}
const defaultGenerator = makeNumberGenerator(1);

export { defaultGenerator, makeNumberGenerator };

export function groundToTiles(ground: string) {
  return ground
    .split('\n')
    .map((row) => row.split('').map((tile) => parseInt(tile)));
}

export type Tile = [x: number, y: number, z: number, neighbors: string];
export type Ground = Tile[];

export function generateGround(
  levels = 10,
  rand = defaultGenerator,
  perimeter = 10,
  forceZ: number | undefined = undefined,
) {
  const noiseGenerator = makeNoise2D(rand);
  let ground = '';
  for (let i = 0; i < perimeter; i++) {
    let row1 = '';
    for (let j = 0; j < perimeter; j++) {
      const v = noiseGenerator(i, j);
      if (forceZ !== undefined) {
        row1 += forceZ;
      } else {
        const val = Math.floor(((v + 1) / 2) * levels);
        row1 += val;
      }
    }
    ground += `${row1}\n`;
  }
  return ground;
}

export function generateExpandedGround(
  levels = 10,
  rand = defaultGenerator,
  perimeter = 10,
  forceZ: number | undefined = undefined,
) {
  const noiseGenerator = makeNoise2D(rand);
  let ground = '';
  for (let i = 0; i < perimeter; i++) {
    let row1 = '',
      row2 = '',
      row3 = '';
    for (let j = 0; j < perimeter; j++) {
      const v = noiseGenerator(i, j);
      if (forceZ !== undefined) {
        row1 += forceZ;
        row2 += forceZ;
        row3 += forceZ;
      } else {
        const val = Math.floor(((v + 1) / 2) * levels);
        row1 += `${wiggle(val, rand)}${wiggle(val, rand)}${wiggle(val, rand)}`;
        row2 += `${wiggle(val, rand)}${wiggle(val, rand)}${wiggle(val, rand)}`;
        row3 += `${wiggle(val, rand)}${wiggle(val, rand)}${wiggle(val, rand)}`;
      }
    }
    ground += `${row1}\n`;
    ground += `${row2}\n`;
    ground += `${row3}\n`;
  }
  return ground;
}

function wiggle(v: number, g: () => number, mod = 0.8) {
  const nv = Math.min(9, Math.max(0, Math.floor(v + (mod * g() - 0.5))));
  if (nv < 3) return 2;
  return nv;
}

const cliffThreshold = 1.1;
function getEntry(
  x: number,
  y: number,
  z: number,
  neighborZs: {
    l: number;
    lu: number;
    u: number;
    ru: number;
    r: number;
    rd: number;
    d: number;
    ld: number;
  },
  invalidPositions: Set<string>,
  diff = cliffThreshold,
): Tile {
  /*
   *
   *  ..2..
   *  .1.3.
   *  8...4
   *  .7.5.
   *  ..6..
   *
   */
  const lDiff = neighborZs.l - z;
  const l = lDiff > 0 && lDiff < diff;

  const luDiff = neighborZs.lu - z;
  const lu = luDiff > 0 && luDiff < diff;

  const uDiff = neighborZs.u - z;
  const u = uDiff > 0 && uDiff < diff;

  const ruDiff = neighborZs.ru - z;
  const ru = ruDiff > 0 && ruDiff < diff;

  const rDiff = neighborZs.r - z;
  const r = rDiff > 0 && rDiff < diff;

  const rdDiff = neighborZs.rd - z;
  const rd = rdDiff > 0 && rdDiff < diff;

  const dDiff = neighborZs.d - z;
  const d = dDiff > 0 && dDiff < diff;

  const ldDiff = neighborZs.ld - z;
  const ld = ldDiff > 0 && ldDiff < diff;

  // prettier-ignore
  const sig = [
    (l || ld || d),
    (l || lu || u),
    (u || ru || r),
    (r || rd || d),
  ]
    .map((v) => (v ? 1 : 0))
    .join('');

  if (sig === '1111') {
    // add all neighbors to invalid positions, we need to re-calc them
    // basically this has a smoothing effect.
    invalidPositions.add([x - 1, y - 1].join(','));
    invalidPositions.add([x, y - 1].join(','));
    invalidPositions.add([x + 1, y - 1].join(','));
    invalidPositions.add([x - 1, y].join(','));
    invalidPositions.add([x + 1, y].join(','));
    invalidPositions.add([x - 1, y + 1].join(','));
    invalidPositions.add([x, y + 1].join(','));
    invalidPositions.add([x + 1, y + 1].join(','));
    return getEntry(x, y, z + 1, neighborZs, invalidPositions);
  }

  return [x, y, z, sig];
}

export function groundToData(ground: string): Ground {
  const rows = ground.split('\n');
  const invalidPositions = new Set<string>();
  const output = rows.map((row, y) => {
    return row.split('').map((zStr, x) => {
      const z = parseInt(zStr);
      return getEntry(
        x,
        y,
        z,
        {
          l: Number(rows[y]?.[x - 1]),
          lu: Number(rows[y - 1]?.[x - 1]),
          u: Number(rows[y - 1]?.[x]),
          ru: Number(rows[y - 1]?.[x + 1]),
          r: Number(rows[y][x + 1]),
          rd: Number(rows[y + 1]?.[x + 1]),
          d: Number(rows[y + 1]?.[x]),
          ld: Number(rows[y + 1]?.[x - 1]),
        },
        invalidPositions,
      );
    });
  });

  while (invalidPositions.size > 0) {
    Array.from(invalidPositions).forEach((posStr) => {
      const [x, y] = posStr.split(',').map((v) => parseInt(v));

      invalidPositions.delete(posStr);

      if (!output[y]?.[x]) return;

      output[y][x] = getEntry(
        x,
        y,
        output[y][x][2],
        {
          l: output[y]?.[x - 1]?.[2],
          lu: output[y - 1]?.[x - 1]?.[2],
          u: output[y - 1]?.[x]?.[2],
          ru: output[y - 1]?.[x + 1]?.[2],
          r: output[y][x + 1]?.[2],
          rd: output[y + 1]?.[x + 1]?.[2],
          d: output[y + 1]?.[x]?.[2],
          ld: output[y + 1]?.[x - 1]?.[2],
        },
        invalidPositions,
      );
    });
  }

  return output.flat();
}
