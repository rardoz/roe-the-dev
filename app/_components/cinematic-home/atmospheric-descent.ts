import * as THREE from 'three'
import {
  atmosphericDescent,
  cloudPlacements,
  cloudPose,
  type CloudPlacement,
} from './atmospheric-cloud-model'

export { atmosphericDescent } from './atmospheric-cloud-model'

type CloudMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>

type CloudAsset = {
  texture: THREE.Texture
  state: 'loading' | 'ready' | 'error'
  clouds: CloudMesh[]
}

function cloudAssetPath(index: number) {
  const assetNumber = (index % 20) + 1
  return `/assets/clouds/cloud_${String(assetNumber).padStart(2, '0')}.png`
}

function configureCloudTexture(texture: THREE.Texture, anisotropy: number) {
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.anisotropy = Math.max(1, anisotropy)
}

export function createAtmosphericDescent(
  width = 1440,
  onLoad = () => {},
  anisotropy = 1,
) {
  const group = new THREE.Group()
  group.name = 'atmospheric-clouds'
  group.userData.mobile = width < 700
  const geometry = new THREE.PlaneGeometry(2, 1)
  const loader = new THREE.TextureLoader()
  const assets = new Map<string, CloudAsset>()
  const paths = new Set(
    cloudPlacements.map((_, index) => cloudAssetPath(index)),
  )

  for (const path of paths) {
    const asset: CloudAsset = {
      texture: undefined as unknown as THREE.Texture,
      state: 'loading',
      clouds: [],
    }
    const texture = loader.load(
      path,
      () => {
        asset.state = 'ready'
        if (group.userData.disposed) return
        asset.clouds.forEach((cloud) => {
          cloud.userData.assetReady = true
        })
        onLoad()
      },
      undefined,
      () => {
        asset.state = 'error'
        if (group.userData.disposed) return
        asset.clouds.forEach((cloud) => {
          cloud.userData.assetReady = false
          cloud.visible = false
        })
        onLoad()
      },
    )
    configureCloudTexture(texture, anisotropy)
    asset.texture = texture
    assets.set(path, asset)
  }

  cloudPlacements.forEach((placement, index) => {
    const path = cloudAssetPath(index)
    const asset = assets.get(path)!
    const material = new THREE.MeshBasicMaterial({
      map: asset.texture,
      transparent: true,
      opacity: 0,
      alphaTest: 0.01,
      depthTest: true,
      depthWrite: true,
      side: THREE.FrontSide,
      toneMapped: false,
    })
    const cloud = new THREE.Mesh(geometry, material)
    cloud.name = `atmospheric-cloud-${placement.seed}`
    cloud.userData = {
      ...placement,
      assetPath: path,
      assetReady: asset.state === 'ready',
      billboardRotation: placement.turn * 0.19,
    }
    cloud.visible = false
    asset.clouds.push(cloud)
    group.add(cloud)
  })

  group.visible = false
  return group
}

export function updateAtmosphericDescent(
  group: THREE.Group,
  progress: number,
  mobile: boolean,
  camera: THREE.PerspectiveCamera,
  stacked = mobile,
  cityOffset = 0,
  sceneProgress = 0.3,
) {
  const opacity = atmosphericDescent(progress, sceneProgress)
  group.visible = opacity > 0.001
  if (!group.visible) return
  camera.updateMatrixWorld()
  for (const object of group.children) {
    const cloud = object as CloudMesh
    const pose = cloudPose(
      cloud.userData as CloudPlacement,
      progress,
      mobile,
      stacked,
      cityOffset,
      sceneProgress,
    )
    cloud.visible = pose.opacity > 0.001 && cloud.userData.assetReady
    if (!cloud.visible) continue
    cloud.position.set(...pose.position)
    cloud.quaternion.copy(camera.quaternion)
    cloud.rotateZ(cloud.userData.billboardRotation)
    cloud.scale.set(pose.scale[0], pose.scale[0], 1)
    cloud.translateZ(pose.scale[2] * 0.42)
    cloud.material.opacity = pose.opacity
    cloud.updateMatrixWorld()
  }
}
