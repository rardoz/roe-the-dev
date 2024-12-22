'use client'
import React from 'react'
import SketchBook from '../sketch-book'
//TODO: May want to add a suspense animation here so that the SketchBook component is not immediately rendered
const SketchBookPlayground: React.FC = () => {
  return (
    <>
      <SketchBook />
    </>
  )
}

export default SketchBookPlayground
