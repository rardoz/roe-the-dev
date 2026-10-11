import * as THREE from 'three'

export function planetMapWidth(width: number, pixelRatio: number) {
  return width < 700 || width * pixelRatio < 1000 ? 2048 : 4096
}

export function advancePlanetClouds(
  drift: number,
  delta: number,
  reduced: boolean,
) {
  return reduced ? drift : (drift + delta * 0.012) % (Math.PI * 2)
}

export const cloudRepeat = [2, 2] as const

export const planetVertex = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec4 p=modelViewMatrix*vec4(position,1.);
  vUv=uv;
  vNormal=normalize(normalMatrix*normal);
  vView=normalize(-p.xyz);
  gl_Position=projectionMatrix*p;
}`

export const planetFragment = `
uniform sampler2D uMap;
uniform float uCloudDrift;
uniform vec2 uCloudRepeat;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;
const float cloudLongitudeOffset=.12;
void main() {
  vec4 paint=texture2D(uMap,(vUv+vec2(cloudLongitudeOffset+uCloudDrift/6.28318530718,0.))*uCloudRepeat);
  float grey=dot(paint.rgb,vec3(.2126,.7152,.0722));
  float facing=abs(dot(normalize(vNormal),normalize(vView)));
  float rim=pow(1.-facing,11.)*.45+pow(1.-facing,4.)*.14;
  float painted=mix(.025,pow(grey,1.18)*.9,paint.a);
  float tone=painted+rim;
  gl_FragColor=vec4(vec3(tone),1.);
  #include <colorspace_fragment>
}`

export function createPlanet(
  width: number,
  pixelRatio: number,
  anisotropy: number,
  onLoad: () => void,
) {
  const resolution = planetMapWidth(width, pixelRatio)
  const loader = new THREE.TextureLoader()
  let disposed = false
  const texture = loader.load(
    `/assets/earth/clouds-${resolution}.webp`,
    (loaded) => {
      if (disposed) loaded.dispose()
      else onLoad()
    },
    undefined,
    (error) => {
      if (!disposed) console.error('Could not load Earth clouds map', error)
    },
  )
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.MirroredRepeatWrapping
  texture.flipY = false
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.anisotropy = Math.max(1, anisotropy)
  texture.addEventListener('dispose', () => {
    disposed = true
  })
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(260, 96, 64),
    new THREE.ShaderMaterial({
      vertexShader: planetVertex,
      fragmentShader: planetFragment,
      uniforms: {
        uMap: { value: texture },
        uCloudDrift: { value: 0 },
        uCloudRepeat: { value: new THREE.Vector2(...cloudRepeat) },
      },
      toneMapped: false,
    }),
  )
  earth.position.set(0, -260, -220)
  earth.rotation.set(-0.45, 0.4, 0)
  return { earth }
}
