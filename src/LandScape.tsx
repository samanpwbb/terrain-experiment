import { processData } from './processData';
import { MemoizedTile } from './Tile';
import { makeGetColorFromZ } from './colors';
import { useMemo } from 'react';

export function LandScape({
  tileSize,
  terrainData,
  colors,
}: {
  tileSize: number;
  terrainData: string;
  colors: string[];
}) {
  const getColorFromZ = useMemo(() => makeGetColorFromZ(colors), [colors]);
  const tiles = useMemo(() => processData(terrainData), [terrainData]);

  return (
    <>
      <div
        className="parent"
        style={{
          display: 'flex',
          // filter: 'url("#pixelate")',
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
