import { useTranslations } from 'next-intl'

const SectionTitle = () => {
  const t = useTranslations('Portfolio')
  return (
    <h2 className="text-center text-slate-100 text-4xl font-bold py-5">
      {t('title')}
    </h2>
  )
}

export default SectionTitle
