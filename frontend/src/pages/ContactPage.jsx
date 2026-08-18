import Contact from '../components/Contact'
import PageHero from '../components/PageHero'
import { useSiteData } from '../context/SiteDataContext'

export default function ContactPage() {
  const { data } = useSiteData()
  return (
    <>
      <PageHero
        title={data.content?.contact_title || 'Contact Us'}
        subtitle={data.content?.contact_subtitle}
        ctaTo="/get-started"
      />
      <Contact content={data.content} trustLogos={data.trust_logos} showHeader={false} />
    </>
  )
}
