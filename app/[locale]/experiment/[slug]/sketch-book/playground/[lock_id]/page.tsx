import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import config from '../../../../../../../messages/config'
import DefaultLayout from '../../../../../../_components/layout'
import SectionTitle from '../../../../../../_components/section-title'
import CodeForm from '../../../../../../_components/sketch-book/code-form'

type Props = {
  params: {
    locale?: string
    slug: string
    lock_id: string
  }
}

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getTranslations('SketchBook')

  return {
    title: `${messages('title')} Lock Code`,
    description: messages('description'),
  }
}

export default async function Playground(props: Props) {
  const locale = props.params?.locale || 'en-US'
  const lock_id = props.params?.lock_id
  unstable_setRequestLocale(locale)

  return (
    <DefaultLayout navForcedInView>
      <div className="w-full min-h-screen overflow-hidden my-16 py-10 flex items-center flex-col">
        <div className="mb-6 w-3/4 mx-auto">
          <SectionTitle>Skechbook Locked!</SectionTitle>

          <CodeForm lock_id={lock_id} />
        </div>
      </div>
    </DefaultLayout>
  )
}
