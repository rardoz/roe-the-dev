'use client'

import { DiscussionEmbed } from 'disqus-react'
import type { FC } from 'react'

const Discussion: FC<{
  slug: string
  contentType: string
  title: string
  locale?: string
}> = ({ slug, contentType, title, locale = 'en-US' }) => {
  return (
    <DiscussionEmbed
      shortname={`${process.env.NEXT_PUBLIC_DISQUS_SHORTNAME}`}
      config={{
        url: `${process.env.NEXT_PUBLIC_DISQUS_APP_URL}/${contentType}/${slug}`,
        identifier: `${contentType}-${slug}`,
        title,
        language: locale,
      }}
    />
  )
}

export default Discussion
