import LinkButton from '../../../../../../_components/link-button'
import { useTranslations } from 'next-intl'
import { FC } from 'react'

const SectionFooter: FC = () => {
  const t = useTranslations('Portfolio')
  return (
    <div className="flex justify-center mb-10 mt-3">
      <LinkButton href="/portfolio">{t('cta')}</LinkButton>
    </div>
  )
}

export default SectionFooter
