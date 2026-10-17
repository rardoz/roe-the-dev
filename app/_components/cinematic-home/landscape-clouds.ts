import * as THREE from 'three'
import { smooth } from './motion'

export function createLandscapeClouds(atmosphericClouds: THREE.Group) {
  const group = new THREE.Group()
  group.name = 'landscape-clouds'
  const geometry = new THREE.PlaneGeometry(2, 1)
  let state = 7319
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
  for (let index = 0; index < 30; index++) {
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
    const x = (random() - 0.5) * 4.4
    const z = -2.8 + random() * 4.2
    const altitude = 0.13 + random() * 0.26
    const size = 0.075 + random() * 0.085
    cloud.position.set(x, altitude, z)
    cloud.scale.setScalar(size)
    cloud.userData = {
      originX: x,
      originZ: z,
      altitude,
      phase: random() * Math.PI * 2,
      speed: 0.65 + random() * 0.7,
      opacity: 0.5 + random() * 0.32,
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
    smooth(0.315, 0.35, progress) * (1 - smooth(0.52, 0.64, progress))
  group.visible = visibility > 0.001
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
    const horizonFade = 1 - smooth(4, 10, distance)
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
