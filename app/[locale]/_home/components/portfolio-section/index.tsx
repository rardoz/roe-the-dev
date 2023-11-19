import Card from '../../../../_components/card'
import Carousel from '../../../../_components/carousel'
import { useTranslations } from 'next-intl'

const PortfolioSection = () => {
  const t = useTranslations('Portfolio')

  return (
    <div className="bg-purple-900 p-5 w-full my-8">
      <h2 className="text-center text-slate-100 text-4xl font-bold">
        {t('title')}
      </h2>
      <Carousel>
        <div className="px-5 relative pb-5 max-w-screen-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-5 pb-14 px-0 grid-flow-row lg:grid-flow-col sm:px-14">
            <Card />
            <Card />
            <Card />
          </div>
        </div>
      </Carousel>
    </div>
  )
}

export default PortfolioSection
