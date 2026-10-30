export function FilterPanel({ filters, counts, onChange, onClear }) {
  const selectOptions = {
    source: ['all', 'WordPress', 'Drupal'],
    type: ['all', 'article', 'case-study', 'product', 'faq'],
    product: ['all', 'BrandHub Search', 'Customer Portal', 'Portal UX', 'Partner Portal', 'Insights Hub'],
    tag: ['all', 'search', 'content strategy', 'taxonomy', 'support', 'retail', 'knowledge base', 'ux', 'filtering', 'content library', 'ai', 'integration', 'wordpress', 'drupal'],
  }

  const buildOptions = (key) => {
    const values = selectOptions[key]

    return values.map((value) => ({
      label: value === 'all' ? 'All' : value,
      value,
      count: value === 'all' ? Object.values(counts[key] || {}).reduce((sum, total) => sum + total, 0) : counts[key]?.[value] || 0,
    }))
  }

  return (
    <aside className="filter-panel" aria-label="Search filters">
      <div className="filter-header">
        <h2>Filters</h2>
        <button type="button" className="clear-button" onClick={onClear}>
          Clear all
        </button>
      </div>

      {Object.entries(selectOptions).map(([key, values]) => (
        <div className="filter-group" key={key}>
          <label htmlFor={`filter-${key}`}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
          <select
            id={`filter-${key}`}
            value={filters[key]}
            onChange={(event) => onChange(key, event.target.value)}
          >
            {buildOptions(key).map((option) => (
              <option key={`${key}-${option.value}`} value={option.value}>
                {option.label} {option.count > 0 ? `(${option.count})` : ''}
              </option>
            ))}
          </select>
        </div>
      ))}
    </aside>
  )
}
