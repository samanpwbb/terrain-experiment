// basic perspective parameters
// why does 57.2958 work here? 1 radian = 57.2958 degrees
export const BASE_X = 57.2958;
// export const BASE_X = 45;
// T0DO: change base_z in order to rotate.
export const BASE_Z = 45;
export const ANGLE_TO_RADIAN = 0.0174533;
export const RADIAN_TO_ANGLE = 57.2958;
export const scale = 1 / Math.sin((BASE_X + 90) * ANGLE_TO_RADIAN);

export function setIsoCssVars() {
  document.documentElement.style.setProperty('--base-x', `${BASE_X}deg`);
  document.documentElement.style.setProperty('--base-z', `${BASE_Z}deg`);
  document.documentElement.style.setProperty('--scale', `${scale}`);
  document.documentElement.style.setProperty(
    '--base-z-reverse',
    `-${BASE_Z}deg`,
  );
}

export function updateBaseX(degrees: number) {
  document.documentElement.style.setProperty('--base-x', `${degrees}deg`);
}
