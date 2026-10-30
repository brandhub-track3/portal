import { SearchBar } from '../components/SearchBar'

export function HomePage({ searchQuery, setSearchQuery, handleSearchSubmit, featuredItems, onOpenDetail }) {
  return (
    <section className="home-page">
      <div className="hero-panel">
        <p className="eyebrow">A better way to find what you need</p>
        <h1>Search your content without bouncing between tools.</h1>
        <p className="hero-copy">
          From blog posts and product pages to support articles and FAQs, BrandHub helps teams find the right answer in seconds instead of hunting through endless systems.
        </p>

        <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearchSubmit} />

        <div className="popular-searches" aria-label="Popular searches">
          {['Content strategy', 'Support docs', 'Drupal CMS', 'Brand guidelines'].map((item) => (
            <button key={item} type="button" className="chip" onClick={() => handleSearchSubmit(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="quick-stats" aria-label="Portal stats">
          <div>
            <strong>12k+</strong>
            <span>content pieces</span>
          </div>
          <div>
            <strong>3x</strong>
            <span>faster discovery</span>
          </div>
          <div>
            <strong>4 sources</strong>
            <span>WordPress + Drupal</span>
          </div>
        </div>
      </div>

      <div className="featured-panel">
        {featuredItems.map((item) => (
          <article key={item.id} className="feature-card">
            <div className="result-meta-row">
              <span className="pill pill-source">{item.source}</span>
              <span className="pill pill-type">{item.type}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <button type="button" className="link-button" onClick={() => onOpenDetail(item.id)}>
              Read this story
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
