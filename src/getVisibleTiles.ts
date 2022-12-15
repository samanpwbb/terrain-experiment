import { Terrain } from './processData';

export function getVisibleTiles(
  tiles: Terrain,
  center: [number, number],
  perimeter: number,
): Terrain {
  const visibleTiles = {} as Terrain;
  const [x, y] = center;
  console.log(tiles);
  const half = Math.round(perimeter / 2);
  for (let i = 0; i <= perimeter; i++) {
    for (let j = 0; j <= perimeter; j++) {
      const tile = tiles[`${x + (i - half)},${y + (j - half)}`];
      console.log(`${x + (i - half)},${y + (j - half)}`);
      if (tile) {
        tile[0] = i - half;
        tile[1] = j - half;
        visibleTiles[`${x + (i - half)},${y + (j - half)}`] = tile;
      }
    }
  }
  return visibleTiles;
}
