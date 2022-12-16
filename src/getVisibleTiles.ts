import { TILE, Terrain } from './processData';

export function getVisibleTiles(
  tiles: Terrain,
  center: [number, number],
  perimeter: number,
  fade: boolean,
): Terrain {
  const visibleTiles = {} as Terrain;
  const [x, y] = center;
  const raw_half = perimeter / 2;
  const half = Math.round(raw_half);

  for (let i = 0; i <= perimeter; i++) {
    // const isLimitBottom = i - raw_half === 0;
    for (let j = 0; j <= perimeter; j++) {
      const tile = tiles[`${x + (i - half)},${y + (j - half)}`];
      if (tile) {
        // todo: this is not working.
        // const isLimitRight = j - raw_half === 0;
        // if (isLimitBottom) {
        //   tile[TILE.D_NEIGHBOR] = NaN;
        // }
        // if (isLimitRight) {
        //   tile[TILE.R_NEIGHBOR] = NaN;
        // }

        if (fade) {
          const fadeVal =
            Math.sqrt((i - raw_half) ** 2 + (j - raw_half) ** 2) / half;
          tile[TILE.FADE] = Math.min(1, fadeVal ** 2);
        }

        visibleTiles[`${x + (i - half)},${y + (j - half)}`] = tile;
      }
    }
  }
  return visibleTiles;
}
