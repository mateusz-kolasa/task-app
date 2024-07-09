import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'
import CardDescriptionTextForm from './CardDescriptionTextForm'
import { SAMPLE_LISTS } from 'mocks/data/lists'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '3', cardId: '1' }),
  }
})
const handleClose = vi.fn()

const card = SAMPLE_LISTS[0].cards[0]

describe('BoardDescriptionTextForm', () => {
  it('renders BoardDescriptionTextForm component', () => {
    customRender(
      <CardDescriptionTextForm
        listId={card.listId}
        description={card.description}
        handleClose={handleClose}
      />
    )
  })

  it('Closes form on blur', async () => {
    const { getByRole } = customRender(
      <CardDescriptionTextForm
        listId={card.listId}
        description={card.description}
        handleClose={handleClose}
      />
    )
    fireEvent.focus(getByRole('textbox'))
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(handleClose).toHaveBeenCalled())
  })

  it('Shows error notification on error', async () => {
    server.use(
      http.patch('http://localhost:3000/api/card/change-description', async () => {
        return new HttpResponse(null, { status: 400 })
      })
    )

    const { getByRole, getByText } = customRender(
      <CardDescriptionTextForm
        listId={card.listId}
        description={card.description}
        handleClose={handleClose}
      />
    )

    fireEvent.focus(getByRole('textbox'))
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'board new description' },
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(getByText('card.description.error.title')).toBeTruthy())
  })
})
