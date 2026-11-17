import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('BrandHub API client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_BRANDHUB_API_URL', 'https://api.example.test/stage')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ data: [] }),
    }))
  })

  it('builds search, multi-filter, sort, pagination, and honeypot query parameters', async () => {
    const { getContent } = await import('./brandhubApi')

    await getContent({
      q: ' cloud ',
      source: ['drupal', 'wordpress'],
      type: ['article', 'faq'],
      product: 'ClearCall USB Microphone',
      tag: ['Audio', 'Cloud'],
      sort: 'relevance',
      page: 2,
      pageSize: 12,
    })

    const requestUrl = new URL(fetch.mock.calls[0][0])
    expect(requestUrl.pathname).toBe('/stage/content')
    expect(requestUrl.searchParams.get('q')).toBe('cloud')
    expect(requestUrl.searchParams.get('source')).toBe('drupal,wordpress')
    expect(requestUrl.searchParams.get('type')).toBe('article,faq')
    expect(requestUrl.searchParams.get('product')).toBe('ClearCall USB Microphone')
    expect(requestUrl.searchParams.get('tag')).toBe('Audio,Cloud')
    expect(requestUrl.searchParams.get('sort')).toBe('relevance')
    expect(requestUrl.searchParams.get('page')).toBe('2')
    expect(requestUrl.searchParams.get('pageSize')).toBe('12')
    expect(requestUrl.searchParams.get('_hp')).toBe('')
  })

  it('preserves the exact product filter and enforces the maximum page size', async () => {
    const { getContent } = await import('./brandhubApi')

    await getContent({ product: 'ClearCall USB Microphone', pageSize: 1000 })

    const requestUrl = new URL(fetch.mock.calls[0][0])
    expect(requestUrl.searchParams.get('product')).toBe('ClearCall USB Microphone')
    expect(requestUrl.searchParams.get('pageSize')).toBe('100')
  })

  it('URL-encodes content IDs and loads filter options', async () => {
    const { getContentById, getFilters } = await import('./brandhubApi')

    await getContentById('dr:63')
    await getFilters()

    expect(String(fetch.mock.calls[0][0])).toBe('https://api.example.test/stage/content/dr%3A63')
    expect(String(fetch.mock.calls[1][0])).toBe('https://api.example.test/stage/filters')
  })

  it('throws an API error with mapped message and request ID', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers(),
      json: async () => ({ error: { code: 'RATE_LIMITED', requestId: 'req-123' } }),
    }))
    const { getContent, BrandHubApiError } = await import('./brandhubApi')

    await expect(getContent()).rejects.toMatchObject({
      name: BrandHubApiError.name,
      status: 429,
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please wait and try again.',
      requestId: 'req-123',
    })
  })
})
