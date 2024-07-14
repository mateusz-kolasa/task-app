import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'
import { SAMPLE_LISTS } from 'mocks/data/lists'
import CardUserSelect from './CardUserSelect'
import { SAMPLE_BOARDS_FULL } from 'mocks/data/boards-full'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '3', cardId: '1' }),
  }
})
const handleClose = vi.fn()

const card = SAMPLE_LISTS[0].cards[0]

describe('CardUserSelect', () => {
  it('renders CardUserSelect component', () => {
    customRender(
      <CardUserSelect listId={card.listId} userId={card.userId} handleClose={handleClose} />
    )
  })

  it('closes form on blur', async () => {
    const { getByRole } = customRender(
      <CardUserSelect listId={card.listId} userId={card.userId} handleClose={handleClose} />
    )
    fireEvent.focus(getByRole('textbox'))
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(handleClose).toHaveBeenCalled())
  })

  it('displays placeholder when no user is assigned', async () => {
    server.use(
      http.get('http://localhost:3000/api/board/3', async () => {
        return new HttpResponse(
          JSON.stringify({
            description: null,
          }),
          { status: 200 }
        )
      })
    )

    const { getByPlaceholderText } = customRender(
      <CardUserSelect listId={card.listId} userId={card.userId} handleClose={handleClose} />
    )
    expect(getByPlaceholderText('card.user.placeholder')).toBeTruthy()
  })

  it('shows error notification on error', async () => {
    server.use(
      http.patch('http://localhost:3000/api/card/assign-user', async () => {
        return new HttpResponse(null, { status: 400 })
      })
    )

    const { getByRole, getAllByRole, getByText } = customRender(
      <CardUserSelect listId={card.listId} userId={card.userId} handleClose={handleClose} />
    )

    await fireEvent.click(getByRole('textbox'))
    await waitFor(() => expect(getAllByRole('option').length).toBeGreaterThan(0))
    await fireEvent.click(
      getByRole('option', {
        name: SAMPLE_BOARDS_FULL['3'].users.filter(user => user.userId !== card.userId)[0].user
          .username,
      })
    )

    await waitFor(() => expect(getByText('card.user.error.title')).toBeTruthy())
  })
})
