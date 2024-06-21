import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import AddListButtonForm from './AddListButtonForm'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'

const handleCloseForm = vi.fn()

describe('AddListButtonForm', () => {
  it('renders AddListButtonForm component', () => {
    customRender(<AddListButtonForm handleCloseForm={handleCloseForm} />)
  })

  it('Closes form on X click', async () => {
    const { getByRole } = customRender(<AddListButtonForm handleCloseForm={handleCloseForm} />)
    fireEvent.click(getByRole('button', { name: '' }))
    expect(handleCloseForm).toHaveBeenCalled()
  })

  it('Creates list and closes form', async () => {
    const { getByPlaceholderText, getByText } = customRender(
      <AddListButtonForm handleCloseForm={handleCloseForm} />
    )

    fireEvent.change(getByPlaceholderText('list.create.placeholder'), {
      target: { value: 'list title' },
    })
    fireEvent.click(getByText('list.create.button'))

    await waitFor(() => expect(handleCloseForm).toHaveBeenCalled())
  })

  it('Shows error notification on error', async () => {
    server.use(
      http.post('http://localhost:3000/api/list', async () => {
        return new HttpResponse(null, { status: 400 })
      })
    )

    const { getByPlaceholderText, getByText } = customRender(
      <AddListButtonForm handleCloseForm={handleCloseForm} />
    )

    fireEvent.change(getByPlaceholderText('list.create.placeholder'), {
      target: { value: 'list title' },
    })
    fireEvent.click(getByText('list.create.button'))

    await waitFor(() => expect(getByText('list.create.error.title')).toBeTruthy())
    expect(handleCloseForm).not.toHaveBeenCalled()
  })
})