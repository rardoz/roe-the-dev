import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import config from '../../../../../../../../messages/config'
import SketchBookPlayground from '../../../../../../../_components/sketch-book-playground'

type Props = {
  params: {
    locale?: string
    slug: string
    lock_id: string
    code: string
  }
}

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getTranslations('SketchBook')

  return {
    title: `${messages('title')} Playground`,
    description: messages('description'),
  }
}

export default async function Playground(props: Props) {
  const locale = props.params?.locale || 'en-US'
  const lock_id = props.params?.lock_id
  const code = props.params?.code
  unstable_setRequestLocale(locale)

  return (
    <div className="w-full h-full overflow-hidden">
      <SketchBookPlayground locale={locale} code={code} lockId={lock_id} />
    </div>
  )
}
