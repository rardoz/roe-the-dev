import * as THREE from 'three'
import {
  atmosphericDescent,
  cloudPlacements,
  cloudPose,
  type CloudPlacement,
} from './atmospheric-cloud-model'
import { ASTEROID_STENCIL_REF } from './asteroid'

export { atmosphericDescent } from './atmospheric-cloud-model'

type CloudMaterial = THREE.MeshBasicMaterial & {
  userData: {
    fadeUniform: { value: number }
    fogDepthUniform: { value: number }
  }
}

type CloudMesh = THREE.Mesh<THREE.PlaneGeometry, CloudMaterial>

type CloudAsset = {
  texture: THREE.Texture
  state: 'loading' | 'ready' | 'error'
  clouds: CloudMesh[]
}

const CLOUD_SCALE = 1.25
const STACKED_OPACITY = 0.92
const meteorForegroundPlacementIndices = new Set([5, 10])
const cloudCameraTransform = new THREE.Matrix4()

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

function configureCloudAlpha(material: THREE.MeshBasicMaterial) {
  const cloudMaterial = material as CloudMaterial
  const fadeUniform = { value: 0 }
  const fogDepthUniform = { value: 1 }
  cloudMaterial.userData.fadeUniform = fadeUniform
  cloudMaterial.userData.fogDepthUniform = fogDepthUniform
  cloudMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.cloudFade = fadeUniform
    shader.uniforms.cloudFogDepthScale = fogDepthUniform
    shader.fragmentShader = shader.fragmentShader.replace(
      'uniform float opacity;',
      'uniform float opacity;\nuniform float cloudFade;\nuniform float cloudFogDepthScale;',
    )
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <fog_fragment>',
      THREE.ShaderChunk.fog_fragment.replaceAll(
        'vFogDepth',
        '(vFogDepth * cloudFogDepthScale)',
      ),
    )
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
      float cloudSourceAlpha = diffuseColor.a;
      float cloudBodyAlpha = smoothstep(0.0, 0.78, cloudSourceAlpha);
      float cloudBodyInfluence = smoothstep(0.18, 0.55, cloudSourceAlpha);
      diffuseColor.a = mix(cloudSourceAlpha, cloudBodyAlpha, cloudBodyInfluence) * cloudFade;`,
    )
  }
  cloudMaterial.customProgramCacheKey = () => 'atmospheric-cloud-alpha-v2'
  return cloudMaterial
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
    const meteorLayer = meteorForegroundPlacementIndices.has(index)
      ? 'foreground'
      : 'background'
    const background = meteorLayer === 'background'
    const material = configureCloudAlpha(
      new THREE.MeshBasicMaterial({
        map: asset.texture,
        transparent: true,
        opacity: 1,
        alphaTest: 0.01,
        depthTest: true,
        depthWrite: true,
        stencilWrite: background,
        stencilRef: ASTEROID_STENCIL_REF,
        stencilFunc: THREE.NotEqualStencilFunc,
        stencilFail: THREE.KeepStencilOp,
        stencilZFail: THREE.KeepStencilOp,
        stencilZPass: THREE.KeepStencilOp,
        side: THREE.FrontSide,
        toneMapped: false,
      }),
    )
    const cloud = new THREE.Mesh(geometry, material)
    cloud.name = `atmospheric-cloud-${placement.seed}`
    cloud.userData = {
      ...placement,
      assetPath: path,
      assetReady: asset.state === 'ready',
      billboardRotation: placement.turn * 0.19,
      meteorLayer,
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
  meteorVisible = false,
  passageCamera?: THREE.PerspectiveCamera,
  cityCloudAnchors?: Map<number, THREE.Vector3>,
  cityFogDepthScale = 1,
) {
  const opacity = atmosphericDescent(progress, sceneProgress)
  group.visible = opacity > 0.001
  if (!group.visible) return
  camera.updateMatrixWorld()
  if (passageCamera) {
    passageCamera.updateMatrixWorld()
    cloudCameraTransform.multiplyMatrices(
      camera.matrixWorld,
      passageCamera.matrixWorldInverse,
    )
  }
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
    const cityAnchor = cityCloudAnchors?.get(cloud.userData.seed)
    cloud.material.userData.fogDepthUniform.value = cityAnchor
      ? cityFogDepthScale
      : 1
    if (cityAnchor) {
      cloud.position.copy(cityAnchor)
      cloud.position.y += cityOffset
    } else {
      cloud.position.set(...pose.position)
      cloud.quaternion.copy((passageCamera ?? camera).quaternion)
      cloud.translateZ(pose.scale[2] * 0.42)
      if (passageCamera) cloud.position.applyMatrix4(cloudCameraTransform)
    }
    cloud.quaternion.copy(camera.quaternion)
    cloud.rotateZ(cloud.userData.billboardRotation)
    const meteorForeground =
      meteorVisible && cloud.userData.meteorLayer === 'foreground'
    cloud.material.depthTest = !meteorForeground
    cloud.material.depthWrite = !meteorForeground
    cloud.renderOrder = meteorForeground ? 10 : 0
    const renderedScale = pose.scale[0] * CLOUD_SCALE
    cloud.scale.set(renderedScale, renderedScale, 1)
    cloud.material.userData.fadeUniform.value = Math.min(
      1,
      pose.opacity / (stacked ? STACKED_OPACITY : 1),
    )
    cloud.updateMatrixWorld()
  }
}
