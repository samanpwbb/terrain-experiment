import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
extend([mixPlugin]);

export const colorsNatural = [
  'hsla(330 100% 80%)',
  'hsla(280 100% 90%)',
  'hsla(250 10% 100%)',
  'hsla(170 60% 40%)',
  'hsla(110 45% 60%)',
  'hsla(90 65% 70%)',
  'hsla(60 75% 75%)',
  'hsla(200 80% 65%)',
  '#008fb0',
  '#0c4278',
].reverse();

export function getColorFromZ(z: number, offset: number) {
  // interpolate non-integer z values
  if (offset) {
    // return colorsNatural[z + 1];
    const colorFloor = colord(colorsNatural[z]);
    const colorCeil = colord(colorsNatural[z + 1]);
    return colorFloor.mix(colorCeil, offset).toHex();
  }

  return colorsNatural[z];
}
