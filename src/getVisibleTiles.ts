import { TILE, Terrain, Tile } from './processData';

export function getVisibleTiles(
  tiles: Terrain,
  center: [number, number],
  perimeter: number,
  fade: boolean,
  buffer: number,
): Terrain {
  const visibleTiles = {} as Terrain;
  const [x, y] = center;
  const PerimeterWithBuffer = perimeter + buffer * 2;
  const raw_half = perimeter / 2;
  const half = Math.round(raw_half);

  for (let i = 0; i <= PerimeterWithBuffer; i++) {
    const isLimitRight = i === PerimeterWithBuffer;
    for (let j = 0; j <= PerimeterWithBuffer; j++) {
      const key = `${x + (i - half)},${y + (j - half)}`;
      if (tiles[key]) {
        const modified = [...tiles[key]] as Tile;
        const isLimitBottom = j === PerimeterWithBuffer;
        if (isLimitBottom) {
          modified[TILE.D_NEIGHBOR] = NaN;
        }
        if (isLimitRight) {
          modified[TILE.R_NEIGHBOR] = NaN;
        }

        if (fade) {
          const fadeVal =
            Math.sqrt((i - raw_half) ** 2 + (j - raw_half) ** 2) /
            (half - buffer);
          modified[TILE.FADE] = Math.min(1, fadeVal ** 3);
        }

        visibleTiles[key] = modified;
      }
    }
  }
  return visibleTiles;
}
