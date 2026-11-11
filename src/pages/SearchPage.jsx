import { FilterPanel } from '../components/FilterPanel'
import { ResultCard } from '../components/ResultCard'
import { SearchBar } from '../components/SearchBar'

function label(value) {
  if (value === 'faq') return 'FAQ'
  return value.split(/[_-]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

export function SearchPage({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  results,
  filters,
  filterOptions,
  handleFilterChange,
  removeFilter,
  clearFilters,
  isLoading,
  loadError,
  retry,
  sortBy,
  setSortBy,
  pagination,
  page,
  setPage,
  onOpenDetail,
}) {
  const chips = [
    ...(searchQuery ? [{ key: 'q', value: searchQuery, text: `Search: ${searchQuery}` }] : []),
    ...filters.source.map((value) => ({ key: 'source', value, text: `Source: ${label(value)}` })),
    ...filters.type.map((value) => ({ key: 'type', value, text: `Type: ${label(value)}` })),
    ...(filters.product ? [{ key: 'product', value: filters.product, text: `Product: ${filters.product}` }] : []),
    ...filters.tag.map((value) => ({ key: 'tag', value, text: `Tag: ${value}` })),
  ]

  return (
    <section className="results-page">
      <div className="results-topbar">
        <div>
          <p className="eyebrow">Find it fast</p>
          <h2 aria-live="polite">{pagination?.totalItems ?? 0} results</h2>
        </div>
        <div className="header-actions">
          <SearchBar id="results-search" value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearchSubmit} />
          <label className="sort-field" htmlFor="sort-select">
            <span>Sort by</span>
            <select id="sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {searchQuery ? <option value="relevance">Relevance</option> : null}
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
            </select>
          </label>
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="active-filters" aria-label="Active filters">
          {chips.map((chip) => (
            <button type="button" className="chip" key={`${chip.key}-${chip.value}`} onClick={() => removeFilter(chip.key, chip.value)}>
              {chip.text} <span aria-hidden="true">×</span>
            </button>
          ))}
          <button type="button" className="clear-button" onClick={clearFilters}>Clear all filters</button>
        </div>
      ) : null}

      {loadError ? (
        <div className="empty-state error-box" role="alert">
          <h2>Search is temporarily unavailable</h2>
          <p>{loadError.message}</p>
          {loadError.requestId ? (
            <details><summary>Technical details</summary><p>Request ID: {loadError.requestId}</p></details>
          ) : null}
          <button type="button" className="primary-button" onClick={retry}>Retry</button>
        </div>
      ) : (
        <div className="results-layout">
          <FilterPanel
            filters={filters}
            options={filterOptions || {}}
            onChange={handleFilterChange}
            onClear={clearFilters}
            disabled={!filterOptions}
          />
          <div className="results-column" aria-busy={isLoading}>
            {isLoading ? (
              <div className="loading-state" aria-live="polite">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-card" />
                <div className="skeleton skeleton-card" />
              </div>
            ) : results.length === 0 ? (
              <div className="empty-state">
                <h2>No content matched the selected search and filters.</h2>
                <p>Try a broader keyword or remove a filter.</p>
                <button type="button" className="primary-button" onClick={clearFilters}>Clear filters</button>
              </div>
            ) : (
              <>
                {results.map((item) => <ResultCard key={item.id} item={item} onOpen={onOpenDetail} />)}
                {pagination?.totalPages > 1 ? (
                  <nav className="pagination" aria-label="Results pages">
                    <button type="button" disabled={!pagination.hasPreviousPage} onClick={() => setPage(page - 1)}>Previous</button>
                    <span>Page {pagination.page} of {pagination.totalPages}</span>
                    <button type="button" disabled={!pagination.hasNextPage} onClick={() => setPage(page + 1)}>Next</button>
                    <label>
                      <span>Per page</span>
                      <select value={pagination.pageSize} onChange={(event) => setPage(1, Number(event.target.value))}>
                        {[12, 20, 40].map((size) => <option key={size} value={size}>{size}</option>)}
                      </select>
                    </label>
                  </nav>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
