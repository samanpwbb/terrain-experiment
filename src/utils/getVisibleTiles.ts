import { makeNumberGenerator } from '../terrain-gen/defaultGenerator';
import { TILE, Terrain, Tile } from './processData';

// Naive function to scatter some decorations on the terrain, basically at random.
// Could be moved into terrain-gen and made nice at some point.
function applyVegetation({
  tile,
  stablePosition,
}: {
  tile: Tile;
  stablePosition: [number, number];
}) {
  const generator = makeNumberGenerator(
    Number(`1${Math.abs(stablePosition[0])}${Math.abs(stablePosition[1])}`),
  );

  const isPlant =
    tile[TILE.SIGNATURE] === 0b0000 && tile[TILE.Z] > 2 && generator() > 0.5;

  if (isPlant) {
    let type = 'tree' as 'weed' | 'bush' | 'tree';

    if (
      tile[TILE.L_NEIGHBOR] ||
      tile[TILE.U_NEIGHBOR] ||
      tile[TILE.R_NEIGHBOR] ||
      tile[TILE.D_NEIGHBOR] ||
      generator() > 0.7
    ) {
      type = 'bush';
    }

    if (type === 'bush') {
      if (generator() > 0.5) {
        type = 'weed';
      }
    }
    tile[TILE.VEGETATION] = type;
    tile[TILE.VEGETATION_ROTATION] = generator() * 360;
    tile[TILE.VEGETATION_SCALE] = generator() * 0.2 + 0.9;
  }
}

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
    const isLimitRight = i === perimeter;
    for (let j = 0; j <= perimeter; j++) {
      const stablePosition = [x + (i - half), y + (j - half)] as [
        number,
        number,
      ];
      const key = `${stablePosition.join(',')}`;
      if (tiles[key]) {
        const modified = [...tiles[key]] as Tile;
        const isLimitBottom = j === perimeter;
        if (isLimitBottom) {
          modified[TILE.D_NEIGHBOR] = NaN;
        }
        if (isLimitRight) {
          modified[TILE.R_NEIGHBOR] = NaN;
        }

        const fadeVal =
          Math.sqrt((i - raw_half) ** 2 + (j - raw_half) ** 2) / (half - 1);
        modified[TILE.FADE] = Math.min(1, fadeVal ** 2);

        applyVegetation({
          tile: modified,
          stablePosition,
        });

        visibleTiles[key] = modified;
      }
    }
  }
  return visibleTiles;
}
