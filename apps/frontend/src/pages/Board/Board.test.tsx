import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import Board from './Board'
import { SAMPLE_BOARDS_FULL } from 'mocks/data/boards-full'
import * as reactRouter from 'react-router-dom'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '1' }),
  }
})

vi.mock(`hooks/useIsAuthorized`, () => ({
  default: () => () => true,
}))

describe('Board', () => {
  it('renders Board component', () => {
    customRender(<Board />)
  })

  Object.keys(SAMPLE_BOARDS_FULL).forEach(boardId =>
    it(`Renders correctly with ${SAMPLE_BOARDS_FULL[boardId].lists.length} lists`, async () => {
      vi.spyOn(reactRouter, 'useParams').mockReturnValue({ boardId })
      const { getByTestId, queryByText } = customRender(<Board />)
      const group = getByTestId('board-group')
      expect(group).toBeTruthy()

      // Lists and create list button
      await waitFor(() =>
        expect(getByTestId('board-group').childNodes.length).toBe(
          SAMPLE_BOARDS_FULL[boardId].lists.length + 1
        )
      )
      expect(queryByText('board.data.fetch.unauthorized')).toBeNull()
    })
  )

  it('renders error message if user cant view board', async () => {
    vi.spyOn(reactRouter, 'useParams').mockReturnValue({ boardId: '1' })
    server.use(
      http.get('http://localhost:3000/api/board/1', async () => {
        return new HttpResponse(null, { status: 403 })
      })
    )
    const { getByText, queryByTestId } = customRender(<Board />)
    await waitFor(() => expect(queryByTestId('board-group')).toBeNull())
    expect(getByText('board.data.fetch.unauthorized')).toBeTruthy()
  })
})
