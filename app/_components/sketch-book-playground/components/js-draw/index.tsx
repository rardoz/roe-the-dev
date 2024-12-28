'use client'
import React, { useContext, useEffect, useRef } from 'react'
import * as jsdraw from 'js-draw'
import 'js-draw/styles'
import './style.css'
import { useRouter } from 'next/navigation'
import { sketchBookContext } from '../../../sketch-book/context'

const JsDraw: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<jsdraw.Editor | null>(null)
  const router = useRouter()
  const sketchData = useContext(sketchBookContext)

  const onSave = () => {
    //NOTE: we only want to save what the user added so we can remove it later if we need to
    const output = editorRef.current?.toSVG()
    if (output) {
      output.getElementsByClassName('js-draw-image-background')[0].remove()
      output.querySelector('#js-draw-style-sheet')?.remove()
      const newPaths = output.innerHTML
      sketchData.savePage(newPaths)
    }
  }

  const onUnlock = () => {
    onSave()
    router.replace('sketch-book')
  }

  useEffect(() => {
    if (pageRef.current && sketchData.paths) {
      editorRef.current = new jsdraw.Editor(pageRef.current, {
        wheelEventsEnabled: 'only-if-focused',
      })
      const toolbar = editorRef.current.addToolbar()

      toolbar.addActionButton('Save', onSave)
      toolbar.addActionButton('Unlock', onUnlock)

      editorRef.current.loadFromSVG(sketchData.paths)
      return () => {
        editorRef.current?.remove()
      }
    }
  }, [sketchData.paths])

  return (
    <>
      <div ref={pageRef}></div>
    </>
  )
}

export default JsDraw
