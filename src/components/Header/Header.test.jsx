import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from './Header'

describe('Header', () => {
  it('renders total formatted in UAH', () => {
    render(<Header totalUAH={1250} searchQuery="" onSearchChange={vi.fn()} onSignOut={vi.fn()} />)
    // Ukrainian number format: 1 250 ₴ (non-breaking space as thousands separator)
    expect(screen.getByLabelText(/Total spent/i)).toBeInTheDocument()
  })

  it('renders 0 UAH when totalUAH is undefined', () => {
    render(<Header searchQuery="" onSearchChange={vi.fn()} onSignOut={vi.fn()} />)
    expect(screen.getByLabelText(/Total spent/i)).toBeInTheDocument()
  })

  it('calls onSearchChange when typing in search input', async () => {
    const onSearchChange = vi.fn()
    render(<Header totalUAH={0} searchQuery="" onSearchChange={onSearchChange} onSignOut={vi.fn()} />)

    const input = screen.getByRole('searchbox', { name: /search expenses/i })
    await userEvent.type(input, 'coffee')

    expect(onSearchChange).toHaveBeenCalled()
  })

  it('calls onSignOut when sign out button clicked', async () => {
    const onSignOut = vi.fn()
    render(<Header totalUAH={0} searchQuery="" onSearchChange={vi.fn()} onSignOut={onSignOut} />)

    await userEvent.click(screen.getByRole('button', { name: /sign out/i }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })

  it('displays the current search query value', () => {
    render(<Header totalUAH={0} searchQuery="matcha" onSearchChange={vi.fn()} onSignOut={vi.fn()} />)
    expect(screen.getByRole('searchbox')).toHaveValue('matcha')
  })
})
