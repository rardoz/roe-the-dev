import DefaultLayout from '../../../_components/layout'
//import { useEntries } from '../../../_services/contentful'
import { getTranslator } from 'next-intl/server'
import SectionTitle from '../../../_components/section-title'

//const CONTENTFUL_PORTFOLIO_ID = process.env.CONTENTFUL_PORTFOLIO_ID || 'blog'

export default async function BlogDetail(props: {
  params?: { locale: string; slug?: string }
}) {
  // const entries = await useEntries({
  //   limit: LIMIT,
  //   contentType: CONTENTFUL_PORTFOLIO_ID,
  //   skip: parseInt(props.params?.page || '0', 10) * LIMIT,
  // })

  const messages = await getTranslator(props.params?.locale || '', 'Blog')

  return (
    <DefaultLayout navForcedInView params={props.params}>
      <div className="w-full max-w-screen-2xl mb-16 -mt-8">
        <SectionTitle>{messages.raw('title')}</SectionTitle>
      </div>
    </DefaultLayout>
  )
}
