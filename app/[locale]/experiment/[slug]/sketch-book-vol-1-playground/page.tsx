import DefaultLayout from '../../../../_components/layout'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import config from '../../../../../messages/config'

type Props = {
  params: { locale?: string; slug: string }
}

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const messages = await getTranslations('SketchBook')
  return {
    title: `${messages('title')}`,
    description: messages('description'),
    alternates: {
      canonical: `/experiment/${params.slug}/sketch-book-vol-1-playground`,
      languages: Object.fromEntries(
        config.locales.map((cur) => [
          cur,
          `/${cur}/experiment/${params.slug}/sketch-book-vol-1-playground`,
        ]),
      ),
    },
    openGraph: {
      url: `/experiment/${params.slug}/sketch-book-vol-1-playground`,
    },
    keywords: messages('keywords'),
  }
}

export default async function SketchBookVol1Playground(props: Props) {
  unstable_setRequestLocale(props.params?.locale || 'en-US')
  const messages = await getTranslations('SketchBook')

  return (
    <DefaultLayout params={{ locale: props.params.locale || '' }}>
      <div className="w-full">
        <div className="max-w-screen-lg mx-auto pt-1" id="main-section">
          <div className="px-4">
            <h1>{messages('title')}</h1>
            <p>{messages('description')}</p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
