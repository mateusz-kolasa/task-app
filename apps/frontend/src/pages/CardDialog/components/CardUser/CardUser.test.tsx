import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import * as useIsAuthorized from 'hooks/useIsAuthorized'
import { server } from 'mocks/api/server'
import { http, HttpResponse } from 'msw'
import { SAMPLE_LISTS } from 'mocks/data/lists'
import CardUser from './CardUser'
import { SAMPLE_BOARDS_FULL } from 'mocks/data/boards-full'

vi.mock(`hooks/useIsAuthorized`, () => ({
  default: () => () => true,
}))

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '3', cardId: '1' }),
  }
})

const card = SAMPLE_LISTS[0].cards[0]
const user = SAMPLE_BOARDS_FULL['3'].users.find(user => user.userId === card.userId) ?? {
  user: { username: 'test' },
}

describe('CardUser', () => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()

  it('renders CardUser component', () => {
    customRender(<CardUser listId={card.id} />)
  })

  it('opens form on click', async () => {
    const { getByText, queryByRole, getByRole } = customRender(<CardUser listId={card.id} />)
    await waitFor(() => expect(getByText(user.user.username)).toBeTruthy())
    expect(queryByRole('textbox')).toBeNull()
    fireEvent.click(getByText(user.user.username))
    await waitFor(() => expect(getByRole('textbox')).toBeTruthy())
  })

  it('does not open form for unauthorized', async () => {
    vi.spyOn(useIsAuthorized, 'default').mockReturnValue(() => false)
    const { getByText, queryByRole } = customRender(<CardUser listId={card.id} />)
    await waitFor(() => expect(getByText(user.user.username)).toBeTruthy())
    expect(queryByRole('textbox')).toBeNull()
    fireEvent.click(getByText(user.user.username))
    await waitFor(() => expect(queryByRole('textbox')).toBeNull())
  })
  it('displays placeholder text for empty description', async () => {
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
    const { getByText, queryByRole } = customRender(<CardUser listId={card.id} />)
    await waitFor(() => expect(getByText('card.user.none.label')).toBeTruthy())
    expect(queryByRole('textbox')).toBeNull()
  })
})
