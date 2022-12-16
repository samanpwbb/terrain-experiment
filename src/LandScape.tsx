import { processData } from './processData';
import { MemoizedTile } from './Tile';
import { makeGetColorFromZ } from './colors';
import { useEffect, useMemo, useState } from 'react';
import { getVisibleTiles } from './getVisibleTiles';
import { config, useTransition } from '@react-spring/web';

export function LandScape({
  tileSize,
  terrainData,
  colors,
  perimeter,
  pixelate,
  fade,
}: {
  tileSize: number;
  perimeter: number;
  terrainData: number[][];
  colors: string[];
  pixelate: boolean;
  fade?: boolean;
}) {
  const getColorFromZ = useMemo(() => makeGetColorFromZ(colors), [colors]);
  const [center, setCenter] = useState<[number, number]>([0, 0]);

  const tiles = useMemo(() => processData(terrainData), [terrainData]);
  const visible = useMemo(() => {
    const vis = getVisibleTiles(tiles, center, perimeter, Boolean(fade));
    return Object.keys(vis).map((v) => vis[v]);
  }, [center, perimeter, tiles, fade]);

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

  const transitions = useTransition(visible, {
    from: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
    },
    leave: {
      opacity: 0,
    },
    config: config.stiff,
  });

  const bg = 'rgba(0, 20, 190, 1)';
  return (
    <>
      <div
        style={{
          display: 'flex',
          backgroundColor: bg,
          pointerEvents: 'none',
          filter: pixelate ? 'url("#turb") url("#pixelate")' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'absolute',
          bottom: 0,
          paddingTop: '40vh',
          /* if we want perspective, uncomment: */
          transformOrigin: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            transition: 'transform 250ms',
            transformStyle: 'preserve-3d',
            transform: `rotateX(var(--base-x)) rotateZ(var(--base-z)) translateX(${
              -center[0] * tileSize
            }px) translateY(${-center[1] * tileSize}px)`,
          }}
        >
          {transitions((style, [x, y, z, s, l, u, r, d, fadeVal]) => {
            return (
              <MemoizedTile
                animation={style}
                bgColor={bg}
                border={false}
                stepSize={0.33}
                diffs={[l, u, r, d]}
                fade={fadeVal}
                getColorFromZ={getColorFromZ}
                hasFade={Boolean(fade)}
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
