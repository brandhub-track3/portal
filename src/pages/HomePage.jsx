import { SearchBar } from '../components/SearchBar'

export function HomePage({ searchQuery, setSearchQuery, handleSearchSubmit, featuredItems, onOpenDetail, isLoading, loadError, totalItems, sources, pagination, page, setPage, retry }) {
  const sourceNames = (sources || []).map(({ value }) => value === 'drupal' ? 'Drupal' : value === 'wordpress' ? 'WordPress' : value)

  return (
    <section className="home-page">
      <div className="hero-panel">
        <p className="eyebrow">A better way to find what you need</p>
        <h1>Search your content without bouncing between tools.</h1>
        <p className="hero-copy">
          From blog posts and product pages to support articles and FAQs, BrandHub helps teams find the right answer in seconds instead of hunting through endless systems.
        </p>

        <SearchBar id="home-search" value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearchSubmit} />
        <p className="hero-result-count" aria-live="polite">
          {isLoading ? 'Loading content…' : loadError ? loadError.message : `${totalItems || 0} published content pieces`}
        </p>
        {loadError?.requestId ? (
          <details className="hero-api-details">
            <summary>Technical details</summary>
            <span>Request ID: {loadError.requestId}</span>
          </details>
        ) : null}
        {loadError ? <button type="button" className="primary-button" onClick={retry}>Retry</button> : null}

        <div className="popular-searches" aria-label="Popular searches">
          {['Content strategy', 'Support docs', 'Drupal CMS', 'Brand guidelines'].map((item) => (
            <button key={item} type="button" className="chip" onClick={() => handleSearchSubmit(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="quick-stats" aria-label="Portal stats">
          <div>
            <strong>{isLoading ? '…' : totalItems}</strong>
            <span>published content pieces</span>
          </div>
          <div>
            <strong>{sourceNames.length || '—'}</strong>
            <span>{sourceNames.length ? sourceNames.join(' + ') : 'content sources'}</span>
          </div>
        </div>
      </div>

      <section className="home-content-section" aria-label="Published content">
        <div className="featured-panel">
        {featuredItems.map((item) => (
          <article key={item.id} className="feature-card">
            <div className="result-meta-row">
              <span className="pill pill-source">{item.source === 'drupal' ? 'Drupal' : 'WordPress'}</span>
              <span className="pill pill-type">{item.type === 'faq' ? 'FAQ' : item.type}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <button type="button" className="link-button" onClick={() => onOpenDetail(item.id)}>
              Read this story
            </button>
          </article>
        ))}
        {!isLoading && !loadError && featuredItems.length === 0 ? (
          <p className="empty-state">No published content is available yet.</p>
        ) : null}
        </div>
        {pagination?.totalPages > 1 ? (
          <nav className="pagination" aria-label="Home content pages">
            <button type="button" disabled={!pagination.hasPreviousPage} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {pagination.page} of {pagination.totalPages} · {totalItems} content pieces</span>
            <button type="button" disabled={!pagination.hasNextPage} onClick={() => setPage(page + 1)}>Next</button>
          </nav>
        ) : null}
      </section>
    </section>
  )
}
