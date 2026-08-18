import Categories from '../components/Categories'
import PageHero from '../components/PageHero'
import { useSiteData } from '../context/SiteDataContext'

export default function CategoriesPage() {
  const { data } = useSiteData()
  return (
    <>
      <PageHero
        title={data.content?.categories_title || 'Categories'}
        subtitle={data.content?.categories_subtitle}
      />
      <Categories categories={data.categories} content={data.content} showHeader={false} />
    </>
  )
}
