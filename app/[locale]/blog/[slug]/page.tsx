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

const CONTENTFUL_BLOG_ID = process.env.CONTENTFUL_BLOG_ID || 'blog'

type Props = {
  params: { locale?: string; slug: string }
}

async function getEntry(slug: string) {
  const blogEntries = await getEntries({
    contentType: CONTENTFUL_BLOG_ID,
    slug,
  })

  return blogEntries?.items?.[0]
}

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const messages = await getTranslations('Blog')
  const entry = await getEntry(params.slug)

  return {
    title: `${messages('title')} | ${entry?.title}`,
    description: entry?.description,
    alternates: {
      canonical: `/blog/${entry?.slug}`,
      languages: Object.fromEntries(
        config.locales.map((cur) => [cur, `/${cur}/blog/${entry?.slug}`]),
      ),
    },
    openGraph: {
      images: entry?.socialPhoto?.url ? [entry.socialPhoto.url] : undefined,
    },
    keywords: entry?.keywords,
  }
}

export default async function BlogDetail(props: Props) {
  unstable_setRequestLocale(props.params?.locale || 'en-US')
  const entry = await getEntry(props.params.slug)

  const messages = await getTranslations('Blog')
  return (
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
    </DefaultLayout>
  )
}
