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

export const ground1 = `
0000000000
0000000000
0000000000
0000000000
0000000000
0000000000
0000000000
0000000000
0000000000
0000000000
`;

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

function wiggle(v: number, g: () => number, mod = 1) {
  const nv = Math.min(9, Math.max(0, Math.floor(v + (mod * g() - 0.5))));
  if (nv < 3) return 2;
  return nv;
}

const cliffThreshold = 10;
function getNeighbors(
  x: number,
  y: number,
  rows: string[],
  z: number,
  diff = cliffThreshold,
): string {
  /*
   *
   *  ..2..
   *  .1.3.
   *  8...4
   *  .7.5.
   *  ..6..
   *
   */
  const lValDiff = Number(rows[y][x - 1]) - z;
  const l = lValDiff > 0 && lValDiff < diff;

  const luValDiff = Number(rows[y - 1]?.[x - 1]) - z;
  const lu = luValDiff > 0 && luValDiff < diff;

  const uValDiff = Number(rows[y - 1]?.[x]) - z;
  const u = uValDiff > 0 && uValDiff < diff;

  const ruValDiff = Number(rows[y - 1]?.[x + 1]) - z;
  const ru = ruValDiff > 0 && ruValDiff < diff;

  const rValDiff = Number(rows[y][x + 1]) - z;
  const r = rValDiff > 0 && rValDiff < diff;

  const rdValDiff = Number(rows[y + 1]?.[x + 1]) - z;
  const rd = rdValDiff > 0 && rdValDiff < diff;

  const dValDiff = Number(rows[y + 1]?.[x]) - z;
  const d = dValDiff > 0 && dValDiff < diff;

  const ldValDiff = Number(rows[y + 1]?.[x - 1]) - z;
  const ld = ldValDiff > 0 && ldValDiff < diff;

  const sig = [l || ld || d, l || lu || u, u || ru || r, r || rd || d]
    .map((v) => (v ? 1 : 0))
    .join('');

  return sig;
}

export function groundToData(ground: string): Ground {
  const rows = ground.split('\n');
  return rows
    .map((row, y) => {
      return row.split('').map((zStr, x) => {
        const z = parseInt(zStr);
        return [x, y, z, getNeighbors(x, y, rows, z)] as Tile;
      });
    })
    .flat();
}
