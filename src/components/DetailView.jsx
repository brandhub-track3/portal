export function DetailView({ item, relatedItems, onBack }) {
  if (!item) {
    return (
      <section className="empty-state">
        <h2>This content isn’t available right now</h2>
        <p>The item you asked for could not be loaded. Head back to the results and try another one.</p>
        <button type="button" className="primary-button" onClick={onBack}>Back to results</button>
      </section>
    )
  }

  return (
    <section className="detail-view">
      <button type="button" className="back-link" onClick={onBack}>
        ← Back to search
      </button>

      <div className="detail-header">
        <div className="detail-badges">
          <span className="pill pill-source">{item.source}</span>
          <span className="pill pill-type">{item.type}</span>
        </div>
        <h1>{item.title}</h1>
        <p className="detail-summary">{item.summary}</p>
      </div>

      <div className="detail-grid">
        <article className="detail-content">
          <p>{item.body}</p>

          {item.type === 'faq' && item.answer ? (
            <div className="faq-box">
              <h3>Answer</h3>
              <p>{item.answer}</p>
            </div>
          ) : null}

          <div className="detail-meta">
            <span>Product: {item.product}</span>
            <span>Published: {new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          <div className="tag-row">
            {item.tags.map((tag) => (
              <span key={`${item.id}-${tag}`} className="tag">#{tag}</span>
            ))}
          </div>

          <a className="primary-button inline-link" href={item.url} target="_blank" rel="noreferrer">
            Open original source
          </a>
        </article>

        <aside className="related-panel">
          <h3>You may also like</h3>
          <ul>
            {relatedItems.map((related) => (
              <li key={related.id}>
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-result', { detail: related.id }))}>
                  {related.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}
