import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'
import CardDialogTitleTextForm from './CardDialogTitleTextForm'
import { SAMPLE_LISTS } from 'mocks/data/lists'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '3' }),
  }
})
const handleClose = vi.fn()

const list = SAMPLE_LISTS[0]

describe('CardDialogTitleTextForm', () => {
  it('renders CardDialogTitleTextForm component', () => {
    customRender(
      <CardDialogTitleTextForm
        title={list.cards[0].title}
        handleClose={handleClose}
        listId={list.id}
      />
    )
  })

  it('Closes form on blur', async () => {
    const { getByRole } = customRender(
      <CardDialogTitleTextForm
        title={list.cards[0].title}
        handleClose={handleClose}
        listId={list.id}
      />
    )
    fireEvent.focus(getByRole('textbox'))
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(handleClose).toHaveBeenCalled())
  })

  it('Shows error notification on error', async () => {
    server.use(
      http.patch('http://localhost:3000/api/card/change-title', async () => {
        return new HttpResponse(null, { status: 400 })
      })
    )

    const { getByRole, getByText } = customRender(
      <CardDialogTitleTextForm
        title={list.cards[0].title}
        handleClose={handleClose}
        listId={list.id}
      />
    )

    fireEvent.focus(getByRole('textbox'))
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'card new title' },
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(getByText('card.title.error.title')).toBeTruthy())
  })
})
