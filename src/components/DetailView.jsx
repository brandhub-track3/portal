import { useState } from 'react'

function formattedDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function typeLabel(value = '') {
  if (value === 'faq') return 'FAQ'
  return value.split(/[_-]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

export function DetailView({ item, isLoading, error, retry, onBack }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (isLoading) {
    return <section className="loading-state" aria-live="polite" aria-busy="true"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-card" /></section>
  }

  if (!item) {
    return (
      <section className="empty-state" role="alert">
        <h2>{error?.status === 404 ? 'Content not found' : 'This content isn’t available right now'}</h2>
        <p>{error?.message || 'The item you asked for could not be loaded. Head back to the results and try another one.'}</p>
        {error?.requestId ? <details><summary>Technical details</summary><p>Request ID: {error.requestId}</p></details> : null}
        {error?.status !== 404 ? <button type="button" className="primary-button" onClick={retry}>Retry</button> : null}
        <button type="button" className="back-link" onClick={onBack}>Back to results</button>
      </section>
    )
  }

  const source = item.source === 'drupal' ? 'Drupal' : item.source === 'wordpress' ? 'WordPress' : item.source
  const product = Array.isArray(item.product) ? item.product.join(', ') : item.product

  return (
    <section className="detail-view">
      <button type="button" className="back-link" onClick={onBack}>← Back to search</button>
      <div className="detail-header">
        <div className="detail-badges">
          <span className="pill pill-source">{source}</span>
          <span className="pill pill-type">{typeLabel(item.type)}</span>
        </div>
        <h1>{item.title}</h1>
        {item.summary ? <p className="detail-summary">{item.summary}</p> : null}
      </div>
      {item.heroImage && !imageFailed ? (
        <img className="detail-image" src={item.heroImage} alt={item.title} onError={() => setImageFailed(true)} />
      ) : null}
      <div className="detail-grid">
        <article className="detail-content">
          {item.bodyHtml ? (
            <div dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
          ) : item.plainText ? <p>{item.plainText}</p> : null}
          <div className="detail-meta">
            {product ? <span>Product: {product}</span> : null}
            {item.author ? <span>Author: {item.author}</span> : null}
            <span>Published: {formattedDate(item.publishedAt)}</span>
            {item.updatedAt ? <span>Updated: {formattedDate(item.updatedAt)}</span> : null}
          </div>
          {Array.isArray(item.tags) && item.tags.length ? (
            <div className="tag-row">{item.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}</div>
          ) : null}
          {item.url ? <a className="primary-button inline-link" href={item.url} target="_blank" rel="noopener noreferrer">View Source</a> : null}
        </article>
      </div>
    </section>
  )
}
