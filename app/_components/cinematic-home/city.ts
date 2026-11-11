import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { disposeObject } from './asteroid'
import { cloudPlacements } from './atmospheric-cloud-model'
import { shorelineHull } from './island-asset'

export const CITY_FOUNDATION_ELEVATION = 0.12
export const CITY_ISLAND_IMMERSION = 0.28
export const CITY_WATER_LEVEL =
  CITY_FOUNDATION_ELEVATION - CITY_ISLAND_IMMERSION

export const cityImpactView = (mobile: boolean) => ({
  eye: [9, 65, mobile ? 170 : 130] as const,
  target: [0, 48, -25] as const,
})

type CityFraming = { scale: number; offsetX: number; projectedWidth: number }

export type CityView = {
  eye: [number, number, number]
  target: [number, number, number]
}

function landscapeView(
  bounds: THREE.Box3,
  corners: THREE.Vector3[],
  width: number,
  height: number,
  elevation: number,
): CityView {
  const camera = new THREE.PerspectiveCamera(
    width < 700 ? 52 : 45,
    width / height,
    0.1,
    1600,
  )
  const target = bounds.getCenter(new THREE.Vector3())
  const direction = new THREE.Vector3(
    0.05,
    Math.sin(elevation),
    Math.cos(elevation),
  ).normalize()
  const point = new THREE.Vector3()
  const fits = (distance: number) => {
    camera.position.copy(target).addScaledVector(direction, distance)
    camera.lookAt(target)
    camera.updateMatrixWorld()
    return corners.every((corner) => {
      point.copy(corner).project(camera)
      return (
        Math.abs(point.x) <= 0.9 &&
        point.y >= -0.86 &&
        point.y <= 0.76 &&
        point.z < 1
      )
    })
  }
  let near = bounds.getSize(point).length() * 0.5
  let far = near * 10
  for (let iteration = 0; iteration < 28; iteration++) {
    const distance = (near + far) / 2
    if (fits(distance)) far = distance
    else near = distance
  }
  fits(far)
  return { eye: camera.position.toArray(), target: target.toArray() }
}

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
  let fittedScale = scale
  for (let attempt = 0; attempt < 60; attempt++) {
    center(fittedScale)
    let top = -Infinity
    for (let index = 0; index < points.length; index += 3) {
      const point = new THREE.Vector3(
        points[index] * fittedScale + offsetX,
        points[index + 1] * fittedScale,
        points[index + 2] * fittedScale + 5,
      ).project(camera)
      top = Math.max(top, point.y)
    }
    if (top <= 0.76) break
    fittedScale *= 0.96
  }
  const projectedWidth = center(fittedScale) / 2
  return { scale: fittedScale, offsetX, projectedWidth }
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
  const final = fitFraming(points, width, height, cityImpactView(mobile), 2)
  city.userData.finalFraming = final
  city.userData.projectedWidth = final.projectedWidth
  const bounds = city.userData.sourceBounds as THREE.Box3
  const cityHeight = (bounds.max.y - bounds.min.y) * final.scale
  const foundationY =
    (CITY_FOUNDATION_ELEVATION - CITY_ISLAND_IMMERSION) * final.scale
  city.userData.foundationY = foundationY
  city.userData.arrivalOffset = -Math.max(210, cityHeight + 20)
  // Both exports share source coordinates; keep the intact framing after impact.
  for (const asset of city.children) {
    asset.scale.setScalar(final.scale * (city.userData.assetUnitScale || 1))
    asset.position.set(
      final.offsetX - ((bounds.min.x + bounds.max.x) / 2) * final.scale,
      -city.userData.groundY * final.scale + foundationY,
      5 - ((bounds.min.z + bounds.max.z) / 2) * final.scale,
    )
    const craterCenter: unknown = asset.userData.craterCenter
    if (craterCenter instanceof THREE.Vector3) {
      city.userData.impactPoint = craterCenter
        .clone()
        .multiply(asset.scale)
        .add(asset.position)
    }
  }
  const landscapeBounds = bounds.clone()
  landscapeBounds.translate(
    new THREE.Vector3(
      -(bounds.min.x + bounds.max.x) / 2,
      -city.userData.groundY,
      -(bounds.min.z + bounds.max.z) / 2,
    ),
  )
  landscapeBounds.min.multiplyScalar(final.scale)
  landscapeBounds.max.multiplyScalar(final.scale)
  landscapeBounds.translate(new THREE.Vector3(final.offsetX, foundationY, 5))
  const viewPoints = (city.userData.viewPoints as THREE.Vector3[]).map(
    (point) =>
      point
        .clone()
        .multiplyScalar(final.scale)
        .add(
          new THREE.Vector3(
            final.offsetX,
            -CITY_ISLAND_IMMERSION * final.scale,
            5,
          ),
        ),
  )
  city.userData.closeView = landscapeView(
    landscapeBounds,
    viewPoints,
    width,
    height,
    THREE.MathUtils.degToRad(42),
  )
  city.userData.aftermathView = landscapeView(
    landscapeBounds,
    viewPoints,
    width,
    height,
    THREE.MathUtils.degToRad(25),
  )
  const eye = new THREE.Vector3(final.offsetX, 0, 5)
  const elevation = THREE.MathUtils.degToRad(76)
  const viewCamera = new THREE.PerspectiveCamera(
    mobile ? 52 : 45,
    width / height,
    0.1,
    1600,
  )
  const islandWidth = (bounds.max.x - bounds.min.x) * final.scale
  const distance =
    islandWidth /
    (2 *
      Math.tan(THREE.MathUtils.degToRad(viewCamera.fov) / 2) *
      viewCamera.aspect *
      0.5)
  eye.y = foundationY + Math.sin(elevation) * distance
  eye.z += Math.cos(elevation) * distance
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

