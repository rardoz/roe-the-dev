import * as THREE from 'three'

export function createMushroomCloudMist(width: THREE.Vector2) {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: true,
    uniforms: {
      ...THREE.UniformsLib.fog,
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uFloorCenter: { value: new THREE.Vector3() },
      uFloorSpan: { value: new THREE.Vector2() },
    },
    vertexShader: `
      #include <fog_pars_vertex>
      uniform float uTime;
      uniform vec3 uFloorCenter;
      uniform vec2 uFloorSpan;
      attribute float mistPhase;
      attribute float mistFloor;
      varying vec2 vUv;
      varying float vPhase;
      varying float vNearFade;
      varying float vFloor;
      void main() {
        vUv = uv;
        vPhase = mistPhase;
        vFloor = mistFloor;
        vec3 center = instanceMatrix[3].xyz;
        if (mistFloor > 0.5) {
          center.xz *= uFloorSpan;
          center += uFloorCenter;
        }
        float phase = mistPhase + uTime * 0.13;
        center.x += sin(phase) * 3.2;
        center.y += sin(phase * 0.7) * mix(2.4, 0.8, mistFloor);
        center.z += cos(phase * 0.8) * 2.6;
        vec4 mvPosition = modelViewMatrix * vec4(center, 1.0);
        vNearFade = smoothstep(10.0, 32.0, -mvPosition.z);
        vec2 size = vec2(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz));
        if (mistFloor > 0.5) size.x *= min(uFloorSpan.x, uFloorSpan.y);
        float scale = length(modelMatrix[0].xyz);
        float billow = 1.0 + 0.08 * sin(phase * 1.3);
        mvPosition.xy += position.xy * size * scale * billow;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: `
      #include <fog_pars_fragment>
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;
      varying float vPhase;
      varying float vNearFade;
      varying float vFloor;
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 cell = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(cell), hash(cell + vec2(1.0, 0.0)), f.x),
          mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float value = 0.0;
        float weight = 0.5;
        for (int i = 0; i < 4; i++) {
          value += weight * noise(p);
          p = mat2(1.6, -1.2, 1.2, 1.6) * p + 7.3;
          weight *= 0.5;
        }
        return value;
      }
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        vec2 drift = vec2(uTime * 0.022, -uTime * 0.036);
        vec2 p = uv * 2.3 + vPhase * 3.7 + drift;
        float roll = fbm(p * 0.7 + vec2(0.0, -uTime * 0.018));
        float density = fbm(p + vec2(roll * 1.8, -roll));
        float edge = 1.0 - smoothstep(0.35, 1.0, length(uv) + (roll - 0.45) * 0.4);
        float texture = smoothstep(0.16, 0.64, density);
        float breath = 0.8 + 0.2 * sin(vPhase + uTime * 0.17);
        float alpha = edge * texture * breath * uOpacity * vNearFade
          * mix(1.0, 1.7, vFloor);
        gl_FragColor = vec4(vec3(mix(0.045, 0.12, density)), alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
  })
  const count = 60
  const geometry = new THREE.PlaneGeometry(1, 1)
  const phases = new Float32Array(count)
  const floors = new Float32Array(count)
  const mist = new THREE.InstancedMesh(geometry, material, count)
  mist.name = 'mushroom-cloud-mist'
  // Billboards and shader drift extend beyond the CPU-side instance bounds.
  mist.frustumCulled = false
  const pose = new THREE.Object3D()
  for (let index = 0; index < count; index++) {
    const floor = index >= 24
    const cap = index >= 12 && !floor
    const step = index % 12
    const phase = index * 2.3999632297
    const radius = cap ? 0.34 + (step % 3) * 0.025 : 0.1
    pose.position.set(
      Math.cos(phase) * width.x * radius,
      cap ? 65 + (step % 4) * 6 : 14 + step * 4.1,
      Math.sin(phase) * width.y * radius,
    )
    pose.scale.set(
      width.x * (cap ? 0.32 : 0.2),
      cap ? 19 + (step % 3) * 3 : 17 + (step % 3) * 2,
      1,
    )
    if (floor) {
      const ring = Math.floor((index - 24) / 12)
      const radius = 0.15 + ring * 0.3
      pose.position.set(
        Math.cos(phase) * radius,
        4 + (step % 3) * 1.8,
        Math.sin(phase) * radius,
      )
      pose.scale.set(0.65 + (step % 3) * 0.08, 12 + (step % 4) * 2, 1)
      floors[index] = 1
    }
    pose.updateMatrix()
    mist.setMatrixAt(index, pose.matrix)
    phases[index] = phase
  }
  geometry.setAttribute(
    'mistPhase',
    new THREE.InstancedBufferAttribute(phases, 1),
  )
  geometry.setAttribute(
    'mistFloor',
    new THREE.InstancedBufferAttribute(floors, 1),
  )
  return mist
}
