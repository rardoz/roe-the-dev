import type { FC } from 'react'
import { useTranslations } from 'next-intl'

const SectionTitle: FC = () => {
  const t = useTranslations('Blog')

  return (
    <div className="w-3/4 lg:w-1/2 mx-auto">
      <h2 className=" text-center text-purple-700 text-4xl font-bold">
        {t('title')}
      </h2>
      <hr className="mt-5 mb-16 border-dotted border-spacing-8 border-8 border-t-0 border-purple-300" />
    </div>
  )
}

export default SectionTitle
