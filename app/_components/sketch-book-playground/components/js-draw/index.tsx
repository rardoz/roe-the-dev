'use client'
import React, { useContext, useEffect, useRef } from 'react'
import * as jsdraw from 'js-draw'
import 'js-draw/styles'
import './style.css'
import { useRouter } from 'next/navigation'
import { sketchBookContext } from '../../../sketch-book/context'
import { makeEdgeToolbar } from 'js-draw'
import CustomInsertImageWidget from './CustomInsertImageWidget'
import { MaterialIconProvider } from '@js-draw/material-icons'
import { lockPageContext } from '../../../sketch-book/lock/context'

const JsDraw: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<jsdraw.Editor | null>(null)
  const router = useRouter()
  const sketchData = useContext(sketchBookContext)
  const lockData = useContext(lockPageContext)
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
    router.push(`/experiment/sketchbook-experiment/sketch-book`)
  }

  useEffect(() => {
    if (pageRef.current && sketchData.paths) {
      editorRef.current = new jsdraw.Editor(pageRef.current, {
        wheelEventsEnabled: 'only-if-focused',
        iconProvider: new MaterialIconProvider(),
      })

      const toolbar = makeEdgeToolbar(editorRef.current)

      const imgWidget = new CustomInsertImageWidget(editorRef.current)
      toolbar.addActionButton(
        {
          icon: editorRef.current.icons.makeSaveIcon(),
          label: 'Save',
        },
        onSave,
      )
      toolbar.addActionButton(
        {
          icon: editorRef.current.icons.makeCloseIcon(),
          label: 'Close',
        },
        onUnlock,
      )

      toolbar.addDefaultActionButtons()
      const timer = document.createElement('div')
      timer.innerHTML = `<strong>Timer: </strong><span id="js-draw-timer-value">${'60:00'}</span>`
      const endTime = new Date(lockData.endTime)

      const codeLabel = document.createElement('div')
      codeLabel.innerHTML = `<strong>Code: </strong><span id="js-draw-code-value">${lockData.code}</span>`

      const spacer = document.createElement('div')
      spacer.innerText = ' '

      toolbar.addActionButton({ icon: codeLabel, label: '' }, () => {})

      toolbar.addActionButton({ icon: spacer, label: '' }, () => {})
      toolbar.addActionButton({ icon: timer, label: '' }, () => {})
      toolbar.addActionButton({ icon: spacer, label: '' }, () => {})
      toolbar.addActionButton({ icon: spacer, label: '' }, () => {})
      toolbar.addWidgetsForPrimaryTools(() => {
        return true
      })

      toolbar.addWidget(imgWidget)
      editorRef.current.loadFromSVG(sketchData.paths)

      const interval = setInterval(() => {
        const now = new Date()
        const timeDiff = endTime.getTime() - now.getTime()
        if (timeDiff <= 0) {
          timer.innerHTML = `<strong>Timer: </strong><span id="js-draw-timer-value">00:00</span>`
          if (window.confirm('Your timer has ended, would you like to save?')) {
            onSave()
          }
          router.replace(
            `/experiment/sketchbook-experiment/sketch-book/page-number/${lockData.pageNumber}`,
          )
          clearInterval(interval)
          return
        }

        const minutes = Math.floor(timeDiff / 60000)
        const seconds = Math.floor((timeDiff % 60000) / 1000)
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

        timer.innerHTML = `<strong>Timer: </strong><span id="js-draw-timer-value">${timeString}</span>`
      }, 1000)
      return () => {
        clearInterval(interval)
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
