import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import config from '../../../../../../../messages/config'
import SketchBookLockPage from '../../../../../../_components/sketch-book/lock'
import DefaultLayout from '../../../../../../_components/layout'

type Props = {
  params: Promise<{ locale?: string; slug: string; page_number: string }>
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
    title: `${messages('title')} Playground`,
    description: messages('description'),
    alternates: {
      canonical: `/experiment/${params.slug}/sketch-book/${params.page_number}`,
      languages: Object.fromEntries(
        config.locales.map((cur) => [
          cur,
          `/${cur}/experiment/${params.slug}/sketch-book/${params.page_number}`,
        ]),
      ),
    },
    openGraph: {
      url: `/experiment/${params.slug}/sketch-book/${params.page_number}`,
    },
    keywords: messages('keywords'),
  }
}

export default async function Playground(props: Props) {
  const params = await props.params
  const locale = params?.locale || 'en-US'
  const page_number = parseInt(params?.page_number, 10) || 0
  setRequestLocale(locale)
  return (
    <DefaultLayout params={{ locale: params.locale || '' }} navForcedInView>
      <div className="w-full py-10 my-10">
        <SketchBookLockPage page={page_number} />
      </div>
    </DefaultLayout>
  )
}
