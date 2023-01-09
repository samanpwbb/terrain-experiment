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
