import DefaultLayout from '../../../../_components/layout'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import config from '../../../../../messages/config'
import SketchBookLandingPage from '../../../../_components/sketch-book-landing-page'

type Props = {
  params: Promise<{ locale?: string; slug: string }>
}

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: pendingParams,
}: Props): Promise<Metadata> {
  const params = await pendingParams
  const messages = await getTranslations('SketchBook')
  return {
    title: `${messages('title')}`,
    description: messages('description'),
    alternates: {
      canonical: `/experiment/${params.slug}/sketch-book`,
      languages: Object.fromEntries(
        config.locales.map((cur) => [
          cur,
          `/${cur}/experiment/${params.slug}/sketch-book`,
        ]),
      ),
    },
    openGraph: {
      url: `/experiment/${params.slug}/sketch-book`,
    },
    keywords: messages('keywords'),
  }
}

export default async function SketchBookVol1Playground(props: Props) {
  const params = await props.params
  const locale = params?.locale || 'en-US'
  setRequestLocale(locale)

  return (
    <>
      <DefaultLayout params={{ locale: params.locale || '' }} navForcedInView>
        <div className="w-full h-full overflow-hidden py-10">
          <SketchBookLandingPage locale={locale} />
        </div>
      </DefaultLayout>
    </>
  )
}
