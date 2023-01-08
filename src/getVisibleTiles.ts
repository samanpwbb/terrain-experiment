import { TILE, Terrain, Tile } from './processData';

const terrainCache = {} as {
  [key: string]: {
    type: 'weed' | 'bush' | 'tree';
    rotation: number;
    scale: number;
  };
};

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
  const raw_half = PerimeterWithBuffer / 2;
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
          modified[TILE.FADE] = Math.min(1, fadeVal ** 2);
        }

        // This is pretty hacky but hey this is just a demo!
        const isPlant =
          modified[TILE.SIGNATURE] === 0b0000 && modified[TILE.Z] > 2;
        if (isPlant) {
          let type = 'tree' as 'weed' | 'bush' | 'tree';

          if (
            modified[TILE.L_NEIGHBOR] ||
            modified[TILE.U_NEIGHBOR] ||
            modified[TILE.R_NEIGHBOR] ||
            modified[TILE.D_NEIGHBOR] ||
            Math.random() > 0.7
          ) {
            type = 'bush';
          }

          if (type === 'bush') {
            if (Math.random() > 0.5) {
              type = 'weed';
            }
          }

          if (!terrainCache[key]) {
            terrainCache[key] = {
              type,
              rotation: Math.random() * 360,
              scale: Math.random() * 0.2 + 0.9,
            };
          }

          modified[TILE.VEGETATION] = terrainCache[key].type;
          modified[TILE.VEGETATION_ROTATION] = terrainCache[key].rotation;
          modified[TILE.VEGETATION_SCALE] = terrainCache[key].scale;
        }

        visibleTiles[key] = modified;
      }
    }
  }
  return visibleTiles;
}
