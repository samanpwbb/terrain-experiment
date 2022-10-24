import { useEffect, useRef, useState } from 'react';
import { generateGround, groundToData } from './ground';
import { useTrail, animated, useTransition, config } from '@react-spring/web';

// next:
// - [ ] Figure out math for parameters.
// - [ ] drag and load in new tiles from any direction.
// - [ ] add basic side faces.

// a list of 10 colors making a gradient from gree to blue
const colors = [
  '#ef6',
  '#cafa6e',
  '#82ea7f',
  '#1ed693',
  // '#00c0a4',
  // '#00a8ae',
  '#008fb0',
  '#0075a6',
  '#005b93',
  '#0c4278',
  // '#0F172A',
].reverse();

// These we understand.
const tiles = 25;
const levels = 8;
const mid = 3;

// before going further, figure out the math for all these parameters.
const base_width = 70;
const tile_distance = 7;

// const defaultGround = groundToData(generateGround(levels, Math.random, tiles));
const allMidGround = groundToData(
  generateGround(levels, undefined, tiles, mid),
);
export default function App() {
  const [ground, setGround] = useState(allMidGround);

  const tileSize = base_width / tiles;

  // const transitions = useTransition(ground, {
  //   config: config.molasses,
  //   enter: { t: 1 },
  //   from: { t: 0 },
  //   keys: (item) => `${item[0]}${item[1]}`,
  //   leave: { t: 0 },
  // });

  const toggle = useRef(0);
  const interval = useRef<NodeJS.Timeout>();
  useEffect(() => {
    interval.current = setInterval(() => {
      if (toggle.current === 0) {
        setGround(groundToData(generateGround(levels, undefined, tiles)));
      }

      if (toggle.current >= 10) {
        setGround(allMidGround);
        toggle.current = 0;
        return;
      }

      if (toggle.current < 10) {
        toggle.current++;
        return;
      }
    }, 500);
    return () => {
      clearInterval(interval.current!);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
      <div
        className="isometric"
        style={{
          height: `${base_width}vmin`,
          width: `${base_width}vmin`,
        }}
      >
        {ground.map(([x, y, z]) => {
          return (
            <div
              className={`absolute transition-all`}
              key={x + ',' + y}
              style={{
                backgroundColor: colors[z],
                height: `${tileSize}vmin`,
                transform: `translate3d(${
                  (x / tileSize) * tile_distance
                }vmin, ${(y / tileSize) * tile_distance}vmin, ${
                  ((z - mid) / tileSize) * tile_distance * 1.414
                }vmin)`,
                transitionDuration: `${
                  500 + (Math.abs(z - mid) / tileSize) * 250
                }ms`,
                width: `${tileSize}vmin`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
