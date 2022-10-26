const BASE_X = 45;
const BASE_Y = 45;
const RADIAN_CONVERSION = 0.0174533;

function updateIsometricTransform(position) {
  if (!position.size) return;

  const y = position.get(0);
  const x = position.get(1);
  const modifier = 0.6;
  const depth = BASE_X - (x + y) * modifier;
  const rotation = BASE_Y + (y - x) * modifier;
  const scale = 1 / Math.sin((depth + 90) * RADIAN_CONVERSION);

  setTimeout(() => {
    document.documentElement.style.setProperty(
      '--isometric',
      `rotateX(${depth}deg) rotateZ(${rotation}deg)`,
    );
    document.documentElement.style.setProperty(
      '--unisometric',
      `rotateZ(-${rotation}deg) scaleY(${scale})`,
    );
  }, 0);
}

export default updateIsometricTransform;
