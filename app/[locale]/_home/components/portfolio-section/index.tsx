import { useEntries } from '../../../../_services/contentful'
import Card from '../../../../_components/card'
import Carousel from '../../../../_components/carousel'
import SectionTitle from './components/section-title'
const CONTENTFUL_PORTFOLIO_ID =
  process.env.CONTENTFUL_PORTFOLIO_ID || 'portfolio'

const PortfolioSection = async () => {
  const entries = await useEntries({
    limit: 6,
    contentType: CONTENTFUL_PORTFOLIO_ID,
  })

  return (
    <div className="bg-purple-900 p-5 w-full mt-24">
      <SectionTitle />
      <Carousel>
        {[0, 1].map((slide) => (
          <div key={slide} className="px-5 relative pb-5 max-w-screen-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-5 pb-14 px-0 grid-flow-row lg:grid-flow-col sm:px-14">
              {entries?.items?.slice(slide * 3, slide * 3 + 3).map((entry) => {
                return (
                  <Card
                    key={entry?.slug}
                    imageAlt={entry?.featuredImage?.description}
                    imageSrc={entry?.featuredImage?.url}
                    title={entry?.title}
                    description={entry?.description}
                    hardRoute={entry?.hardRoute}
                    link={
                      entry?.hardRoute
                        ? entry?.slug
                        : `/portfolio/${entry?.slug}`
                    }
                  />
                )
              })}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  )
}

export default PortfolioSection