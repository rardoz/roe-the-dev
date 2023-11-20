import DefaultLayout from '../../_components/layout'
import { useEntries } from '../../_services/contentful'
import { getTranslator } from 'next-intl/server'
import SectionTitle from '../../_components/section-title'
import Card from '../../_components/card'
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
    <DefaultLayout navForcedInView params={props.params}>
      <div className="w-full max-w-screen-2xl mb-16 -mt-8">
        <SectionTitle>{messages.raw('title')}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
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
    </DefaultLayout>
  )
}
