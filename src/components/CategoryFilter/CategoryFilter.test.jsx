import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CategoryFilter, { CATEGORIES } from './CategoryFilter'

describe('CategoryFilter', () => {
  it('renders All pill plus all 7 category pills', () => {
    render(<CategoryFilter activeCategory="All" onCategoryChange={vi.fn()} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(8) // All + 7 categories
  })

  it('marks All as selected when activeCategory is All', () => {
    render(<CategoryFilter activeCategory="All" onCategoryChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true')
  })

  it('marks the correct category as selected', () => {
    render(<CategoryFilter activeCategory="Food" onCategoryChange={vi.fn()} />)
    const foodTab = screen.getByRole('tab', { name: /food/i })
    expect(foodTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onCategoryChange with "All" when All is clicked', async () => {
    const onChange = vi.fn()
    render(<CategoryFilter activeCategory="Food" onCategoryChange={onChange} />)
    await userEvent.click(screen.getByRole('tab', { name: 'All' }))
    expect(onChange).toHaveBeenCalledWith('All')
  })

  it('calls onCategoryChange with the correct category id when a category pill is clicked', async () => {
    const onChange = vi.fn()
    render(<CategoryFilter activeCategory="All" onCategoryChange={onChange} />)
    await userEvent.click(screen.getByRole('tab', { name: /shopping/i }))
    expect(onChange).toHaveBeenCalledWith('Shopping')
  })

  it('renders all 7 expected category labels', () => {
    render(<CategoryFilter activeCategory="All" onCategoryChange={vi.fn()} />)
    CATEGORIES.forEach(cat => {
      expect(screen.getByRole('tab', { name: new RegExp(cat.label, 'i') })).toBeInTheDocument()
    })
  })
})
