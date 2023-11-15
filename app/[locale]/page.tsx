import DefaultLayout from '../_components/layout'
import BigCarousel from '../_components/big-carousel'
import { useEntries } from '../_services/contentful'
import CarouselSlide from '../_components/big-carousel/slide'

export default async function Home(props: { params?: { locale: string } }) {
  const entries = await useEntries({
    order: 'fields.orderOverride',
    contentType: 'featuredContent',
  })

  return (
    <DefaultLayout params={props.params}>
      <BigCarousel className="absolute top-0 left-0">
        {entries.items?.map((item) => (
          <CarouselSlide key={item.title} {...item}></CarouselSlide>
        ))}
      </BigCarousel>
    </DefaultLayout>
  )
}
