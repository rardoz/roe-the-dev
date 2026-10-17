import * as THREE from 'three'

const coastalWaveCoordinates = `
uniform float uWaveTravel;
uniform vec3 uCoastBend;
vec3 coastalCoordinates(vec2 p) {
  float along = p.y - uCoastBend.x;
  float widthSquared = uCoastBend.y * uCoastBend.y;
  float bow = uCoastBend.z * exp(-.5 * along * along / widthSquared);
  float bowSlope = -bow * along / widthSquared;
  return vec3(along, p.x - bow, bowSlope);
}`

const waterVertex = `
${coastalWaveCoordinates}
varying vec2 vSurface;
varying vec2 vSlope;
varying vec3 vWorld;
varying float vDepth;
void main() {
  vec3 p = position;
  vec3 coast = coastalCoordinates(p.xz);
  float phase = (coast.y - uWaveTravel * .006) * 7.;
  p.y += sin(phase) * .005;
  vSlope = vec2(1., -coast.z) * cos(phase) * .035;
  vSurface = p.xz;
  vec4 world = modelMatrix * vec4(p, 1.);
  vWorld = world.xyz;
  vec4 view = viewMatrix * world;
  vDepth = -view.z;
  gl_Position = projectionMatrix * view;
}`

const waterFragment = `
${coastalWaveCoordinates}
uniform float uFogDensity;
uniform sampler2D uNormal;
uniform sampler2D uFoam;
uniform sampler2D uShore;
varying vec2 vSurface;
varying vec2 vSlope;
varying vec3 vWorld;
varying float vDepth;
void main() {
  vec2 p = vSurface;
  vec3 coast = coastalCoordinates(p);
  vec2 flow = (coast.xy - vec2(uWaveTravel * .006, 0.)) * 1.7;
  vec3 surfaceNormal = texture2D(uNormal, flow).xyz * 2. - 1.;
  vec2 ripple = vec2(surfaceNormal.y, surfaceNormal.x - coast.z * surfaceNormal.y) * .56;
  vec3 normal = normalize(vec3(ripple.x - vSlope.x, 1., ripple.y - vSlope.y));
  vec3 view = normalize(cameraPosition - vWorld);
  vec3 light = normalize(vec3(-.48, .78, .4));
  vec3 halfway = normalize(view + light);
  float sheen = pow(max(dot(normal, halfway), 0.), 24.);
  float glint = pow(max(dot(normal, halfway), 0.), 115.);
  float fresnel = pow(1. - max(dot(normal, view), 0.), 4.);
  float reflectionPatch = .035 + .965 * exp(-pow((p.x + .8) * .65, 2.));
  float value = .0028 + reflectionPatch * (sheen * .038 + glint * .14) + fresnel * .025;
  float distanceToShore = (texture2D(uShore, (p + 1.6) / 3.2).r - .5) * 1.2;
  float foamTexture = texture2D(uFoam, (coast.xy - vec2(uWaveTravel * .006, 0.)) * 4.5).r;
  float foam = exp(-abs(distanceToShore - .018) * 48.) * smoothstep(.42, .84, foamTexture) * .65;
  value += foam * .19;
  float haze = 1. - exp(-pow(vDepth * uFogDensity, 2.));
  gl_FragColor = vec4(mix(vec3(value), vec3(.00091), haze), 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

const rockSurface = `
varying vec3 vRockPosition;
float rockHash(vec3 p) {
  p = fract(p * .1031);
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}
float rockNoise(vec3 p) {
  vec3 cell = floor(p);
  vec3 f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(
    mix(mix(rockHash(cell), rockHash(cell + vec3(1,0,0)), f.x),
        mix(rockHash(cell + vec3(0,1,0)), rockHash(cell + vec3(1,1,0)), f.x), f.y),
    mix(mix(rockHash(cell + vec3(0,0,1)), rockHash(cell + vec3(1,0,1)), f.x),
        mix(rockHash(cell + vec3(0,1,1)), rockHash(cell + vec3(1,1,1)), f.x), f.y), f.z);
}`

function cityFootprint(points: Float32Array) {
  const candidates: THREE.Vector2[] = []
  for (let i = 0; i < points.length; i += 9) {
    if (points[i + 1] > 0.1 && points[i + 2] < 0.12)
      candidates.push(new THREE.Vector2(points[i], points[i + 2]))
  }
  candidates.sort((a, b) => a.x - b.x || a.y - b.y)
  const cross = (a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2) =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  const half = (list: THREE.Vector2[]) => {
    const hull: THREE.Vector2[] = []
    for (const point of list) {
      while (
        hull.length > 1 &&
        cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0
      )
        hull.pop()
      hull.push(point)
    }
    return hull.slice(0, -1)
  }
  const hull = [...half(candidates), ...half(candidates.reverse())]
  const center = hull
    .reduce((sum, point) => sum.add(point), new THREE.Vector2())
    .multiplyScalar(1 / hull.length)
  return hull.map((point) =>
    point
      .clone()
      .add(point.clone().sub(center).normalize().multiplyScalar(0.085)),
  )
}

function cliffGeometry(outline: THREE.Vector2[]) {
  const coast: THREE.Vector2[] = []
  outline.forEach((point, index) => {
    const next = outline[(index + 1) % outline.length]
    const count = Math.max(2, Math.ceil(point.distanceTo(next) / 0.065))
    for (let step = 0; step < count; step++)
      coast.push(point.clone().lerp(next, step / count))
  })
  const center = coast
    .reduce((sum, point) => sum.add(point), new THREE.Vector2())
    .multiplyScalar(1 / coast.length)
  const positions: number[] = []
  const colors: number[] = []
  const ringHeights = [-0.006, -0.085, -0.17, -0.26, -0.36, -0.5]
  const ringWidths = [0.94, 1, 1.055, 1.1, 1.18, 1.21]
  const rings = ringHeights.map((height, ring) =>
    coast.map((point, index) => {
      const jagged = Math.sin(index * 7.13 + ring * 3.1) * 0.018
      const radial = point
        .clone()
        .sub(center)
        .multiplyScalar(ringWidths[ring] + jagged)
        .add(center)
      return new THREE.Vector3(
        radial.x,
        height + (ring ? Math.sin(index * 4.7) * 0.012 : 0),
        radial.y,
      )
    }),
  )
  const triangle = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    c: THREE.Vector3,
    tone: number,
  ) => {
    for (const point of [a, b, c]) {
      positions.push(point.x, point.y, point.z)
      colors.push(tone, tone, tone)
    }
  }
  const top = new THREE.Vector3(center.x, -0.006, center.y)
  coast.forEach((_, index) => {
    const next = (index + 1) % coast.length
    triangle(top, rings[0][next], rings[0][index], 0.045)
    for (let ring = 0; ring < rings.length - 1; ring++) {
      const tone =
        0.065 + (0.5 + Math.sin(index * 5.7 + ring * 2.8) * 0.5) * 0.12
      triangle(
        rings[ring][index],
        rings[ring][next],
        rings[ring + 1][index],
        tone,
      )
      triangle(
        rings[ring][next],
        rings[ring + 1][next],
        rings[ring + 1][index],
        tone * 0.85,
      )
    }
  })
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

function shorelineTexture(outline: THREE.Vector2[]) {
  const size = 192
  const data = new Uint8Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = (x / (size - 1)) * 3.2 - 1.6
      const py = (y / (size - 1)) * 3.2 - 1.6
      let distance = Infinity
      let inside = false
      outline.forEach((a, index) => {
        const b = outline[(index + 1) % outline.length]
        const dx = b.x - a.x,
          dy = b.y - a.y
        const t = THREE.MathUtils.clamp(
          ((px - a.x) * dx + (py - a.y) * dy) / (dx * dx + dy * dy),
          0,
          1,
        )
        distance = Math.min(
          distance,
          Math.hypot(px - a.x - dx * t, py - a.y - dy * t),
        )
        if (
          a.y > py !== b.y > py &&
          px < ((b.x - a.x) * (py - a.y)) / (b.y - a.y) + a.x
        )
          inside = !inside
      })
      data[y * size + x] = Math.round(
        THREE.MathUtils.clamp(
          0.5 + (inside ? -distance : distance) / 1.2,
          0,
          1,
        ) * 255,
      )
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat)
  texture.minFilter = texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

function placeCliffOutcrops(
  outcrops: THREE.InstancedMesh,
  outline: THREE.Vector2[],
) {
  const center = outline
    .reduce((sum, point) => sum.add(point), new THREE.Vector2())
    .multiplyScalar(1 / outline.length)
  const pose = new THREE.Object3D()
  for (let index = 0; index < outcrops.count; index++) {
    const edge = Math.floor((index / outcrops.count) * outline.length)
    const variation = (Math.sin(index * 127.1 + 7.7) + 1) * 0.5
    const point = outline[edge]
      .clone()
      .lerp(outline[(edge + 1) % outline.length], variation)
      .sub(center)
      .multiplyScalar(1.1 + variation * 0.1)
      .add(center)
    pose.position.set(point.x, -0.2 - variation * 0.16, point.y)
    pose.scale.set(
      0.025 + variation * 0.037,
      0.03 + variation * 0.035,
      0.03 + variation * 0.04,
    )
    pose.rotation.set(index * 0.7, index * 2.4, index * 0.23)
    pose.updateMatrix()
    outcrops.setMatrixAt(index, pose.matrix)
  }
  outcrops.instanceMatrix.needsUpdate = true
  outcrops.computeBoundingSphere()
}

export function createCityIsland(
  width: number,
  anisotropy: number,
  onLoad: () => void,
) {
  const group = new THREE.Group()
  group.name = 'city-island-ocean'
  group.visible = false
  const fogDepthScale = { value: 1 }
  const rockMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    flatShading: true,
  })
  rockMaterial.onBeforeCompile = (shader: any) => {
    shader.uniforms.islandFogDepthScale = fogDepthScale
    shader.vertexShader =
      'varying vec3 vRockPosition;\n' +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvRockPosition = position;',
      )
    shader.fragmentShader =
      'uniform float islandFogDepthScale;\n' +
      rockSurface +
      '\n' +
      shader.fragmentShader
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          vec3 rockPoint = vRockPosition;
          float rockGrain = rockNoise(rockPoint * 180.);
          float rockStrata = rockNoise(rockPoint * vec3(27., 145., 27.));
          float seam = abs(sin(rockPoint.y * 115. + rockNoise(rockPoint * 12.) * 4.));
          float fissure = abs(sin(rockPoint.x * 23. + rockPoint.z * 17. + rockNoise(rockPoint * 9.) * 5.));
          diffuseColor.rgb *= (.35 + rockGrain * .55 + rockStrata * .32)
            * mix(.55, 1., smoothstep(.025, .14, seam))
            * mix(.55, 1., smoothstep(.03, .16, fissure));`,
        )
        .replace(
          '#include <fog_fragment>',
          THREE.ShaderChunk.fog_fragment.replaceAll(
            'vFogDepth',
            '(vFogDepth * islandFogDepthScale)',
          ),
        )
  }
  rockMaterial.customProgramCacheKey = () => 'island-rock-haze-v2'
  const cliffs = new THREE.Mesh(new THREE.BufferGeometry(), rockMaterial)
  cliffs.name = 'city-cliffs'
  const outcropGeometry = new THREE.IcosahedronGeometry(1, 1)
  const outcropPositions = outcropGeometry.getAttribute('position')
  const outcropColors = new Float32Array(outcropPositions.count * 3)
  for (let index = 0; index < outcropPositions.count; index++) {
    const x = outcropPositions.getX(index)
    const y = outcropPositions.getY(index)
    const z = outcropPositions.getZ(index)
    const facet = 1 + Math.sin(x * 12 + y * 7 + z * 13) * 0.16
    outcropPositions.setXYZ(index, x * facet, y * facet, z * facet)
    outcropColors.set([0.09, 0.09, 0.09], index * 3)
  }
  outcropGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(outcropColors, 3),
  )
  outcropGeometry.computeVertexNormals()
  const outcrops = new THREE.InstancedMesh(outcropGeometry, rockMaterial, 64)
  outcrops.name = 'cliff-rock-outcrops'
  const fallbackNormal = new THREE.DataTexture(
    new Uint8Array([128, 128, 255, 255]),
    1,
    1,
  )
  const fallbackFoam = new THREE.DataTexture(
    new Uint8Array([0, 0, 0, 255]),
    1,
    1,
  )
  fallbackNormal.needsUpdate = fallbackFoam.needsUpdate = true
  const uniforms = {
    uTime: { value: 0 },
    uWaveTravel: { value: 0 },
    uCoastBend: { value: new THREE.Vector3(-0.33, 1.1, 1.8) },
    uFogDensity: { value: 0.005 },
    uNormal: { value: fallbackNormal as THREE.Texture },
    uFoam: { value: fallbackFoam as THREE.Texture },
    uShore: { value: fallbackFoam as THREE.Texture },
  }
  const waterGeometry = new THREE.PlaneGeometry(
    20,
    20,
    width < 700 ? 80 : 160,
    width < 700 ? 80 : 160,
  )
  waterGeometry.rotateX(-Math.PI / 2)
  const water = new THREE.Mesh(
    waterGeometry,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: waterVertex,
      fragmentShader: waterFragment,
    }),
  )
  water.position.y = -0.36
  water.name = 'city-ocean'
  const loader = new THREE.TextureLoader()
  for (const [key, path] of [
    ['uNormal', '/assets/ocean/water-map.png'],
    ['uFoam', '/assets/ocean/foam-texture.png'],
  ] as const) {
    loader.load(
      path,
      (texture) => {
        if (group.userData.disposed) {
          texture.dispose()
          return
        }
        texture.colorSpace = THREE.NoColorSpace
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.anisotropy = anisotropy
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.needsUpdate = true
        const previous = uniforms[key].value
        uniforms[key].value = texture
        if (previous !== uniforms.uShore.value) previous.dispose()
        onLoad()
      },
      undefined,
      () => onLoad(),
    )
  }
  group.add(cliffs, outcrops, water)
  return {
    group,
    cliffs,
    outcrops,
    water,
    uniforms,
    fogDepthScale,
    detail: width < 700 ? 80 : 160,
    sourcePoints: undefined as Float32Array | undefined,
  }
}

