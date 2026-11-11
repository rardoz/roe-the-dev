import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { disposeObject } from './asteroid'
import { createMushroomCloudMist } from './mushroom-cloud-mist'

export function createMushroomCloud(
  anisotropy: number,
  onLoad: () => void,
  onError: (error: unknown) => void,
) {
  const glowStrength = { value: 0 }
  const surgeHeight = { value: 40 }
  const surgeStrength = { value: 1 }
  const smokeView = { value: new THREE.Matrix4() }
  const lights = [
    new THREE.PointLight('#ffffff', 0, 125, 2),
    new THREE.PointLight('#ffffff', 0, 145, 2),
  ]
  lights[0].position.set(0, 18, 0)
  lights[1].position.set(0, 62, 0)
  const cloud = Object.assign(new THREE.Group(), {
    glow: {
      strength: glowStrength,
      surgeHeight,
      surgeStrength,
      time: 0,
      lights,
    },
    smokeView,
    mist: null as ReturnType<typeof createMushroomCloudMist> | null,
  })
  cloud.name = 'mushroom-cloud'
  cloud.userData.assetState = 'loading'
  cloud.add(...lights)
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
      scene.updateMatrixWorld(true)
      const glowWidth = new THREE.Vector2(size.x, size.z).multiplyScalar(scale)
      const point = new THREE.Vector3()
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        const position = object.geometry.getAttribute('position')
        const glowPosition = new Float32Array(position.count * 3)
        for (let index = 0; index < position.count; index++) {
          point
            .fromBufferAttribute(position, index)
            .applyMatrix4(object.matrixWorld)
          point.toArray(glowPosition, index * 3)
        }
        object.geometry.setAttribute(
          'cloudGlowPosition',
          new THREE.BufferAttribute(glowPosition, 3),
        )
        const materials: THREE.Material[] = Array.isArray(object.material)
          ? object.material
          : [object.material]
        for (const material of materials) {
          if (material instanceof THREE.MeshStandardMaterial) {
            material.onBeforeCompile = (shader) => {
              shader.uniforms.cloudGlowStrength = glowStrength
              shader.uniforms.cloudSurgeHeight = surgeHeight
              shader.uniforms.cloudSurgeStrength = surgeStrength
              shader.uniforms.cloudGlowWidth = { value: glowWidth }
              shader.uniforms.cloudSmokeView = smokeView
              shader.vertexShader =
                'attribute vec3 cloudGlowPosition;\nuniform mat4 cloudSmokeView;\nvarying float vCloudSmokeDepth;\nvarying vec3 vCloudGlowPosition;\n' +
                shader.vertexShader
                  .replace(
                    '#include <begin_vertex>',
                    '#include <begin_vertex>\nvCloudGlowPosition = cloudGlowPosition;',
                  )
                  .replace(
                    '#include <project_vertex>',
                    `#include <project_vertex>
                    vCloudSmokeDepth = -(cloudSmokeView * modelMatrix * vec4(transformed, 1.0)).z;`,
                  )
              // Local emission suggests light diffusing through opaque smoke;
              // the point lights provide the actual spill onto nearby geometry.
              shader.fragmentShader =
                'uniform float cloudGlowStrength;\nuniform float cloudSurgeHeight;\nuniform float cloudSurgeStrength;\nuniform vec2 cloudGlowWidth;\nvarying float vCloudSmokeDepth;\nvarying vec3 vCloudGlowPosition;\n' +
                shader.fragmentShader
                  .replace(
                    '#include <emissivemap_fragment>',
                    `#include <emissivemap_fragment>
                  vec3 shaft = (vCloudGlowPosition - vec3(0.0, 30.0, 0.0))
                    / vec3(cloudGlowWidth.x * 0.17, 32.0, cloudGlowWidth.y * 0.17);
                  vec3 cap = (vCloudGlowPosition - vec3(0.0, 65.0, 0.0))
                    / vec3(cloudGlowWidth.x * 0.34, 19.0, cloudGlowWidth.y * 0.34);
                  vec3 surge = (vCloudGlowPosition - vec3(0.0, cloudSurgeHeight, 0.0))
                    / vec3(cloudGlowWidth.x * 0.25, 16.0, cloudGlowWidth.y * 0.25);
                  float innerGlow = 0.3 * exp(-dot(shaft, shaft))
                    + 0.6 * exp(-2.0 * dot(cap, cap))
                    + 2.8 * cloudSurgeStrength * exp(-2.0 * dot(surge, surge));
                  totalEmissiveRadiance += vec3(cloudGlowStrength * innerGlow);`,
                  )
                  .replace(
                    'vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',
                    `// Keep surface haze at least as dark as the wide view, without attenuating emission.
                  float smokeAttenuation = 1.0;
                  #ifdef FOG_EXP2
                    float extraDepthSquared = max(0.0,
                      vCloudSmokeDepth * vCloudSmokeDepth - vFogDepth * vFogDepth);
                    smokeAttenuation = exp(-2.2 * fogDensity * fogDensity * extraDepthSquared);
                  #endif
                  vec3 outgoingLight = (totalDiffuse + totalSpecular) * smokeAttenuation
                    + totalEmissiveRadiance;`,
                  )
            }
            material.customProgramCacheKey = () =>
              'mushroom-cloud-inner-glow-v3'
          }
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) value.anisotropy = anisotropy
          }
        }
      })
      cloud.mist = createMushroomCloudMist(glowWidth)
      cloud.add(cloud.mist)
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

export function updateMushroomCloud(
  cloud: ReturnType<typeof createMushroomCloud>,
  size: number,
  dt: number,
  reduced: boolean,
  closeup: number,
) {
  cloud.scale.setScalar(size)
  const strength = cloud.visible ? size : 0
  if (strength > 0 && !reduced) cloud.glow.time += dt
  if (strength === 0) cloud.glow.time = 0
  const phase = reduced ? 0.5 : (cloud.glow.time % 5.5) / 5.5
  cloud.glow.surgeHeight.value = THREE.MathUtils.lerp(-12, 104, phase)
  cloud.glow.surgeStrength.value = Math.sin(Math.PI * phase) ** 2
  const exposure = THREE.MathUtils.lerp(1, 0.1, closeup)
  cloud.glow.strength.value = 9.5 * strength * exposure
  cloud.glow.lights.forEach((light, index) => {
    const power = index === 0 ? 1500 : 14000 * cloud.glow.surgeStrength.value
    light.intensity = power * strength * size * size * exposure
    light.distance = (index === 0 ? 125 : 145) * size
  })
  cloud.glow.lights[1].position.y = cloud.glow.surgeHeight.value
  if (cloud.mist) {
    cloud.mist.material.uniforms.uTime.value = reduced ? 0 : cloud.glow.time
    cloud.mist.material.uniforms.uOpacity.value = 0.55 * strength
  }
}
