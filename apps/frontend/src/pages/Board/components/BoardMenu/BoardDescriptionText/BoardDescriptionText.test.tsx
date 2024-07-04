import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import * as useIsAuthorized from 'hooks/useIsAuthorized'
import { SAMPLE_BOARDS_FULL } from 'mocks/data/boards-full'
import BoardDescriptionText from './BoardDescriptionText'
import { server } from 'mocks/api/server'
import { http, HttpResponse } from 'msw'

vi.mock(`hooks/useIsAuthorized`, () => ({
  default: () => () => true,
}))

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '3' }),
  }
})

const board = SAMPLE_BOARDS_FULL['3']

describe('BoardDescriptionText', () => {
  it('renders BoardTitleText component', () => {
    customRender(<BoardDescriptionText />)
  })

  it('opens form on click', async () => {
    const { getByText, queryByRole, getByRole } = customRender(<BoardDescriptionText />)
    await waitFor(() => expect(getByText(board.description ?? '')).toBeTruthy())
    expect(queryByRole('textbox')).toBeNull()
    fireEvent.click(getByText(board.description ?? ''))
    await waitFor(() => expect(getByRole('textbox')).toBeTruthy())
  })

  it('doesnt open form for unauthorized', async () => {
    vi.spyOn(useIsAuthorized, 'default').mockReturnValue(() => false)

    const { getByText, queryByRole } = customRender(<BoardDescriptionText />)
    await waitFor(() => expect(getByText(board.description ?? '')).toBeTruthy())
    expect(queryByRole('textbox')).toBeNull()
    fireEvent.click(getByText(board.description ?? ''))
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

    const { getByText, queryByRole } = customRender(<BoardDescriptionText />)
    await waitFor(() => expect(getByText('board.description.empty.text')).toBeTruthy())
    expect(queryByRole('textbox')).toBeNull()
  })
})
