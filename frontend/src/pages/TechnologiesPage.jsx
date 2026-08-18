import Datasets from '../components/Datasets'
import PageHero from '../components/PageHero'
import { useSiteData } from '../context/SiteDataContext'

export default function TechnologiesPage() {
  const { data } = useSiteData()
  return (
    <>
      <PageHero
        title={data.content?.datasets_title || 'Technologies'}
        subtitle={data.content?.datasets_subtitle}
      />
      <Datasets technologies={data.technologies} content={data.content} showHeader={false} />
    </>
  )
}
