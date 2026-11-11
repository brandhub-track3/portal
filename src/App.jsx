import { useCallback, useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import './App.css'
import { getContent, getContentById, getFilters, getApiErrorMessage } from './api/brandhubApi'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { DetailPage } from './pages/DetailPage'
import { DemoPage } from './pages/DemoPage'

const defaultFilters = { source: [], type: [], product: '', tag: [] }
const validSources = ['wordpress', 'drupal']
const validTypes = ['post', 'case_study', 'product', 'article', 'faq']
const validSorts = ['relevance', 'date_desc', 'date_asc']
const defaultPagination = { page: 1, pageSize: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false }

function buildSearchParams({ q, filters, sort, page, pageSize }) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (filters.source.length) params.set('source', filters.source.join(','))
  if (filters.type.length) params.set('type', filters.type.join(','))
  if (filters.product) params.set('product', filters.product)
  if (filters.tag.length) params.set('tag', filters.tag.join(','))
  if (sort !== (q ? 'relevance' : 'date_desc')) params.set('sort', sort)
  if (page > 1) params.set('page', String(page))
  if (pageSize !== 20) params.set('pageSize', String(pageSize))
  return params
}

function readUrlState(params) {
  const sort = params.get('sort')
  const pageSize = Number(params.get('pageSize'))
  return {
    q: params.get('q') || '',
    filters: {
      source: (params.get('source') || '').split(',').filter((value) => validSources.includes(value)),
      type: (params.get('type') || '').split(',').filter((value) => validTypes.includes(value)),
      product: params.get('product') || '',
      tag: (params.get('tag') || '').split(',').filter(Boolean),
    },
    sort: !params.get('q') && sort === 'relevance'
      ? 'date_desc'
      : validSorts.includes(sort) ? sort : params.get('q') ? 'relevance' : 'date_desc',
    page: Math.max(1, Number(params.get('page')) || 1),
    pageSize: [12, 20, 40].includes(pageSize) ? pageSize : 20,
  }
}

