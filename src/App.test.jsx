import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { getContent, getContentById, getFilters } from './api/brandhubApi'

vi.mock('./api/brandhubApi', () => ({
  getContent: vi.fn(),
  getContentById: vi.fn(),
  getFilters: vi.fn(),
  getApiErrorMessage: (error) => error.message,
}))

const item = {
  id: 'dr:63',
  title: 'Example FAQ',
  summary: 'An answer from the content API.',
  source: 'drupal',
  type: 'faq',
  status: 'published',
  tags: [],
}

const listResponse = {
  data: [item],
  pagination: {
    page: 1,
    pageSize: 20,
    totalItems: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  },
}

function LocationOutput() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}{location.search}</output>
}

function renderApp(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes><Route path="*" element={<App />} /></Routes>
      <LocationOutput />
    </MemoryRouter>,
  )
}

describe('App API and routing integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getContent.mockResolvedValue(listResponse)
    getFilters.mockResolvedValue({
      data: {
        sources: [{ value: 'drupal', count: 1 }],
        types: [{ value: 'faq', count: 1 }],
        products: [],
        tags: [],
      },
    })
    getContentById.mockResolvedValue({ data: item })
  })

  it('restores valid filter and pagination values from the URL', async () => {
    renderApp('/search?q=cloud&type=faq&page=2&pageSize=12')

    expect(await screen.findByRole('checkbox', { name: /FAQ\s*1/ })).toBeChecked()
    await waitFor(() => {
      expect(getContent).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'cloud', type: ['faq'], page: 2, pageSize: 12 }),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      )
    })
  })

  it('requests the matching API data when a type filter is selected', async () => {
    renderApp('/search')
    const typeFilter = await screen.findByRole('checkbox', { name: /FAQ\s*1/ })

    fireEvent.click(typeFilter)

    await waitFor(() => {
      expect(getContent).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: ['faq'], page: 1 }),
        expect.any(Object),
      )
    })
    expect(screen.getByTestId('location')).toHaveTextContent('type=faq')
  })

  it('loads content details by ID and preserves the search URL when navigating back', async () => {
    renderApp('/search?q=cloud&type=faq')

    fireEvent.click(await screen.findByRole('button', { name: 'View details' }))

    expect(await screen.findByRole('heading', { name: 'Example FAQ' })).toBeInTheDocument()
    await waitFor(() => expect(getContentById).toHaveBeenCalledWith('dr:63', expect.any(Object)))
    fireEvent.click(screen.getByRole('button', { name: '← Back to search' }))

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/search?q=cloud&type=faq'))
  })
})
