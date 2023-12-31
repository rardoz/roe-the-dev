import ContentfulToReact from '../../../_components/contentful-to-react'
import DefaultLayout from '../../../_components/layout'
import { getEntries } from '../../../_services/contentful'
import Discussion from '../../../_components/discussion'
import SectionTitle from '../../../_components/section-title'
import VideoPlayer from '../../../_components/video-player'
import Hero from '../../../_components/hero'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import BreadCrumbs from '../../../_components/breadcrumbs'
import dayjs from 'dayjs'
import type { Metadata } from 'next'
import config from '../../../../messages/config'
import BlogSchema from '../../../_components/schema'

const CONTENTFUL_PORTFOLIO_ID =
  process.env.CONTENTFUL_PORTFOLIO_ID || 'portfolio'

type Props = {
  params: { locale?: string; slug: string }
}

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }))
}

async function getEntry(slug: string) {
  const porfolioEntries = await getEntries({
    contentType: CONTENTFUL_PORTFOLIO_ID,
    slug,
  })

  return porfolioEntries?.items?.[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const messages = await getTranslations('Portfolio')
  const entry = await getEntry(params.slug)

  return {
    title: `${messages('title')} | ${entry?.title}`,
    description: entry?.description,
    alternates: {
      canonical: `/porfolio/${entry?.slug}`,
      languages: Object.fromEntries(
        config.locales.map((cur) => [cur, `/${cur}/portfolio/${entry?.slug}`]),
      ),
    },
    category: 'technology',
    openGraph: {
      images: entry?.socialPhoto?.url ? [entry.socialPhoto.url] : undefined,
      url: `/portfolio/${entry?.slug}`,
    },
    keywords: entry?.keywords,
  }
}

export default async function PortfolioDetail(props: Props) {
  unstable_setRequestLocale(props.params?.locale || 'en-US')
  const entry = await getEntry(props.params.slug)
  const messages = await getTranslations('Portfolio')

  return (
    <>
      <DefaultLayout params={{ locale: props.params.locale || '' }}>
        <div className="w-full">
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
                      label: messages('title'),
                      href: '/portfolio',
                    },
                    {
                      label: `${entry?.title}`,
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
                    {messages('lastUpdated')}: &nbsp;
                  </strong>
                  {dayjs(entry?.dateUpdated).format('MM/DD/YYYY @ hh:mm A')}
                </em>
              </div>
            </div>
            {entry && (
              <>
                <div className="px-4 pb-10 w-full">
                  <SectionTitle>{messages('commentLabel')}</SectionTitle>

                  <Discussion
                    slug={entry.slug!}
                    title={entry.title!}
                    contentType="portfolio"
                    locale={props.params.locale}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </DefaultLayout>
      {entry && <BlogSchema entry={entry} />}
    </>
  )
}
