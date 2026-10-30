export function ResultCard({ item, onOpen }) {
  return (
    <article className="result-card">
      <div className="result-meta-row">
        <span className="pill pill-source">{item.source}</span>
        <span className="pill pill-type">{item.type}</span>
      </div>

      <h3>{item.title}</h3>
      <p className="summary">{item.summary}</p>

      <div className="details-row">
        <span>{item.product}</span>
        <span>{new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>

      <div className="tag-row">
        {item.tags.map((tag) => (
          <span key={`${item.id}-${tag}`} className="tag">#{tag}</span>
        ))}
      </div>

      <button type="button" className="link-button" onClick={() => onOpen(item.id)}>
        Open resource
      </button>
    </article>
  )
}
