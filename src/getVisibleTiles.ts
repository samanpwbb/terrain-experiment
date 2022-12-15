import { TILE, Terrain } from './processData';

export function getVisibleTiles(
  tiles: Terrain,
  center: [number, number],
  perimeter: number,
): Terrain {
  const visibleTiles = {} as Terrain;
  const [x, y] = center;
  const raw_half = perimeter / 2;
  const half = Math.round(raw_half);
  for (let i = 0; i <= perimeter; i++) {
    for (let j = 0; j <= perimeter; j++) {
      const tile = tiles[`${x + (i - half)},${y + (j - half)}`];
      if (tile) {
        tile[TILE.X] = i - half;
        tile[TILE.Y] = j - half;

        // fade gradually from center in a radius
        const fadeVal =
          Math.sqrt((i - raw_half) ** 2 + (j - raw_half) ** 2) / (half + 0.25);
        tile[TILE.FADE] = Math.min(1, fadeVal ** 2);

        visibleTiles[`${x + (i - half)},${y + (j - half)}`] = tile;
      }
    }
  }
  return visibleTiles;
}
