import * as THREE from 'three'
import { CITY_FOUNDATION_ELEVATION } from './city'
import {
  createIslandAsset,
  fitIslandAsset,
  shorelineHull,
} from './island-asset'

const coastalWaveCoordinates = `
uniform float uWaveTravel;
uniform vec3 uCoastBend;
vec3 coastalCoordinates(vec2 p) {
  float along = p.y - uCoastBend.x;
  float turn = along / uCoastBend.y;
  float decay = exp(-2. * abs(turn));
  float bow = -uCoastBend.z * uCoastBend.y * (abs(turn) + log(1. + decay) - .69314718);
  float turnDirection = sign(turn) * (1. - decay) / (1. + decay);
  float bowSlope = -uCoastBend.z * turnDirection;
  float straightRun = sqrt(1. + uCoastBend.z * uCoastBend.z);
  float travel = along * straightRun - (straightRun - 1.) * uCoastBend.y * turnDirection;
  return vec3(travel, p.x - bow, bowSlope);
}`

const waterVertex = `
${coastalWaveCoordinates}
varying vec2 vSurface;
varying vec3 vWorld;
varying float vDepth;
void main() {
  vec3 p = position;
  vec3 coast = coastalCoordinates(p.xz);
  float phase = (coast.y - uWaveTravel * .006) * 7.;
  p.y += sin(phase) * .005;
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
varying vec3 vWorld;
varying float vDepth;
float skyHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float skyNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 blend = fract(p);
  blend = blend * blend * (3. - 2. * blend);
  return mix(
    mix(skyHash(cell), skyHash(cell + vec2(1., 0.)), blend.x),
    mix(skyHash(cell + vec2(0., 1.)), skyHash(cell + vec2(1., 1.)), blend.x),
    blend.y);
}
vec3 normalPatch(vec2 uv, vec2 cell) {
  vec2 offset = vec2(skyHash(cell), skyHash(cell + vec2(47.2, -19.8)));
  float scale = mix(.7, 1.45, skyHash(cell + vec2(-13.1, 62.4)));
  return texture2D(uNormal, uv * scale + offset * 8.7).xyz * 2. - 1.;
}
vec3 irregularWaterNormal(vec2 uv) {
  vec2 grid = mat2(1., 0., -.57735027, 1.15470054) * uv * .9;
  vec2 cell = floor(grid);
  vec2 f = fract(grid);
  vec2 a;
  vec2 b;
  vec2 c;
  vec3 weights;
  if (f.x + f.y < 1.) {
    a = cell;
    b = cell + vec2(1., 0.);
    c = cell + vec2(0., 1.);
    weights = vec3(1. - f.x - f.y, f.x, f.y);
  } else {
    a = cell + vec2(1.);
    b = cell + vec2(0., 1.);
    c = cell + vec2(1., 0.);
    weights = vec3(f.x + f.y - 1., 1. - f.x, 1. - f.y);
  }
  weights = weights * weights * weights;
  weights /= dot(weights, vec3(1.));
  vec3 result = normalPatch(uv, a) * weights.x
    + normalPatch(uv, b) * weights.y
    + normalPatch(uv, c) * weights.z;
  result.xy *= inversesqrt(dot(weights, weights));
  return result;
}
float oceanLighting(vec2 p) {
  vec2 q = mat2(.8, .6, -.6, .8) * p * .6;
  vec2 warp = vec2(
    skyNoise(q * .46 + vec2(13.7, -8.3)),
    skyNoise(q * .59 + vec2(-5.2, 24.1))) - .5;
  q += warp * 2.1;
  float broad = skyNoise(q * .47 + vec2(-17.1, 6.8));
  float medium = skyNoise(mat2(.36, .93, -.93, .36) * q * 1.31 + vec2(31.8, -4.9));
  float small = skyNoise(mat2(.91, -.41, .41, .91) * q * 3.29 + vec2(-9.4, 41.3));
  return broad * .48 + medium * .34 + small * .18;
}
void main() {
  vec2 p = vSurface;
  float lighting = oceanLighting(p);
  vec3 coast = coastalCoordinates(p);
  vec2 flow = (coast.xy - vec2(uWaveTravel * .006, 0.)) * 1.55;
  vec3 surfaceNormal = irregularWaterNormal(flow);
  float wavePacket = skyNoise(mat2(.73, .68, -.68, .73) * flow * .39 + vec2(9.3, -19.7)) * .65
    + skyNoise(mat2(.92, -.39, .39, .92) * flow * .91 + vec2(-27.1, 6.2)) * .35;
  float packetVariation = smoothstep(.18, .82, wavePacket);
  vec2 tangent = normalize(vec2(coast.z, 1.));
  vec2 across = vec2(tangent.y, -tangent.x);
  vec2 ripple = (tangent * surfaceNormal.x + across * surfaceNormal.y) * .8 * mix(.55, 1.2, packetVariation);
  vec3 normal = normalize(vec3(ripple.x, 1., ripple.y));
  vec3 view = normalize(cameraPosition - vWorld);
  vec3 leftSky = normalize(view + normalize(vec3(-.48, .78, .4)));
  vec3 rightSky = normalize(view + normalize(vec3(.52, .82, .18)));
  float leftReflection = max(dot(normal, leftSky), 0.);
  float rightReflection = max(dot(normal, rightSky), 0.);
  float softSheen = pow(leftReflection, 6.) * .55 + pow(rightReflection, 6.) * .45;
  float sheenPower = mix(14., 32., packetVariation);
  float glintPower = mix(65., 150., packetVariation);
  float sheen = pow(leftReflection, sheenPower) * .55 + pow(rightReflection, sheenPower) * .45;
  float glint = pow(leftReflection, glintPower) * .55 + pow(rightReflection, glintPower) * .45;
  float fresnel = pow(1. - max(dot(normal, view), 0.), 4.);
  float skyVariation = mix(.2, .8, smoothstep(.18, .78, lighting));
  float reflection = skyVariation * mix(.45, 1.1, packetVariation) * (softSheen * .022 + sheen * .07 + glint * .08);
  reflection = .032 * reflection / (.032 + reflection);
  float waveFace = pow(min(length(ripple) * 3., 1.), 1.35);
  float surfaceDetail = waveFace * mix(.65, 1., lighting) * .014;
  float value = .0012 + reflection + fresnel * .006 + surfaceDetail;
  float distanceToShore = (texture2D(uShore, (p + 1.6) / 3.2).r - .5) * 1.2;
  float foamTexture = texture2D(uFoam, (coast.xy - vec2(uWaveTravel * .006, 0.)) * 4.5).r;
  float foam = exp(-abs(distanceToShore - .018) * 48.) * smoothstep(.42, .84, foamTexture) * .65;
  value += foam * .1;
  float haze = 1. - exp(-pow(vDepth * uFogDensity, 2.));
  gl_FragColor = vec4(mix(vec3(value), vec3(.00091), haze), 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

function cityFootprint(points: Float32Array) {
  const candidates: THREE.Vector2[] = []
  for (let i = 0; i < points.length; i += 9) {
    if (points[i + 1] > CITY_FOUNDATION_ELEVATION + 0.1 && points[i + 2] < 0.12)
      candidates.push(new THREE.Vector2(points[i], points[i + 2]))
  }
  const hull = shorelineHull(candidates)
  const center = hull
    .reduce((sum, point) => sum.add(point), new THREE.Vector2())
    .multiplyScalar(1 / hull.length)
  return hull.map((point) =>
    point
      .clone()
      .add(point.clone().sub(center).normalize().multiplyScalar(0.085)),
  )
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

export function createCityIsland(
  width: number,
  anisotropy: number,
  onLoad: () => void,
) {
  const group = new THREE.Group()
  group.name = 'city-island-ocean'
  group.visible = false
  const fogDepthScale = { value: 1 }
  const rocks = createIslandAsset(anisotropy, fogDepthScale, onLoad)
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
    uCoastBend: { value: new THREE.Vector3(0.45, 0.8, 3) },
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
  group.add(rocks, water)
  return {
    group,
    rocks,
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
  if (
    island.sourcePoints !== points &&
    island.rocks.userData.assetState === 'ready'
  ) {
    const outline = cityFootprint(points)
    const waterline = fitIslandAsset(
      island.rocks,
      outline,
      island.water.position.y,
    )
    const previous = island.uniforms.uShore.value
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
