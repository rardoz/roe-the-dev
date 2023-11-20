import DefaultLayout from '../_components/layout'
import BigCarousel from '../_components/big-carousel'
import { useEntries } from '../_services/contentful'
import CarouselSlide from '../_components/big-carousel/slide'
import AboutSection from './_home/components/about-section'
import PortfolioSection from './_home/components/portfolio-section'
import BlogSection from './_home/components/blog-section'

export default async function Home(props: { params?: { locale: string } }) {
  const entries = await useEntries({
    order: 'fields.orderOverride',
    contentType: 'featuredContent',
  })

  return (
    <DefaultLayout params={props.params}>
      <div className="flex flex-col items-center justify-center w-full h-screen">
        <BigCarousel className="absolute top-0 left-0">
          {entries.items?.map((item) => (
            <CarouselSlide key={item.title} {...item}></CarouselSlide>
          ))}
        </BigCarousel>
      </div>
      <AboutSection />
      <PortfolioSection locale={props.params?.locale} />
      <BlogSection locale={props.params?.locale} />
    </DefaultLayout>
  )
}
