import { customRender } from 'utils/testHelper'
import { waitFor } from '@testing-library/dom'
import { describe, it, expect, vi } from 'vitest'
import BoardUsers from './BoardUsers'
import { SAMPLE_BOARDS_FULL } from 'mocks/data/boards-full'
import * as reactRouter from 'react-router-dom'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '1' }),
  }
})

describe('BoardUsers', () => {
  it('renders BoardUsers component', () => {
    customRender(<BoardUsers />)
  })

  Object.keys(SAMPLE_BOARDS_FULL).forEach(boardId =>
    it(`Renders correctly with ${SAMPLE_BOARDS_FULL[boardId].users.length} users`, async () => {
      vi.spyOn(reactRouter, 'useParams').mockReturnValue({ boardId })
      const { getAllByTestId } = customRender(<BoardUsers />)
      await waitFor(() =>
        expect(getAllByTestId('board-user').length).toBe(SAMPLE_BOARDS_FULL[boardId].users.length)
      )
    })
  )
})
