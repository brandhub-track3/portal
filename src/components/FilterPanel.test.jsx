import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FilterPanel } from './FilterPanel'

const filters = { source: [], type: [], product: '', tag: [] }
const options = {
  sources: [{ value: 'drupal', count: 15 }],
  types: [{ value: 'article', count: 13 }, { value: 'faq', count: 1 }, { value: 'product', count: 1 }],
  products: [{ value: 'ClearCall USB Microphone', count: 1 }],
  tags: [{ value: 'Audio', count: 1 }],
}

describe('FilterPanel', () => {
  it('shows all supported types, including options with zero results', () => {
    render(
      <FilterPanel filters={filters} options={options} onChange={vi.fn()} onClear={vi.fn()} />,
    )

    expect(screen.getByRole('checkbox', { name: /Post\s*0/ })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Case Study\s*0/ })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /FAQ\s*1/ })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Product\s*1/ })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Article\s*13/ })).toBeInTheDocument()
  })

  it('allows selecting multiple types and changes the exact product', () => {
    const onChange = vi.fn()
    render(<FilterPanel filters={filters} options={options} onChange={onChange} onClear={vi.fn()} />)

    fireEvent.click(screen.getByRole('checkbox', { name: /FAQ\s*1/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Article\s*13/ }))
    fireEvent.change(screen.getByLabelText('Product'), {
      target: { value: 'ClearCall USB Microphone' },
    })

    expect(onChange).toHaveBeenNthCalledWith(1, 'type', ['faq'])
    expect(onChange).toHaveBeenNthCalledWith(2, 'type', ['article'])
    expect(onChange).toHaveBeenCalledWith('product', 'ClearCall USB Microphone')
  })

  it('clears filters when Clear all is clicked', () => {
    const onClear = vi.fn()
    render(<FilterPanel filters={filters} options={options} onChange={vi.fn()} onClear={onClear} />)

    fireEvent.click(screen.getByRole('button', { name: 'Clear all', exact: true }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
