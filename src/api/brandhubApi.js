const API_BASE_URL = import.meta.env.VITE_BRANDHUB_API_URL

const ERROR_MESSAGES = {
  400: 'Some filter values are invalid. Please update your filters.',
  403: 'This portal origin is not allowed to access the content API.',
  404: 'The requested content could not be found.',
  429: 'Too many requests. Please wait and try again.',
  500: 'Content is temporarily unavailable. Please try again.',
  503: 'Content is temporarily unavailable. Please try again.',
}

export class BrandHubApiError extends Error {
  constructor({ status, code, message, requestId }) {
    super(message)
    this.name = 'BrandHubApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

async function request(path, { signal, query } = {}) {
  if (!API_BASE_URL) {
    throw new BrandHubApiError({
      status: 0,
      code: 'API_URL_NOT_CONFIGURED',
      message: 'Set VITE_BRANDHUB_API_URL to connect to the content API.',
    })
  }

  const baseUrl = API_BASE_URL.replace(/\/+$/, '')
  const url = new URL(`${baseUrl}/${path.replace(/^\/+/, '')}`)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) url.searchParams.set(key, value.join(','))
      } else if (key === '_hp') {
        url.searchParams.set(key, '')
      } else if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  let response
  try {
    response = await fetch(url, { method: 'GET', signal, headers: { Accept: 'application/json' } })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new BrandHubApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to reach the content API. Please check your connection and try again.',
    })
  }

  let body
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    throw new BrandHubApiError({
      status: response.status,
      code: body?.error?.code || 'API_ERROR',
      message: ERROR_MESSAGES[response.status] || 'The content API returned an unexpected error.',
      requestId: body?.error?.requestId || response.headers.get('x-amzn-requestid') || undefined,
    })
  }

  return body
}

export function getContent(params = {}, options = {}) {
  const query = {
    q: params.q?.trim(),
    source: params.source,
    type: params.type,
    product: params.product,
    tag: params.tag,
    sort: params.sort || 'date_desc',
    page: Math.max(1, Number(params.page) || 1),
    pageSize: Math.min(100, Math.max(1, Number(params.pageSize) || 20)),
    _hp: '',
  }

  return request('/content', { ...options, query })
}

export function getContentById(id, options = {}) {
  return request(`/content/${encodeURIComponent(id)}`, options)
}

export function getFilters(options = {}) {
  return request('/filters', options)
}

export function getApiErrorMessage(error) {
  return error instanceof BrandHubApiError
    ? error.message
    : 'Content is temporarily unavailable. Please try again.'
}
