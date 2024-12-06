export const SQ2 = 1.41421356237;

export function clamp(min: number, val: number, max: number) {
  return Math.min(Math.max(min, val), max);
}
