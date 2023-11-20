import { useEntries } from '../../../../_services/contentful'
import Card from '../../../../_components/card'
import Carousel from '../../../../_components/carousel'
import SectionTitle from '../../../../_components/section-title'
import { getTranslator } from 'next-intl/server'
import { FC } from 'react'
import LinkButton from '../../../../_components/link-button'

const CONTENTFUL_PORTFOLIO_ID =
  process.env.CONTENTFUL_PORTFOLIO_ID || 'portfolio'

const PortfolioSection: FC<{ locale?: string }> = async (props) => {
  const entries = await useEntries({
    limit: 6,
    contentType: CONTENTFUL_PORTFOLIO_ID,
  })
  const messages = await getTranslator(props.locale || '', 'Portfolio')

  return (
    <div className="bg-purple-900 p-5 w-full mt-24">
      <SectionTitle light>{messages.raw('title')}</SectionTitle>
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
      <div className="flex justify-center mb-10 mt-3">
        <LinkButton href="/portfolio">{messages('cta')}</LinkButton>
      </div>
    </div>
  )
}

export default PortfolioSection
