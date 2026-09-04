import { Categories } from '../../components'
import { useSiteData } from '../../context/SiteDataContext'

export default function CategoriesPage() {
  const { data } = useSiteData()
  return (
    <>
      <Categories
        categories={data.categories}
        content={data.content}
        showHeader={false}
        enableSearch
      />
    </>
  )
}
