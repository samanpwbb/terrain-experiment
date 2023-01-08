import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
import { useMemo } from 'react';
extend([mixPlugin]);

function Weed({ rotate, fill }: { rotate: boolean; fill: string }) {
  return (
    <svg
      className="tree"
      fill="none"
      height="100%"
      style={{
        position: 'absolute',
        transform: rotate ? 'rotateY(90deg)' : 'rotateX(0deg)',
      }}
      viewBox="0 0 100 100"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="80" fill={`${fill}`} r="20" />
    </svg>
  );
}

function Bush({ rotate, fill }: { rotate: boolean; fill: string }) {
  return (
    <svg
      className="tree"
      fill="none"
      height="100%"
      style={{
        position: 'absolute',
        transform: rotate ? 'rotateY(90deg)' : 'rotateX(0deg)',
      }}
      viewBox="0 0 100 100"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="63" fill={`${fill}`} r="15" />
      <circle cx="31" cy="85" fill={`${fill}`} r="15" />
      <circle cx="69" cy="85" fill={`${fill}`} r="15" />
      <path d="M50 61L30.5063 100H70L50 61Z" fill={`${fill}`} />
    </svg>
  );
}

function Tree({ rotate, fill }: { rotate: boolean; fill: string }) {
  return (
    <svg
      className="tree"
      fill="none"
      height="100%"
      style={{
        position: 'absolute',
        transform: rotate ? 'rotateY(90deg)' : 'rotateX(0deg)',
      }}
      viewBox="0 0 100 100"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="20" fill={`${fill}`} r="20" />
      <circle cx="30" cy="53" fill={`${fill}`} r="20" />
      <circle cx="70" cy="53" fill={`${fill}`} r="20" />
      <path d="M45 27H55V100H45V27Z" fill={`${fill}`} />
      <path d="M50 20L27.5823 43H73L50 20Z" fill={`${fill}`} />
    </svg>
  );
}
export function Entity({
  type,
  fade,
  bgColor,
  baseColor,
  rotateOffset,
  scale,
}: {
  type: 'bush' | 'tree' | 'weed';
  rotateOffset: number;
  scale: number;
  bgColor: string;
  baseColor: string;
  fade: number;
}) {
  const fill = useMemo(
    () =>
      colord(baseColor)
        .darken(0.15)
        .desaturate(0.3)
        .rotate(25)
        .mix(bgColor, fade)
        .toHex(),
    [baseColor, bgColor, fade],
  );

  let Type = Tree;
  if (type === 'bush') {
    Type = Bush;
  }
  if (type === 'weed') {
    Type = Weed;
  }

  return (
    <div
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        transformStyle: 'preserve-3d',
        display: 'flex',
        pointerEvents: 'all',
        width: '100%',
        height: '100%',
        transformOrigin: 'bottom',
        transform: `translateY(-50%) rotateX(-90deg) scale(${scale}) rotateY(${rotateOffset}deg)`,
      }}
    >
      <Type fill={fill} rotate={false} />
      <Type fill={fill} rotate={true} />
    </div>
  );
}
