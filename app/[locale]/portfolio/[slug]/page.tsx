import ContentfulToReact from '../../../_components/contentful-to-react'
import DefaultLayout from '../../../_components/layout'
import { useEntries } from '../../../_services/contentful'
import Discussion from '../../../_components/discussion'
import SectionTitle from '../../../_components/section-title'
import VideoPlayer from '../../../_components/video-player'
import Hero from '../../../_components/hero'

const CONTENTFUL_PORTFOLIO_ID =
  process.env.CONTENTFUL_PORTFOLIO_ID || 'portfolio'

export default async function PortfolioDetail(props: {
  params?: { locale: string; slug?: string }
}) {
  const entries = await useEntries({
    contentType: CONTENTFUL_PORTFOLIO_ID,
    slug: props.params?.slug,
  })

  const entry = entries?.items?.[0]
  return (
    <DefaultLayout params={props.params}>
      <div className="w-full -my-2">
        <div>
          <Hero
            description={entry?.description}
            title={entry?.title}
            imageDescription={entry?.blogPhoto?.description}
            imageSrc={entry?.blogPhoto?.url}
          />

          <div className="max-w-screen-lg mx-auto pt-1" id="main-section">
            <div className="px-4 pt-16">
              {entry?.content && <ContentfulToReact content={entry?.content} />}
              <div className="my-5 sm:my-10">
                <VideoPlayer
                  posterSrc={entry?.blogPhoto?.url}
                  videoSrc={entry?.video?.url || ''}
                />
              </div>
            </div>
            {entry && (
              <>
                <div className="px-4 pb-10 w-full">
                  <SectionTitle>Critique my work</SectionTitle>

                  <Discussion
                    slug={entry.slug!}
                    title={entry.title!}
                    contentType="portfolio"
                    locale={props.params?.locale}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
