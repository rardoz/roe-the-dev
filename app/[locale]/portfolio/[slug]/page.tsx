import { FaChevronDown } from 'react-icons/fa6'
import ContentfulToReact from '../../../_components/contentful-to-react'
import DefaultLayout from '../../../_components/layout'
import { useEntries } from '../../../_services/contentful'
import Image from 'next/image'
import Discussion from '../../../_components/discussion'
import SectionTitle from '../../../_components/section-title'

const CONTENTFUL_PORTFOLIO_ID =
  process.env.CONTENTFUL_PORTFOLIO_ID || 'portfolio'

export default async function PortfolioDetail(props: {
  params?: { locale: string; slug?: string }
}) {
  const entries = await useEntries({
    contentType: CONTENTFUL_PORTFOLIO_ID,
    slug: props.params?.slug,
  })

  const entry = entries?.items?.[0]

  return (
    <DefaultLayout params={props.params}>
      <div className="w-full -my-2">
        <div>
          <div className="h-screen w-full relative ">
            <Image
              src={entry?.blogPhoto?.url || ''}
              alt={entry?.blogPhoto?.description || ''}
              fill
              className="bg-purple-950 object-cover absolute top-0 -z-10"
            />
            <div className="flex justify-center px-2 items-center flex-col h-full max-w-screen-2xl mx-auto w-full">
              <h1 className="text-left md:text-center text-slate-50 font-extrabold text-5xl sm:text-7xl md:text-8xl">
                {entry?.title}
              </h1>

              <p className="border-l-slate-50 border-l-8 ps-8 ml-2 my-6 text-slate-50 font-bold text-2xl md:text-3xl text-left md:text-center">
                <span className="">{entry?.description}</span>
              </p>
              <a href="#main-section">
                <FaChevronDown className="animate-bounce text-slate-50 text-4xl" />
              </a>
            </div>
          </div>
          <div className="max-w-screen-lg mx-auto pt-1" id="main-section">
            <div className="px-4 pt-16">
              {entry?.content && <ContentfulToReact content={entry?.content} />}
            </div>
            {entry && (
              <>
                <div className="px-4 pb-10 w-full">
                  <SectionTitle>Critique my work</SectionTitle>

                  <Discussion
                    slug={entry.slug!}
                    title={entry.title!}
                    contentType="portfolio"
                    locale={props.params?.locale}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
