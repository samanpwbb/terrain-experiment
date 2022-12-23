export function wiggle(v: number, g: () => number, mod = 2, max = 9) {
  const nv = Math.min(max, Math.max(0, Math.floor(v + mod * (g() - 0.5))));
  return nv;
}
