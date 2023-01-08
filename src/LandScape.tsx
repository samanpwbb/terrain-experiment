import { processData, TILE } from './processData';
import { MemoizedTile } from './Tile';
import { makeGetColorFromZ } from './colors';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getVisibleTiles } from './getVisibleTiles';
import { MemoizedPositioner } from './Positioner';
import { SvgFilters } from './SvgFilters';
import { Entity } from './Entity';

export function LandScape({
  tileSize,
  bufferSize = 1,
  terrainData,
  colors,
  perimeter,
  pixelate,
  fade,
  bgColor,
}: {
  tileSize: number;
  bufferSize: number;
  perimeter: number;
  terrainData: number[][];
  colors: string[];
  pixelate: boolean;
  fade?: boolean;
  bgColor: string;
}) {
  const getColorFromZ = useMemo(() => makeGetColorFromZ(colors), [colors]);
  const [center, setCenter] = useState<[number, number]>([0, 0]);

  const tiles = useMemo(() => processData(terrainData), [terrainData]);
  const visible = useMemo(() => {
    const vis = getVisibleTiles(
      tiles,
      center,
      perimeter,
      Boolean(fade),
      bufferSize,
    );
    return Object.keys(vis).map((v) => ({
      key: v,
      item: vis[v],
    }));
  }, [tiles, center, perimeter, fade, bufferSize]);

  // use arrow keys to update center
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        setCenter((c) => [c[0], c[1] - 1]);
        break;
      case 'ArrowDown':
        setCenter((c) => [c[0], c[1] + 1]);
        break;
      case 'ArrowLeft':
        setCenter((c) => [c[0] - 1, c[1]]);
        break;
      case 'ArrowRight':
        setCenter((c) => [c[0] + 1, c[1]]);
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <div
        style={{
          display: 'flex',
          backgroundColor: bgColor,
          pointerEvents: 'none',
          filter: pixelate ? 'url("#turb") url("#pixelate")' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'absolute',
          bottom: 0,
          paddingTop: '50vh',
          /* if we want perspective, uncomment: */
          transformOrigin: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            transition: 'transform 125ms',
            transformStyle: 'preserve-3d',
            transform: `rotateX(var(--base-x)) rotateZ(var(--base-z)) translateX(${
              -center[0] * tileSize
            }px) translateY(${-center[1] * tileSize}px)`,
          }}
        >
          {visible.map((tileProps) => {
            return (
              <MemoizedPositioner
                floorHeight={0}
                key={tileProps.key}
                stepSize={0.3}
                tileSize={tileSize}
                x={tileProps.item[TILE.X]}
                y={tileProps.item[TILE.Y]}
                z={tileProps.item[TILE.Z]}
              >
                <MemoizedTile
                  bgColor={bgColor}
                  border={false}
                  getColorFromZ={getColorFromZ}
                  stepSize={0.3}
                  tileProps={tileProps.item}
                  tileSize={tileSize}
                />
                {tileProps.item[TILE.VEGETATION] && (
                  <Entity
                    baseColor={getColorFromZ(tileProps.item[TILE.Z], 0)}
                    bgColor={bgColor}
                    fade={tileProps.item[TILE.FADE]}
                    rotateOffset={tileProps.item[TILE.VEGETATION_ROTATION] || 0}
                    scale={tileProps.item[TILE.VEGETATION_SCALE] || 1}
                    type={tileProps.item[TILE.VEGETATION]}
                  />
                )}
              </MemoizedPositioner>
            );
          })}
        </div>
      </div>
      <SvgFilters />
    </>
  );
}