export function updateCityIsland(
  island: ReturnType<typeof createCityIsland>,
  city: THREE.Group,
  dt: number,
  reduced: boolean,
  fogDensity: number,
) {
  const frame = city.userData.finalFraming as
    { scale: number; offsetX: number } | undefined
  const points = city.userData.framingPoints as Float32Array | undefined
  island.group.visible = city.visible && !!frame
  if (!frame || !points) return false
  const detail = city.userData.viewport.width < 700 ? 80 : 160
  if (detail !== island.detail) {
    island.water.geometry.dispose()
    island.water.geometry = new THREE.PlaneGeometry(20, 20, detail, detail)
    island.water.geometry.rotateX(-Math.PI / 2)
    island.detail = detail
  }
  if (island.sourcePoints !== points) {
    const outline = cityFootprint(points)
    island.cliffs.geometry.dispose()
    island.cliffs.geometry = cliffGeometry(outline)
    placeCliffOutcrops(island.outcrops, outline)
    const previous = island.uniforms.uShore.value
    const center = outline
      .reduce((sum, point) => sum.add(point), new THREE.Vector2())
      .multiplyScalar(1 / outline.length)
    const waterline = outline.map((point) =>
      point.clone().sub(center).multiplyScalar(1.18).add(center),
    )
    island.uniforms.uShore.value = shorelineTexture(waterline)
    if (previous !== island.uniforms.uFoam.value) previous.dispose()
    island.sourcePoints = points
  }
  island.group.scale.setScalar(frame.scale)
  island.group.position.set(frame.offsetX, city.position.y, 5)
  island.fogDepthScale.value = city.userData.fogDepthScale.value
  island.uniforms.uFogDensity.value = fogDensity * island.fogDepthScale.value
  if (island.group.visible && !reduced) {
    const elapsed = Math.min(dt, 0.05)
    island.uniforms.uTime.value += elapsed
    island.uniforms.uWaveTravel.value += elapsed
  }
  return island.group.visible && !reduced
}
