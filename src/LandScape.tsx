import { processData } from './processData';
import { Tile } from './Tile';
import { makeGetColorFromZ } from './colors';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getVisibleTiles } from './getVisibleTiles';

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
  }, [center, perimeter, tiles, fade]);

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
          paddingTop: '25vh',
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
              <Tile
                bgColor={bgColor}
                border={false}
                getColorFromZ={getColorFromZ}
                hasFade={Boolean(fade)}
                key={tileProps.key}
                stepSize={0.25}
                tileProps={tileProps.item}
                tileSize={tileSize}
              />
            );
          })}
        </div>
      </div>
      <svg display="none">
        <defs>
          <filter id="turb">
            <feTurbulence baseFrequency="0.15" numOctaves="3" />
            <feDisplacementMap in="SourceGraphic" scale="10" />
          </filter>
          <filter id="pixelate">
            <feFlood height="2" width="2" x="2" y="2" />
            <feComposite height="6" width="6" />
            <feTile result="a" />
            <feComposite in="SourceGraphic" in2="a" operator="in" />
            <feMorphology operator="dilate" radius="2" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
