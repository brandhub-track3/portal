import { useEffect, useMemo, useState } from 'react'
import { Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import './App.css'
import { Header } from './components/Header'
import { searchIndex } from './data/searchIndex'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { DetailPage } from './pages/DetailPage'
import { DemoPage } from './pages/DemoPage'
import { buildFilterCounts, filterAndSortResults, getInitialFiltersFromUrl } from './utils/searchHelpers'

const defaultFilters = {
  source: 'all',
  type: 'all',
  product: 'all',
  tag: 'all',
}

function DetailRoute({ searchIndexData, onBack }) {
  const { id } = useParams()
  const selectedItem = id ? searchIndexData.find((item) => item.id === id) : null
  const relatedItems = selectedItem
    ? searchIndexData.filter((item) => item.id !== selectedItem.id && item.product === selectedItem.product)
    : []

  return <DetailPage item={selectedItem} relatedItems={relatedItems} onBack={onBack} />
}

function App() {
  const initialUrlState = getInitialFiltersFromUrl()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(initialUrlState.q)
  const [filters, setFilters] = useState({
    ...defaultFilters,
    source: initialUrlState.source,
    type: initialUrlState.type,
    product: initialUrlState.product,
    tag: initialUrlState.tag,
  })
  const [sortBy, setSortBy] = useState(initialUrlState.sort)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [staleData, setStaleData] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (!Array.isArray(searchIndex) || searchIndex.length === 0) {
          throw new Error('Search index is empty.')
        }

        setIsLoading(false)
        setStaleData(true)
      } catch (error) {
        setLoadError('The search index could not be loaded. Please refresh or try again later.')
        setIsLoading(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const nextParams = new URLSearchParams()

    if (searchQuery) nextParams.set('q', searchQuery)
    if (filters.source !== 'all') nextParams.set('source', filters.source)
    if (filters.type !== 'all') nextParams.set('type', filters.type)
    if (filters.product !== 'all') nextParams.set('product', filters.product)
    if (filters.tag !== 'all') nextParams.set('tag', filters.tag)
    if (sortBy !== 'relevance') nextParams.set('sort', sortBy)

    setSearchParams(nextParams, { replace: true })
  }, [searchQuery, filters, sortBy, setSearchParams])

  const featuredItems = useMemo(() => searchIndex.filter((item) => item.featured), [])

  const filteredResults = useMemo(
    () => filterAndSortResults(searchIndex, searchQuery, filters, sortBy),
    [searchQuery, filters, sortBy],
  )

  const filterCounts = useMemo(
    () => buildFilterCounts(searchIndex, searchQuery),
    [searchQuery],
  )

  const handleSearchSubmit = (value) => {
    setSearchQuery(value)
    navigate('/search')
  }

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
    setSortBy('relevance')
  }

  const onOpenDetail = (id) => {
    navigate(`/content/${encodeURIComponent(id)}`)
  }

  return (
    <div className="app-shell">
      <Header />

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
                filteredResults={filteredResults}
                filterCounts={filterCounts}
                filters={filters}
                handleFilterChange={handleFilterChange}
                clearFilters={clearFilters}
                isLoading={isLoading}
                loadError={loadError}
                staleData={staleData}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onOpenDetail={onOpenDetail}
              />
            }
          />

          <Route
            path="/content/:id"
            element={<DetailRoute searchIndexData={searchIndex} onBack={() => navigate('/search')} />}
          />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="*" element={<HomePage searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearchSubmit={handleSearchSubmit} featuredItems={featuredItems} onOpenDetail={onOpenDetail} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
