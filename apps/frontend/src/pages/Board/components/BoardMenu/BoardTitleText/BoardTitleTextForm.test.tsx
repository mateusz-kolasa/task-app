import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import { server } from 'mocks/api/server'
import { HttpResponse, http } from 'msw'
import BoardTitleTextForm from './BoardTitleTextForm'
import { SAMPLE_BOARDS_FULL } from 'mocks/data/boards-full'

vi.mock(`react-router-dom`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router-dom`)

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ boardId: '3' }),
  }
})
const handleClose = vi.fn()

const board = SAMPLE_BOARDS_FULL['3']

describe('BoardTitleTextForm', () => {
  it('renders BoardTitleTextForm component', () => {
    customRender(<BoardTitleTextForm title={board.title} handleClose={handleClose} />)
  })

  it('closes form on blur', async () => {
    const { getByRole } = customRender(
      <BoardTitleTextForm title={board.title} handleClose={handleClose} />
    )
    fireEvent.focus(getByRole('textbox'))
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(handleClose).toHaveBeenCalled())
  })

  it('shows error notification on error', async () => {
    server.use(
      http.patch('http://localhost:3000/api/board/change-title', async () => {
        return new HttpResponse(null, { status: 400 })
      })
    )

    const { getByRole, getByText } = customRender(
      <BoardTitleTextForm title={board.title} handleClose={handleClose} />
    )

    fireEvent.focus(getByRole('textbox'))
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'board new title' },
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(getByText('board.title.error.title')).toBeTruthy())
  })
})
