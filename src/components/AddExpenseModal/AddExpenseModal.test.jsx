import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddExpenseModal from './AddExpenseModal'

describe('AddExpenseModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is not visible when isOpen is false', () => {
    render(<AddExpenseModal isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('is visible when isOpen is true', () => {
    render(<AddExpenseModal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<AddExpenseModal {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows validation error when name is empty', async () => {
    render(<AddExpenseModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /save expense/i }))
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  it('shows validation error when amount is invalid', async () => {
    render(<AddExpenseModal {...defaultProps} />)
    await userEvent.type(screen.getByLabelText(/what did you get/i), 'Coffee')
    await userEvent.click(screen.getByRole('button', { name: /save expense/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid amount/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when no category selected', async () => {
    render(<AddExpenseModal {...defaultProps} />)
    await userEvent.type(screen.getByLabelText(/what did you get/i), 'Coffee')
    await userEvent.type(screen.getByLabelText(/how much/i), '50')
    await userEvent.click(screen.getByRole('button', { name: /save expense/i }))
    await waitFor(() => {
      expect(screen.getByText(/pick a category/i)).toBeInTheDocument()
    })
  })

  it('calls onSave with correct shape when form is valid', async () => {
    const onSave = vi.fn().mockResolvedValue()
    render(<AddExpenseModal {...defaultProps} onSave={onSave} />)

    await userEvent.type(screen.getByLabelText(/what did you get/i), 'Matcha')
    await userEvent.type(screen.getByLabelText(/how much/i), '125')
    await userEvent.click(screen.getByRole('button', { name: /food/i }))
    await userEvent.click(screen.getByRole('button', { name: /save expense/i }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Matcha',
        amount: 125,
        currency: 'UAH',
        category: 'Food',
      }))
    })
  })

  it('currency pill selection updates form state', async () => {
    render(<AddExpenseModal {...defaultProps} />)
    const usdBtn = screen.getByRole('button', { name: 'USD' })
    await userEvent.click(usdBtn)
    expect(usdBtn).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'UAH' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('defaults to UAH currency', () => {
    render(<AddExpenseModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'UAH' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('can select EUR currency', async () => {
    render(<AddExpenseModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'EUR' }))
    expect(screen.getByRole('button', { name: 'EUR' })).toHaveAttribute('aria-pressed', 'true')
  })
})
