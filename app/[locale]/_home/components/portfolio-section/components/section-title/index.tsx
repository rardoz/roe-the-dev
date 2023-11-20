import { useTranslations } from 'next-intl'
import HR from '../../../../../../_components/hr'

const SectionTitle = () => {
  const t = useTranslations('Portfolio')
  return (
    <div className="w-3/4 lg:w-1/2 mx-auto mt-8 -mb-4">
      <h2 className="text-center text-slate-50 text-4xl font-bold">
        {t('title')}
      </h2>
      <HR />
    </div>
  )
}

export default SectionTitle
