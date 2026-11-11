export function SearchBar({ value, onChange, onSubmit, id = 'global-search', placeholder = 'Search content, products and FAQs' }) {
  return (
    <form
      className="search-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(value)
      }}
    >
      <label className="sr-only" htmlFor={id}>
        Search portal content
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <button type="submit">Search</button>
    </form>
  )
}
