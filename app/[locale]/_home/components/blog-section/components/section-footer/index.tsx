import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { FC } from 'react'

const SectionFooter: FC = () => {
  const t = useTranslations('Blog')
  return (
    <div className="flex justify-center my-10">
      <Link
        href="/blog"
        className="bg-purple-700 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition-all duration-500 ease-in-out"
      >
        {t('cta')}
      </Link>
    </div>
  )
}

export default SectionFooter