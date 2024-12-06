import { makeNoise2D } from 'fast-simplex-noise';
import { defaultGenerator } from './defaultGenerator';
import { updateAll } from './updateAll';
import { getNeighborElevations } from './getNeighbors';
import { smoothAll } from './smooth';

function fill(perimeter: number, height = 0) {
  const ground = [] as number[][];
  for (let y = 0; y < perimeter; y++) {
    ground[y] = [];
    for (let x = 0; x < perimeter; x++) {
      ground[y][x] = height;
    }
  }
  return ground;
}

export function generateNaturalGround(
  levels = 10,
  perimeter = 10,
  baseHeight = 0,
) {
  let ground = fill(perimeter, baseHeight);
  const generator = makeNoise2D(defaultGenerator);

  function raiseNoise(
    v: number,
    x: number,
    y: number,
    baseH: number,
    ground: number[][],
    threshHold: number,
  ) {
    const gen = generator(x, y);
    const neighbors = getNeighborElevations(x, y, ground, true);
    if (
      v === baseH - 1 &&
      gen > threshHold &&
      neighbors.every((n) => n === baseH - 1 || isNaN(n))
    ) {
      return baseH;
    }
    return v;
  }

  function grow(
    v: number,
    x: number,
    y: number,
    baseH: number,
    ground: number[][],
  ) {
    const neighbors = getNeighborElevations(x, y, ground, true);
    if (v === baseH - 1 && neighbors.some((n) => n === baseH)) {
      return baseH;
    }
    return v;
  }

  for (let i = 0; i < levels; i++) {
    ground = updateAll(ground, (v, x, y) =>
      raiseNoise(v, x, y, baseHeight + i, ground, 0.4 + i * 0.05),
    );

    ground = updateAll(ground, (v, x, y) =>
      grow(v, x, y, baseHeight + i, ground),
    );
  }

  return smoothAll(ground);
}
