import { colord, extend } from 'colord';
import { CSSProperties } from 'react';
import mixPlugin from 'colord/plugins/mix';

extend([mixPlugin]);

export function TileFace({
  color,
  style,
  fade,
  bgColor,
}: {
  color: string;
  style: CSSProperties;
  fade: number;
  bgColor: string;
}) {
  const finalColor = colord(color).mix(bgColor, fade).toHex();

  return (
    <div
      className="absolute h-full w-full"
      style={{
        transition: 'all 125ms',
        backgroundColor: finalColor,
        ...style,
      }}
    />
  );
}
