import Layout from './_components/layout'
import { Button } from 'flowbite-react'
import useTranslation from 'next-translate/useTranslation'

export default function Home() {
  //const { t, lang } = useTranslation('common')
  return (
    <Layout>
      <h1>
        test
        {/* {t('title')} - {lang} */}
      </h1>
      {/* <Button>{t('primaryCTA')}</Button> */}
    </Layout>
  )
}
