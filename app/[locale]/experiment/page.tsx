import DefaultLayout from '../../_components/layout'
import { getEntries } from '../../_services/contentful'
import { getTranslator } from 'next-intl/server'
import SectionTitle from '../../_components/section-title'
import Card from '../../_components/card'
import VideoBackground from '../../_components/video-bg'
import Link from '../../_components/link'
import BreadCrumbs from '../../_components/breadcrumbs'

const CONTENTFUL_EXPERIMENT_ID =
  process.env.CONTENTFUL_EXPERIMENT_ID || 'experiment'
const LIMIT = 9

export default async function Experiment(props: {
  params?: { locale: string; page?: string }
}) {
  const entries = await getEntries({
    limit: LIMIT,
    contentType: CONTENTFUL_EXPERIMENT_ID,
    skip: parseInt(props.params?.page || '0', 10) * LIMIT,
  }).catch(() => {
    return { items: [] }
  })

  const messages = await getTranslator(props.params?.locale || '', 'Experiment')

  return (
    <>
      <DefaultLayout params={props.params}>
        <VideoBackground videoSrc="/blog-video-720.mp4" fixed />
        <div className="w-full max-w-screen-2xl mb-16 mt-16">
          <SectionTitle>{messages('title')}</SectionTitle>
          <div className="px-4 mb-4">
            <BreadCrumbs
              links={[{ label: messages('title'), href: '/experiment' }]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12 px-4">
            {entries?.items?.map((entry) => {
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
                      : `/experiment/${entry?.slug}`
                  }
                />
              )
            })}
          </div>
        </div>
        {!entries?.items?.length && (
          <div className="h-96 flex justify-center items-center mb-20">
            <p className="text-4xl font-bold text-slate-50">
              {messages('comingSoon')}
            </p>
          </div>
        )}
        <p className="text-slate-50 text-sm pb-8 w-full text-center">
          {messages.raw('footerMessage')}
          <br className="inline sm:hidden" />
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://deepmind.google/"
          >
            Google Deepmind
          </Link>
        </p>
      </DefaultLayout>
    </>
  )
}
