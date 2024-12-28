'use client'
import React from 'react'
import SketchBookProvider from '../sketch-book/context'
const JsDraw = React.lazy(() => import('./components/js-draw'))
//import { useTranslations } from 'next-intl'

const SketchBookPlayground: React.FC<{
  locale: string
  pageNumber: number
}> = ({ pageNumber }) => {
  //const translations = useTranslations('SketchBook')

  return (
    <div>
      <React.Suspense fallback={'loading...'}>
        <SketchBookProvider page={pageNumber} includePageBg>
          {global.window && <JsDraw />}
        </SketchBookProvider>
      </React.Suspense>
    </div>
  )
}

export default SketchBookPlayground
