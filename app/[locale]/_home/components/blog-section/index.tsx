import React, { FC } from 'react'
import Card from '../../../../_components/card'
import SectionTitle from '../../../../_components/section-title'
import { getEntries } from '../../../../_services/contentful'
import { getTranslator } from 'next-intl/server'
import LinkButton from '../../../../_components/link-button'
import { GiEvilBook } from 'react-icons/gi'

const BlogSection: FC<{ locale?: string }> = async (props) => {
  const entries = await getEntries({
    limit: 3,
    contentType: 'linkBank',
  })

  const messages = await getTranslator(props.locale || '', 'Blog')

  return (
    <div className="w-full max-w-screen-2xl my-10">
      <SectionTitle>{messages('title')}</SectionTitle>
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
      <div className="flex justify-center my-10">
        <LinkButton href="/blog">
          <GiEvilBook className="inline-block mr-2" />
          {messages('cta')}
        </LinkButton>
      </div>
    </div>
  )
}

export default BlogSection
