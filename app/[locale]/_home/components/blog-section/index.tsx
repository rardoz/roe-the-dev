import React, { FC } from 'react'
import Card from '../../../../_components/card'
import SectionTitle from '../../../../_components/section-title'
import { useEntries } from '../../../../_services/contentful'
import { getTranslator } from 'next-intl/server'
import LinkButton from '../../../../_components/link-button'

const BlogSection: FC<{ locale?: string }> = async (props) => {
  const entries = await useEntries({
    limit: 3,
    contentType: 'linkBank',
  })

  const messages = await getTranslator(props.locale || '', 'Blog')

  return (
    <div className="w-full max-w-screen-2xl mt-10">
      <SectionTitle>{messages.raw('title')}</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4">
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
      <div className="flex justify-center my-10">
        <LinkButton href="/blog">{messages('cta')}</LinkButton>
      </div>
    </div>
  )
}

export default BlogSection
