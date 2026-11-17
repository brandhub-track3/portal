import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SeoMetadata } from './SeoMetadata'

afterEach(() => {
  cleanup()
  document.head.querySelector('link[rel="canonical"]')?.remove()
  document.head.querySelector('#brandhub-structured-data')?.remove()
  document.head.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach((meta) => meta.remove())
})

describe('SeoMetadata', () => {
  it('sets homepage title, description, canonical, and WebSite structured data', () => {
    render(<SeoMetadata pathname="/" />)

    expect(document.title).toBe('BrandHub | Unified Content Portal')
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute('content', expect.stringContaining('Drupal and WordPress'))
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute('href', `${window.location.origin}/`)
    expect(JSON.parse(document.getElementById('brandhub-structured-data').textContent)['@type']).toBe('WebSite')
  })

  it('uses content metadata and prevents search pages from being indexed', () => {
    const { rerender } = render(<SeoMetadata pathname="/search" query="cloud" />)
    expect(document.title).toBe('Search: cloud | BrandHub')
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow')

    rerender(<SeoMetadata pathname="/content/dr%3A63" item={{ title: 'Cloud Guide', summary: 'A cloud guide', status: 'published' }} />)
    expect(document.title).toBe('Cloud Guide | BrandHub')
    expect(document.head.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'article')
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index,follow')
  })

  it('marks unresolved or unavailable content as noindex', () => {
    render(<SeoMetadata pathname="/content/missing" />)
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow')
  })
})
