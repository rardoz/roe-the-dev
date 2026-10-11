import * as THREE from 'three'
import { createWorld, disposeWorld } from './world'
import { advancePlanetClouds } from './planet'
import { disposeObject, loadAsteroid } from './asteroid'
import { documentFilmProgress, filmState, mix, smooth } from './motion'
import { createSpatialContent, updateSpatialContent } from './spatial-content'
import {
  createTumble,
  dragAxis,
  dragTumble,
  entryScale,
  keyRotation,
  openingDiameter,
  releaseTumble,
  stepTumble,
  wrapAngle,
} from './tumble'
import type { EditorialItem } from './content'
import {
  ABOUT_ASTEROID_EVENT,
  aboutAsteroidState,
  silhouetteHull,
  type Point,
} from './about-motion'

type SceneOptions = {
  canvas: HTMLCanvasElement
  container: HTMLElement
  handle?: HTMLElement | null
  onReady: (ready: boolean) => void
  posts: EditorialItem[]
  projects: EditorialItem[]
}

export async function createFilmScene({
  canvas,
  container,
  handle,
  onReady,
  posts,
  projects,
}: SceneOptions) {
  const asteroidLoad = loadAsteroid(8)
  asteroidLoad.catch(() => {})
  canvas.dataset.assetState = 'loading'
  await document.fonts.ready
  const displayFont =
    getComputedStyle(container).getPropertyValue('--film-display').trim() ||
    'Georgia'
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
  } catch {
    asteroidLoad.then(disposeObject, () => {})
    onReady(false)
    return () => {}
  }
  let asteroidModel: THREE.Object3D
  try {
    asteroidModel = await asteroidLoad
  } catch (error) {
    console.error(error)
    canvas.dataset.assetError = 'asteroid'
    canvas.dataset.assetState = 'error'
    renderer.dispose()
    onReady(false)
    return () => {}
  }
  canvas.dataset.assetState = 'ready'
  renderer.setClearColor('#030303')
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2('#080808', 0.0022)
  scene.add(new THREE.AmbientLight('#d1d1d1', 0.15))
  const light = new THREE.DirectionalLight('#ffffff', 3.5)
  light.position.set(-60, 130, 55)
  scene.add(light)
  const backLight = new THREE.DirectionalLight('#ffffff', 0)
  scene.add(backLight, backLight.target)
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1600)
  const world = createWorld(scene, asteroidModel, {
    width: window.innerWidth,
    pixelRatio: window.devicePixelRatio || 1,
    anisotropy: renderer.capabilities.getMaxAnisotropy(),
    onLoad: () => requestDraw(),
  })
  const asteroidVertices: THREE.Vector3[] = []
  world.asteroid.updateMatrixWorld()
  world.asteroid.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const position = object.geometry.getAttribute('position')
    for (let index = 0; index < position.count; index++) {
      asteroidVertices.push(
        new THREE.Vector3()
          .fromBufferAttribute(position, index)
          .applyMatrix4(object.matrixWorld),
      )
    }
  })
  let rimX = 1
  let rimYZ = 1
  for (const vertex of asteroidVertices) {
    rimX = Math.max(rimX, Math.abs(vertex.x))
    rimYZ = Math.max(rimYZ, Math.hypot(vertex.y, vertex.z))
  }
  const OPENING_TOP_EDGE = 0.32
  const OPENING_CLOSE_FACTOR = 0.5
  const OPENING_EDGE_DEPTH = 2.1
  const OPENING_EDGE_OFFSET = 0.34
  let openingDistance = 100
  let openingHeight = 110
  let openingPixels = 400
  const fitOpeningAsteroid = () => {
    const verticalField = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
    // Full frame width, centred, so the frame crops the rock through its middle.
    openingPixels = openingDiameter(width, height)
    openingDistance =
      ((rimX + rimYZ) * height) / (2 * openingPixels * verticalField)
    openingHeight = 110
    canvas.dataset.openingAsteroidPx = openingPixels.toFixed(0)
  }
  const postFrames = createSpatialContent(
    posts,
    scene,
    'posts',
    () => requestDraw(),
    displayFont,
  )
  const projectFrames = createSpatialContent(
    projects,
    scene,
    'projects',
    () => requestDraw(),
    displayFont,
  )
  const pointer = new THREE.Vector2()
  const pointerTarget = new THREE.Vector2()
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)')
  let reduced = reducedQuery.matches
  let width = 1
  let height = 1
  let mobile = false
  let lost = false
  let visible = true
  let disposed = false
  let frame = 0
  let lastDraw = -1
  let progress = 0
  let smoothProgress = 0
  let tumble = createTumble()
  let lastTime = -1
  let lastScrollY = window.scrollY
  let scrollSpeed = 0
  let dragging = false
  let dragRadius = 100
  const tilt = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(0, 0.62, 0.14),
  )
  const spin = new THREE.Quaternion()
  const xAxis = new THREE.Vector3(1, 0, 0)
  let frames = 0
  const eye = new THREE.Vector3()
  const target = new THREE.Vector3()
  const projected = new THREE.Vector3()
  const debrisPose = new THREE.Object3D()
  const handlePoint = new THREE.Vector3()
  const backOffset = new THREE.Vector3(0, 26, -100)
  let aboutOutline: Point[] | null = null
  const aboutPoint = new THREE.Vector3()
  const aboutDirection = new THREE.Vector3()

  const readProgress = () => {
    const extra = Number(container.dataset.postsExtra || 0)
    const length = container.offsetHeight - window.innerHeight - extra
    progress = documentFilmProgress(
      window.scrollY - container.offsetTop,
      length,
      extra,
    )
  }

  const handleOpen = (p: number) =>
    p < 0.12 && container.dataset.mode !== 'reading'
  const placeHandle = (p: number) => {
    // Fast Refresh can retain a scene after React replaces/reuses its old node.
    // Never project the asteroid control onto an element with another owner.
    if (
      !handle?.isConnected ||
      handle.getAttribute('role') !== 'slider' ||
      !container.contains(handle)
    )
      return
    const open = handleOpen(p) && !reduced
    handle.hidden = !open
    if (!open) return
    const verticalField = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
    handlePoint.copy(world.asteroid.position).project(camera)
    const distance = camera.position.distanceTo(world.asteroid.position)
    const scale = world.asteroid.scale.x
    dragRadius =
      (((rimX + rimYZ) / 2) * scale * height) / (2 * distance * verticalField)
    // Clip to the viewport so the focus ring and hit area stay on-screen.
    const centerX = (handlePoint.x * 0.5 + 0.5) * width
    const centerY = (-handlePoint.y * 0.5 + 0.5) * height
    const left = Math.max(0, centerX - dragRadius)
    // At close range the rock's centre lies far below the frame, so also reach
    // up to the sphere's tangent top edge to keep the visible rock draggable.
    const tangent = Math.asin(
      Math.min(0.999, (rimYZ * scale) / Math.max(distance, 0.001)),
    )
    const topNdc =
      Math.tan(Math.atan(handlePoint.y * verticalField) + tangent) /
      verticalField
    const top = Math.max(
      0,
      Math.min(centerY - dragRadius, (-topNdc * 0.5 + 0.5) * height),
    )
    handle.style.left = `${left}px`
    handle.style.top = `${top}px`
    handle.style.width = `${Math.min(width, centerX + dragRadius) - left}px`
    handle.style.height = `${Math.min(height, centerY + dragRadius) - top}px`
  }

  const stopLoop = () => {
    frame = 0
    lastTime = -1
  }

  const frameScene = (now = performance.now()) => {
    if (
      disposed ||
      lost ||
      !visible ||
      document.hidden ||
      container.dataset.mode === 'reading'
    ) {
      stopLoop()
      return
    }
    const dt = lastTime < 0 ? 0 : Math.min(0.05, (now - lastTime) / 1000)
    lastTime = now
    readProgress()
    const step = dt || 1 / 60
    smoothProgress = reduced
      ? progress
      : mix(smoothProgress, progress, 1 - Math.exp(-step / 0.0956))
    if (Math.abs(smoothProgress - progress) < 0.00001) smoothProgress = progress
    pointer.lerp(pointerTarget, 1 - Math.exp(-step / 0.325))
    const rawSpeed =
      dt > 0 ? (window.scrollY - lastScrollY) / window.innerHeight / dt : 0
    lastScrollY = window.scrollY
    scrollSpeed = mix(scrollSpeed, rawSpeed, 1 - Math.exp(-step / 0.08))
    if (Math.abs(scrollSpeed) < 0.005 && rawSpeed === 0) scrollSpeed = 0
    tumble = stepTumble(tumble, {
      dt,
      scrollSpeed: reduced ? 0 : scrollSpeed,
      reduced,
      dragging,
    })
    const p = smoothProgress
    const state = filmState(p)
    const asteroidTravel =
      smooth(0.02, 0.465, p) * 0.35 + smooth(0.465, 0.49, p) * 0.65
    // Start about twice as close (≈2x apparent width) while clearing the rock
    // surface, then pull back toward the established framing.
    const openingZ = openingDistance * OPENING_CLOSE_FACTOR
    // Raise the camera so the rock's upper edge lands ~20% of the viewport higher than the earlier 60% anchor (the visible horizon lands ~38% down)
    // at the top; the lift fades out as scrolling begins.
    const verticalField = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
    // The rock's top vertex sits slightly nearer than its centre, so the
    // edge anchor scales with that depth; this keeps it fixed at any distance.
    const edgeDepth = (z: number) => z - OPENING_EDGE_DEPTH
    const openingLift =
      (((OPENING_TOP_EDGE - 0.5) *
        2 *
        edgeDepth(openingDistance) *
        verticalField +
        OPENING_EDGE_OFFSET) *
        edgeDepth(openingZ)) /
        edgeDepth(openingDistance) -
      OPENING_EDGE_OFFSET +
      rimYZ
    const points = [
      {
        p: 0,
        eye: [0, openingHeight + openingLift, openingZ],
        target: [0, openingHeight + openingLift, 0],
      },
      {
        p: 0.12,
        eye: [3, openingHeight - 4, openingDistance * 1.7 + 24],
        target: [0, 98, 0],
      },
      {
        p: 0.3,
        eye: [1, 13, mobile ? 178 : 145],
        target: [0, mobile ? 100 : 108, -7],
      },
      {
        p: 0.43,
        eye: [2, 13, mobile ? 169 : 141],
        target: [0, mobile ? 98 : 105, -7],
      },
      { p: 0.485, eye: [9, 23, mobile ? 139 : 96], target: [0, 28, 0] },
      { p: 0.55, eye: [10, 41, mobile ? 164 : 126], target: [0, 32, 0] },
      { p: 0.63, eye: [8, 48, mobile ? 159 : 122], target: [0, 34, 0] },
      { p: 0.67, eye: [0, 68, mobile ? 119 : 88], target: [0, 48, 0] },
      { p: 0.89, eye: [0, 13, mobile ? 112 : 82], target: [0, 13, 0] },
      { p: 1, eye: [0, 7, mobile ? 222 : 194], target: [0, 19, 0] },
    ]
    const next = points.findIndex((point) => point.p > p)
    const left = points[Math.max(0, next < 0 ? points.length - 2 : next - 1)]
    const right = points[next < 0 ? points.length - 1 : next]
    const interpolation = smooth(left.p, right.p, p)
    eye.set(
      mix(left.eye[0], right.eye[0], interpolation),
      mix(left.eye[1], right.eye[1], interpolation),
      mix(left.eye[2], right.eye[2], interpolation),
    )
    target.set(
      mix(left.target[0], right.target[0], interpolation),
      mix(left.target[1], right.target[1], interpolation),
      mix(left.target[2], right.target[2], interpolation),
    )
    const pointerStrength = reduced ? 0 : 1 - smooth(0.44, 0.48, p)
    eye.x += pointer.x * 1.8 * pointerStrength
    eye.y += pointer.y * 0.8 * pointerStrength
    camera.position.copy(eye)
    camera.lookAt(target)
    world.asteroid.position.set(
      mix(0, -3, asteroidTravel),
      mix(110, 2, asteroidTravel),
      mix(0, -7, asteroidTravel),
    )
    world.asteroid.quaternion
      .copy(spin.setFromAxisAngle(xAxis, tumble.angle))
      .multiply(tilt)
    const rockScale = entryScale(p) * (1 - smooth(0.48, 0.515, p))
    world.asteroid.scale.set(rockScale, rockScale, rockScale)
    world.asteroid.visible = p < 0.516
    const aboutPhase = aboutAsteroidState(p)
    if (aboutPhase.active && container.dataset.aboutControl === 'true') {
      camera.updateMatrixWorld()
      world.asteroid.updateMatrixWorld()
      aboutPoint.copy(world.asteroid.position).project(camera)
      const originX = (aboutPoint.x * 0.5 + 0.5) * width
      const originY = (-aboutPoint.y * 0.5 + 0.5) * height
      const distance = camera.position.distanceTo(world.asteroid.position)
      const projectedWidth =
        ((rimX + rimYZ) * rockScale * height) / (2 * distance * verticalField)
      if (!aboutOutline) {
        const points = asteroidVertices.map((vertex) => {
          aboutPoint
            .copy(vertex)
            .applyMatrix4(world.asteroid.matrixWorld)
            .project(camera)
          return {
            x: ((aboutPoint.x * 0.5 + 0.5) * width - originX) / projectedWidth,
            y:
              ((-aboutPoint.y * 0.5 + 0.5) * height - originY) / projectedWidth,
          }
        })
        const hull = silhouetteHull(points)
        const left = Math.min(...hull.map((point) => point.x))
        const right = Math.max(...hull.map((point) => point.x))
        const top = Math.min(...hull.map((point) => point.y))
        const bottom = Math.max(...hull.map((point) => point.y))
        aboutOutline = hull.map((point) => ({
          x: (point.x - (left + right) / 2) / (right - left),
          y: (point.y - (top + bottom) / 2) / (right - left),
        }))
      }
      container.dispatchEvent(
        new CustomEvent(ABOUT_ASTEROID_EVENT, {
          detail: {
            x: originX,
            y: originY,
            width: projectedWidth,
            outline: aboutOutline,
          },
        }),
      )
      const x = Number(container.dataset.aboutX)
      const y = Number(container.dataset.aboutY)
      const diameter = Number(container.dataset.aboutWidth)
      if (Number.isFinite(x) && Number.isFinite(y) && diameter > 0) {
        aboutPoint
          .set((x / width) * 2 - 1, 1 - (y / height) * 2, 0.5)
          .unproject(camera)
        aboutDirection.copy(aboutPoint).sub(camera.position).normalize()
        world.asteroid.position
          .copy(camera.position)
          .addScaledVector(aboutDirection, distance)
        world.asteroid.scale.setScalar((rockScale * diameter) / projectedWidth)
      }
      world.asteroid.visible = aboutPhase.foreground < 0.999
    } else {
      aboutOutline = null
    }
    // Light sits directly behind the rock, so the facing side stays in shadow.
    backLight.position.copy(world.asteroid.position).add(backOffset)
    backLight.target.position.copy(world.asteroid.position)
    backLight.intensity = 5 * (1 - smooth(0.08, 0.3, p))
    world.debris.rotation.y = p * 0.7
    world.debris.position.y = mix(45, -45, asteroidTravel)
    world.debris.visible = p < 0.48
    const drift = world.earth.material.uniforms.uCloudDrift
    drift.value = advancePlanetClouds(drift.value, dt, reduced)
    world.earth.position.y = mobile ? -185 : -200
    world.atmosphere.position.copy(world.earth.position)
    world.earth.visible = p < 0.3
    world.atmosphere.visible = p < 0.3
    world.arrivalLight.visible = p < 0.3
    const deltaY = world.earth.position.y - camera.position.y
    const deltaZ = world.earth.position.z - camera.position.z
    const planetDistance = Math.hypot(deltaY, deltaZ)
    if (planetDistance > 260) {
      const sine = 260 / planetDistance,
        cosine = Math.sqrt(1 - sine * sine)
      const tangentDistance =
        Math.sqrt(planetDistance * planetDistance - 260 * 260) + 8
      const sun = world.arrivalLight.children[0]
      sun.position.set(
        0,
        camera.position.y +
          ((deltaY * cosine - deltaZ * sine) / planetDistance) *
            tangentDistance +
          0.7,
        camera.position.z +
          ((deltaY * sine + deltaZ * cosine) / planetDistance) *
            tangentDistance,
      )
      sun.quaternion.copy(camera.quaternion)
    }
    world.cityDisc.visible = p > 0.24 && p < 0.55
    // Rays and searchlight beams stay out of the Featured Posts backdrop and return for the city.
    const rays = smooth(0.315, 0.35, p)
    ;(world.city.userData.beamMaterial as THREE.MeshBasicMaterial).opacity =
      0.07 * rays
    ;(
      (world.cityDisc.children[0] as THREE.Mesh)
        .material as THREE.ShaderMaterial
    ).uniforms.uRays.value = rays
    // The city's illuminated ribs project as vertical shafts behind the posts.
    world.city.visible = state.postsBackdropClear
    world.city.scale.y = mix(1, 0.35, state.impact)
    world.city.rotation.z = state.impact * -0.035
    world.cloud.visible = state.impact > 0.001
    const cloudSize = smooth(0.49, 0.57, p)
    world.cloud.scale.setScalar(cloudSize)
    world.cloud.rotation.y = state.portfolio * -0.28
    world.haze.visible = p > 0.245 && p < 0.53
    world.haze.children.forEach((bank, index) => {
      bank.position.x = (index ? 1 : -1) * mix(28, 58, smooth(0.3, 0.445, p))
    })
    world.haze.position.y = mix(5, -1, smooth(0.32, 0.5, p))
    world.haze.rotation.y = p * 0.14
    world.shockwave.visible = p > 0.486 && p < 0.565
    world.shockwave.scale.setScalar(mix(1, 95, smooth(0.486, 0.565, p)))
    ;(world.shockwave.material as THREE.MeshBasicMaterial).opacity =
      0.65 * (1 - smooth(0.495, 0.565, p))
    const blast = smooth(0.486, 0.565, p)
    world.blastDebris.visible = p > 0.486 && p < 0.565
    world.blastPaths.forEach((path, index) => {
      debrisPose.position.set(
        Math.cos(path.angle) * path.distance * blast,
        2 + Math.sin(blast * Math.PI) * path.height,
        Math.sin(path.angle) * path.distance * blast,
      )
      debrisPose.scale.setScalar(path.size * (1 - blast * 0.8))
      debrisPose.rotation.set(blast * 4 + index, blast * 5, blast * 3)
      debrisPose.updateMatrix()
      world.blastDebris.setMatrixAt(index, debrisPose.matrix)
    })
    world.blastDebris.instanceMatrix.needsUpdate = true
    world.desert.group.visible = p > 0.15
    world.desert.tumbleweed.position.x = mix(-8, 7, state.retreat)
    world.desert.tumbleweed.rotation.z = state.retreat * -13
    world.desert.scorpion.position.x = -6 + state.retreat * 1.4
    world.desert.scorpion.rotation.y = state.retreat * 0.18
    light.intensity =
      3.5 * mix(0.08, 1, smooth(0.03, 0.13, p)) +
      (reduced ? 0 : state.flash * 3)
    ;(scene.fog as THREE.FogExp2).density = mix(
      0.0022,
      0.005,
      smooth(0.18, 0.35, p),
    )
    camera.updateMatrixWorld()
    world.cloud.updateMatrixWorld()
    const cloudUniforms = (world.cloud.material as THREE.ShaderMaterial)
      .uniforms
    cloudUniforms.uCamera.value
      .copy(camera.position)
      .applyMatrix4(world.cloud.matrixWorld.clone().invert())
    cloudUniforms.uProgress.value = state.impact
    cloudUniforms.uViewProjection.value.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    )
    cloudUniforms.uModel.value.copy(world.cloud.matrixWorld)
    const postsAnimating = updateSpatialContent(
      postFrames,
      camera,
      p,
      mobile,
      'posts',
      container,
    )
    updateSpatialContent(
      projectFrames,
      camera,
      p,
      mobile,
      'projects',
      container,
    )
    renderer.render(scene, camera)
    frames++
    projected
      .copy(world.cloud.position)
      .add(new THREE.Vector3(0, mix(48, 13, state.portfolio), 0))
      .project(camera)
    canvas.dataset.progress = p.toFixed(5)
    canvas.dataset.camera = JSON.stringify(
      camera.position.toArray().map((value) => +value.toFixed(3)),
    )
    canvas.dataset.asteroid = JSON.stringify(
      world.asteroid.position.toArray().map((value) => +value.toFixed(3)),
    )
    canvas.dataset.tumble = tumble.angle.toFixed(4)
    canvas.dataset.tumbleSpin = tumble.spin.toFixed(4)
    canvas.dataset.scrollSpeed = scrollSpeed.toFixed(4)
    canvas.dataset.asteroidScale = world.asteroid.scale.x.toFixed(4)
    placeHandle(p)
    canvas.dataset.impact = state.impact.toFixed(4)
    canvas.dataset.flash = (reduced ? 0 : state.flash).toFixed(4)
    canvas.dataset.frames = `${frames}`
    canvas.dataset.cloudAxis = `${(projected.x * 0.5 + 0.5).toFixed(4)},${(-projected.y * 0.5 + 0.5).toFixed(4)}`
    lastDraw = p
    if (
      !reduced &&
      (world.asteroid.visible ||
        postsAnimating ||
        Math.abs(progress - smoothProgress) > 0.000001 ||
        pointer.distanceTo(pointerTarget) > 0.001)
    )
      frame = requestAnimationFrame(frameScene)
    else stopLoop()
  }

  const requestDraw = () => {
    if (
      !frame &&
      !lost &&
      !document.hidden &&
      visible &&
      !disposed &&
      container.dataset.mode !== 'reading'
    )
      frame = requestAnimationFrame(frameScene)
  }
  const resize = () => {
    width = window.innerWidth
    height = window.innerHeight
    mobile = width < 700
    aboutOutline = null
    camera.aspect = width / height
    camera.fov = mobile ? 52 : 45
    camera.updateProjectionMatrix()
    fitOpeningAsteroid()
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.6),
    )
    renderer.setSize(width, height, false)
    requestDraw()
  }
  let dragPointer = -1
  let dragLast = 0
  let dragTime = 0
  const announce = () =>
    handle?.setAttribute(
      'aria-valuenow',
      `${Math.round((wrapAngle(tumble.angle) * 180) / Math.PI)}`,
    )
  const endDrag = (event?: PointerEvent) => {
    if (dragPointer < 0) return
    if (handle?.hasPointerCapture(dragPointer))
      handle.releasePointerCapture(dragPointer)
    dragPointer = -1
    dragging = false
    tumble = releaseTumble(tumble, reduced)
    announce()
    if (event) requestDraw()
  }
  const startDrag = (event: PointerEvent) => {
    if (!handle || reduced || event.button > 0 || !event.isPrimary) return
    dragPointer = event.pointerId
    dragging = true
    dragLast =
      dragAxis(event.pointerType) === 'x' ? event.clientX : event.clientY
    dragTime = event.timeStamp
    handle.setPointerCapture(event.pointerId)
    requestDraw()
  }
  const moveDrag = (event: PointerEvent) => {
    if (event.pointerId !== dragPointer) return
    const position =
      dragAxis(event.pointerType) === 'x' ? event.clientX : event.clientY
    const elapsed = Math.max(0.001, (event.timeStamp - dragTime) / 1000)
    tumble = dragTumble(
      tumble,
      position - dragLast,
      dragRadius,
      elapsed,
      reduced,
    )
    dragLast = position
    dragTime = event.timeStamp
    requestDraw()
  }
  const keyRotate = (event: KeyboardEvent) => {
    // Space would scroll the page; the slider keeps it as a no-op.
    if (
      event.key === ' ' &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault()
      return
    }
    const rotation = keyRotation(event.key)
    if (!rotation || event.altKey || event.ctrlKey || event.metaKey) return
    // Handled keys must never fall through to page scrolling.
    event.preventDefault()
    event.stopPropagation()
    tumble = {
      ...tumble,
      angle: 'to' in rotation ? rotation.to : tumble.angle + rotation.by,
      spin: 0,
    }
    announce()
    requestDraw()
  }
  const movePointer = (event: PointerEvent) => {
    if (reduced || event.pointerType !== 'mouse') return
    pointerTarget.set(
      (event.clientX / width - 0.5) * 2,
      -(event.clientY / height - 0.5) * 2,
    )
    requestDraw()
  }
  const motionPreference = () => {
    reduced = reducedQuery.matches
    if (reduced) endDrag()
    pointerTarget.set(0, 0)
    requestDraw()
  }
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame)
      frame = 0
    } else requestDraw()
  }
  const contextLost = (event: Event) => {
    event.preventDefault()
    lost = true
    cancelAnimationFrame(frame)
    frame = 0
    canvas.dataset.context = 'lost'
    onReady(false)
  }
  const contextRestored = () => {
    lost = false
    canvas.dataset.context = 'restored'
    onReady(true)
    resize()
    requestDraw()
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (!visible) {
      cancelAnimationFrame(frame)
      frame = 0
    } else requestDraw()
  })
  observer.observe(container)
  const modeObserver = new MutationObserver(requestDraw)
  modeObserver.observe(container, {
    attributes: true,
    attributeFilter: ['data-mode', 'data-about-control'],
  })
  handle?.addEventListener('pointerdown', startDrag)
  handle?.addEventListener('pointermove', moveDrag)
  handle?.addEventListener('pointerup', endDrag)
  handle?.addEventListener('pointercancel', endDrag)
  handle?.addEventListener('lostpointercapture', endDrag)
  handle?.addEventListener('keydown', keyRotate)
  window.addEventListener('scroll', requestDraw, { passive: true })
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', movePointer, { passive: true })
  window.addEventListener('film-card-input', requestDraw)
  document.addEventListener('visibilitychange', visibility)
  reducedQuery.addEventListener('change', motionPreference)
  canvas.addEventListener('webglcontextlost', contextLost)
  canvas.addEventListener('webglcontextrestored', contextRestored)
  readProgress()
  smoothProgress = progress
  resize()
  onReady(true)
  canvas.dataset.engine = `Three ${THREE.REVISION} / WebGL2`
  return () => {
    disposed = true
    cancelAnimationFrame(frame)
    observer.disconnect()
    modeObserver.disconnect()
    endDrag()
    handle?.removeEventListener('pointerdown', startDrag)
    handle?.removeEventListener('pointermove', moveDrag)
    handle?.removeEventListener('pointerup', endDrag)
    handle?.removeEventListener('pointercancel', endDrag)
    handle?.removeEventListener('lostpointercapture', endDrag)
    handle?.removeEventListener('keydown', keyRotate)
    window.removeEventListener('scroll', requestDraw)
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', movePointer)
    window.removeEventListener('film-card-input', requestDraw)
    document.removeEventListener('visibilitychange', visibility)
    reducedQuery.removeEventListener('change', motionPreference)
    canvas.removeEventListener('webglcontextlost', contextLost)
    canvas.removeEventListener('webglcontextrestored', contextRestored)
    disposeWorld(scene)
    renderer.dispose()
    canvas.dataset.frames = `${frames}`
    canvas.dataset.lastDraw = `${lastDraw}`
  }
}
