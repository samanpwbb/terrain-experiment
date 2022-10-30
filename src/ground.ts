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

export type Tile = [x: number, y: number, z: number, ramp: string];
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

function wiggle(v: number, g: () => number, mod = 2) {
  const nv = Math.min(9, Math.max(0, Math.floor(v + (mod * g() - 0.5))));
  if (nv < 3) return 2;
  if (nv < 5) return 4;

  return nv;
}

const cliffThreshold = 3;
function getNeighbors(x: number, y: number, rows: string[], z: number): string {
  const lValDiff = Number(rows[y][x - 1]) - z;
  const l = lValDiff > 0 && lValDiff < cliffThreshold ? 1 : 0;
  const uValDiff = Number(rows[y - 1]?.[x]) - z;
  const u = uValDiff > 0 && uValDiff < cliffThreshold ? 1 : 0;
  const rValDiff = Number(rows[y][x + 1]) - z;
  const r = rValDiff > 0 && rValDiff < cliffThreshold ? 1 : 0;
  const dValDiff = Number(rows[y + 1]?.[x]) - z;
  const d = dValDiff > 0 && dValDiff < cliffThreshold ? 1 : 0;
  return `${l}${u}${r}${d}`;
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
