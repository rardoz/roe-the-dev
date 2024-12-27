import DefaultLayout from '../../../../_components/layout'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import config from '../../../../../messages/config'
import SketchBookLandingPage from '../../../../_components/sketch-book-landing-page'

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
      canonical: `/experiment/${params.slug}/sketch-book-vol-1`,
      languages: Object.fromEntries(
        config.locales.map((cur) => [
          cur,
          `/${cur}/experiment/${params.slug}/sketch-book-vol-1`,
        ]),
      ),
    },
    openGraph: {
      url: `/experiment/${params.slug}/sketch-book-vol-1`,
    },
    keywords: messages('keywords'),
  }
}

export default async function SketchBookVol1Playground(props: Props) {
  const locale = props.params?.locale || 'en-US'
  unstable_setRequestLocale(locale)

  return (
    <>
      <DefaultLayout
        params={{ locale: props.params.locale || '' }}
        navForcedInView
      >
        <div className="w-full h-full overflow-hidden py-10">
          <SketchBookLandingPage locale={locale} />
        </div>
      </DefaultLayout>
    </>
  )
}
