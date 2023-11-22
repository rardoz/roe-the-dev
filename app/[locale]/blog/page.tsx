import DefaultLayout from '../../_components/layout'
import { useEntries } from '../../_services/contentful'
import { getTranslator } from 'next-intl/server'
import SectionTitle from '../../_components/section-title'
import Card from '../../_components/card'
import VideoBackground from '../../_components/video-bg'
import Link from '../../_components/link'
import BreadCrumbs from '../../_components/breadcrumbs'

const CONTENTFUL_BLOG_ID = process.env.CONTENTFUL_BLOG_ID || 'blog'
const LIMIT = 9

export default async function Blog(props: {
  params?: { locale: string; page?: string }
}) {
  const entries = await useEntries({
    limit: LIMIT,
    contentType: CONTENTFUL_BLOG_ID,
    skip: parseInt(props.params?.page || '0', 10) * LIMIT,
  })

  const messages = await getTranslator(props.params?.locale || '', 'Blog')

  return (
    <>
      <DefaultLayout params={props.params}>
        <VideoBackground videoSrc="/blog-video-720.mp4" fixed />
        <div className="w-full max-w-screen-2xl mb-16 mt-16">
          <SectionTitle>{messages.raw('title')}</SectionTitle>
          <div className="px-4 mb-4">
            <BreadCrumbs
              links={[{ label: messages.raw('title'), href: '/blog' }]}
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
                  link={entry?.hardRoute ? entry?.slug : `/blog/${entry?.slug}`}
                />
              )
            })}
          </div>
        </div>

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
