import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi, Mock } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import Register from './Register'

const useNavigateMock: Mock = vi.fn()
vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useNavigate: (): Mock => useNavigateMock,
  }
})

describe('Register', () => {
  it('renders Register component', () => {
    customRender(<Register />)
  })

  it('redirects to login page', () => {
    const { getByText } = customRender(<Register />)

    const signinLink = getByText('signin.redirect')
    fireEvent.click(signinLink)
    expect(useNavigateMock).toHaveBeenCalledWith('/login')
  })

  it('Registers sucessfuly', async () => {
    const { getByText, queryByText, getByLabelText } = customRender(<Register />)
    expect(queryByText('username.validation.taken')).toBeNull()
    expect(queryByText('password.validation.minLength')).toBeNull()
    expect(queryByText('password.validation.strength')).toBeNull()
    expect(queryByText('password.validation.different')).toBeNull()

    fireEvent.change(getByLabelText('username.label'), { target: { value: 'user' } })
    fireEvent.change(getByLabelText('password.label'), { target: { value: 'StrongPassword1234!' } })
    fireEvent.change(getByLabelText('password.confirm.label'), {
      target: { value: 'StrongPassword1234!' },
    })
    fireEvent.click(getByText('signup.button'))

    await waitFor(() => expect(queryByText('username.validation.taken')).toBeNull())
    await waitFor(() => expect(queryByText('password.validation.minLength')).toBeNull())
    await waitFor(() => expect(queryByText('password.validation.strength')).toBeNull())
    await waitFor(() => expect(queryByText('password.validation.different')).toBeNull())
  })

  it('shows error for taken username', async () => {
    const { getByText, queryByText, getByLabelText } = customRender(<Register />)
    expect(queryByText('username.validation.taken')).toBeNull()

    fireEvent.change(getByLabelText('username.label'), { target: { value: 'takenUser' } })
    fireEvent.change(getByLabelText('password.label'), {
      target: { value: 'StrongPassword1234!' },
    })
    fireEvent.change(getByLabelText('password.confirm.label'), {
      target: { value: 'StrongPassword1234!' },
    })
    fireEvent.click(getByText('signup.button'))

    await waitFor(() => expect(getByText('username.validation.taken')).toBeTruthy())
  })

  it('shows error for too short password', async () => {
    const { getByText, queryByText, getByLabelText } = customRender(<Register />)
    expect(queryByText('password.validation.minLength')).toBeNull()

    fireEvent.change(getByLabelText('username.label'), { target: { value: 'user' } })
    fireEvent.change(getByLabelText('password.label'), {
      target: { value: 'Short' },
    })
    fireEvent.change(getByLabelText('password.confirm.label'), { target: { value: 'short' } })
    fireEvent.click(getByText('signup.button'))

    await waitFor(() => expect(getByText('password.validation.minLength')).toBeTruthy())
  })

  it('shows error for weak password', async () => {
    const { getByText, queryByText, getByLabelText } = customRender(<Register />)
    expect(queryByText('password.validation.strength')).toBeNull()

    fireEvent.change(getByLabelText('username.label'), { target: { value: 'user' } })
    fireEvent.change(getByLabelText('password.label'), {
      target: { value: 'weakpassword' },
    })
    fireEvent.change(getByLabelText('password.confirm.label'), {
      target: { value: 'weakpassword' },
    })
    fireEvent.click(getByText('signup.button'))

    await waitFor(() => expect(getByText('password.validation.strength')).toBeTruthy())
  })

  it('shows error for not matching passwords', async () => {
    const { getByText, queryByText, getByLabelText } = customRender(<Register />)
    expect(queryByText('password.validation.different')).toBeNull()

    fireEvent.change(getByLabelText('username.label'), { target: { value: 'user' } })
    fireEvent.change(getByLabelText('password.label'), {
      target: { value: 'StrongPassword1234!' },
    })
    fireEvent.change(getByLabelText('password.confirm.label'), {
      target: { value: 'StrongPassword1!' },
    })
    fireEvent.click(getByText('signup.button'))

    await waitFor(() => expect(getByText('password.validation.different')).toBeTruthy())
  })
})
