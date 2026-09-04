import { Hero } from '../components'
import { PopularTechnologies } from '../components'
import { FeatureBento } from '../components'
import { WhatWeDetect } from '../components'
import { Enrichment } from '../components'
import { FinalCta } from '../components'
import { useSiteData } from '../context/SiteDataContext'

export default function HomePage() {
  const { data } = useSiteData()

  return (
    <>
      <Hero content={data.content} dashboardPreviews={data.dashboard_previews} />
      <PopularTechnologies content={data.content} technologies={data.popular_technologies} />
      <FeatureBento content={data.content} features={data.feature_highlights} />
      <WhatWeDetect content={data.content} groups={data.detect_groups} />
      <Enrichment content={data.content} />
      <FinalCta content={data.content} />
    </>
  )
}
