export function normalizeText(value = '') {
  return value.trim().toLowerCase()
}

export function buildRelevanceScore(item, query) {
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) {
    return 0
  }

  const titleText = normalizeText(item.title)
  const summaryText = normalizeText(item.summary)
  const bodyText = normalizeText(item.body)
  const tagText = item.tags.join(' ').toLowerCase()
  const productText = normalizeText(item.product)

  let score = 0

  if (titleText.includes(normalizedQuery)) score += 40
  if (titleText.startsWith(normalizedQuery)) score += 20
  if (summaryText.includes(normalizedQuery)) score += 20
  if (productText.includes(normalizedQuery)) score += 10
  if (bodyText.includes(normalizedQuery)) score += 8
  if (tagText.includes(normalizedQuery)) score += 12

  const queryParts = normalizedQuery.split(/\s+/).filter(Boolean)
  queryParts.forEach((part) => {
    if (titleText.includes(part)) score += 8
    if (summaryText.includes(part)) score += 5
    if (bodyText.includes(part)) score += 2
  })

  return score
}

export function matchesSearch(item, query) {
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) {
    return true
  }

  const haystack = [
    item.title,
    item.summary,
    item.body,
    item.product,
    item.tags.join(' '),
    item.source,
  ]
    .join(' ')
    .toLowerCase()

  if (haystack.includes(normalizedQuery)) {
    return true
  }

  const queryParts = normalizedQuery.split(/\s+/).filter(Boolean)
  return queryParts.some((part) => {
    if (part.length <= 2) return false
    return haystack.includes(part) || haystack.startsWith(part)
  })
}

export function buildFilterCounts(items, query) {
  const filteredByQuery = items.filter((item) => matchesSearch(item, query))

  return {
    source: filteredByQuery.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1
      return acc
    }, {}),
    type: filteredByQuery.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {}),
    product: filteredByQuery.reduce((acc, item) => {
      acc[item.product] = (acc[item.product] || 0) + 1
      return acc
    }, {}),
    tag: filteredByQuery.reduce((acc, item) => {
      item.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1
      })
      return acc
    }, {}),
  }
}

export function filterAndSortResults(items, query, filters, sortBy = 'relevance') {
  const normalizedQuery = normalizeText(query)

  const filtered = items.filter((item) => {
    if (!matchesSearch(item, query)) {
      return false
    }

    if (filters.source !== 'all' && item.source !== filters.source) {
      return false
    }

    if (filters.type !== 'all' && item.type !== filters.type) {
      return false
    }

    if (filters.product !== 'all' && item.product !== filters.product) {
      return false
    }

    if (filters.tag !== 'all' && !item.tags.includes(filters.tag)) {
      return false
    }

    return true
  })

  return filtered
    .map((item) => ({
      item,
      score: buildRelevanceScore(item, normalizedQuery),
    }))
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.item.publishedAt) - new Date(a.item.publishedAt)
      }

      if (b.score !== a.score) {
        return b.score - a.score
      }

      return new Date(b.item.publishedAt) - new Date(a.item.publishedAt)
    })
    .map(({ item }) => item)
}

export function getInitialFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search)

  return {
    q: params.get('q') || '',
    source: params.get('source') || 'all',
    type: params.get('type') || 'all',
    product: params.get('product') || 'all',
    tag: params.get('tag') || 'all',
    sort: params.get('sort') || 'relevance',
  }
}
