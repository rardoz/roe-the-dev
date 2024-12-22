'use client'
import React from 'react'
import SketchBook from '../sketch-book'

const SketchBookPlayground: React.FC = () => {
  return <>{global['window'] && <SketchBook />}</>
}

export default SketchBookPlayground
