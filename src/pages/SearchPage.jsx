import { FilterPanel } from '../components/FilterPanel'
import { ResultCard } from '../components/ResultCard'
import { SearchBar } from '../components/SearchBar'

export function SearchPage({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  filteredResults,
  filterCounts,
  filters,
  handleFilterChange,
  clearFilters,
  isLoading,
  loadError,
  staleData,
  sortBy,
  setSortBy,
  onOpenDetail,
}) {
  return (
    <section className="results-page">
      <div className="results-topbar">
        <div>
          <p className="eyebrow">Find it fast</p>
          <h2>{filteredResults.length} results</h2>
        </div>

        <div className="header-actions">
          <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearchSubmit} />

          <label className="sort-field" htmlFor="sort-select">
            <span>Sort by</span>
            <select id="sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
            </select>
          </label>
        </div>
      </div>

      {staleData ? (
        <div className="status stale">
          We’re showing the latest saved view. A fresh sync may still be on the way.
        </div>
      ) : null}

      {loadError ? (
        <div className="empty-state error-box">
          <h2>Search is temporarily unavailable</h2>
          <p>{loadError}</p>
        </div>
      ) : isLoading ? (
        <div className="loading-state" aria-live="polite">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="empty-state">
          <h2>No matches yet</h2>
          <p>Try a broader keyword or clear a filter to widen the search a little.</p>
          <button type="button" className="primary-button" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="results-layout">
          <FilterPanel filters={filters} counts={filterCounts} onChange={handleFilterChange} onClear={clearFilters} />

          <div className="results-column">
            {filteredResults.map((item) => (
              <ResultCard key={item.id} item={item} onOpen={onOpenDetail} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
