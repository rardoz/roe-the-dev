import ContentfulToReact from '../../../_components/contentful-to-react'
import DefaultLayout from '../../../_components/layout'
import { getEntries } from '../../../_services/contentful'
import Discussion from '../../../_components/discussion'
import SectionTitle from '../../../_components/section-title'
import Hero from '../../../_components/hero'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import BreadCrumbs from '../../../_components/breadcrumbs'
import dayjs from 'dayjs'
import type { Metadata } from 'next'
import config from '../../../../messages/config'
import ExperimentSchema from '../../../_components/schema'

const CONTENTFUL_EXPERIMENT_ID =
  process.env.CONTENTFUL_EXPERIMENT_ID || 'experiment'

type Props = {
  params: { locale?: string; slug: string }
}

async function getEntry(slug: string) {
  const experimentEntries = await getEntries({
    contentType: CONTENTFUL_EXPERIMENT_ID,
    slug,
  })
  return experimentEntries?.items?.[0]
}

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const messages = await getTranslations('Experiment')
  const entry = await getEntry(params.slug)

  return {
    title: `${messages('title')} | ${entry?.title}`,
    description: entry?.description,
    alternates: {
      canonical: `/experiment/${entry?.slug}`,
      languages: Object.fromEntries(
        config.locales.map((cur) => [cur, `/${cur}/experiment/${entry?.slug}`]),
      ),
    },
    openGraph: {
      images: entry?.socialPhoto?.url ? [entry.socialPhoto.url] : undefined,
      url: `/experiment/${entry?.slug}`,
    },
    keywords: entry?.keywords,
  }
}

export default async function ExperimentDetail(props: Props) {
  unstable_setRequestLocale(props.params?.locale || 'en-US')
  const entry = await getEntry(props.params.slug)

  const messages = await getTranslations('Experiment')
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
                      href: '/experiment',
                    },
                    {
                      label: `${entry?.title}`,
                      href: `/experiment/${entry?.slug}`,
                    },
                  ]}
                />
              </div>

              {entry?.content && <ContentfulToReact content={entry?.content} />}
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
                    contentType="experiment"
                    locale={props.params?.locale}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </DefaultLayout>
      {entry && <ExperimentSchema entry={entry} />}
    </>
  )
}
