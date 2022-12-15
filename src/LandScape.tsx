import { processData } from './processData';
import { MemoizedTile } from './Tile';
import { makeGetColorFromZ } from './colors';
import { useEffect, useMemo, useState } from 'react';
import { getVisibleTiles } from './getVisibleTiles';

export function LandScape({
  tileSize,
  terrainData,
  colors,
  perimeter,
  pixelate,
}: {
  tileSize: number;
  perimeter: number;
  terrainData: number[][];
  colors: string[];
  pixelate: boolean;
}) {
  const getColorFromZ = useMemo(() => makeGetColorFromZ(colors), [colors]);
  const [center, setCenter] = useState<[number, number]>([0, 0]);

  const tiles = useMemo(() => processData(terrainData), [terrainData]);
  const visible = useMemo(
    () => getVisibleTiles(tiles, center, perimeter),
    [center, perimeter, tiles],
  );

  // use arrow keys to update center
  const handleKeyDown = (e: KeyboardEvent) => {
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
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div
        className="parent"
        style={{
          display: 'flex',
          pointerEvents: 'none',
          filter: pixelate ? 'url("#pixelate")' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'absolute',
          bottom: 0,
          paddingTop: '15vh',
          /* if we want perspective, uncomment: */
          // transformStyle: 'preserve-3d',
          transformOrigin: 'center',
        }}
      >
        <div className="isometric">
          {Object.keys(visible).map((k) => {
            const [x, y, z, s, ...diffs] = visible[k];
            return (
              <MemoizedTile
                diffs={diffs}
                getColorFromZ={getColorFromZ}
                key={k}
                signature={s}
                tileSize={tileSize}
                x={x}
                y={y}
                z={z}
              />
            );
          })}
        </div>
      </div>
      <svg>
        <defs>
          <filter id="turb">
            <feTurbulence baseFrequency="0.15" numOctaves="3" />
            <feDisplacementMap in="SourceGraphic" scale="10" />
          </filter>
        </defs>
      </svg>

      <svg>
        <filter id="pixelate">
          <feFlood height="2" width="2" x="2" y="2" />
          <feComposite height="6" width="6" />
          <feTile result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
          <feMorphology operator="dilate" radius="2" />
        </filter>
      </svg>
    </>
  );
}
