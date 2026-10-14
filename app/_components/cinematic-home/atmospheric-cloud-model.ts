import { clamp, mix, smooth } from './motion'

export function atmosphericDescent(atmosphere: number, progress = 0.3) {
  return atmosphere < 0
    ? 0
    : smooth(0, 0.055, atmosphere) * (1 - smooth(0.435, 0.475, progress))
}

function randomSequence(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}

function hash(x: number, y: number, z: number, seed: number) {
  let value =
    Math.imul(x, 73856093) ^
    Math.imul(y, 19349663) ^
    Math.imul(z, 83492791) ^
    seed
  value = Math.imul(value ^ (value >>> 13), 1274126177)
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296
}

function noise(x: number, y: number, z: number, seed: number) {
  const ix = Math.floor(x),
    iy = Math.floor(y),
    iz = Math.floor(z)
  const blend = (v: number) => v * v * (3 - 2 * v)
  const fx = blend(x - ix),
    fy = blend(y - iy),
    fz = blend(z - iz)
  const row = (dy: number, dz: number) =>
    mix(
      hash(ix, iy + dy, iz + dz, seed),
      hash(ix + 1, iy + dy, iz + dz, seed),
      fx,
    )
  return mix(mix(row(0, 0), row(1, 0), fy), mix(row(0, 1), row(1, 1), fy), fz)
}

export function* sculptCloudTextureData(seed: number, mobile = false) {
  const width = mobile ? 48 : 64,
    height = mobile ? 32 : 48,
    depth = mobile ? 40 : 56
  const data = new Uint8Array(width * height * depth * 4)
  const random = randomSequence(seed)
  const lobes = Array.from(
    { length: 7 + Math.floor(random() * 4) },
    (_, index) => {
      const x = -0.65 + (index / 9) * 1.3 + (random() - 0.5) * 0.2
      const height = 0.23 + random() * 0.37
      return {
        x,
        y: -0.12 + height * 0.35 + (random() - 0.5) * 0.16,
        z: (random() - 0.5) * 0.65,
        rx: 0.23 + random() * 0.22,
        ry: height,
        rz: 0.34 + random() * 0.25,
      }
    },
  )
  const indexAt = (x: number, y: number, z: number) =>
    ((z * height + y) * width + x) * 4
  for (let z = 0; z < depth; z++) {
    const pz = (z / (depth - 1)) * 2 - 1
    for (let y = 0; y < height; y++) {
      const py = (y / (height - 1)) * 2 - 1
      for (let x = 0; x < width; x++) {
        const px = (x / (width - 1)) * 2 - 1
        const warp = (noise(px * 2.8, py * 3.8, pz * 3.4, seed) - 0.5) * 0.17
        let field = 8
        for (const lobe of lobes) {
          const distance =
            (Math.hypot(
              (px - lobe.x) / lobe.rx,
              (py - lobe.y) / lobe.ry,
              (pz - lobe.z) / lobe.rz,
            ) -
              1) *
            Math.min(lobe.rx, lobe.ry, lobe.rz)
          const blend = Math.max(0.13 - Math.abs(field - distance), 0) / 0.13
          field = Math.min(field, distance) - blend * blend * 0.13 * 0.25
        }
        const turbulence =
          (noise(px * 9, py * 11, pz * 9, seed + 31) - 0.5) * 0.13 +
          (noise(px * 19, py * 19, pz * 19, seed + 71) - 0.5) * 0.045
        const density = 1 - smooth(-0.09, 0.018, field + warp + turbulence)
        const edge =
          1 -
          smooth(0.84, 0.99, Math.max(Math.abs(px), Math.abs(py), Math.abs(pz)))
        data[indexAt(x, y, z)] = Math.round(density * edge * 255)
      }
    }
    if (z % 2 === 1) yield
  }
  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let obstruction = 0
        for (let step = 1; step <= 8; step++) {
          const sx = x - step * 2,
            sy = y + step * 2,
            sz = z + step
          if (sx < 0 || sy >= height || sz >= depth) break
          obstruction += data[indexAt(sx, sy, sz)] / 255
        }
        const index = indexAt(x, y, z)
        const densityAt = (dx: number, dy: number, dz: number) =>
          data[
            indexAt(
              Math.min(width - 1, Math.max(0, x + dx)),
              Math.min(height - 1, Math.max(0, y + dy)),
              Math.min(depth - 1, Math.max(0, z + dz)),
            )
          ] / 255
        const nx = (densityAt(-1, 0, 0) - densityAt(1, 0, 0)) * width
        const ny = (densityAt(0, -1, 0) - densityAt(0, 1, 0)) * height
        const nz = (densityAt(0, 0, -1) - densityAt(0, 0, 1)) * depth
        const normalLength = Math.hypot(nx, ny, nz)
        const key =
          normalLength > 0.001
            ? Math.max(0, (-nx * 0.57 + ny * 0.76 + nz * 0.31) / normalLength)
            : 0
        const lighting =
          0.08 +
          key * 0.61 * Math.exp(-obstruction * 0.16) +
          Math.exp(-obstruction * 0.65) * 0.28
        data[index + 1] = Math.round(lighting * 255)
        data[index + 3] = 255
      }
    }
    if (z % 2 === 1) yield
  }
  return { data, width, height, depth }
}

