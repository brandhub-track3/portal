import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchPage } from './SearchPage'

const defaults = {
  searchQuery: '',
  setSearchQuery: vi.fn(),
  handleSearchSubmit: vi.fn(),
  results: [],
  filters: { source: [], type: [], product: '', tag: [] },
  filterOptions: { sources: [], types: [], products: [], tags: [] },
  handleFilterChange: vi.fn(),
  removeFilter: vi.fn(),
  clearFilters: vi.fn(),
  isLoading: false,
  loadError: null,
  retry: vi.fn(),
  sortBy: 'date_desc',
  setSortBy: vi.fn(),
  pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false },
  page: 1,
  setPage: vi.fn(),
  onOpenDetail: vi.fn(),
}

describe('SearchPage', () => {
  it('submits searches, changes sort, and shows the empty-state action', () => {
    render(<SearchPage {...defaults} searchQuery="cloud" />)

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'cloud again' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'date_asc' } })

    expect(defaults.setSearchQuery).toHaveBeenCalledWith('cloud again')
    expect(defaults.handleSearchSubmit).toHaveBeenCalledWith('cloud')
    expect(defaults.setSortBy).toHaveBeenCalledWith('date_asc')
    expect(screen.getByText('No content matched the selected search and filters.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(defaults.clearFilters).toHaveBeenCalledOnce()
  })

  it('changes pages and page size using API pagination metadata', () => {
    const setPage = vi.fn()
    render(
      <SearchPage
        {...defaults}
        results={[{ id: 'one', title: 'One', source: 'drupal', type: 'article', summary: '', tags: [] }]}
        pagination={{ ...defaults.pagination, page: 2, pageSize: 20, totalItems: 41, totalPages: 3, hasPreviousPage: true, hasNextPage: true }}
        page={2}
        setPage={setPage}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.change(screen.getByLabelText('Per page'), { target: { value: '40' } })

    expect(setPage).toHaveBeenNthCalledWith(1, 1)
    expect(setPage).toHaveBeenNthCalledWith(2, 3)
    expect(setPage).toHaveBeenNthCalledWith(3, 1, 40)
  })

  it('shows API errors and invokes retry', () => {
    const retry = vi.fn()
    render(<SearchPage {...defaults} loadError={{ message: 'API is unavailable', requestId: 'req-1' }} retry={retry} />)

    expect(screen.getByText('API is unavailable')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
