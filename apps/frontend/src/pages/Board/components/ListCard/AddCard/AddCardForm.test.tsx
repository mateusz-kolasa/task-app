import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'
import AddCardForm from './AddCardForm'

const handleCloseForm = vi.fn()

describe('AddCardForm', () => {
  it('renders AddCardForm component', () => {
    customRender(<AddCardForm listId={1} handleCloseForm={handleCloseForm} />)
  })

  it('Closes form on X click', async () => {
    const { getByRole } = customRender(<AddCardForm listId={1} handleCloseForm={handleCloseForm} />)
    fireEvent.click(getByRole('button', { name: '' }))
    expect(handleCloseForm).toHaveBeenCalled()
  })

  it('Creates card and closes form', async () => {
    const { getByPlaceholderText, getByText } = customRender(
      <AddCardForm listId={1} handleCloseForm={handleCloseForm} />
    )

    fireEvent.change(getByPlaceholderText('card.create.placeholder'), {
      target: { value: 'card title' },
    })
    fireEvent.click(getByText('card.create.button'))

    await waitFor(() => expect(handleCloseForm).toHaveBeenCalled())
  })

  it('Shows error notification on error', async () => {
    server.use(
      http.post('http://localhost:3000/api/card', async () => {
        return new HttpResponse(null, { status: 400 })
      })
    )

    const { getByPlaceholderText, getByText } = customRender(
      <AddCardForm listId={1} handleCloseForm={handleCloseForm} />
    )

    fireEvent.change(getByPlaceholderText('card.create.placeholder'), {
      target: { value: 'card title' },
    })
    fireEvent.click(getByText('card.create.button'))

    await waitFor(() => expect(getByText('card.create.error.title')).toBeTruthy())
    expect(handleCloseForm).not.toHaveBeenCalled()
  })
})
