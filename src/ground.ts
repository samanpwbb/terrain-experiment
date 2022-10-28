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

export type Tile = [x: number, y: number, z: number];
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
  console.log(ground);
  return ground;
}

function wiggle(v: number, g: () => number, mod = 2) {
  const nv = Math.min(9, Math.max(0, Math.floor(v + (mod * g() - 0.5))));
  if (nv < 3) return 2;
  if (nv < 5) return 4;

  return nv;
}

export function groundToData(ground: string): Ground {
  return ground
    .split('\n')
    .map((row, y) => {
      return row.split('').map((tile, x) => {
        return [x, y, parseInt(tile)] as Tile;
      });
    })
    .flat();
}
