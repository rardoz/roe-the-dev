'use client'
import React, { useEffect, useRef } from 'react'
import * as jsdraw from 'js-draw'
import 'js-draw/styles'
import './style.css'
import { useRouter } from 'next/navigation'
const imgBg = `<image class="js-draw-image-background" href="/paper.png" width="1821" height="2725" aria-label="" style="transform: matrix(0.2475, 0, 0, 0.22, 0, -0.464309);"></image>`

const JsDraw: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<jsdraw.Editor | null>(null)
  const router = useRouter()
  const onSave = () => {
    //NOTE: we only want to save what the user added so we can remove it later if we need to
    const output = editorRef.current?.toSVG()
    if (output) {
      output.getElementsByClassName('js-draw-image-background')[0].remove()
      localStorage.setItem('svg-test', `${output.outerHTML}`)
    }
  }

  const onUnlock = () => {
    onSave()
    router.replace('sketch-book-vol-1')
  }

  useEffect(() => {
    if (pageRef.current) {
      editorRef.current = new jsdraw.Editor(pageRef.current, {
        wheelEventsEnabled: 'only-if-focused',
      })
      const toolbar = editorRef.current.addToolbar()

      toolbar.addActionButton('Save', onSave)
      toolbar.addActionButton('Unlock', onUnlock)

      editorRef.current.loadFromSVG(
        localStorage
          .getItem('svg-test')
          ?.replace('</style>', `</style>${imgBg}`) ||
          `
	<svg viewBox="0 0 450 600" width="450" height="600" version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg"><style id="js-draw-style-sheet">path{stroke-linecap:round;stroke-linejoin:round;}text{white-space:pre;}</style>${imgBg}</svg>
	`,
      )
      console.log(editorRef.current?.toSVG().outerHTML)
      return () => {
        editorRef.current?.remove()
      }
    }
  }, [])

  return (
    <>
      <div ref={pageRef}></div>
    </>
  )
}

export default JsDraw
