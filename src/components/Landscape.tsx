import { processData, TILE } from '../utils/processData';
import { Tile } from './Tile';
import { makeGetColorFromZ } from '../utils/makeGetColorFromZ';
import { useMemo } from 'react';
import { getVisibleTiles } from '../utils/getVisibleTiles';
import { Positioner } from './Positioner';
import { SvgFilters } from './SvgFilters';
import { Decoration } from './Decorations';
import { stepSize } from '../constants';

export function Landscape({
  tileSize,
  terrainData,
  colors,
  perimeter,
  pixelate,
  bgColor,
  center,
  x,
  z,
}: {
  tileSize: number;
  perimeter: number;
  terrainData: number[][];
  colors: string[];
  pixelate: boolean;
  bgColor: string;
  center: [number, number];
  x: number;
  z: number;
}) {
  const getColorFromZ = useMemo(() => makeGetColorFromZ(colors), [colors]);
  const tiles = useMemo(() => processData(terrainData), [terrainData]);
  const visible = useMemo(() => {
    const vis = getVisibleTiles(tiles, center, perimeter);
    return Object.keys(vis).map((v) => ({
      key: v,
      item: vis[v],
    }));
  }, [tiles, center, perimeter]);

  return (
    <>
      <div
        className="pointer-events-none absolute flex h-full w-full items-center justify-center"
        style={{
          backgroundColor: bgColor,
          filter: pixelate ? 'url("#pixelate")' : 'none',
          paddingTop: '40vh',
          transformOrigin: 'center',
        }}
      >
        <div
          className="absolute"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${x}deg) rotateZ(${z}deg) translateX(${
              -center[0] * tileSize
            }px) translateY(${-center[1] * tileSize}px)`,
          }}
        >
          {visible.map((tileProps) => {
            return (
              <Positioner
                floorHeight={0}
                key={tileProps.key}
                stepSize={stepSize}
                tileSize={tileSize}
                x={tileProps.item[TILE.X]}
                y={tileProps.item[TILE.Y]}
                z={tileProps.item[TILE.Z]}
              >
                <Tile
                  bgColor={bgColor}
                  getColorFromZ={getColorFromZ}
                  stepSize={stepSize}
                  tileProps={tileProps.item}
                  tileSize={tileSize}
                />
                {tileProps.item[TILE.VEGETATION] && (
                  <Decoration
                    baseColor={getColorFromZ(tileProps.item[TILE.Z], 0)}
                    bgColor={bgColor}
                    fade={tileProps.item[TILE.FADE]}
                    rotateOffset={tileProps.item[TILE.VEGETATION_ROTATION] || 0}
                    scale={tileProps.item[TILE.VEGETATION_SCALE] || 1}
                    type={tileProps.item[TILE.VEGETATION]}
                  />
                )}
              </Positioner>
            );
          })}
        </div>
      </div>
      <SvgFilters />
    </>
  );
}
