'use client'
import React from 'react'
import SketchBookProvider, {
  SketchWithHTML,
} from '../../../sketch-book/context'
//import { useTranslations } from 'next-intl'

const MiniPagePreview: React.FC<{
  pageNumber: number
}> = ({ pageNumber }) => {
  //const translations = useTranslations('SketchBook')

  return (
    <div>
      <React.Suspense fallback={'loading...'}>
        <SketchBookProvider page={pageNumber} includePageBg>
          <SketchWithHTML />
        </SketchBookProvider>
      </React.Suspense>
    </div>
  )
}

export default MiniPagePreview
