import { customRender } from 'utils/testHelper'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import * as useIsAuthorized from 'hooks/useIsAuthorized'
import BoardTitleText from './BoardTitleText'
import { SAMPLE_BOARDS_FULL } from 'mocks/data/boards-full'

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
const toggleMenu = vi.fn()

const board = SAMPLE_BOARDS_FULL['3']

describe('BoardTitleText', () => {
  it('renders BoardTitleText component', () => {
    customRender(<BoardTitleText toggleMenu={toggleMenu} />)
  })

  it('opens form on click', async () => {
    const { getByText, queryByRole, getByRole } = customRender(
      <BoardTitleText toggleMenu={toggleMenu} />
    )
    await waitFor(() => expect(getByText(board.title)).toBeTruthy())
    expect(queryByRole('textbox')).toBeNull()
    fireEvent.click(getByText(board.title))
    await waitFor(() => expect(getByRole('textbox')).toBeTruthy())
  })

  it('doesnt open form for unauthorized', async () => {
    vi.spyOn(useIsAuthorized, 'default').mockReturnValue(() => false)

    const { getByText, queryByRole } = customRender(<BoardTitleText toggleMenu={toggleMenu} />)
    await waitFor(() => expect(getByText(board.title)).toBeTruthy())
    expect(queryByRole('textbox')).toBeNull()
    fireEvent.click(getByText(board.title))
    await waitFor(() => expect(queryByRole('textbox')).toBeNull())
  })

  it('closes menu on click', async () => {
    const { getByText, getByRole } = customRender(<BoardTitleText toggleMenu={toggleMenu} />)
    await waitFor(() => expect(getByText(board.title)).toBeTruthy())
    fireEvent.click(getByRole('button'))
    expect(toggleMenu).toHaveBeenCalled()
  })
})
