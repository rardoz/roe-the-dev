import type { NormalizedBlogData } from '../../_services/contentful/types'

export type EditorialItem = {
  title: string
  description: string
  href: string
  image: string
  imageAlt: string
  external: boolean
}

export function previewImage(source: string) {
  const url = new URL(source, 'https://roethedev.com')
  if (
    !['images.ctfassets.net', 'images.eu.ctfassets.net'].includes(url.hostname)
  )
    return source
  url.searchParams.set('w', '800')
  url.searchParams.set('fm', 'webp')
  url.searchParams.set('q', '85')
  return url.toString()
}

export function editorialItems(
  entries: NormalizedBlogData[] | undefined,
  destination: 'blog' | 'portfolio' | 'featured',
): EditorialItem[] {
  return (entries || []).flatMap((entry) => {
    if (!entry.title || !entry.slug) return []
    const asset = [
      entry.featuredImage,
      entry.blogPhoto,
      entry.socialPhoto,
    ].find((image) => image?.url?.startsWith('https://'))
    const external = Boolean(entry.hardRoute || /^https?:/.test(entry.slug))
    return [
      {
        title: entry.title,
        description: entry.description || '',
        href:
          external || destination === 'featured' || entry.slug.startsWith('/')
            ? entry.slug
            : `/${destination}/${entry.slug}`,
        image: previewImage(asset?.url || '/default-social-image.jpg'),
        imageAlt: asset?.description || asset?.title || entry.title,
        external,
      },
    ]
  })
}

export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/rardoz' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/rardoz' },
  { label: 'X / Twitter', href: 'https://twitter.com/roe_the_dev' },
  { label: 'Twitch', href: 'https://twitch.tv/roe_the_dev' },
  { label: 'Email', href: 'mailto:roethedev@gmail.com' },
]