function DetailRoute({ onBack }) {
  const { id = '' } = useParams()
  const [detailResponse, setDetailResponse] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getContentById(id, { signal: controller.signal })
      .then((response) => {
        const item = response?.data
        if (!item || item.status !== 'published') {
          setDetailResponse({
            id,
            retryCount,
            error: { status: 404, message: 'The requested content could not be found.' },
          })
          return
        }
        setDetailResponse({ id, retryCount, item })
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setDetailResponse({
            id,
            retryCount,
            error: {
              status: requestError.status,
              message: getApiErrorMessage(requestError),
              requestId: requestError.requestId,
            },
          })
        }
      })
    return () => controller.abort()
  }, [id, retryCount])

  const isCurrentResponse = detailResponse?.id === id && detailResponse?.retryCount === retryCount
  return (
    <DetailPage
      item={isCurrentResponse ? detailResponse.item : null}
      isLoading={!isCurrentResponse}
      error={isCurrentResponse ? detailResponse.error : null}
      retry={() => setRetryCount((count) => count + 1)}
      onBack={onBack}
    />
  )
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const lastLocationSearch = useRef(location.search)
  const pendingSearch = useRef(null)
  const skipUrlWrite = useRef(false)
  const [initialState] = useState(() => readUrlState(searchParams))
  const [searchQuery, setSearchQueryState] = useState(initialState.q)
  const [filters, setFilters] = useState(initialState.filters)
  const [sortBy, setSortBy] = useState(initialState.sort)
  const [sortWasManuallySet, setSortWasManuallySet] = useState(false)
  const [page, setPage] = useState(initialState.page)
  const [pageSize, setPageSize] = useState(initialState.pageSize)
  const [contentResponse, setContentResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [filterOptions, setFilterOptions] = useState(null)
  const [filterError, setFilterError] = useState(null)
  const [filterRetryCount, setFilterRetryCount] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (location.search === lastLocationSearch.current) return

    lastLocationSearch.current = location.search
    const serializedSearch = location.search.replace(/^\?/, '')
    if (pendingSearch.current === serializedSearch) {
      pendingSearch.current = null
      return
    }

    pendingSearch.current = null
    skipUrlWrite.current = true
    const restored = readUrlState(new URLSearchParams(location.search))
    setSearchQueryState(restored.q)
    setFilters(restored.filters)
    setSortBy(restored.sort)
    setSortWasManuallySet(new URLSearchParams(location.search).has('sort'))
    setPage(restored.page)
    setPageSize(restored.pageSize)
  }, [location.search])

  useEffect(() => {
    if (skipUrlWrite.current) {
      skipUrlWrite.current = false
      return
    }

    const nextParams = buildSearchParams({ q: searchQuery, filters, sort: sortBy, page, pageSize })
    if (nextParams.toString() !== searchParams.toString()) {
      pendingSearch.current = nextParams.toString()
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchQuery, filters, sortBy, page, pageSize, searchParams, setSearchParams])

  useEffect(() => {
    const controller = new AbortController()
    getFilters({ signal: controller.signal })
      .then((response) => {
        setFilterOptions(response?.data || {})
        setFilterError(null)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setFilterError({ message: getApiErrorMessage(error), requestId: error.requestId })
        }
      })
    return () => controller.abort()
  }, [filterRetryCount])

  useEffect(() => {
    if (!['/', '/search'].includes(location.pathname)) return undefined

    const controller = new AbortController()
    const timer = setTimeout(() => {
      setIsLoading(true)
      setLoadError(null)
      getContent({
        q: searchQuery,
        source: filters.source,
        type: filters.type,
        product: filters.product,
        tag: filters.tag,
        sort: sortBy,
        page,
        pageSize,
      }, { signal: controller.signal })
        .then((response) => {
          const visibleItems = Array.isArray(response?.data)
            ? response.data.filter((item) => item.status === 'published')
            : []
          setContentResponse({
            ...response,
            data: visibleItems,
            pagination: response?.pagination || defaultPagination,
          })
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            setLoadError({ message: getApiErrorMessage(error), requestId: error.requestId })
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false)
        })
    }, searchQuery ? 350 : 0)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [location.pathname, searchQuery, filters, sortBy, page, pageSize, retryCount])

  const results = contentResponse?.data || []
  const pagination = contentResponse?.pagination || defaultPagination
  const featuredItems = results

  const setSearchQuery = useCallback((value) => {
    setSearchQueryState(value)
    setPage(1)
    if (!value.trim() || !sortWasManuallySet) setSortBy(value.trim() ? 'relevance' : 'date_desc')
  }, [sortWasManuallySet])

  const handleSearchSubmit = (value) => {
    setSearchQuery(value)
    const query = value.trim()
    const nextSort = !query ? 'date_desc' : sortWasManuallySet ? sortBy : 'relevance'
    const params = buildSearchParams({ q: query, filters, sort: nextSort, page: 1, pageSize })
    navigate(`/search${params.size ? `?${params.toString()}` : ''}`)
  }

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setSearchQueryState('')
    setFilters(defaultFilters)
    setSortBy('date_desc')
    setSortWasManuallySet(false)
    setPage(1)
  }

  const removeFilter = (key, value) => {
    if (key === 'q') {
      setSearchQuery('')
    } else if (key === 'product') {
      handleFilterChange(key, '')
    } else {
      handleFilterChange(key, filters[key].filter((item) => item !== value))
    }
  }

  const changePage = (nextPage, nextPageSize) => {
    if (nextPageSize) {
      setPageSize(Math.min(100, Math.max(1, nextPageSize)))
      setPage(1)
    } else {
      setPage(Math.max(1, nextPage))
      document.querySelector('.results-page, .home-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const onOpenDetail = (id) => {
    navigate(`/content/${encodeURIComponent(id)}${location.search}`)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setSortWasManuallySet(true)
    setPage(1)
  }

  return (
    <div className="app-shell">
      <Header />
      {filterError ? (
        <div className="container filter-api-error" role="alert">
          {filterError.message}
          {filterError.requestId ? <details><summary>Technical details</summary><p>Request ID: {filterError.requestId}</p></details> : null}
          <button type="button" className="clear-button" onClick={() => setFilterRetryCount((count) => count + 1)}>Retry filters</button>
        </div>
      ) : null}
      <main className="container main-content">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearchSubmit={handleSearchSubmit}
                featuredItems={featuredItems}
                onOpenDetail={onOpenDetail}
                isLoading={isLoading}
                loadError={loadError}
                totalItems={pagination.totalItems}
                sources={filterOptions?.sources}
                pagination={pagination}
                page={page}
                setPage={changePage}
                retry={() => setRetryCount((count) => count + 1)}
              />
            }
          />
          <Route
            path="/search"
            element={
              <SearchPage
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearchSubmit={handleSearchSubmit}
                results={results}
                filters={filters}
                filterOptions={filterOptions}
                handleFilterChange={handleFilterChange}
                removeFilter={removeFilter}
                clearFilters={clearFilters}
                isLoading={isLoading}
                loadError={loadError}
                retry={() => setRetryCount((count) => count + 1)}
                sortBy={sortBy}
                setSortBy={handleSortChange}
                pagination={pagination}
                page={page}
                setPage={changePage}
                onOpenDetail={onOpenDetail}
              />
            }
          />
          <Route path="/content/:id" element={<DetailRoute onBack={() => navigate(`/search${location.search}`)} />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="*" element={<HomePage searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearchSubmit={handleSearchSubmit} featuredItems={featuredItems} onOpenDetail={onOpenDetail} isLoading={isLoading} loadError={loadError} totalItems={pagination.totalItems} sources={filterOptions?.sources} pagination={pagination} page={page} setPage={changePage} retry={() => setRetryCount((count) => count + 1)} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
