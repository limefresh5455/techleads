import { Datasets } from '../../components'
import { useSiteData } from '../../context/SiteDataContext'

export default function TechnologiesPage() {
  const { data } = useSiteData()
  return (
    <>
      <Datasets
        technologies={data.technologies}
        content={data.content}
        showHeader={false}
        enableSearch
      />
    </>
  )
}
