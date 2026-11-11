import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { disposeObject } from './asteroid'

export function createMushroomCloud(
  anisotropy: number,
  onLoad: () => void,
  onError: (error: unknown) => void,
) {
  const cloud = new THREE.Group()
  cloud.name = 'mushroom-cloud'
  cloud.userData.assetState = 'loading'
  new GLTFLoader().load(
    '/assets/city/mushroom-cloud.glb',
    ({ scene }) => {
      if (cloud.userData.disposed) {
        disposeObject(scene)
        return
      }
      const bounds = new THREE.Box3().setFromObject(scene)
      const size = bounds.getSize(new THREE.Vector3())
      if (bounds.isEmpty() || size.y <= 0) {
        disposeObject(scene)
        cloud.userData.assetState = 'error'
        onError(new Error('Mushroom cloud asset contains no usable geometry'))
        return
      }
      const center = bounds.getCenter(new THREE.Vector3())
      const scale = 90 / size.y
      scene.position
        .set(-center.x, -bounds.min.y, -center.z)
        .multiplyScalar(scale)
      scene.scale.multiplyScalar(scale)
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        const materials: THREE.Material[] = Array.isArray(object.material)
          ? object.material
          : [object.material]
        for (const material of materials) {
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) value.anisotropy = anisotropy
          }
        }
      })
      cloud.add(scene)
      cloud.userData.assetState = 'ready'
      onLoad()
    },
    undefined,
    (error: unknown) => {
      if (cloud.userData.disposed) return
      cloud.userData.assetState = 'error'
      onError(error)
    },
  )
  return cloud
}
