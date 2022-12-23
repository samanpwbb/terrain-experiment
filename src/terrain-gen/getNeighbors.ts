const neighborPositions = [
  [-1, 0],
  [0, -1],
  [0, 1],
  [1, 0],
];

const neighborPositionsWithDiagonals = [
  [-1, 0],
  [-1, -1],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, -1],
];

export function getNeighborPositions(
  x: number,
  y: number,
  ground: number[][],
  includeDiagonals = true,
) {
  const positions = includeDiagonals
    ? neighborPositionsWithDiagonals
    : neighborPositions;
  return positions
    .map(([nx, ny]) => [y + ny, x + nx])
    .filter((n) => !isNaN(ground[n[0]]?.[n[1]]));
}

export function getNeighborElevations(
  x: number,
  y: number,
  ground: number[][],
  includeDiagonals = true,
) {
  const positions = includeDiagonals
    ? neighborPositionsWithDiagonals
    : neighborPositions;
  return positions
    .map(([nx, ny]) => ground[y + ny]?.[x + nx])
    .filter((n) => !isNaN(n));
}

export function getNeighborsNeighbors(
  baseX: number,
  baseY: number,
  ground: number[][],
  radius = 1,
) {
  const visitedSet = new Set([`${baseX},${baseY}`]);
  const neighbors = [[baseX, baseY]] as number[][];
  const neighborElevations = [] as number[];

  function updateSingle([x, y]: number[], [nx, ny]: number[]) {
    const str = `${x + nx}${y + ny}`;
    const _x = x + nx;
    const _y = y + ny;
    const val = ground[_y]?.[_x];
    if (!isNaN(ground[_y]?.[_x]) && !visitedSet.has(str)) {
      neighbors.push([_x, _y]);
      visitedSet.add(str);
      neighborElevations.push(val);
    }
  }

  function updateNeighbors(x: number, y: number) {
    neighborPositions.forEach(([nx, ny]) => updateSingle([x, y], [nx, ny]));
  }

  for (let i = 0; i < radius; i++) {
    neighbors.forEach(([visitedX, visitedY]) => {
      updateNeighbors(visitedX, visitedY);
    });
  }

  return neighborElevations;
}
