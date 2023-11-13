import { useTranslations } from 'next-intl'
import H1 from '../_components/h1'
import DefaultLayout from '../_components/layout'
import BigCarousel from '../_components/big-carousel'

export default function Home(props: { params?: { locale: string } }) {
  const homeTranslations = useTranslations('Home')

  return (
    <>
      <DefaultLayout params={props.params}>
        <BigCarousel className="-mt-20 pt-5">
          <div className="flex items-center justify-center">
            <H1>{homeTranslations('title')}</H1>
          </div>
        </BigCarousel>
      </DefaultLayout>
    </>
  )
}