export function createCloudTextureData(seed: number, mobile = false) {
  const sculptor = sculptCloudTextureData(seed, mobile)
  let next = sculptor.next()
  while (!next.done) next = sculptor.next()
  return next.value
}

const cloudArrival = [
  0.015, 0.055, 0.109, 0.128, 0.202, 0.237, 0.285, 0.331, 0.386, 0.419, 0.461,
  0.524, 0.566, 0.624, 0.658, 0.714, 0.77, 0.8, 0.874, 0.907,
]
const cloudX = [
  -104, 57, -45, 118, -96, 40, 93, -54, -114, 58, -40, 112, -86, 35, 92, -52,
  -31, 34, 47, -44,
]

const originalCloudPlacements = Array.from({ length: 20 }, (_, slot) => {
  const layer = Math.floor(slot / 2)
  const index = slot % 2
  const city = layer / 9
  const random = randomSequence(137 + layer * 379 + index * 153)
  const size = mix(63, 9, city) * (0.73 + random() * 0.42)
  const z = layer >= 8 ? -59 + random() * 14 : -103 + random() * 75
  return {
    seed: 137 + layer * 379 + index * 153,
    layer,
    city,
    arrival: cloudArrival[slot],
    duration: 0.27 + random() * 0.045,
    x: cloudX[slot],
    y:
      layer >= 8
        ? 81 + random() * 5
        : 13 + (145 - z) * 0.625 - 118 + random() * 35,
    z,
    scale: [
      size,
      size * (0.54 + random() * 0.22),
      size * (0.6 + random() * 0.12),
    ],
    turn: (random() - 0.5) * 0.7,
  }
})

const addedCloudArrival = [
  0.035, 0.119, 0.22, 0.308, 0.403, 0.493, 0.595, 0.686, 0.785, 0.891,
]
const addedCloudX = [126, -122, 110, -122, 122, -118, 106, -112, 94, -96]

const addedCloudPlacements = Array.from({ length: 10 }, (_, layer) => {
  const index = 2
  const city = layer / 9
  const seed = 137 + layer * 379 + index * 153
  const random = randomSequence(seed)
  const size = mix(63, 9, city) * (0.73 + random() * 0.42)
  const z = layer >= 8 ? -59 + random() * 14 : -103 + random() * 75
  return {
    seed,
    layer,
    city,
    arrival: addedCloudArrival[layer],
    duration: 0.27 + random() * 0.045,
    x: addedCloudX[layer],
    y:
      layer >= 8
        ? 81 + random() * 5
        : 13 + (145 - z) * 0.625 - 118 + random() * 35,
    z,
    scale: [
      size,
      size * (0.54 + random() * 0.22),
      size * (0.6 + random() * 0.12),
    ],
    turn: (random() - 0.5) * 0.7,
  }
})

export const cloudPlacements = [
  ...originalCloudPlacements,
  ...addedCloudPlacements,
]

export type CloudPlacement = (typeof cloudPlacements)[number]

export function cloudPose(
  cloud: CloudPlacement,
  atmosphere: number,
  mobile: boolean,
  stacked: boolean,
  cityOffset = 0,
  progress = 0.3,
) {
  const { arrival, duration, layer, x, y, z, scale, city } = cloud
  const passage = clamp((atmosphere - arrival) / duration)
  const lingering = layer >= 8
  const exit = lingering
    ? 1 - smooth(0.435, 0.475, progress)
    : 1 - smooth(0.78, 1, passage)
  const opacity =
    atmosphere < 0 ? 0 : smooth(arrival, arrival + 0.045, atmosphere) * exit
  const travel = lingering
    ? smooth(arrival, arrival + duration, atmosphere)
    : passage
  return {
    position: [
      x,
      y +
        (lingering
          ? cityOffset + travel * 1.5 - (mobile ? 13 : 0)
          : travel * mix(315, 285, city)),
      z + travel * (lingering ? 3 : 12),
    ] as const,
    scale: [scale[0], scale[1], scale[2]] as const,
    opacity: opacity * (stacked ? 0.92 : 1),
    steps: mobile ? 32 : 48,
  }
}
