import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategorySplitChart from './CategorySplitChart'

const identity = (amount) => amount // no conversion needed for tests

describe('CategorySplitChart', () => {
  it('renders empty state when no expenses', () => {
    render(<CategorySplitChart expenses={[]} convertToUAH={identity} />)
    expect(screen.getByText('No expenses yet')).toBeInTheDocument()
  })

  it('renders category rows for each unique category', () => {
    const expenses = [
      { id: '1', category: 'Food', amount: 100, currency: 'UAH' },
      { id: '2', category: 'Shopping', amount: 200, currency: 'UAH' },
      { id: '3', category: 'Food', amount: 50, currency: 'UAH' },
    ]
    render(<CategorySplitChart expenses={expenses} convertToUAH={identity} />)
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Shopping')).toBeInTheDocument()
  })

  it('does not render categories not present in expenses', () => {
    const expenses = [
      { id: '1', category: 'Food', amount: 100, currency: 'UAH' },
    ]
    render(<CategorySplitChart expenses={expenses} convertToUAH={identity} />)
    expect(screen.queryByText('Shopping')).not.toBeInTheDocument()
    expect(screen.queryByText('Travel')).not.toBeInTheDocument()
  })

  it('renders the highest category bar at 100% width', () => {
    const expenses = [
      { id: '1', category: 'Food', amount: 200, currency: 'UAH' },
      { id: '2', category: 'Shopping', amount: 100, currency: 'UAH' },
    ]
    render(<CategorySplitChart expenses={expenses} convertToUAH={identity} />)
    // Food is highest, should be 100% width
    const progressBars = screen.getAllByRole('progressbar')
    const foodBar = progressBars.find(el => el.getAttribute('aria-label') === 'Food spending')
    expect(foodBar).toHaveAttribute('aria-valuenow', '100')
  })

  it('renders the lower category bar at correct proportional width', () => {
    const expenses = [
      { id: '1', category: 'Food', amount: 200, currency: 'UAH' },
      { id: '2', category: 'Shopping', amount: 100, currency: 'UAH' },
    ]
    render(<CategorySplitChart expenses={expenses} convertToUAH={identity} />)
    const progressBars = screen.getAllByRole('progressbar')
    const shoppingBar = progressBars.find(el => el.getAttribute('aria-label') === 'Shopping spending')
    expect(shoppingBar).toHaveAttribute('aria-valuenow', '50')
  })

  it('uses convertToUAH for currency conversion', () => {
    const convertToUAH = vi.fn().mockImplementation((amount, currency) => {
      if (currency === 'USD') return amount * 41.5
      return amount
    })
    const expenses = [
      { id: '1', category: 'Food', amount: 10, currency: 'USD' },
    ]
    render(<CategorySplitChart expenses={expenses} convertToUAH={convertToUAH} />)
    expect(convertToUAH).toHaveBeenCalledWith(10, 'USD')
  })

  it('aggregates multiple expenses in the same category', () => {
    const expenses = [
      { id: '1', category: 'Food', amount: 100, currency: 'UAH' },
      { id: '2', category: 'Food', amount: 50, currency: 'UAH' },
      { id: '3', category: 'Shopping', amount: 300, currency: 'UAH' },
    ]
    render(<CategorySplitChart expenses={expenses} convertToUAH={identity} />)
    // Shopping (300) > Food (150), so Shopping should be 100%
    const progressBars = screen.getAllByRole('progressbar')
    const shoppingBar = progressBars.find(el => el.getAttribute('aria-label') === 'Shopping spending')
    expect(shoppingBar).toHaveAttribute('aria-valuenow', '100')
    const foodBar = progressBars.find(el => el.getAttribute('aria-label') === 'Food spending')
    expect(foodBar).toHaveAttribute('aria-valuenow', '50')
  })
})
