
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../pages/Login'
import { login } from '../services/auth'

vi.mock('../services/auth', () => ({
  login: vi.fn(),
}))

const mockedLogin = vi.mocked(login)

describe('Login component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays the login form', () => {
    render(<Login />)

    expect(screen.getByText('JobFlow')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Se connecter' })
    ).toBeInTheDocument()
  })

  it('allows the user to enter email and password', async () => {
    const user = userEvent.setup()

    render(<Login />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')

    await user.type(emailInput, 'maram@jobflow.com')
    await user.type(passwordInput, 'TestPassword123')

    expect(emailInput).toHaveValue('maram@jobflow.com')
    expect(passwordInput).toHaveValue('TestPassword123')
  })

  it('displays an error when login fails', async () => {
    const user = userEvent.setup()

    mockedLogin.mockRejectedValue(
      new Error('Identifiants invalides')
    )

    render(<Login />)

    await user.type(
      screen.getByLabelText('Email'),
      'maram@jobflow.com'
    )

    await user.type(
      screen.getByLabelText('Password'),
      'WrongPassword'
    )

    await user.click(
      screen.getByRole('button', { name: 'Se connecter' })
    )

    expect(
      await screen.findByText('Identifiants invalides')
    ).toBeInTheDocument()
  })

  it('disables the button while login is loading', async () => {
    const user = userEvent.setup()

    mockedLogin.mockImplementation(
      () => new Promise(() => {})
    )

    render(<Login />)

    await user.type(
      screen.getByLabelText('Email'),
      'maram@jobflow.com'
    )

    await user.type(
      screen.getByLabelText('Password'),
      'TestPassword123'
    )

    await user.click(
      screen.getByRole('button', { name: 'Se connecter' })
    )

    const loadingButton = screen.getByRole('button', {
      name: 'Connexion...',
    })

    expect(loadingButton).toBeDisabled()
  })
})
