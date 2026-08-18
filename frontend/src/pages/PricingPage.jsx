import Pricing from '../components/Pricing'
import PageHero from '../components/PageHero'
import { useSiteData } from '../context/SiteDataContext'

export default function PricingPage() {
  const { data } = useSiteData()
  return (
    <>
      <PageHero
        title={data.content?.pricing_title || 'Pricing'}
        subtitle={data.content?.pricing_subtitle}
        ctaLabel="Get Started"
        ctaTo="/get-started"
      />
      <Pricing plans={data.pricing_plans} content={data.content} showHeader={false} />
    </>
  )
}
