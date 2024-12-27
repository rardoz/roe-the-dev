'use client'
import React from 'react'
const JsDraw = React.lazy(() => import('./components/js-draw'))
//import { useTranslations } from 'next-intl'

const SketchBookPlayground: React.FC<{ locale: string }> = (/*{ locale }*/) => {
  //const translations = useTranslations('SketchBook')

  return (
    <div>
      <React.Suspense fallback={'loading...'}>
        {global.window && <JsDraw />}
      </React.Suspense>
    </div>
  )
}

export default SketchBookPlayground
