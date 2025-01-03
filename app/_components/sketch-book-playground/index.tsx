'use client'
import React, { useEffect, useState } from 'react'
import LockPageProvider from '../sketch-book/lock/context'
const JsDraw = React.lazy(() => import('./components/js-draw'))
//import { useTranslations } from 'next-intl'

const SketchBookPlayground: React.FC<{
  locale: string
  lockId: string
  code: string
}> = ({ lockId, code }) => {
  //const translations = useTranslations('SketchBook')
  const [hydrationLoad, setHydrationLoad] = useState(false)

  useEffect(() => {
    setHydrationLoad(true)
  }, [])
  return (
    <div>
      <React.Suspense fallback={'loading...'}>
        <LockPageProvider lockId={lockId} code={code}>
          {hydrationLoad && <JsDraw />}
        </LockPageProvider>
      </React.Suspense>
    </div>
  )
}

export default SketchBookPlayground
