import { FC } from 'react'
import { NormalizedBlogData } from '../../_services/contentful/types'

type Props = {
  entry: NormalizedBlogData
}

export const BlogSchema: FC<Props> = ({ entry }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: entry.title,
          keywords: entry.keywords?.split(', ') || [],
          image: [
            entry.socialPhoto?.url,
            entry.blogPhoto?.url,
            entry.featuredImage?.url,
          ].filter((i) => i),
          datePublished: entry.dateCreated,
          dateModified: entry.dateUpdated,
          author: [
            {
              '@type': 'Person',
              name: 'Roe Greene',
              url: 'https://roethedev.com',
            },
          ],
        }),
      }}
    />
  )
}

export default BlogSchema
