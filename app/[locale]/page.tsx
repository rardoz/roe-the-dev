import DefaultLayout from '../_components/layout'
import BigCarousel from '../_components/big-carousel'
import { getEntries } from '../_services/contentful'
import CarouselSlide from '../_components/big-carousel/slide'
import AboutSection from './_home/components/about-section'
import PortfolioSection from './_home/components/portfolio-section'
import BlogSection from './_home/components/blog-section'

import type { Metadata } from 'next'
import { getTranslator } from 'next-intl/server'

type Props = {
  params?: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const messages = await getTranslator(params?.locale || '', 'Home')

  return {
    title: messages('title'),
    description: messages('description'),
  }
}

export default async function Home(props: Props) {
  const entries = await getEntries({
    order: 'fields.orderOverride',
    contentType: 'featuredContent',
  })

  return (
    <DefaultLayout params={props.params}>
      <BigCarousel className="mb-10">
        {entries.items?.map((item) => (
          <CarouselSlide key={item.title} {...item}></CarouselSlide>
        ))}
      </BigCarousel>
      <AboutSection />
      <PortfolioSection locale={props.params?.locale} />
      <BlogSection locale={props.params?.locale} />
    </DefaultLayout>
  )
}
