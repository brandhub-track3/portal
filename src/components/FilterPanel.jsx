function formatLabel(value) {
  if (value === 'faq') return 'FAQ'
  if (value === 'wordpress') return 'WordPress'
  return value
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const supportedSources = ['drupal', 'wordpress']
const supportedTypes = ['post', 'case_study', 'product', 'article', 'faq']

function completeOptions(supportedValues, apiOptions = []) {
  const optionsByValue = new Map(
    apiOptions.map((option) => [String(option.value).toLowerCase(), option]),
  )

  return [
    ...supportedValues.map((value) => ({
      value,
      count: optionsByValue.get(value)?.count || 0,
    })),
    ...apiOptions.filter((option) => !supportedValues.includes(String(option.value).toLowerCase())),
  ]
}

function OptionGroup({ title, name, options, selected, onToggle, disabled }) {
  return (
    <fieldset className="filter-group" disabled={disabled}>
      <legend>{title}</legend>
      {options.map(({ value, count }) => (
        <label className="filter-option" key={value}>
          <input
            type="checkbox"
            checked={selected.includes(value)}
            onChange={() => onToggle(name, value)}
          />
          <span>{formatLabel(value)}</span>
          <span className="filter-count">{count}</span>
        </label>
      ))}
    </fieldset>
  )
}

export function FilterPanel({ filters, options, onChange, onClear, disabled }) {
  const sourceOptions = completeOptions(supportedSources, options.sources)
  const typeOptions = completeOptions(supportedTypes, options.types)

  const toggleOption = (key, value) => {
    const selected = filters[key]
    onChange(key, selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value])
  }

  return (
    <aside className="filter-panel" aria-label="Search filters">
      <div className="filter-header">
        <h2>Filters</h2>
        <button type="button" className="clear-button" onClick={onClear}>Clear all</button>
      </div>

      <OptionGroup
        title="Source"
        name="source"
        options={sourceOptions}
        selected={filters.source}
        onToggle={toggleOption}
        disabled={disabled}
      />
      <OptionGroup
        title="Type"
        name="type"
        options={typeOptions}
        selected={filters.type}
        onToggle={toggleOption}
        disabled={disabled}
      />

      <div className="filter-group">
        <label htmlFor="filter-product">Product</label>
        <select
          id="filter-product"
          value={filters.product}
          disabled={disabled}
          onChange={(event) => onChange('product', event.target.value)}
        >
          <option value="">All products</option>
          {(options.products || []).map(({ value, count }) => (
            <option key={value} value={value}>{value} ({count})</option>
          ))}
        </select>
      </div>

      <OptionGroup
        title="Tags"
        name="tag"
        options={options.tags || []}
        selected={filters.tag}
        onToggle={toggleOption}
        disabled={disabled}
      />
    </aside>
  )
}
