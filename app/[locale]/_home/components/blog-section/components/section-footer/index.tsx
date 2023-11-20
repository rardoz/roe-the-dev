import LinkButton from '../../../../../../_components/link-button'
import { useTranslations } from 'next-intl'
import { FC } from 'react'

const SectionFooter: FC = () => {
  const t = useTranslations('Blog')
  return (
    <div className="flex justify-center my-10">
      <LinkButton href="/blog">{t('cta')}</LinkButton>
    </div>
  )
}

export default SectionFooter
