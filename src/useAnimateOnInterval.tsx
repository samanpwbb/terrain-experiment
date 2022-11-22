import { useEffect, useRef } from 'react';
import { Ground, generateExpandedGround, groundToData } from './generateData';

export function useAnimateOnInterval(
  set: (tiles: Ground) => void,
  levels: number,
  tiles: number,
  t = 1000,
  hold = 4,
) {
  const toggle = useRef(0);
  const interval = useRef<NodeJS.Timeout>();
  useEffect(() => {
    interval.current = setInterval(() => {
      if (toggle.current === 0) {
        set(groundToData(generateExpandedGround(levels, undefined, tiles)));
      }

      if (toggle.current >= hold) {
        toggle.current = 0;
        return;
      }

      if (toggle.current < hold) {
        toggle.current++;
        return;
      }
    }, t);
    return () => {
      clearInterval(interval.current!);
    };
  }, []);
}
