import { customRender } from 'utils/testHelper'
import { describe, it, expect, Mock, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'
import UserAccount from './UserAccount'
import { MOCK_USER } from 'mocks/data/user'

const useNavigateMock: Mock = vi.fn()
vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useNavigate: (): Mock => useNavigateMock,
  }
})

describe('UserAccount', () => {
  it('renders UserAccount component', () => {
    customRender(<UserAccount />)
  })

  it('opens popup on click', async () => {
    const { queryByText, getByText, getByRole } = customRender(<UserAccount />)

    expect(queryByText(MOCK_USER.username)).toBeNull()
    expect(queryByText('signout.button')).toBeNull()
    fireEvent.click(getByRole('button'))

    await waitFor(() => expect(getByText(MOCK_USER.username)).toBeTruthy())
    expect(getByText('signout.button')).toBeTruthy()
  })

  it('logs out on click', async () => {
    const { getByRole, getByText } = customRender(<UserAccount />)

    fireEvent.click(getByRole('button'))

    await waitFor(() => expect(getByText(MOCK_USER.username)).toBeTruthy())
    fireEvent.click(getByText('signout.button'))

    await waitFor(() => expect(useNavigateMock).toHaveBeenCalledWith('/login'))
  })

  it('shows error notification on error', async () => {
    server.use(
      http.delete('http://localhost:3000/api/auth/logout', async () => {
        return new HttpResponse(null, { status: 400 })
      })
    )
    const { getByRole, getByText } = customRender(<UserAccount />)

    fireEvent.click(getByRole('button'))

    await waitFor(() => expect(getByText(MOCK_USER.username)).toBeTruthy())
    fireEvent.click(getByText('signout.button'))

    await waitFor(() => expect(getByText('signout.error.title')).toBeTruthy())
  })
})
