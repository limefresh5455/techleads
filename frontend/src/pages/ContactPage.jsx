import Contact from '../components/Contact'
import PageHero from '../components/PageHero'
import { useSiteData } from '../context/SiteDataContext'

export default function ContactPage() {
  const { data } = useSiteData()
  return (
    <>
      <PageHero
        title={data.content?.contact_title || 'Contact sales'}
        subtitle={data.content?.contact_subtitle}
        ctaLabel={false}
      />
      <Contact content={data.content} showHeader={false} />
    </>
  )
}
