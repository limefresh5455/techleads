import Hero from '../components/Hero'
import PopularTechnologies from '../components/PopularTechnologies'
import FeatureBento from '../components/FeatureBento'
import WhatWeDetect from '../components/WhatWeDetect'
import Enrichment from '../components/Enrichment'
import ApiSection from '../components/ApiSection'
import FinalCta from '../components/FinalCta'
import { useSiteData } from '../context/SiteDataContext'

export default function HomePage() {
  const { data } = useSiteData()

  return (
    <>
      <Hero content={data.content} dashboardPreviews={data.dashboard_previews} />
      <PopularTechnologies
        content={data.content}
        technologies={data.popular_technologies}
      />
      <FeatureBento content={data.content} features={data.feature_highlights} />
      <WhatWeDetect content={data.content} groups={data.detect_groups} />
      <Enrichment content={data.content} rows={data.dashboard_previews} />
      <ApiSection content={data.content} />
      <FinalCta content={data.content} />
    </>
  )
}
