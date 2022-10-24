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

export function generateGround(
  levels = 10,
  seed = defaultGenerator,
  perimeter = 10,
  forceZ: number | undefined = undefined,
) {
  const noiseGenerator = makeNoise2D(seed);
  let ground = '';
  for (let i = 0; i < perimeter; i++) {
    for (let j = 0; j < perimeter; j++) {
      const v = noiseGenerator(i, j);
      if (forceZ !== undefined) {
        ground += forceZ;
      } else {
        ground += Math.floor(((v + 1) / 2) * levels);
      }
    }
    ground += '\n';
  }
  return ground;
}

export function groundToData(ground: string) {
  return ground
    .split('\n')
    .map((row, y) => {
      return row.split('').map((tile, x) => {
        return [x, y, parseInt(tile)];
      });
    })
    .flat();
}
