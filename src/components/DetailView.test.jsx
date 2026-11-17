import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DetailView } from './DetailView'

const item = {
  id: 'dr:63',
  title: 'Example article',
  summary: 'A useful summary.',
  source: 'drupal',
  type: 'article',
  url: 'https://cms.example.test/article/63',
  tags: ['Audio'],
  publishedAt: '2026-11-10T00:00:00Z',
  status: 'published',
}

describe('DetailView', () => {
  it('renders content fields and opens View Source in a safe new tab', () => {
    render(<DetailView item={item} isLoading={false} onBack={vi.fn()} />)

    const sourceLink = screen.getByRole('link', { name: 'View Source' })
    expect(screen.getByRole('heading', { name: 'Example article' })).toBeInTheDocument()
    expect(sourceLink).toHaveAttribute('href', item.url)
    expect(sourceLink).toHaveAttribute('target', '_blank')
    expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not render a source link if the API has no URL', () => {
    render(<DetailView item={{ ...item, url: null }} isLoading={false} onBack={vi.fn()} />)
    expect(screen.queryByRole('link', { name: 'View Source' })).not.toBeInTheDocument()
  })

  it('shows loading, missing content, and retry states', () => {
    const retry = vi.fn()
    const { container, rerender } = render(<DetailView item={null} isLoading onBack={vi.fn()} />)
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()

    rerender(<DetailView item={null} isLoading={false} error={{ status: 404 }} retry={retry} onBack={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Content not found' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()

    rerender(<DetailView item={null} isLoading={false} error={{ status: 503 }} retry={retry} onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
