import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { disposeObject } from './asteroid'
import { CITY_FOUNDATION_ELEVATION, CITY_ISLAND_IMMERSION } from './city'

export function shorelineHull(points: THREE.Vector2[]) {
  const sorted = points.slice().sort((a, b) => a.x - b.x || a.y - b.y)
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
  return [...half(sorted), ...half(sorted.reverse())]
}

export function createIslandAsset(
  anisotropy: number,
  fogDepthScale: { value: number },
  onLoad: () => void,
) {
  const group = new THREE.Group()
  group.name = 'island-asset'
  group.userData.assetState = 'loading'
  new GLTFLoader().load(
    '/assets/island/island.glb',
    ({ scene }) => {
      if (group.userData.disposed) {
        disposeObject(scene)
        return
      }
      const bounds = new THREE.Box3().setFromObject(scene)
      if (bounds.isEmpty()) {
        disposeObject(scene)
        group.userData.assetState = 'error'
        onLoad()
        return
      }
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material]
        for (const material of materials) {
          if (material instanceof THREE.MeshStandardMaterial) {
            material.metalness = 0
            material.roughness = 0.95
          }
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) value.anisotropy = anisotropy
          }
          material.onBeforeCompile = (
            shader: THREE.WebGLProgramParametersWithUniforms,
          ) => {
            shader.uniforms.islandFogDepthScale = fogDepthScale
            shader.fragmentShader =
              'uniform float islandFogDepthScale;\n' +
              shader.fragmentShader
                .replace(
                  '#include <color_fragment>',
                  `#include <color_fragment>
                  float stone = dot(diffuseColor.rgb, vec3(.2126, .7152, .0722));
                  diffuseColor.rgb = vec3(stone * .25);`,
                )
                .replace(
                  '#include <fog_fragment>',
                  THREE.ShaderChunk.fog_fragment.replaceAll(
                    'vFogDepth',
                    '(vFogDepth * islandFogDepthScale)',
                  ),
                )
          }
          material.customProgramCacheKey = () => 'island-asset-noir-v1'
        }
      })
      group.add(scene)
      group.userData.bounds = bounds
      group.userData.assetState = 'ready'
      onLoad()
    },
    undefined,
    () => {
      if (group.userData.disposed) return
      group.userData.assetState = 'error'
      onLoad()
    },
  )
  return group
}

function foundationCoverage(point: THREE.Vector2, outline: THREE.Vector2[]) {
  let distance = Infinity
  let inside = true
  for (let index = 0; index < outline.length; index++) {
    const a = outline[index]
    const b = outline[(index + 1) % outline.length]
    const edge = b.clone().sub(a)
    const relative = point.clone().sub(a)
    if (edge.cross(relative) < 0) inside = false
    const t = THREE.MathUtils.clamp(relative.dot(edge) / edge.lengthSq(), 0, 1)
    distance = Math.min(distance, relative.sub(edge.multiplyScalar(t)).length())
  }
  return inside ? 1 : 1 - THREE.MathUtils.smoothstep(distance, 0, 0.18)
}

export function fitIslandAsset(
  asset: THREE.Group,
  outline: THREE.Vector2[],
  waterLevel: number,
) {
  const bounds = asset.userData.bounds as THREE.Box3
  const center = bounds.getCenter(new THREE.Vector3())
  const size = bounds.getSize(new THREE.Vector3())
  const footprint = new THREE.Box2().setFromPoints(outline)
  const footprintSize = footprint.getSize(new THREE.Vector2())
  const footprintCenter = footprint.getCenter(new THREE.Vector2())
  const fittedScale =
    Math.max(footprintSize.x / size.x, footprintSize.y / size.z) * 1.08
  const widthScale = fittedScale * 1.45
  const depthScale = fittedScale * 1.1
  const heightScale = fittedScale * 1.3
  const foregroundOffset = (size.z * (depthScale - fittedScale)) / 2
  const supportY = CITY_FOUNDATION_ELEVATION - CITY_ISLAND_IMMERSION - 0.003
  const offsetY = supportY - bounds.max.y * heightScale
  const waterline: THREE.Vector2[] = []
  asset.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const geometry = object.geometry as THREE.BufferGeometry
    const positions = geometry.getAttribute('position')
    for (let index = 0; index < positions.count; index++) {
      const x =
        (positions.getX(index) - center.x) * widthScale + footprintCenter.x
      const z =
        (positions.getZ(index) - center.z) * depthScale +
        footprintCenter.y +
        foregroundOffset
      const y = positions.getY(index)
      const deck = THREE.MathUtils.smoothstep(
        y,
        bounds.max.y - size.y * 0.32,
        bounds.max.y - size.y * 0.23,
      )
      const contact =
        deck * foundationCoverage(new THREE.Vector2(x, z), outline)
      positions.setXYZ(
        index,
        x,
        THREE.MathUtils.lerp(y * heightScale + offsetY, supportY, contact),
        z,
      )
    }
    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    const indices = geometry.getIndex()
    const count = indices?.count ?? positions.count
    for (let index = 0; index < count; index += 3) {
      for (let edge = 0; edge < 3; edge++) {
        a.fromBufferAttribute(
          positions,
          indices?.getX(index + edge) ?? index + edge,
        )
        const next = index + ((edge + 1) % 3)
        b.fromBufferAttribute(positions, indices?.getX(next) ?? next)
        if (a.y > waterLevel === b.y > waterLevel) continue
        a.lerp(b, (waterLevel - a.y) / (b.y - a.y))
        waterline.push(new THREE.Vector2(a.x, a.z))
      }
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
  })
  return shorelineHull(waterline)
}
