import ContentfulToReact from '../../../_components/contentful-to-react'
import DefaultLayout from '../../../_components/layout'
import { useEntries } from '../../../_services/contentful'
import Discussion from '../../../_components/discussion'
import SectionTitle from '../../../_components/section-title'
import VideoPlayer from '../../../_components/video-player'
import Hero from '../../../_components/hero'
import { getTranslator } from 'next-intl/server'
import BreadCrumbs from '../../../_components/breadcrumbs'
import dayjs from 'dayjs'

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

  const messages = await getTranslator(props.params?.locale || '', 'Portfolio')
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
            <div className="px-4">
              <div className="pb-12 pt-4">
                <BreadCrumbs
                  links={[
                    {
                      label: messages.raw('title'),
                      href: '/portfolio',
                    },
                    {
                      label: entry?.title,
                      href: `/portfolio/${entry?.slug}`,
                    },
                  ]}
                />
              </div>
              {entry?.content && <ContentfulToReact content={entry?.content} />}

              <div className="my-5 sm:my-10">
                <VideoPlayer
                  posterSrc={entry?.blogPhoto?.url}
                  videoSrc={entry?.video?.url || ''}
                />
              </div>
              <div className="opacity-70 text-sm">
                <em>
                  <strong className="text-purple-800">
                    Last updated: &nbsp;
                  </strong>
                  {dayjs(entry?.dateUpdated).format('MMMM DD, YYYY @ hh:mm A')}
                </em>
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