function prepareCityMaterials(
  scene: THREE.Object3D,
  anisotropy: number,
  fogDepthScale: { value: number },
) {
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const materials: THREE.Material[] = Array.isArray(object.material)
      ? object.material
      : [object.material]
    for (const material of materials) {
      material.onBeforeCompile = (shader) => {
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
}

export function updateCityImpact(city: THREE.Group, exploded: boolean) {
  const showExploded =
    exploded &&
    city.userData.assetState === 'ready' &&
    city.userData.explodedAssetState === 'ready'
  for (const asset of city.children) {
    asset.visible =
      asset.name === 'city-exploded-asset' ? showExploded : !showExploded
  }
  city.userData.variant = showExploded ? 'exploded' : 'intact'
}

export function createCity(
  anisotropy: number,
  onLoad: () => void,
  onError: (error: unknown) => void,
  onExplodedLoad?: (asset: THREE.Object3D) => void,
) {
  const city = new THREE.Group()
  city.name = 'city'
  city.userData.assetState = 'loading'
  city.userData.explodedAssetState = 'loading'
  const fogDepthScale = { value: 1 }
  city.userData.fogDepthScale = fogDepthScale
  const loader = new GLTFLoader()
  loader.load(
    '/assets/city/city-island.glb',
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
      const sourceDepth = bounds.max.z - bounds.min.z
      if (sourceDepth > 0) {
        city.userData.assetUnitScale = 2 / sourceDepth
        scene.scale.multiplyScalar(city.userData.assetUnitScale)
        scene.updateMatrixWorld(true)
        bounds.setFromObject(scene)
      }
      scene.name = 'city-asset'
      const points: number[] = []
      const point = new THREE.Vector3()
      const sourceCenter = bounds.getCenter(new THREE.Vector3())
      const groundY = 0
      const waterY = -2.35 * city.userData.assetUnitScale
      const waterline: THREE.Vector2[] = []
      const a = new THREE.Vector3()
      const b = new THREE.Vector3()
      const roof = new THREE.Vector3(0, -Infinity, 0)
      const viewPoints: THREE.Vector3[] = []
      scene.updateMatrixWorld(true)
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        const meshBounds = new THREE.Box3().setFromObject(object)
        for (const x of [meshBounds.min.x, meshBounds.max.x])
          for (const y of [meshBounds.min.y, meshBounds.max.y])
            for (const z of [meshBounds.min.z, meshBounds.max.z])
              viewPoints.push(
                new THREE.Vector3(
                  x - sourceCenter.x,
                  y - groundY + CITY_FOUNDATION_ELEVATION,
                  z - sourceCenter.z,
                ),
              )
        const positions = object.geometry.getAttribute('position')
        for (let index = 0; index < positions.count; index++) {
          point
            .fromBufferAttribute(positions, index)
            .applyMatrix4(object.matrixWorld)
          points.push(
            point.x - (bounds.min.x + bounds.max.x) / 2,
            point.y - groundY + CITY_FOUNDATION_ELEVATION,
            point.z - sourceCenter.z,
          )
          if (point.y > roof.y) roof.copy(point)
        }
        if (
          object.name.startsWith('Island_') ||
          object.name.startsWith('Island ')
        ) {
          const indices = object.geometry.getIndex()
          const count = indices?.count ?? positions.count
          for (let index = 0; index < count; index += 3) {
            for (let edge = 0; edge < 3; edge++) {
              a.fromBufferAttribute(
                positions,
                indices?.getX(index + edge) ?? index + edge,
              ).applyMatrix4(object.matrixWorld)
              const next = index + ((edge + 1) % 3)
              b.fromBufferAttribute(
                positions,
                indices?.getX(next) ?? next,
              ).applyMatrix4(object.matrixWorld)
              if (a.y > waterY === b.y > waterY) continue
              a.lerp(b, (waterY - a.y) / (b.y - a.y))
              waterline.push(
                new THREE.Vector2(a.x - sourceCenter.x, a.z - sourceCenter.z),
              )
            }
          }
        }
      })
      prepareCityMaterials(scene, anisotropy, fogDepthScale)
      city.add(scene)
      city.userData.sourceBounds = bounds
      city.userData.groundY = groundY
      city.userData.viewPoints = viewPoints
      city.userData.waterLevel = CITY_WATER_LEVEL + waterY
      city.userData.shoreline = shorelineHull(waterline)
      city.userData.roof = roof.set(
        roof.x - sourceCenter.x,
        roof.y - groundY + CITY_FOUNDATION_ELEVATION,
        roof.z - sourceCenter.z,
      )
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
  loader.load(
    '/assets/city/city-island-exploded.glb',
    ({ scene }) => {
      if (city.userData.disposed) {
        disposeObject(scene)
        return
      }
      if (new THREE.Box3().setFromObject(scene).isEmpty()) {
        disposeObject(scene)
        city.userData.explodedAssetState = 'error'
        onError(new Error('Exploded city asset contains no geometry'))
        return
      }
      const craterBounds = new THREE.Box3()
      scene.traverse((object) => {
        if (object.name.startsWith('Impact_crater'))
          craterBounds.expandByObject(object)
      })
      if (craterBounds.isEmpty()) {
        disposeObject(scene)
        city.userData.explodedAssetState = 'error'
        onError(new Error('Exploded city asset contains no impact crater'))
        return
      }
      scene.userData.craterCenter = craterBounds.getCenter(new THREE.Vector3())
      scene.userData.craterCenter.y = craterBounds.min.y
      scene.name = 'city-exploded-asset'
      scene.visible = false
      prepareCityMaterials(scene, anisotropy, fogDepthScale)
      onExplodedLoad?.(scene)
      city.add(scene)
      const { width, height } = city.userData.viewport || {
        width: window.innerWidth,
        height: window.innerHeight,
      }
      fitCityToViewport(city, width, height)
      city.userData.explodedAssetState = 'ready'
      onLoad()
    },
    undefined,
    (error) => {
      if (city.userData.disposed) return
      city.userData.explodedAssetState = 'error'
      onError(new Error('Exploded city asset failed to load', { cause: error }))
    },
  )
  return city
}
