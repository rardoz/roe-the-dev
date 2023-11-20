import React, { FC } from 'react'
import Card from '../../../../_components/card'
import SectionTitle from './components/section-title'
import { useEntries } from '../../../../_services/contentful'
import SectionFooter from './components/section-footer'

const BlogSection: FC = async () => {
  const entries = await useEntries({
    limit: 3,
    contentType: 'linkBank',
  })
  return (
    <div className="w-full max-w-screen-2xl mt-10">
      <SectionTitle />
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
      <SectionFooter />
    </div>
  )
}

export default BlogSection
