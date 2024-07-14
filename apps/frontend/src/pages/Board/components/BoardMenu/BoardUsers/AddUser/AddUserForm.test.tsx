import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'
import AddUserForm from './AddUserForm'

const handleCloseForm = vi.fn()

describe('AddUserForm', () => {
  it('renders AddUserForm component', () => {
    customRender(<AddUserForm handleCloseForm={handleCloseForm} />)
  })

  it('closes form on X click', async () => {
    const { getByRole } = customRender(<AddUserForm handleCloseForm={handleCloseForm} />)
    fireEvent.click(getByRole('button', { name: '' }))
    expect(handleCloseForm).toHaveBeenCalled()
  })

  it('adds user and closes form', async () => {
    const { getByPlaceholderText, getByText } = customRender(
      <AddUserForm handleCloseForm={handleCloseForm} />
    )

    fireEvent.change(getByPlaceholderText('board.users.add.username'), {
      target: { value: 'user' },
    })
    fireEvent.click(getByText('board.users.add.confirm'))

    await waitFor(() => expect(handleCloseForm).toHaveBeenCalled())
  })

  it('Shows notification on non existing user', async () => {
    server.use(
      http.post('http://localhost:3000/api/board/users/add', async () => {
        return new HttpResponse(null, { status: 404 })
      })
    )

    const { getByPlaceholderText, getByText } = customRender(
      <AddUserForm handleCloseForm={handleCloseForm} />
    )

    fireEvent.change(getByPlaceholderText('board.users.add.username'), {
      target: { value: 'user' },
    })
    fireEvent.click(getByText('board.users.add.confirm'))

    await waitFor(() => expect(getByText('board.users.add.error.noUser')).toBeTruthy())
    expect(handleCloseForm).not.toHaveBeenCalled()
  })

  it('Shows notification on user already in board', async () => {
    server.use(
      http.post('http://localhost:3000/api/board/users/add', async () => {
        return new HttpResponse(null, { status: 400 })
      })
    )

    const { getByPlaceholderText, getByText } = customRender(
      <AddUserForm handleCloseForm={handleCloseForm} />
    )

    fireEvent.change(getByPlaceholderText('board.users.add.username'), {
      target: { value: 'user' },
    })
    fireEvent.click(getByText('board.users.add.confirm'))

    await waitFor(() => expect(getByText('board.users.add.error.userInBoard')).toBeTruthy())
    expect(handleCloseForm).not.toHaveBeenCalled()
  })

  it('Shows notification on other server error', async () => {
    server.use(
      http.post('http://localhost:3000/api/board/users/add', async () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const { getByPlaceholderText, getByText } = customRender(
      <AddUserForm handleCloseForm={handleCloseForm} />
    )

    fireEvent.change(getByPlaceholderText('board.users.add.username'), {
      target: { value: 'user' },
    })
    fireEvent.click(getByText('board.users.add.confirm'))

    await waitFor(() => expect(getByText('board.users.add.error.other')).toBeTruthy())
    expect(handleCloseForm).not.toHaveBeenCalled()
  })
})
