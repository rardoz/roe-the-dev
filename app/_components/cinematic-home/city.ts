import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { disposeObject } from './asteroid'
import { cloudPlacements } from './atmospheric-cloud-model'

export const CITY_FOUNDATION_ELEVATION = 0.12
export const CITY_ISLAND_IMMERSION = 0.28

export const cityImpactView = (mobile: boolean) => ({
  eye: [9, 65, mobile ? 170 : 130] as const,
  target: [0, 48, -25] as const,
})

type CityFraming = { scale: number; offsetX: number; projectedWidth: number }

export type DistantCityView = {
  eye: THREE.Vector3
  minimumAngle: number
  cloudAnchors: Map<number, THREE.Vector3>
}

function fitFraming(
  points: Float32Array,
  width: number,
  height: number,
  view: { eye: readonly number[]; target: readonly [number, number, number] },
  targetWidth: number,
): CityFraming {
  const mobile = width < 700
  const camera = new THREE.PerspectiveCamera(
    mobile ? 52 : 45,
    width / height,
    0.1,
    1600,
  )
  camera.position.fromArray(view.eye)
  camera.lookAt(...view.target)
  camera.updateMatrixWorld()
  const matrix = new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse,
  ).elements
  let offsetX = 0
  const measure = (scale: number) => {
    let left = Infinity,
      right = -Infinity,
      leftSlope = 0,
      rightSlope = 0
    for (let index = 0; index < points.length; index += 3) {
      const x = points[index] * scale + offsetX
      const y = points[index + 1] * scale
      const z = points[index + 2] * scale + 5
      const depth = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15]
      if (depth < 1) continue
      const screenY =
        (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / depth
      if (screenY < -1 || screenY > 1) continue
      const screenX =
        (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / depth
      const slope = (matrix[0] - screenX * matrix[3]) / depth
      if (screenX < left) {
        left = screenX
        leftSlope = slope
      }
      if (screenX > right) {
        right = screenX
        rightSlope = slope
      }
    }
    return { left, right, slope: (leftSlope + rightSlope) / 2 }
  }
  const center = (scale: number) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const { left, right, slope } = measure(scale)
      if (!Number.isFinite(left + right) || slope === 0) break
      offsetX -= (left + right) / (2 * slope)
    }
    const { left, right } = measure(scale)
    return right - left
  }
  let lower = 1,
    upper = 85
  while (center(upper) < targetWidth && upper < 680) upper *= 1.5
  for (let attempt = 0; attempt < 18; attempt++) {
    const scale = (lower + upper) / 2
    if (center(scale) < targetWidth) lower = scale
    else upper = scale
  }
  const scale = (lower + upper) / 2
  const projectedWidth = center(scale) / 2
  return { scale, offsetX, projectedWidth }
}

