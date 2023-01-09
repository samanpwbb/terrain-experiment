import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
extend([mixPlugin]);

export function makeGetColorFromZ(colors: string[]) {
  return (z: number, offset: number) => {
    if (offset > 1) {
      const colorFloor = colord(colors[z + (Math.round(offset) - 1)]);
      const colorCeil = colord(colors[z + Math.round(offset)]);
      return colorFloor.mix(colorCeil, 0.5).toHex();
    }

    // interpolate non-integer z values
    if (offset <= 1) {
      const colorFloor = colord(colors[z]);
      const colorCeil = colord(colors[z + 1]);
      return colorFloor.mix(colorCeil, offset).toHex();
    }

    return colors[z];
  };
}
