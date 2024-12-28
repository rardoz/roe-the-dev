'use client'
import React from 'react'
import SketchBookProvider from '../sketch-book/context'
import LockPageProvider from '../sketch-book/lock/context'
const JsDraw = React.lazy(() => import('./components/js-draw'))
//import { useTranslations } from 'next-intl'

const SketchBookPlayground: React.FC<{
  locale: string
  lockId: string
  code: string
}> = ({ lockId, code }) => {
  //const translations = useTranslations('SketchBook')

  return (
    <div>
      <React.Suspense fallback={'loading...'}>
        <LockPageProvider lockId={lockId} code={code}>
          <SketchBookProvider includePageBg>
            {global.window && <JsDraw />}
          </SketchBookProvider>
        </LockPageProvider>
      </React.Suspense>
    </div>
  )
}

export default SketchBookPlayground
