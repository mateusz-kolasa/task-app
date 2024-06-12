import { customRender } from 'utils/testHelper'
import Login from './Login'
import { describe, it, expect, vi, Mock } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'

const useNavigateMock: Mock = vi.fn()
vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useNavigate: (): Mock => useNavigateMock,
  }
})

describe('Login', () => {
  it('renders Login component', () => {
    customRender(<Login />)
  })

  it('redirects to register page', () => {
    const { getByText } = customRender(<Login />)

    const signupLink = getByText('signup.redirect')
    fireEvent.click(signupLink)
    expect(useNavigateMock).toHaveBeenCalledWith('/register')
  })

  it('logins sucessfuly', async () => {
    const { getByText, queryByText, getByLabelText } = customRender(<Login />)
    expect(queryByText('username.validation.auth')).toBeNull()

    fireEvent.change(getByLabelText('username.label'), { target: { value: 'user' } })
    fireEvent.change(getByLabelText('password.label'), { target: { value: 'password' } })
    fireEvent.click(getByText('signin.button'))

    await waitFor(() => expect(queryByText('username.validation.auth')).toBeNull())
  })

  it('shows error for invalid credentials', async () => {
    const { getByText, queryByText, getByLabelText } = customRender(<Login />)
    expect(queryByText('username.validation.auth')).toBeNull()

    fireEvent.change(getByLabelText('username.label'), { target: { value: 'user' } })
    fireEvent.change(getByLabelText('password.label'), { target: { value: 'invalidPassword' } })
    fireEvent.click(getByText('signin.button'))

    await waitFor(() => expect(getByText('username.validation.auth')).toBeTruthy())
  })
})
