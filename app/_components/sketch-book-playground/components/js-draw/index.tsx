'use client'
import React, { useEffect, useRef } from 'react'
import * as jsdraw from 'js-draw'
import 'js-draw/styles'
import './style.css'

const JsDraw: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<jsdraw.Editor | null>(null)

  const onSave = () => {
    const output = editorRef.current?.toSVG()
    if (output) {
      output.getElementsByClassName('js-draw-image-background')[0].remove()
      localStorage.setItem('svg-test', `${output.outerHTML}`)
    }
  }

  useEffect(() => {
    if (pageRef.current) {
      editorRef.current = new jsdraw.Editor(pageRef.current, {
        wheelEventsEnabled: 'only-if-focused',
      })
      const toolbar = editorRef.current.addToolbar()

      toolbar.addActionButton('Save', onSave)

      editorRef.current.loadFromSVG(`
	<svg viewBox="0 0 450 600" width="450" height="600" version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg"><style id="js-draw-style-sheet">path{stroke-linecap:round;stroke-linejoin:round;}text{white-space:pre;}</style><image class="js-draw-image-background" href="/paper.png" width="1821" height="2725" aria-label="" style="transform: matrix(0.2475, 0, 0, 0.22, 0, -0.464309);"></image></svg>
	`)

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
