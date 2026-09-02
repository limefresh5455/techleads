import { useState, useMemo } from "react";
import PageHero from "../components/PageHero";
import { Icon, formatCount } from "../components/icons";
import { useSiteData } from "../context/SiteDataContext";
import Pagination from "../components/Pagination";
import { usePagination } from "../utils/pagination";
import { ITEMS_PER_PAGE, GRID_COLUMNS } from "../constants";

export default function DirectoryPage() {
  const { data } = useSiteData();
  const technologies = data.technologies || [];
  const categories = data.categories || [];

  const [catSearch, setCatSearch] = useState("");
  const [techSearch, setTechSearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!catSearch) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(catSearch.toLowerCase()),
    );
  }, [categories, catSearch]);

  const filteredTechnologies = useMemo(() => {
    if (!techSearch) return technologies;
    return technologies.filter((t) =>
      t.name.toLowerCase().includes(techSearch.toLowerCase()),
    );
  }, [technologies, techSearch]);

  const categoriesPagination = usePagination(
    filteredCategories,
    ITEMS_PER_PAGE,
  );
  const technologiesPagination = usePagination(
    filteredTechnologies,
    ITEMS_PER_PAGE,
  );

  const gridColumnsClass =
    {
      1: "lg:grid-cols-1",
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
      6: "lg:grid-cols-6",
    }[GRID_COLUMNS] || "lg:grid-cols-4";

  return (
    <>
      <PageHero
        title="Directory"
        subtitle="Browse websites and technologies detected by LeadIntel.Ai."
        ctaLabel={false}
      />
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-ink">Categories</h2>
          <input
            type="text"
            placeholder="Search categories..."
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-ink placeholder-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${gridColumnsClass}`}>
          {categoriesPagination.currentData().map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand">
                  <Icon name={cat.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">{cat.name}</p>
                  <p className="text-xs text-muted">
                    {formatCount(cat.item_count)} items
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination {...categoriesPagination} />

        <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-ink">Technologies</h2>
          <input
            type="text"
            placeholder="Search technologies..."
            value={techSearch}
            onChange={(e) => setTechSearch(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-ink placeholder-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${gridColumnsClass}`}>
          {technologiesPagination.currentData().map((tech) => (
            <div key={tech.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-lg"
                  style={{ backgroundColor: `${tech.icon_color}22` }}
                >
                  <Icon
                    name={tech.icon}
                    className="h-5 w-5"
                    style={{ color: tech.icon_color }}
                  />
                </span>
                <div>
                  <p className="font-semibold text-ink">{tech.name}</p>
                  <p className="text-xs text-muted">
                    {formatCount(tech.website_count)} websites
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination {...technologiesPagination} />
      </section>
    </>
  );
}
