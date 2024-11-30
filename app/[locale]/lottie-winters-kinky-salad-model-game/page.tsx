import type { Metadata } from 'next'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import config from '../../../messages/config'
import LottieGame from '../../_components/lottie-game'
import './styles.css'

type Props = {
  params?: { locale: string }
}

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getTranslations('LottieGame')

  return {
    title: messages('title'),
    description: messages('description'),
  }
}

export default async function LWKSMG(props: Props) {
  unstable_setRequestLocale(props.params?.locale || 'en-US')
  return (
    <div className="lottie-layout">
      <LottieGame />
    </div>
  )
}
