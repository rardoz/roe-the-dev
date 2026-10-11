import CinematicHome from '../_components/cinematic-home'
import { editorialItems } from '../_components/cinematic-home/content'
import { getEntries } from '../_services/contentful'

import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import config from '../../messages/config'

type Props = {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getTranslations('Home')

  return {
    title: messages('title'),
    description: messages('description'),
  }
}

export default async function Home(props: Props) {
  const params = await props.params
  setRequestLocale(params?.locale || 'en-US')

  const [posts, featured, projects] = await Promise.all([
    getEntries({ limit: 5, contentType: 'linkBank' }),
    getEntries({
      order: 'fields.orderOverride',
      contentType: 'featuredContent',
    }),
    getEntries({
      limit: 6,
      contentType: process.env.CONTENTFUL_PORTFOLIO_ID || 'portfolio',
    }),
  ])
  return (
    <CinematicHome
      posts={editorialItems(posts.items, 'blog')}
      transmissions={editorialItems(featured.items, 'featured')}
      projects={editorialItems(projects.items, 'portfolio')}
    />
  )
}
