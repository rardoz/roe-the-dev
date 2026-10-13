import * as THREE from 'three'
import {
  atmosphericDescent,
  cloudPlacements,
  cloudPose,
  sculptCloudTextureData,
  type CloudPlacement,
} from './atmospheric-cloud-model'

export { atmosphericDescent } from './atmospheric-cloud-model'

const cloudVertex = `
out vec3 vLocal;
void main(){
  vLocal=position;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}`

const cloudFragment = `
precision highp float;
precision highp sampler3D;
uniform sampler3D uVolume;
uniform vec3 uCamera;
uniform mat4 uViewProjection;
uniform mat4 uModel;
uniform float uOpacity;
uniform float uSteps;
in vec3 vLocal;
out vec4 outColor;
void main(){
  vec3 direction=normalize(vLocal-uCamera);
  vec3 safeDirection=vec3(
    direction.x<0.?-max(abs(direction.x),.00001):max(abs(direction.x),.00001),
    direction.y<0.?-max(abs(direction.y),.00001):max(abs(direction.y),.00001),
    direction.z<0.?-max(abs(direction.z),.00001):max(abs(direction.z),.00001));
  vec3 inverse=1./safeDirection;
  vec3 first=(-vec3(1.)-uCamera)*inverse;
  vec3 second=(vec3(1.)-uCamera)*inverse;
  vec3 nearPlane=min(first,second),farPlane=max(first,second);
  float start=max(0.,max(max(nearPlane.x,nearPlane.y),nearPlane.z));
  float end=min(min(farPlane.x,farPlane.y),farPlane.z);
  if(end<=start)discard;
  float stepSize=(end-start)/uSteps;
  float travel=start+stepSize*.5;
  float opacity=0.;
  float firstCloud=-1.;
  vec3 color=vec3(0.);
  for(int index=0;index<48;index++){
    if(float(index)>=uSteps || opacity>.985)break;
    vec3 samplePoint=uCamera+direction*travel;
    vec2 volume=texture(uVolume,samplePoint*.5+.5).rg;
    float alpha=(1.-exp(-volume.r*stepSize*5.4))*uOpacity;
    if(alpha>.0015){
      if(firstCloud<0.)firstCloud=travel;
      float illumination=volume.g;
      float silver=.012+pow(illumination,1.3)*.29;
      color+=(1.-opacity)*alpha*vec3(silver);
      opacity+=(1.-opacity)*alpha;
    }
    travel+=stepSize;
  }
  if(opacity<.006 || firstCloud<0.)discard;
  vec4 clip=uViewProjection*uModel*vec4(uCamera+direction*firstCloud,1.);
  gl_FragDepth=clamp(clip.z/clip.w*.5+.5,0.,1.);
  outColor=vec4(color/max(opacity,.001),opacity);
  outColor=linearToOutputTexel(outColor);
}`

export function createAtmosphericDescent(width = 1440, onLoad = () => {}) {
  const group = new THREE.Group()
  group.name = 'atmospheric-clouds'
  const geometry = new THREE.BoxGeometry(2, 2, 2)
  for (const placement of cloudPlacements) {
    const material = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: cloudVertex,
      fragmentShader: cloudFragment,
      transparent: true,
      depthWrite: true,
      side: THREE.BackSide,
      uniforms: {
        uVolume: { value: null },
        uCamera: { value: new THREE.Vector3() },
        uViewProjection: { value: new THREE.Matrix4() },
        uModel: { value: new THREE.Matrix4() },
        uOpacity: { value: 0 },
        uSteps: { value: 48 },
      },
    })
    const cloud = new THREE.Mesh(geometry, material)
    cloud.name = `atmospheric-cloud-${placement.seed}`
    cloud.userData = { ...placement }
    cloud.rotation.set(0.08, placement.turn, placement.turn * 0.19)
    cloud.visible = false
    group.add(cloud)
  }
  const mobile = width < 700
  const pending = new Set(
    group.children as THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial>[],
  )
  let preparing: THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial> | null =
    null
  group.userData.preparation = { progress: 0, mobile, stacked: width <= 1000 }
  let sculptor: ReturnType<typeof sculptCloudTextureData> | null = null
  const schedulePreparation = () => {
    if (typeof requestIdleCallback === 'function')
      requestIdleCallback(prepareCloud, { timeout: 180 })
    else setTimeout(() => prepareCloud(), 16)
  }
  const prepareCloud = (deadline?: IdleDeadline) => {
    if (group.userData.disposed || pending.size === 0) return
    if (!preparing) {
      const { progress, mobile, stacked } = group.userData.preparation
      let priority = -1
      for (const candidate of pending) {
        const opacity = cloudPose(
          candidate.userData as CloudPlacement,
          progress,
          mobile,
          stacked,
        ).opacity
        if (opacity > priority) {
          preparing = candidate
          priority = opacity
        }
      }
    }
    const cloud = preparing!
    sculptor ??= sculptCloudTextureData(cloud.userData.seed, mobile)
    const started = performance.now()
    const budget = Math.min(6, Math.max(1, deadline?.timeRemaining() ?? 6))
    let next = sculptor.next()
    while (!next.done && performance.now() - started < budget)
      next = sculptor.next()
    if (next.done) {
      const { data, width, height, depth } = next.value
      const volume = new THREE.Data3DTexture(data, width, height, depth)
      volume.format = THREE.RGBAFormat
      volume.type = THREE.UnsignedByteType
      volume.minFilter = volume.magFilter = THREE.LinearFilter
      volume.unpackAlignment = 1
      volume.needsUpdate = true
      cloud.material.uniforms.uVolume.value = volume
      sculptor = null
      pending.delete(cloud)
      preparing = null
      onLoad()
    }
    if (pending.size > 0) schedulePreparation()
  }
  schedulePreparation()
  group.visible = false
  return group
}

const inverseCloud = new THREE.Matrix4()
const viewProjection = new THREE.Matrix4()

export function updateAtmosphericDescent(
  group: THREE.Group,
  progress: number,
  mobile: boolean,
  camera: THREE.PerspectiveCamera,
  stacked = mobile,
  cityOffset = 0,
  sceneProgress = 0.3,
) {
  group.userData.preparation = { progress, mobile, stacked }
  const opacity = atmosphericDescent(progress, sceneProgress)
  group.visible = opacity > 0.001
  if (!group.visible) return
  camera.updateMatrixWorld()
  viewProjection.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse,
  )
  for (const object of group.children) {
    const cloud = object as THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial>
    const pose = cloudPose(
      cloud.userData as CloudPlacement,
      progress,
      mobile,
      stacked,
      cityOffset,
      sceneProgress,
    )
    cloud.visible =
      pose.opacity > 0.001 && cloud.material.uniforms.uVolume.value !== null
    if (!cloud.visible) continue
    cloud.position.set(...pose.position)
    cloud.scale.set(...pose.scale)
    cloud.updateMatrixWorld()
    inverseCloud.copy(cloud.matrixWorld).invert()
    const uniforms = cloud.material.uniforms
    uniforms.uCamera.value.copy(camera.position).applyMatrix4(inverseCloud)
    uniforms.uViewProjection.value.copy(viewProjection)
    uniforms.uModel.value.copy(cloud.matrixWorld)
    uniforms.uOpacity.value = pose.opacity
    uniforms.uSteps.value = pose.steps
  }
}
