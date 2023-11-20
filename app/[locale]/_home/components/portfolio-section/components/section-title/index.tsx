import { useTranslations } from 'next-intl'

const SectionTitle = () => {
  const t = useTranslations('Portfolio')
  return (
    <div className="w-3/4 lg:w-1/2 mx-auto mt-8">
      <h2 className="text-center text-slate-50 text-4xl font-bold">
        {t('title')}
      </h2>
      <hr className="mt-5 mb-10 border-dotted border-spacing-8 border-8 border-t-0 border-purple-300" />
    </div>
  )
}

export default SectionTitle
