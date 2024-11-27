import React, { useEffect, useRef } from 'react'
declare global {
  //eslint-disable-next-line
    interface Window {
    createUnityInstance: any
  }
}
let hasRendered = false
// Type annotations for the refs
const UnityWebGLPlayer: React.FC = () => {
  const unityContainerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const loadingBarRef = useRef<HTMLDivElement | null>(null)
  const progressBarFullRef = useRef<HTMLDivElement | null>(null)
  const fullscreenButtonRef = useRef<HTMLDivElement | null>(null)
  const warningBannerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (hasRendered) return
    hasRendered = true
    const unityContainer = unityContainerRef.current
    const canvas = canvasRef.current
    const loadingBar = loadingBarRef.current
    const progressBarFull = progressBarFullRef.current
    const fullscreenButton = fullscreenButtonRef.current
    const warningBanner = warningBannerRef.current

    // Show a temporary message banner
    function unityShowBanner(msg: string, type: 'error' | 'warning' | string) {
      function updateBannerVisibility() {
        if (warningBanner) {
          warningBanner.style.display = warningBanner.children.length
            ? 'block'
            : 'none'
        }
      }

      const div = document.createElement('div')
      div.innerHTML = msg
      if (warningBanner) warningBanner.appendChild(div)

      if (type !== 'error') {
        setTimeout(() => {
          if (warningBanner) warningBanner.removeChild(div)
          updateBannerVisibility()
        }, 5000)
      }

      updateBannerVisibility()
    }

    const buildUrl = ''
    const loaderUrl = `${buildUrl}/c7cea366ea8eaab59722a8d24073643f.loader.js`

    const config = {
      dataUrl: `${buildUrl}/914d102dd8feaa7d5f32091f58d51297.data.unityweb`,
      frameworkUrl: `${buildUrl}/2bcb3e402c876ede50377ddd1ae58d0c.framework.js.unityweb`,
      codeUrl: `${buildUrl}/352ad9350920871c23b75dc11ba320c3.wasm.unityweb`,
      streamingAssetsUrl: 'StreamingAssets',
      companyName: 'Lottie Winters',
      productName: 'Lottiewood',
      productVersion: '0.1',
      showBanner: unityShowBanner,
    }

    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      const meta = document.createElement('meta')
      meta.name = 'viewport'
      meta.content =
        'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes'
      document.getElementsByTagName('head')[0].appendChild(meta)

      if (unityContainer) unityContainer.classList.add('unity-mobile')
      if (canvas) canvas.classList.add('unity-mobile')

      unityShowBanner(
        'WebGL builds are not supported on mobile devices.',
        'warning',
      )
    } else {
      if (canvas) {
        canvas.style.width = '960px'
        canvas.style.height = '600px'
      }
    }

    if (loadingBar) loadingBar.style.display = 'block'

    const script = document.createElement('script')
    script.src = loaderUrl
    script.onload = () => {
      if (canvas) {
        window
          .createUnityInstance(canvas, config, (progress: number) => {
            if (progressBarFull) {
              progressBarFull.style.width = `${100 * progress}%`
            }
          })
          .then((unityInstance: any) => {
            if (loadingBar) loadingBar.style.display = 'none'
            if (fullscreenButton) {
              fullscreenButton.onclick = () => {
                unityInstance.SetFullscreen(1)
              }
            }
          })
          .catch((message: string) => {
            alert(message)
          })
      }
    }
    document.body.appendChild(script)

    // Cleanup when component unmounts
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div id="unity-container" ref={unityContainerRef} className="unity-desktop">
      <canvas
        id="unity-canvas"
        ref={canvasRef}
        width={960}
        height={600}
      ></canvas>
      <div id="unity-loading-bar" ref={loadingBarRef}>
        <div id="unity-logo"></div>
        <div id="unity-progress-bar-empty">
          <div id="unity-progress-bar-full" ref={progressBarFullRef}></div>
        </div>
      </div>
      <div id="unity-warning" ref={warningBannerRef}></div>
      <div id="unity-footer">
        {/* <div id="unity-webgl-logo"></div> */}
        <div id="unity-fullscreen-button" ref={fullscreenButtonRef}></div>
        {/* <div id="unity-build-title"></div> */}
      </div>
    </div>
  )
}

export default UnityWebGLPlayer
