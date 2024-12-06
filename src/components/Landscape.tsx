import { processData, TILE } from '../utils/processData';
import { Tile } from './Tile';
import { makeGetColorFromZ } from '../utils/makeGetColorFromZ';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getVisibleTiles } from '../utils/getVisibleTiles';
import { Positioner } from './Positioner';
import { SvgFilters } from './SvgFilters';
import { Decoration } from './Decorations';

export function Landscape({
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
  const [stepSize] = useState(0.3);

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
          filter: pixelate ? 'url("#pixelate")' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'absolute',
          bottom: 0,
          paddingTop: '50vh',
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
