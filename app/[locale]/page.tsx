import { useTranslations } from 'next-intl'
import H1 from '../_components/h1'
import DefaultLayout from '../_components/layout'

export default function Home(props: { params?: { locale: string } }) {
  const homeTranslations = useTranslations('Home')

  return (
    <DefaultLayout params={props.params}>
      <H1>{homeTranslations('title')}</H1>
    </DefaultLayout>
  )
}
