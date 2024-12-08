// basic perspective parameters
// 1 radian = 57.2958 degrees
export const BASE_X = 57.2958;
export const BASE_Z = 45;
export const ANGLE_TO_RADIAN = 0.0174533;
export const RADIAN_TO_ANGLE = 57.2958;
export const BASE_SCALE = getScale(BASE_X);

function getScale(x = BASE_X) {
  return 1 / Math.sin((x + 90) * ANGLE_TO_RADIAN);
}

export function setIsoCssVars() {
  document.documentElement.style.setProperty('--base-x', `${BASE_X}deg`);
  document.documentElement.style.setProperty('--base-z', `${BASE_Z}deg`);
}

export function updateBaseX(degrees: number) {
  document.documentElement.style.setProperty('--base-x', `${degrees}deg`);
}

export function updateBaseZ(degrees: number) {
  document.documentElement.style.setProperty('--base-z', `${degrees}deg`);
}