export function fitCityToViewport(
  city: THREE.Group,
  width: number,
  height: number,
) {
  city.userData.viewport = { width, height }
  const points = city.userData.framingPoints as Float32Array | undefined
  if (!points) return
  const mobile = width < 700
  const final = fitFraming(points, width, height, cityImpactView(mobile), 2.66)
  city.userData.finalFraming = final
  city.userData.projectedWidth = final.projectedWidth
  const bounds = city.userData.sourceBounds as THREE.Box3
  const cityHeight = (bounds.max.y - bounds.min.y) * final.scale
  const foundationY =
    (CITY_FOUNDATION_ELEVATION - CITY_ISLAND_IMMERSION) * final.scale
  city.userData.foundationY = foundationY
  city.userData.arrivalOffset = -Math.max(210, cityHeight + 20)
  city.children[0].scale.setScalar(final.scale)
  city.children[0].position.set(
    final.offsetX - ((bounds.min.x + bounds.max.x) / 2) * final.scale,
    -bounds.min.y * final.scale + foundationY,
    5,
  )
  const eye = new THREE.Vector3(
    0,
    Math.max(360, cityHeight * 4),
    Math.max(240, (bounds.max.z - bounds.min.z) * final.scale * 0.8 + 50),
  ).multiplyScalar(0.6)
  const upperCityY = cityHeight * 0.65 + foundationY
  const upperCityZ = 5 - final.scale * 0.5
  const distance = Math.hypot(eye.y - upperCityY, eye.z - upperCityZ)
  const elevation = THREE.MathUtils.degToRad(72)
  eye.y = upperCityY + Math.sin(elevation) * distance
  eye.z = upperCityZ + Math.cos(elevation) * distance
  let minimumAngle = Math.PI / 2
  for (let index = 0; index < points.length; index += 3) {
    minimumAngle = Math.min(
      minimumAngle,
      Math.atan2(
        eye.y - (points[index + 1] - CITY_ISLAND_IMMERSION) * final.scale,
        eye.z - (points[index + 2] * final.scale + 5),
      ),
    )
  }
  const cloudAnchors = new Map<number, THREE.Vector3>()
  const sourceWidth = bounds.max.x - bounds.min.x
  for (const cloud of cloudPlacements.filter(({ layer }) => layer >= 8)) {
    const sourceX = (cloud.x / 105) * sourceWidth * 0.3
    const peak = new THREE.Vector3(sourceX, 0, 0)
    for (let index = 0; index < points.length; index += 3) {
      if (
        Math.abs(points[index] - sourceX) < sourceWidth * 0.09 &&
        points[index + 1] > peak.y
      )
        peak.fromArray(points, index)
    }
    peak.y -= CITY_ISLAND_IMMERSION
    peak.multiplyScalar(final.scale)
    peak.x += final.offsetX
    peak.z += 5
    const radius = cloud.scale[0] * 1.25 * Math.sqrt(1.25)
    peak.y -= radius * 0.3
    const skylineCloudCeiling =
      eye.y -
      (radius + (eye.z - peak.z) * Math.sin(minimumAngle)) /
        Math.cos(minimumAngle)
    peak.y = Math.min(peak.y, skylineCloudCeiling)
    cloudAnchors.set(cloud.seed, peak)
  }
  city.userData.distantView = {
    eye,
    minimumAngle,
    cloudAnchors,
  } satisfies DistantCityView
}

export function createCity(
  anisotropy: number,
  onLoad: () => void,
  onError: (error: unknown) => void,
) {
  const city = new THREE.Group()
  city.name = 'city'
  city.userData.assetState = 'loading'
  const fogDepthScale = { value: 1 }
  city.userData.fogDepthScale = fogDepthScale
  new GLTFLoader().load(
    '/city-v2.glb',
    ({ scene }) => {
      if (city.userData.disposed) {
        disposeObject(scene)
        return
      }
      const bounds = new THREE.Box3().setFromObject(scene)
      if (bounds.isEmpty()) {
        disposeObject(scene)
        city.userData.assetState = 'error'
        onError(new Error('City asset contains no geometry'))
        return
      }
      scene.name = 'city-asset'
      const points: number[] = []
      const point = new THREE.Vector3()
      scene.updateMatrixWorld(true)
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        const positions = object.geometry.getAttribute('position')
        for (let index = 0; index < positions.count; index++) {
          point
            .fromBufferAttribute(positions, index)
            .applyMatrix4(object.matrixWorld)
          points.push(
            point.x - (bounds.min.x + bounds.max.x) / 2,
            point.y - bounds.min.y + CITY_FOUNDATION_ELEVATION,
            point.z,
          )
        }
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material]
        for (const material of materials) {
          material.onBeforeCompile = (shader: any) => {
            shader.uniforms.cityFogDepthScale = fogDepthScale
            shader.fragmentShader =
              'uniform float cityFogDepthScale;\n' +
              shader.fragmentShader.replace(
                '#include <fog_fragment>',
                THREE.ShaderChunk.fog_fragment.replaceAll(
                  'vFogDepth',
                  '(vFogDepth * cityFogDepthScale)',
                ),
              )
          }
          material.customProgramCacheKey = () => 'city-distance-haze-v1'
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) value.anisotropy = anisotropy
          }
        }
      })
      city.add(scene)
      city.userData.sourceBounds = bounds
      city.userData.framingPoints = new Float32Array(points)
      const { width, height } = city.userData.viewport || {
        width: window.innerWidth,
        height: window.innerHeight,
      }
      fitCityToViewport(city, width, height)
      city.userData.assetState = 'ready'
      onLoad()
    },
    undefined,
    (error) => {
      if (city.userData.disposed) return
      city.userData.assetState = 'error'
      onError(error)
    },
  )
  return city
}
