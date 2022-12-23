import { makeNoise2D } from 'fast-simplex-noise';
import { defaultGenerator } from './defaultGenerator';
import { smooth } from './smooth';
import { wiggle } from './wiggle';

export function generateExpandedGround(
  levels = 10,
  rand = defaultGenerator,
  perimeter = 10,
  forceZ: number | undefined = undefined,
) {
  const noiseGenerator = makeNoise2D(rand);
  const ground = [] as number[][];
  for (let i = 0; i < perimeter; i++) {
    const row1 = [] as number[],
      row2 = [] as number[],
      row3 = [] as number[];
    for (let j = 0; j < perimeter; j++) {
      const v = noiseGenerator(i, j);
      if (forceZ !== undefined) {
        row1.push(forceZ);
        row2.push(forceZ);
        row3.push(forceZ);
      } else {
        const val = Math.floor(((v + 1) / 2) * levels);
        row1.push(
          wiggle(val, rand, 3, levels - 1),
          wiggle(val, rand, 3, levels - 1),
          wiggle(val, rand, 3, levels - 1),
        );
        row2.push(
          wiggle(val, rand, 3, levels - 1),
          wiggle(val, rand, 3, levels - 1),
          wiggle(val, rand, 3, levels - 1),
        );
        row3.push(
          wiggle(val, rand, 3, levels - 1),
          wiggle(val, rand, 3, levels - 1),
          wiggle(val, rand, 3, levels - 1),
        );
      }
    }
    ground.push(row1, row2, row3);
  }
  // apply smoothing to all tiles
  return ground.map((row, i) => {
    return row.map((tile, j) => {
      const val = tile;
      const up = ground[i - 1]?.[j];
      const upLeft = ground[i - 1]?.[j - 1];
      const upRight = ground[i - 1]?.[j + 1];
      const down = ground[i + 1]?.[j];
      const downLeft = ground[i + 1]?.[j - 1];
      const downRight = ground[i + 1]?.[j + 1];
      const left = ground[i]?.[j - 1];
      const right = ground[i]?.[j + 1];
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
    });
  });
}