// basic perspective parameters
export const BASE_X = 45;
export const BASE_Z = 45;
export const RADIAN_CONVERSION = 0.0174533;
export const scale = 1 / Math.sin((BASE_X + 90) * RADIAN_CONVERSION);

export function setIsoCssVars() {
  document.documentElement.style.setProperty('--base-x', `${BASE_X}deg`);
  document.documentElement.style.setProperty('--base-z', `${BASE_Z}deg`);
  document.documentElement.style.setProperty('--scale', `${scale}`);
  document.documentElement.style.setProperty(
    '--base-z-reverse',
    `-${BASE_Z}deg`,
  );
}
