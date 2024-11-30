import { MetadataRoute } from 'next'
import { getEntries } from './_services/contentful'
const SITE_BASE_URL = process.env.SITE_BASE_URL || 'https://roethedev.com'
import config from '../messages/config'
const { locales, defaultLocale } = config

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const mostRecentBlogPosts = await getEntries({
    limit: 9,
    contentType: process.env.CONTENTFUL_BLOG_ID,
  })

  const mostRecentPortfolioEntries = await getEntries({
    limit: 9,
    contentType: process.env.CONTENTFUL_PORTFOLIO_ID,
  })

  const mostRecentExperiments = await getEntries({
    limit: 9,
    contentType: process.env.CONTENTFUL_EXPERIMENT_ID,
  }).catch(() => null)

  const fullSiteMap: MetadataRoute.Sitemap = []

  const pages = [
    '',
    'blog',
    'portfolio',
    'experiment',
    'lottie-winters-kinky-salad-model-game',
  ]

  pages.forEach((page, i) => {
    locales.forEach((locale) => {
      fullSiteMap.push({
        url:
          SITE_BASE_URL +
          (locale === defaultLocale ? '' : `/${locale}`) +
          (page ? `/${page}` : ''),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1 - i * 0.1,
      })
    })
  })
  mostRecentBlogPosts?.items?.forEach((post) => {
    locales.forEach((locale) => {
      fullSiteMap.push({
        url:
          SITE_BASE_URL +
          (locale === defaultLocale ? '' : `/${locale}`) +
          `/blog/${post.slug}`,
        lastModified: new Date(post.dateUpdated || ''),
        changeFrequency: 'monthly',
        priority: 0.75,
      })
    })
  })

  mostRecentPortfolioEntries?.items?.forEach((post) => {
    locales.forEach((locale) => {
      fullSiteMap.push({
        url:
          SITE_BASE_URL +
          (locale === defaultLocale ? '' : `/${locale}`) +
          `/portfolio/${post.slug}`,
        lastModified: new Date(post.dateUpdated || ''),
        changeFrequency: 'monthly',
        priority: 0.75,
      })
    })
  })

  mostRecentExperiments?.items?.forEach((post) => {
    locales.forEach((locale) => {
      fullSiteMap.push({
        url:
          SITE_BASE_URL +
          (locale === defaultLocale ? '' : `/${locale}`) +
          `/portfolio/${post.slug}`,
        lastModified: new Date(post.dateUpdated || ''),
        changeFrequency: 'monthly',
        priority: 0.75,
      })
    })
  })

  return fullSiteMap
}
