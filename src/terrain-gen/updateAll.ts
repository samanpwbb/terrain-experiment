import { getNeighborPositions } from './getNeighbors';

export function updateAll(
  ground: number[][],
  updater: (v: number, x: number, y: number) => number,
) {
  const perimeter = ground[0].length;
  const center = Math.floor(perimeter / 2);
  const queue = [[center, center]];
  const visited = new Set<string>();
  const newGround = [] as number[][];

  while (queue.length) {
    const [x, y] = queue.shift()!;
    const key = `${x},${y}`;
    if (visited.has(key)) {
      continue;
    }

    visited.add(key);
    const v = ground[y][x];
    if (!newGround[y]) {
      newGround[y] = [];
    }
    newGround[y][x] = updater(v, x, y);
    const neighbors = getNeighborPositions(x, y, ground, false);
    for (const [nx, ny] of neighbors) {
      queue.push([nx, ny]);
    }
  }
  return newGround;
}

export function mutateAll(
  ground: number[][],
  updater: (v: number, x: number, y: number) => number,
) {
  const perimeter = ground[0].length;
  const center = Math.floor(perimeter / 2);
  const queue = [[center, center]];
  const visited = new Set<string>();

  while (queue.length) {
    const [x, y] = queue.shift()!;
    const key = `${x},${y}`;
    if (visited.has(key)) {
      continue;
    }

    visited.add(key);
    const v = ground[y][x];
    ground[y][x] = updater(v, x, y);
    const neighbors = getNeighborPositions(x, y, ground, false);
    for (const [nx, ny] of neighbors) {
      queue.push([nx, ny]);
    }
  }
}
