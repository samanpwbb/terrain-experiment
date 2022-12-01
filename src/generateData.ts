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

function smooth(curr: number, ...more: number[]) {
  const vals = [curr, ...more].filter((v) => !isNaN(v)) as number[];
  const avg = Math.floor(vals.reduce((a, b) => a + b, 0) / vals.length);
  if (avg < 3) return 2;
  return avg;
}

// TODO: start in center and radiate out rather than starting top left.
export function generateSimpleGround(
  levels = 10,
  rand = Math.random,
  perimeter = 10,
  forceZ: number | undefined = undefined,
) {
  const noiseGenerator = makeNoise2D(rand);
  const rows = [];
  for (let i = 0; i < perimeter; i++) {
    let row = '';
    for (let j = 0; j < perimeter; j++) {
      const v = noiseGenerator(i, j);
      if (forceZ !== undefined) {
        row += forceZ;
      } else {
        const val = Math.round(((v + 1) / 2) * levels);
        row += smooth(
          val,
          Number(row.charAt(j - 1)),
          Number(rows[i - 1]?.charAt(j)),
          Number(rows[i - 1]?.charAt(j - 1)),
          Number(rows[i - 1]?.charAt(j + 1)),
        );
      }
    }
    rows.push(row);
  }
  return rows.join('\n');
}

export function generateExpandedGround(
  levels = 10,
  rand = defaultGenerator,
  perimeter = 10,
  forceZ: number | undefined = undefined,
) {
  const noiseGenerator = makeNoise2D(rand);
  const ground = [] as string[];
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
    ground.push(row1, row2, row3);
  }
  // apply smoothing to all tiles
  return ground
    .map((row, i) => {
      return row
        .split('')
        .map((tile, j) => {
          const val = Number(tile);
          const up = Number(ground[i - 1]?.charAt(j));
          const upLeft = Number(ground[i - 1]?.charAt(j - 1));
          const upRight = Number(ground[i - 1]?.charAt(j + 1));
          const down = Number(ground[i + 1]?.charAt(j));
          const downLeft = Number(ground[i + 1]?.charAt(j - 1));
          const downRight = Number(ground[i + 1]?.charAt(j + 1));
          const left = Number(ground[i]?.charAt(j - 1));
          const right = Number(ground[i]?.charAt(j + 1));
          return smooth(
            val,
            up,
            down,
            left,
            right,
            upLeft,
            upRight,
            downLeft,
            downRight,
          );
        })
        .join('');
    })
    .join('\n');
}

function wiggle(v: number, g: () => number, mod = 2) {
  const nv = Math.min(9, Math.max(0, Math.floor(v + (mod * g() - 0.5))));
  return nv;
}
