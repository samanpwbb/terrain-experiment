import { getNeighborElevations } from './getNeighbors';

export function smooth(curr: number, ...more: number[]) {
  const vals = [curr, ...more].map((v) => (isNaN(v) ? curr : v)) as number[];
  const avg = Math.floor(vals.reduce((a, b) => a + b, 0) / vals.length);
  if (avg < 3) return 2;
  return avg;
}

export function smoothAll(ground: number[][]) {
  return ground.map((row, i) => {
    return row.map((tile, j) => {
      const val = tile;
      return smooth(val, ...getNeighborElevations(i, j, ground));
    });
  });
}
