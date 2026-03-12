import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthPage from './AuthPage'

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  },
}))

import { supabase } from '../../lib/supabase'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthPage', () => {
  it('renders login mode by default', () => {
    render(<AuthPage />)
    expect(screen.getByRole('tab', { name: 'Log In' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument()
  })

  it('switches to sign up mode', async () => {
    render(<AuthPage />)
    await userEvent.click(screen.getByRole('tab', { name: 'Sign Up' }))
    expect(screen.getByRole('tab', { name: 'Sign Up' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
  })

  it('calls signInWithPassword on login submit', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null })
    render(<AuthPage />)

    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Log In' }))

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('calls signUp on signup submit', async () => {
    supabase.auth.signUp.mockResolvedValue({ error: null })
    render(<AuthPage />)

    await userEvent.click(screen.getByRole('tab', { name: 'Sign Up' }))
    await userEvent.type(screen.getByLabelText('Email'), 'new@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
      })
    })
  })

  it('shows error message on auth failure', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    render(<AuthPage />)

    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'Log In' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
  })

  it('clears error when switching modes', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    render(<AuthPage />)

    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'Log In' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('tab', { name: 'Sign Up' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
