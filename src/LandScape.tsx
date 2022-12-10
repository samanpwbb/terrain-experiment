import { processData } from './processData';
import { MemoizedTile } from './Tile';
import { makeGetColorFromZ } from './colors';
import { useMemo, useCallback } from 'react';

export function LandScape({
  tileSize,
  terrainData,
  colors,
}: {
  tileSize: number;
  terrainData: string;
  colors: string[];
}) {
  const getColorFromZ = useCallback(makeGetColorFromZ(colors), [colors]);
  const tiles = useMemo(() => processData(terrainData), [terrainData]);

  return (
    <>
      <div
        className="parent"
        style={{
          display: 'flex',
          filter: "url('#pixelate')",
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'absolute',
          bottom: 0,
          paddingTop: '15vh',
          /* if we want perspective, uncomment: */
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="isometric">
          {Object.keys(tiles).map((k) => {
            const [x, y, z, s, ...diffs] = tiles[k];
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
      <svg style={{ display: 'none' }}>
        <defs>
          <filter id="turb">
            <feTurbulence baseFrequency="0.15" numOctaves="4" />
            <feDisplacementMap in="SourceGraphic" scale="5" />
          </filter>
        </defs>
      </svg>

      <svg>
        <filter id="pixelate" x="0" y="0">
          <feFlood height="2" width="2" />
          <feComposite height="4" width="4" />
          <feTile result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
          <feMorphology operator="dilate" radius="2.5" />
        </filter>
      </svg>
    </>
  );
}
