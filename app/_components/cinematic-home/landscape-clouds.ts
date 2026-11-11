import * as THREE from 'three'
import { IMPACT_FLASH_PEAK, smooth } from './motion'

// Positions are in the island's local space: negative z recedes behind the city.
const cloudField = [
  [-2.35, -3.35, 0.34, 0.12, 0.42],
  [-1.38, -4.12, 0.42, 0.105, 0.36],
  [-0.35, -3.4, 0.26, 0.115, 0.4],
  [0.42, -4.25, 0.38, 0.135, 0.36],
  [1.56, -3.5, 0.29, 0.12, 0.4],
  [2.6, -4.1, 0.35, 0.14, 0.36],
  [-2.95, -1.9, 0.3, 0.17, 0.55],
  [-1.85, -2.78, 0.48, 0.15, 0.5],
  [-0.75, -2.22, 0.28, 0.145, 0.52],
  [0.18, -2.85, 0.25, 0.17, 0.46],
  [1.22, -2.32, 0.4, 0.155, 0.48],
  [2.22, -2.63, 0.32, 0.19, 0.5],
  [3.35, -1.5, 0.47, 0.18, 0.51],
  [-1.65, -1.05, 0.38, 0.22, 0.7],
  [1.72, -0.85, 0.32, 0.24, 0.67],
  [-1.48, 0.05, 0.25, 0.28, 0.71],
  [1.7, 0.62, 0.34, 0.29, 0.75],
  [-1.34, 0.83, 0.24, 0.34, 0.8],
  [1.36, 1.38, 0.3, 0.38, 0.78],
  [-1.43, 1.95, 0.25, 0.45, 0.8],
  [1.04, 2.28, 0.22, 0.42, 0.8],
]

export function createLandscapeClouds(atmosphericClouds: THREE.Group) {
  const group = new THREE.Group()
  group.name = 'landscape-clouds'
  const geometry = new THREE.PlaneGeometry(2, 1)
  let state = 7319
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
  for (let index = 0; index < cloudField.length; index++) {
    const source = atmosphericClouds.children[index % 20] as THREE.Mesh<
      THREE.PlaneGeometry,
      THREE.MeshBasicMaterial
    >
    const material = new THREE.MeshBasicMaterial({
      map: source.material.map,
      transparent: true,
      opacity: 0,
      alphaTest: 0.005,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    })
    const cloud = new THREE.Mesh(geometry, material)
    cloud.name = `landscape-cloud-${index + 1}`
    const [x, z, altitude, size, opacity] = cloudField[index]
    cloud.position.set(x, altitude, z)
    cloud.scale.setScalar(size)
    cloud.userData = {
      originX: x,
      originZ: z,
      altitude,
      phase: random() * Math.PI * 2,
      speed: 0.65 + random() * 0.7,
      opacity,
    }
    group.add(cloud)
  }
  return group
}

const cameraLocal = new THREE.Vector3()
const projected = new THREE.Vector3()

export function updateLandscapeClouds(
  group: THREE.Group,
  camera: THREE.PerspectiveCamera,
  time: number,
  progress: number,
) {
  const visibility =
    smooth(0.335, 0.355, progress) * (1 - smooth(0.52, 0.64, progress))
  group.visible = progress < IMPACT_FLASH_PEAK && visibility > 0.001
  if (!group.visible) return
  group.updateWorldMatrix(true, false)
  cameraLocal.copy(camera.position)
  group.worldToLocal(cameraLocal)
  for (const child of group.children) {
    const cloud = child as THREE.Mesh<
      THREE.PlaneGeometry,
      THREE.MeshBasicMaterial
    >
    const pose = cloud.userData
    const phase = time * 0.035 * pose.speed + pose.phase
    cloud.position.set(
      pose.originX + Math.sin(phase) * 0.075,
      pose.altitude + Math.sin(phase * 0.6) * 0.008,
      pose.originZ + Math.cos(phase * 0.75) * 0.025,
    )
    cloud.quaternion.copy(camera.quaternion)
    const distance = cameraLocal.distanceTo(cloud.position)
    const horizonFade = 1 - smooth(7, 18, distance)
    projected
      .copy(cloud.position)
      .applyMatrix4(group.matrixWorld)
      .project(camera)
    const aboutClearance = 1 - smooth(-0.35, 0.05, projected.y)
    const contentClearance = THREE.MathUtils.lerp(
      aboutClearance,
      1,
      smooth(0.455, 0.47, progress),
    )
    cloud.material.opacity =
      visibility * pose.opacity * horizonFade * contentClearance
  }
}
