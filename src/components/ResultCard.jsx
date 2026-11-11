import { useState } from 'react'

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ResultCard({ item, onOpen }) {
  const [imageFailed, setImageFailed] = useState(false)
  const source = item.source === 'drupal' ? 'Drupal' : item.source === 'wordpress' ? 'WordPress' : item.source
  const type = item.type === 'faq'
    ? 'FAQ'
    : (item.type || '').split(/[_-]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
  const tags = Array.isArray(item.tags) ? item.tags.slice(0, 3) : []

  return (
    <article className="result-card">
      {item.heroImage && !imageFailed ? (
        <img
          className="result-image"
          src={item.heroImage}
          alt={item.title || 'Content image'}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : <div className="result-image image-fallback" aria-hidden="true">BrandHub</div>}
      <div className="result-meta-row">
        <span className="pill pill-source">{source}</span>
        <span className="pill pill-type">{type}</span>
      </div>
      <h3>{item.title}</h3>
      <p className="summary">{item.summary}</p>
      <div className="details-row">
        {item.product ? <span>{Array.isArray(item.product) ? item.product.join(', ') : item.product}</span> : <span />}
        <span>{formatDate(item.publishedAt)}</span>
      </div>
      <div className="tag-row">
        {tags.map((tag) => <span key={`${item.id}-${tag}`} className="tag">#{tag}</span>)}
      </div>
      {item.author ? <p className="result-author">By {item.author}</p> : null}
      <button type="button" className="link-button" onClick={() => onOpen(item.id)}>View details</button>
    </article>
  )
}
