import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import config from '../../../../../../messages/config'
import SketchBookPlayground from '../../../../../_components/sketch-book-playground'

type Props = {
  params: { locale?: string; slug: string; page_number: string }
}

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const messages = await getTranslations('SketchBook')

  return {
    title: `${messages('title')} Playground`,
    description: messages('description'),
    alternates: {
      canonical: `/experiment/${params.slug}/sketch-book-vol-1/${params.page_number}`,
      languages: Object.fromEntries(
        config.locales.map((cur) => [
          cur,
          `/${cur}/experiment/${params.slug}/sketch-book-vol-1/${params.page_number}`,
        ]),
      ),
    },
    openGraph: {
      url: `/experiment/${params.slug}/sketch-book-vol-1/${params.page_number}`,
    },
    keywords: messages('keywords'),
  }
}

export default async function Playground(props: Props) {
  const locale = props.params?.locale || 'en-US'
  const page_number = parseInt(props.params?.page_number, 10) || 0
  unstable_setRequestLocale(locale)
  return (
    <div className="w-full h-full overflow-hidden">
      <SketchBookPlayground locale={locale} pageNumber={page_number} />
    </div>
  )
}
