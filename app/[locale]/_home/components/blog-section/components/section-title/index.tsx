import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import HR from '../../../../../../_components/hr'

const SectionTitle: FC = () => {
  const t = useTranslations('Blog')

  return (
    <div className="w-3/4 lg:w-1/2 mx-auto">
      <h2 className=" text-center text-purple-700 text-4xl font-bold">
        {t('title')}
      </h2>
      <HR />
    </div>
  )
}

export default SectionTitle
