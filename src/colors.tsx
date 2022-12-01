import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
extend([mixPlugin]);

export function makeGetColorFromZ(colors: string[]) {
  return (z: number, offset: number) => {
    // interpolate non-integer z values
    if (offset) {
      const colorFloor = colord(colors[z]);
      const colorCeil = colord(colors[z + 1]);
      return colorFloor.mix(colorCeil, offset).toHex();
    }

    return colors[z];
  };
}
