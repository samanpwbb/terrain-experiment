export type Tile = [
  x: number,
  y: number,
  z: number,
  signature: number,
  lNeighbor: number,
  uNeighbor: number,
  rNeighbor: number,
  dNeighbor: number,
  luNeighbor: number,
  ruNeighbor: number,
  rdNeighbor: number,
  ldNeighbor: number,
  fade: number,
  // these get added later, in getVisibleTiles but would probably make more sense
  // to set them here.
  vegetation?: 'weed' | 'bush' | 'tree',
  vegetationRotation?: number,
  vegetationScale?: number,
];

export enum TILE {
  X = 0,
  Y = 1,
  Z = 2,
  SIGNATURE = 3,
  L_NEIGHBOR = 4,
  U_NEIGHBOR = 5,
  R_NEIGHBOR = 6,
  D_NEIGHBOR = 7,
  LU_NEIGHBOR = 8,
  RU_NEIGHBOR = 9,
  RD_NEIGHBOR = 10,
  LD_NEIGHBOR = 11,
  FADE = 12,
  VEGETATION = 13,
  VEGETATION_ROTATION = 14,
  VEGETATION_SCALE = 15,
}

export type Terrain = { [key: string]: Tile };

const FlatThreshold = 1;
function getEntry(
  x: number,
  y: number,
  z: number,
  neighborZs: {
    l: number;
    lu: number;
    u: number;
    ru: number;
    r: number;
    rd: number;
    d: number;
    ld: number;
  },
  invalidPositions: Set<string>,
  diff = FlatThreshold,
): Tile {
  /*
   *
   *  ..2..
   *  .1.3.
   *  8...4
   *  .7.5.
   *  ..6..
   *
   */
  const lDiff = neighborZs.l - z;
  const lFlat = lDiff <= diff && lDiff >= 0;
  const l = lDiff > 0 && lFlat;

  const luDiff = neighborZs.lu - z;
  const luFlat = luDiff <= diff && luDiff >= 0;
  const lu = luDiff > 0 && luFlat;

  const uDiff = neighborZs.u - z;
  const uFlat = uDiff <= diff && uDiff >= 0;
  const u = uDiff > 0 && uFlat;

  const ruDiff = neighborZs.ru - z;
  const ruFlat = ruDiff <= diff && ruDiff >= 0;
  const ru = ruDiff > 0 && ruFlat;

  const rDiff = neighborZs.r - z;
  const rFlat = rDiff <= diff && rDiff >= 0;
  const r = rDiff > 0 && rFlat;

  const rdDiff = neighborZs.rd - z;
  const rdFlat = rdDiff <= diff && rdDiff >= 0;
  const rd = rdDiff > 0 && rdFlat;

  const dDiff = neighborZs.d - z;
  const dFlat = dDiff <= diff && dDiff >= 0;
  const d = dDiff > 0 && dFlat;

  const ldDiff = neighborZs.ld - z;
  const ldFlat = ldDiff <= diff && ldDiff >= 0;
  const ld = ldDiff > 0 && ldFlat;

  // prettier-ignore
  const edges = [
    (l || d),
    (l || u),
    (u || r),
    (r || d),
  ];

  // if diagonal
  if (!edges[0] && (lFlat || dFlat)) {
    edges[0] = ld;
  }

  if (!edges[1] && (lFlat || uFlat)) {
    edges[1] = lu;
  }

  if (!edges[2] && (uFlat || rFlat)) {
    edges[2] = ru;
  }

  if (!edges[3] && (rFlat || dFlat)) {
    edges[3] = rd;
  }

  const sig = +('0b' + edges.map((v) => (v ? 1 : 0)).join(''));

  if (sig === 0b1111) {
    // add all neighbors to invalid positions, we need to re-calc them
    // basically this has a smoothing effect.
    invalidPositions.add([x - 1, y - 1].join(','));
    invalidPositions.add([x, y - 1].join(','));
    invalidPositions.add([x + 1, y - 1].join(','));
    invalidPositions.add([x - 1, y].join(','));
    invalidPositions.add([x + 1, y].join(','));
    invalidPositions.add([x - 1, y + 1].join(','));
    invalidPositions.add([x, y + 1].join(','));
    invalidPositions.add([x + 1, y + 1].join(','));
    return getEntry(x, y, z + 1, neighborZs, invalidPositions);
  }

  return [
    x,
    y,
    z,
    sig,
    lDiff,
    uDiff,
    rDiff,
    dDiff,
    luDiff,
    ruDiff,
    rdDiff,
    ldDiff,
    0,
  ];
}

export function processData(ground: number[][]): Terrain {
  const rows = ground;
  const tiles = {} as Terrain;
  const invalidPositions = new Set<string>();
  rows.forEach((row, y) => {
    const midY = Math.round(rows.length / 2);
    const relativeY = y - midY;
    const midX = Math.round(row.length / 2);
    return row.forEach((z, x) => {
      const relativeX = x - midX;
      tiles[`${relativeX},${relativeY}`] = getEntry(
        relativeX,
        relativeY,
        z,
        {
          l: rows[y]?.[x - 1],
          lu: rows[y - 1]?.[x - 1],
          u: rows[y - 1]?.[x],
          ru: rows[y - 1]?.[x + 1],
          r: rows[y][x + 1],
          rd: rows[y + 1]?.[x + 1],
          d: rows[y + 1]?.[x],
          ld: rows[y + 1]?.[x - 1],
        },
        invalidPositions,
      );
    });
  });

  while (invalidPositions.size > 0) {
    Array.from(invalidPositions).forEach((posStr) => {
      const [x, y] = posStr.split(',').map((v) => parseInt(v));

      invalidPositions.delete(posStr);

      if (!tiles[`${x},${y}`]) return;

      const entry = tiles[`${x},${y}`];

      tiles[`${x},${y}`] = getEntry(
        entry[0],
        entry[1],
        entry[2],
        {
          l: tiles[`${x - 1},${y}`]?.[2],
          lu: tiles[`${x - 1},${y - 1}`]?.[2],
          u: tiles[`${x},${y - 1}`]?.[2],
          ru: tiles[`${x + 1},${y - 1}`]?.[2],
          r: tiles[`${x + 1},${y}`]?.[2],
          rd: tiles[`${x + 1},${y + 1}`]?.[2],
          d: tiles[`${x},${y + 1}`]?.[2],
          ld: tiles[`${x - 1},${y + 1}`]?.[2],
        },
        invalidPositions,
      );
    });
  }

  return tiles;
}
