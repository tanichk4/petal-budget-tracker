import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExpenseCard from './ExpenseCard'

const baseExpense = {
  id: 'abc-123',
  name: 'Lavender Latte',
  amount: 125,
  currency: 'UAH',
  date: '2026-03-08',
  category: 'Food',
  notes: null,
  photo_url: null,
}

describe('ExpenseCard', () => {
  it('renders the expense name', () => {
    render(<ExpenseCard expense={baseExpense} onDelete={vi.fn()} />)
    expect(screen.getByText('Lavender Latte')).toBeInTheDocument()
  })

  it('renders amount with UAH symbol', () => {
    render(<ExpenseCard expense={baseExpense} onDelete={vi.fn()} />)
    expect(screen.getByText('₴125')).toBeInTheDocument()
  })

  it('renders amount with USD symbol', () => {
    render(<ExpenseCard expense={{ ...baseExpense, currency: 'USD', amount: 50 }} onDelete={vi.fn()} />)
    expect(screen.getByText('$50')).toBeInTheDocument()
  })

  it('renders amount with EUR symbol', () => {
    render(<ExpenseCard expense={{ ...baseExpense, currency: 'EUR', amount: 30.5 }} onDelete={vi.fn()} />)
    expect(screen.getByText('€30.5')).toBeInTheDocument()
  })

  it('renders the formatted date', () => {
    render(<ExpenseCard expense={baseExpense} onDelete={vi.fn()} />)
    expect(screen.getByText('Mar 8, 2026')).toBeInTheDocument()
  })

  it('renders the category badge', () => {
    render(<ExpenseCard expense={baseExpense} onDelete={vi.fn()} />)
    expect(screen.getByLabelText('Category: Food')).toBeInTheDocument()
  })

  it('calls onDelete with expense id when delete button clicked', async () => {
    const onDelete = vi.fn()
    render(<ExpenseCard expense={baseExpense} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /delete lavender latte/i }))
    expect(onDelete).toHaveBeenCalledWith('abc-123')
  })

  it('renders notes when present', () => {
    render(<ExpenseCard expense={{ ...baseExpense, notes: 'Best latte ever' }} onDelete={vi.fn()} />)
    expect(screen.getByText('Best latte ever')).toBeInTheDocument()
  })

  it('does not render notes section when notes is null', () => {
    render(<ExpenseCard expense={baseExpense} onDelete={vi.fn()} />)
    expect(screen.queryByText(/best latte/i)).not.toBeInTheDocument()
  })

  it('renders photo when photo_url is present', () => {
    render(<ExpenseCard expense={{ ...baseExpense, photo_url: 'https://example.com/photo.jpg' }} onDelete={vi.fn()} />)
    const img = screen.getByRole('img', { name: /photo for lavender latte/i })
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })
})
