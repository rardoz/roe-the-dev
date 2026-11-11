import * as THREE from 'three'

export function createStars(random: () => number) {
  const count = 2800
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const brightness = new Float32Array(count)
  for (let index = 0; index < count; index++) {
    const y = random() * 2 - 1
    const angle = random() * Math.PI * 2
    const radius = Math.sqrt(1 - y * y)
    positions.set(
      [radius * Math.cos(angle), y, radius * Math.sin(angle)],
      index * 3,
    )
    sizes[index] = 0.65 + Math.pow(random(), 5) * 4.2
    brightness[index] = 0.18 + Math.pow(random(), 2) * 0.55
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('starSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute(
    'starBrightness',
    new THREE.BufferAttribute(brightness, 1),
  )
  const material = new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: 1 } },
    vertexShader: `
      attribute float starSize;
      attribute float starBrightness;
      uniform float uPixelRatio;
      varying float vBrightness;
      void main() {
        // Ignore camera translation so the sky stays infinitely distant.
        vec3 direction = mat3(viewMatrix) * position;
        gl_Position = projectionMatrix * vec4(direction * 1000.0, 1.0);
        gl_Position.z = gl_Position.w * 0.99999;
        gl_PointSize = starSize * uPixelRatio;
        vBrightness = starBrightness;
      }
    `,
    fragmentShader: `
      varying float vBrightness;
      void main() {
        float radius = length(gl_PointCoord - 0.5) * 2.0;
        float alpha = (1.0 - smoothstep(0.25, 1.0, radius)) * vBrightness;
        gl_FragColor = vec4(vec3(0.85), alpha);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    fog: false,
  })
  const stars = new THREE.Points(geometry, material)
  stars.name = 'sky-stars'
  stars.frustumCulled = false
  stars.renderOrder = -10
  const streakGeometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  const slots: number[] = []
  for (let slot = 0; slot < 3; slot++) {
    for (const [x, y] of [
      [0, -1],
      [1, -1],
      [1, 1],
      [0, -1],
      [1, 1],
      [0, 1],
    ]) {
      vertices.push(x, y, 0)
      slots.push(slot)
    }
  }
  streakGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3),
  )
  streakGeometry.setAttribute(
    'slot',
    new THREE.Float32BufferAttribute(slots, 1),
  )
  const streakMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uHeight: { value: 900 },
      uOrigin: { value: new THREE.Vector2(Math.random(), Math.random()) },
    },
    vertexShader: `
      attribute float slot;
      uniform float uTime;
      uniform float uAspect;
      uniform float uHeight;
      uniform vec2 uOrigin;
      varying vec2 vTrail;
      varying float vFade;
      float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
      void main() {
        float clock = uTime - 2.0 - slot * 6.0;
        float cycle = floor(max(clock, 0.0) / 21.0);
        float age = mod(max(clock, 0.0), 21.0);
        float seed = cycle * 7.0 + slot * 13.0 + 1.0;
        float duration = 1.1 + hash(seed) * 0.5;
        float travel = clamp(age / duration, 0.0, 1.0);
        float event = cycle * 3.0 + slot;
        // Low-discrepancy coordinates avoid the repeated bins of a float hash.
        vec2 location = fract(uOrigin + event * vec2(0.754877666, 0.569840296));
        vec2 start = vec2(mix(-0.9, 0.7, location.x) * uAspect,
                          mix(0.15, 0.95, location.y));
        float side = location.x < 0.5 ? 1.0 : -1.0;
        vec2 direction = normalize(vec2(side, -mix(0.3, 0.85, hash(seed + 4.0))));
        vec2 normal = vec2(-direction.y, direction.x);
        vec2 head = start + direction * travel * 0.8;
        vec2 trail = -direction * (1.0 - position.x) * 0.16
                   + normal * position.y * (1.4 / uHeight);
        vec2 point = head + trail;
        point.x /= uAspect;
        gl_Position = vec4(point, 0.99998, 1.0);
        vTrail = position.xy;
        vFade = step(0.0, clock) * smoothstep(0.0, 0.12, age)
              * (1.0 - smoothstep(duration * 0.55, duration, age));
      }
    `,
    fragmentShader: `
      varying vec2 vTrail;
      varying float vFade;
      void main() {
        float alpha = pow(vTrail.x, 2.0)
                    * (1.0 - smoothstep(0.0, 1.0, abs(vTrail.y))) * vFade * 0.8;
        gl_FragColor = vec4(vec3(0.9), alpha);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    fog: false,
  })
  const shootingStars = new THREE.Mesh(streakGeometry, streakMaterial)
  shootingStars.name = 'shooting-stars'
  shootingStars.frustumCulled = false
  shootingStars.renderOrder = -9
  stars.add(shootingStars)
  return Object.assign(stars, { shootingStars })
}
