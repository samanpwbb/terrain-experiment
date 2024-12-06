import { colord, extend } from 'colord';
import { CSSProperties } from 'react';
import mixPlugin from 'colord/plugins/mix';

extend([mixPlugin]);

export function TileFace({
  color,
  style,
  debugBorder,
  fade,
  bgColor,
}: {
  color: string;
  style: CSSProperties;
  debugBorder?: boolean;
  fade: number;
  bgColor: string;
}) {
  const finalColor = colord(color).mix(bgColor, fade).toHex();
  const transition = `all ${125}ms`;

  return (
    <div
      className={`absolute`}
      style={{
        pointerEvents: 'none',
        height: `100%`,
        width: `100%`,
        transition,
        backgroundColor: finalColor,
        border: debugBorder ? `3px solid rgba(0,0,0,0.1)` : undefined,
        overflow: 'visible',
        ...style,
      }}
    />
  );
}
