import ContentfulToReact from '../../../_components/contentful-to-react'
import DefaultLayout from '../../../_components/layout'
import { getEntries } from '../../../_services/contentful'
import Discussion from '../../../_components/discussion'
import SectionTitle from '../../../_components/section-title'
import Hero from '../../../_components/hero'
import { getTranslator } from 'next-intl/server'
import BreadCrumbs from '../../../_components/breadcrumbs'
import dayjs from 'dayjs'
import type { Metadata } from 'next'
import { NormalizedBlogState } from '../../../_services/contentful/types'

const CONTENTFUL_BLOG_ID = process.env.CONTENTFUL_BLOG_ID || 'blog'

type Props = {
  params: { locale?: string; slug: string }
}

let blogEntries: NormalizedBlogState | undefined

async function getEntry(slug: string) {
  blogEntries =
    blogEntries ||
    (await getEntries({
      contentType: CONTENTFUL_BLOG_ID,
      slug,
    }))

  return blogEntries?.items?.[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const messages = await getTranslator(params?.locale || '', 'Portfolio')
  const entry = await getEntry(params.slug)

  return {
    title: `${messages('title')} | ${entry?.title}`,
    description: entry?.description,
    openGraph: {
      images: entry?.socialPhoto?.url ? [entry.socialPhoto.url] : undefined,
    },
    keywords: entry?.keywords,
  }
}

export default async function BlogDetail(props: Props) {
  const entry = await getEntry(props.params.slug)

  const messages = await getTranslator(props.params?.locale || '', 'Blog')
  return (
    <DefaultLayout params={{ locale: props.params.locale || '' }}>
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
                      href: '/blog',
                    },
                    {
                      label: entry?.title,
                      href: `/blog/${entry?.slug}`,
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
                    contentType="blog"
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
